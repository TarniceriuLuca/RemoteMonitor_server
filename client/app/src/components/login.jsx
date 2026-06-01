import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import './style/login.css'

const Login = ({ setAuthState }) => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [errorMsg, setErrorMsg] = useState("");


    const login = async() => {
        const body = {"username": username, "password": password};
        const response = await axios.post("http://127.0.0.1:8000/api/authenticate/", body,
            {headers:{'Content-Type':'multipart/form-data',}})

        const result = response.data
        localStorage.setItem('authState', result)
        console.log("login result: " + result)
        if(result != "auth_error"){
            console.log("username: " + username)
            localStorage.setItem('username', username)
        }else{
            setErrorMsg("This account does not exist")
        }
        setAuthState(result)
        console.log(localStorage.getItem('currentPage'))
    }




    return(
    <>
        <div className="container">
            <div className="heroText">
                <div className="titleText"> Welcome back </div>
                <div className="subtitleText"> Log in to your monitoring dashboard </div>
            </div>
                <form>
                    <div className="label"> USERNAME </div>
                    <input className="loginInput" type="text" placeholder="admin" onChange={(e) => setUsername(e.target.value)}/> <br/>
                    <div className="label"> PASSWORD </div>
                    <input className="loginInput" type="password" placeholder="••••••" onChange={(e) => setPassword(e.target.value)}/>
                </form>
                <div className="errorText">{errorMsg}</div>
                <button className="loginButton" onClick={() => login()}> Log in </button>
        </div>
    </>
    );



}
export default Login