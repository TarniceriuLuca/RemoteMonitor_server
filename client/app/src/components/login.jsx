import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'

const Login = ({ setAuthState }) => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");


    const login = async() => {
        const body = {"username": username, "password": password};
        const response = await axios.post("http://127.0.0.1:8000/api/authenticate/", body,
            {headers:{'Content-Type':'multipart/form-data',}})

        const result = response.data
        localStorage.setItem('authState', result)
        setAuthState(result)
        console.log(localStorage.getItem('currentPage'))
    }




    return(
    <>
        <h1> Login </h1>
            <form>
                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)}/>
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
            </form>
            <button className="addButton" onClick={() => login()}> Login </button>
    </>
    );



}
export default Login