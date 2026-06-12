import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import axios from 'axios'
import './App.css'

import NewDevice from './components/newDevice';
import Monitoring from './components/monitoring';
import DeviceDetails from './components/deviceDetails';
import Login from './components/login';
import Users from './components/users';

function App() {
    const [authState, setAuthState] = useState(() => localStorage.getItem('authState') || "auth_error")
    const [username, setUsername] = useState(() => localStorage.getItem('username') || "no_user")
    const [page, setPage] = useState(() => localStorage.getItem('currentPage') || "login")
    const [pageTitle, setPageTitle] = useState("")
    const [currentIP, setCurrentIP] = useState(() => localStorage.getItem('currentIP') || "NULL")
    const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('currentUser') || "NULL")

    useEffect( () => {
        if(authState != 'auth_error'){
            if (localStorage.getItem('currentPage') == 'login') setPage('monitoring')
        }else{
            setPage('login')
        }
        localStorage.setItem('authState', authState)
        setUsername(localStorage.getItem('username'))
    }, [authState])

    useEffect( () => {
        localStorage.setItem('currentPage', page)
    }, [page])

    const logout = async() => {
        const body = {"username": localStorage.getItem('username')}
        localStorage.setItem('authState', 'auth_error')
        localStorage.setItem('username', 'no_user')
        setAuthState('auth_error')
        setUsername('no_user')

        const response = await axios.post("http://127.0.0.1:8000/api/logout/", body,
            {headers:{'Content-Type':'multipart/form-data',}})
    }

    const navigate = (newPage) => setPage(newPage)


    return (
        <>

            <div className="navbar">
                {username != "no_user" && <div className="navbar-text"><div className="user"> {username} •</div> <div className="pageName">{pageTitle}</div></div>}
                <div className="navbar-buttons">
                    {/*buton pentru selectarea pagini de monitorizare*/}
                    {authState == "admin" && <button className="navButton" onClick={() => navigate('monitoring')}>Monitor</button>}
                    {/*buton pentru selectarea pagini de adăugare dispozitiv*/}
                    {authState == "admin" && <button className="navButton" onClick={() => navigate('newDevice')}>Add Device</button>}
                    {/*buton pentru selectarea pagini de vizualizare users*/}
                    {authState == "admin" && <button className="navButton" onClick={() => navigate('users') }>Users</button>}
                    {/*buton pentru selectarea pagini de logout*/}
                    {authState != "auth_error" && <button className="navButton" onClick={() => logout() }>Logout</button>}

                </div>
            </div>
            {/*în funție de valoarea variabilei 'currentPage', se alege componenta care trebuie afișată*/}
            {page === "newDevice" && <NewDevice navigate={navigate} setPageTitle={setPageTitle} />}
            {page === "monitoring" && <Monitoring navigate={navigate} authState={authState} setPageTitle={setPageTitle} />}
            {page === "deviceDetails" && <DeviceDetails setPageTitle={setPageTitle} />}
            {page === "login" && <Login setAuthState={setAuthState} />}
            {page === "users" && <Users setPageTitle={setPageTitle} navigate={navigate} authState={authState} />}
        </>
    );
}

export default App
