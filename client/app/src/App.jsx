import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import NewDevice from './components/newDevice';
import Monitoring from './components/monitoring';
import DeviceDetails from './components/deviceDetails';
import Login from './components/login';

function App() {
    const [authState, setAuthState] = useState(() => localStorage.getItem('authState') || "auth_error")
    const [page, setPage] = useState(() => localStorage.getItem('currentPage') || "login")
    const [currentIP, setCurrentIP] = useState(() => localStorage.getItem('currentIP') || "NULL")
    const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('currentUser') || "NULL")

    useEffect( () => {
        if(authState != 'auth_error'){
            if (localStorage.getItem('currentPage') == 'login') setPage('monitoring')
        }else{
            setPage('login')
        }
        localStorage.setItem('authState', authState)
    }, [authState])

    useEffect( () => {
        localStorage.setItem('currentPage', page)
    }, [page])

    const logout = async() => {
        localStorage.setItem('authState', 'auth_error')
        setAuthState('auth_error')
        const response = await fetch("http://127.0.0.1:8000/api/logout/");
        const data = await response.json();
    }

    const navigate = (newPage) => setPage(newPage)


    return (
        <>

            <div className="navbar">
                {/*buton pentru selectarea pagini de monitorizare*/}
                {authState != "auth_error" && <button onClick={() => navigate('monitoring')}>Monitor</button>}
                {/*buton pentru selectarea pagini de adăugare dispozitiv*/}
                {authState == "admin" && <button onClick={() => navigate('newDevice')}>Add Device</button>}
                {/*buton pentru selectarea pagini de logout*/}
                {authState != "auth_error" && <button onClick={() => logout() }>Logout</button>}
            </div>
            {/*în funție de valoarea variabilei 'currentPage', se alege componenta care trebuie afișată    */}
            {page === "newDevice" && <NewDevice/>}
            {page === "monitoring" && <Monitoring navigate={navigate} authState={authState}/>}
            {page === "deviceDetails" && <DeviceDetails/>}
            {page === "login" && <Login setAuthState={setAuthState} />}
        </>
    );
}

export default App
