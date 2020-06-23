var base_url = "http://localhost:8000/" //"http://datanigeria.pythonanywhere.com/"
var auth_token = {auth:"", username:""};

window.onload = ()=>{
    let form = document.getElementById("login_form");

    form.addEventListener("submit", (e)=>{
        e.preventDefault();

        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;

        login(username, password);

    })
    
}


function login(username, password) {
    
    fetch(base_url + 'login_view', {
        method:"POST",
        headers:{
            'Content-Type':'application/json;charset=utf-8'
        },
        body:JSON.stringify({'username':username, 'password':password})
    })

    .then(res => res.json())
    .then(res => {
        auth_token.auth = res.status.token;
        localStorage.setItem("username", username)
        localStorage.setItem("auth", res.status.token)
        console.log(res);
        if (res.status.success){

            window.location.replace("/index.html");

        }
        else{
            alert("Sorry wrong username or password.\n Note that the fields are case sensitive.")
        }

    });

};
