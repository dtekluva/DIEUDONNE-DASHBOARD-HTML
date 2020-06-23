var base_url = "http://localhost:8000/" //"http://datanigeria.pythonanywhere.com/"
var auth_token = {auth: localStorage.getItem("auth"), username: localStorage.getItem("username"), period: "2010-01-01/2020-12-30"};

var datatable = $('#deposits_saves_table').DataTable({
    'paging'      : true,
    'lengthChange': true,
    'searching'   : false,
    'ordering'    : true,
    'info'        : true,
    'autoWidth'   : false
})

window.onload = ()=>{

    document.getElementById("logged_user").innerHTML = "Hello " + auth_token.username.toUpperCase();

    get_loans_summary();
    get_loans_per_segment();
    get_customers_per_time();
    get_loans_per_time();
    get_savings_and_deposits();
}

// FETCHING SECTION
function get_loans_summary() {

        fetch(base_url + 'get_loans_summary', {
        method:"POST",
        headers:{
            'Content-Type':'application/json;charset=utf-8'
        },
        body:JSON.stringify(auth_token)
        })
        .then(res => res.json())
        .then(res => {
            console.log(res);
            add_summary(res.response);
        });
    }

function get_loans_per_segment() {

    fetch(base_url + 'get_number_of_loans_per_segment', {
    method:"POST",
    headers:{
        'Content-Type':'application/json;charset=utf-8'
    },
    body:JSON.stringify(auth_token)
    })
    .then(res => res.json())
    .then(res => {
        console.log(res);
        loans_per_segment_chart(res.response);
    });
    }

function get_customers_per_time() {

    fetch(base_url + 'get_grouped_customers_by_month', {
    method:"POST",
    headers:{
        'Content-Type':'application/json;charset=utf-8'
    },
    body:JSON.stringify(auth_token)
    })
    .then(res => res.json())
    .then(res => {
        console.log(res);
        create_customer_chart(res.response);
    });
    }

function get_loans_per_time() {

    fetch(base_url + 'get_loan_performance_over_time', {
    method:"POST",
    headers:{
        'Content-Type':'application/json;charset=utf-8'
    },
    body:JSON.stringify(auth_token)
    })
    .then(res => res.json())
    .then(res => {
        console.log(res);
        create_dispensation_time_chart(res.response);
    });
    }

function get_savings_and_deposits() {

        fetch(base_url + 'get_deposits_vs_saves', {
        method:"POST",
        headers:{
            'Content-Type':'application/json;charset=utf-8'
        },
        body:JSON.stringify(auth_token)
        })
        .then(res => res.json())
        .then(res => {
            console.log(res);
            create_savings_deposits_table(res.response);
        });
    }

// DOM MANIPULATION SECTION

function add_summary(data) {
    let approved = document.getElementById("approved_amount")
    let dispensed = document.getElementById("dispensed_amount")
    let paid = document.getElementById("paid_amount")
    let outstanding = document.getElementById("outstanding_amount")

    approved.innerHTML = `$${data[0][0].toLocaleString()}`;
    dispensed.innerHTML = `$${data[2][0].toLocaleString()}`;
    paid.innerHTML = `$${data[3][0].toLocaleString()}`;
    outstanding.innerHTML = `$${data[1][0].toLocaleString()}`;

    }

function create_customer_chart(data) {
    
    // Morris-chart
    let values = [];
    let xlabels = [];
    let i = 1;

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];

            element["date"] = key;
            element["position"] = i;
            values.push(element);
            xlabels.push(key);            
        }
        i++;
    }
	
	Morris.Area({
        element: 'customer_chart',
        data: values,
        xkey: 'position',
        ykeys: ['M', 'F'],
        labels: ['Male', 'Female'],
        parseTime: false,
        xLabelFormat: function (x) {
            var index = parseInt(x.src.position);
            return xlabels[index];
        },
        xLabels:'month',
        pointSize: 5,
        fillOpacity: 0.8,
        pointStrokeColors:['#fb8d34', '#5e2572'],
        behaveLikeLine: true,
        gridLineColor: '#e0e0e0',
        lineWidth: 3,
        smooth: true,
        hideHover: 'auto',
        lineColors: ['#fb8d34', '#5e2572'],
        resize: true
        
    });
    }  

function loans_per_segment_chart(data) {
    
    // BAR-CHART
    let values = [];
    
    let disbursed = data.grouped.Disbursement;
    let segment = data.grouped.Segment;
    let outstanding = data.grouped.outstanding;
    let summarized = data.summarized.NumberOfLoans;

    document.getElementById("coporate").innerHTML = summarized[0];
    document.getElementById("micro_serv").innerHTML = summarized[1];
    document.getElementById("retail").innerHTML = summarized[3];
    document.getElementById("non-business").innerHTML = summarized[2];
    document.getElementById("sme").innerHTML = summarized[4];

    for (let i = 0; i < segment.length; i++) {
        // const element = array[segment];
        values.push({
                        "segment":segment[i].slice(0,16),
                        "disbursed":disbursed[i],
                        "count":summarized[i],
                        "outstanding":outstanding[i]
                    })
        
    };
    console.log(values);

    //BAR CHART
    var bar = new Morris.Bar({
        element: 'bar-chart',
        resize: true,
        data: values,
            barColors: ['#5e2572', '#7c3196', '#9b33bf'],
            barSizeRatio: 0.5,
            barGap:5,
            xkey: 'segment',
            ykeys: ['count', 'disbursed', 'outstanding'],
            labels: ['Number of Loans', 'Disbursed', 'Outstanding'],
            hideHover: 'auto'
        });
    }

function create_dispensation_time_chart(data) {
    
    // Morris-chart
    let values = [];
    let xlabels = [];
    let i = 1;

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];

            element["date"] = key;
            element["position"] = i;
            values.push(element);
            xlabels.push(key);            
        }
        i++;
    }
	
	Morris.Area({
        element: 'dispensation-time-chart',
        data: values,
        xkey: 'position',
        ykeys: ['Disbursement', 'outstanding'],
        labels: ['Disbursement', 'outstanding'],
        parseTime: false,
        xLabelFormat: function (x) {
            var index = parseInt(x.src.position);
            return xlabels[index];
        },
        xLabels:'month',
        pointSize: 5,
        fillOpacity: 0.8,
        pointStrokeColors:['#fb8d34', '#5e2572'],
        behaveLikeLine: true,
        gridLineColor: '#e0e0e0',
        lineWidth: 3,
        smooth: true,
        hideHover: 'auto',
        lineColors: ['#fb8d34', '#5e2572'],
        resize: true
        
    });
}

function create_savings_deposits_table(data) {
    
    let i = 1;
    datatable.clear()

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];    
            
                datatable.row.add([i,key,`$${element.depositamount}`, `$${element.SavingAmount}`]).draw(false);
            }
            i ++;
    }
    

}

//[advanced form element Javascript]

//Project:	Qixa Admin - Responsive Admin Template
//Primary use:   Used only for the advanced-form-element

$(function () {
    "use strict";

    $('#daterange-btn').daterangepicker(
      {
        ranges   : {
          'Today'       : [moment(), moment()],
          'Yesterday'   : [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'Last 7 Days' : [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month'  : [moment().startOf('month'), moment().endOf('month')],
          'Last Month'  : [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        startDate: moment().subtract(29, 'days'),
        endDate  : moment()
      },
      function (start, end) {
        $('#daterange-btn span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        refresh_data(start.format('YYYY-MM-DD') + '/' + end.format('YYYY-MM-DD'));
      }
    );

  function refresh_data(value) {
    auth_token.period = value;

    document.getElementById('dispensation-time-chart').innerHTML = "";
    document.getElementById('bar-chart').innerHTML = "";
    document.getElementById('customer_chart').innerHTML = "";
    
    get_loans_summary();
    get_loans_per_segment();
    get_customers_per_time();
    get_loans_per_time();
    get_savings_and_deposits();    
  };    

  });
  

function logout() {
    localStorage.clear();
    window.location.replace("/login.html")
}