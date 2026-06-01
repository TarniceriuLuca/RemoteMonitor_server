import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import './style/users.css'
import './style/login.css'

const Users = ({ setPageTitle, navigate, authState }) => {

    const [userList, setUserList] = useState([]);
    const [statusButtonText, setStatusButtonText] = useState([]);

    const [viewState, setViewState] = useState("users")

    const [errorText, setErrorText] = useState("")

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confPassword, setConfPassword] = useState("")

    useEffect(() => {
        getUsers(localStorage.getItem('username'))
        setPageTitle("users")
    }, []);


    const getUsers = async(username) => {
        const body = {"username": username};
        const response = await axios.post("http://127.0.0.1:8000/api/getUsers/", body,
            {headers:{'Content-Type':'multipart/form-data',}})

        setUserList(response.data)
    }

    const setPermissions = async(activeUser, username, status) => {
        window.location.reload()
        const body = {"activeUser": activeUser, "username": username, "status": status};

        const response = await axios.post("http://127.0.0.1:8000/api/setPermissions/", body,
            {headers:{'Content-Type':'multipart/form-data',}})

        console.log(response)
    }

    const createAccount = async() => {
        if(password != confPassword){
            setErrorText("Passwords do not match");
        }
        else{
            setErrorText("");
            const body = {"username": username, "password": password};

            const response = await axios.post("http://127.0.0.1:8000/api/createAccount/", body,
                {headers:{'Content-Type':'multipart/form-data',}})
            console.log(response)
        }


    }

    if(viewState == "users"){
        return (
            <>
            <div className="mainCanvas-users">
                <div className="usersCard">
                    <div className="usersCardContent">
                        {userList.map((user) => (
                            <div key="{user.username}" className="userEntry">
                                <div className="username"> {user.username}
                                    ({
                                        user.is_staff == "True" ?
                                        <div>admin</div> :
                                        <div>operator</div>
                                    })
                                </div>

                                <div className="staffButton">
                                {
                                    user.username != localStorage.getItem('username') &&
                                    (
                                        user.is_staff == "True" ?
                                        <button className="stateButton" onClick={() => setPermissions(localStorage.getItem('username'), user.username, "operator")}>demote</button> :
                                        <button className="stateButton" onClick={() => setPermissions(localStorage.getItem('username'), user.username, "admin")}>promote</button>
                                    ) ||
                                    <button className="connected"> connected account</button>
                                }
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="createUserButton" onClick={() => setViewState("createUser")}>New user</button>
            </div>
            </>
        );
    }
    if(viewState == "createUser"){
        return(
            <>
            <div className="container">
                <div className="heroText">
                    <div className="titleText"> New user </div>
                    <div className="subtitleText"> Create a new operator account </div>
                </div>
                <form>
                    <div className="label"> USERNAME </div>
                    <input className="loginInput" type="text" placeholder="user" onChange={(e) => setUsername(e.target.value)}/> <br/>
                    <div className="label"> PASSWORD </div>
                    <input className="loginInput" type="password" placeholder="••••••" onChange={(e) => setPassword(e.target.value)}/>
                    <div className="label"> CONFIRM PASSWORD </div>
                    <input className="loginInput" type="password" placeholder="••••••" onChange={(e) => setConfPassword(e.target.value)}/>
                </form>
                <div className="errorText"> {errorText} </div>
                <div className="buttonGroup">
                    <button className="loginButton" onClick={() => createAccount()}> Create account </button>
                    <button className="loginButton" onClick={() => setViewState("users")}>Back</button>
                </div>
            </div>


            </>
        );
    }



}
export default Users