import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import './style/monitoring.css'

export default function Monitoring({ navigate, authState, setPageTitle}) {

    const [status, setStatus] = useState([]);
    const [loading, setLoading] = useState("Loading...");

     useEffect(() => {
        updateStatus();
        setPageTitle("dashboard")
    }, []);

    useEffect(() => {
    const interval = setInterval(() => {
        if(localStorage.getItem('currentPage') == "monitoring")
            updateStatus();
    }, 5000);



    return () => clearInterval(interval);
    }, []);

    const updateStatus = async () => {
        try{
            const response = await fetch("http://127.0.0.1:8000/api/status/");
            const data = await response.json();
            setStatus(data);
            setLoading("");
        } catch(err){
            console.log(err)
        }

    };

    const postData = async(ip, user) => {
        const body = {"ip": ip, "user":user};
        console.log(body)
        const response = await axios.post("http://127.0.0.1:8000/api/reconnect/", body,
            {headers:{'Content-Type':'multipart/form-data',}})
        console.log(response)
        return response.data
    }

    const reconnect = async(ip, user) => {
        const newData = await postData(ip, user)
    }

    const openDetails = async(ip, user) => {
        localStorage.setItem('currentIP', ip)
        localStorage.setItem('currentUser', user)
        localStorage.setItem('currentPage', 'deviceDetails')
        console.log(localStorage.getItem('currentUser') + " " + localStorage.getItem('currentIP'))
        navigate('deviceDetails')
    }

    const deleteClient = async(ip) => {
            const body = {"ip": ip};
            console.log(body)
            const response = await axios.post("http://127.0.0.1:8000/api/deleteClient/", body,
                {headers:{'Content-Type':'multipart/form-data',}})
            console.log(response)
    }

    const removeClient = async(ip) => {
            const body = {"ip": ip};
            const response = await axios.post("http://127.0.0.1:8000/api/removeClient/", body,
                {headers:{'Content-Type':'multipart/form-data',}})
            console.log(response)
    }

    const shutdownClient = async(ip) => {
            const body = {"ip": ip};
            console.log(body)
            const response = await axios.post("http://127.0.0.1:8000/api/shutdownClient/", body,
                {headers:{'Content-Type':'multipart/form-data',}})
            console.log(response)
    }

     return (
        <>
            <div className="subtitleText">CONNECTED DEVICES • {status.length}</div>
            <h2>{loading}</h2>
            <div className="mainCanvas">
                {status.map((client) => (
                    <div key={client.ip} className={client.status[0] == "n/a" && "monitorCard-inactive" || "monitorCard-active"}>
                        <p className={client.status[0] == "n/a" && "clientName-inactive" || "clientName-active"}> {client.name} </p>

                        <div className="stats">
                            {client.status[0] == "n/a" &&
                                <><div className="statsLabel"> MEMORY:</div> <div className="statsValue"> - </div></> ||
                                <><div className="statsLabel"> MEMORY:</div> <div className="statsValue"> {client.status[0]}% </div></>
                            }
                        </div>
                        <div className="progressBarExt">
                            {client.status[0] == "n/a" &&
                                <div className="progressBarInt" style={{ width: `0`, backgroundColor: `transparent`}}></div> ||
                                <div className="progressBarInt" style={{ width: `${client.status[0]}%`, backgroundColor: `purple`}}></div>
                            }

                        </div>
                        <div className="stats">
                            {client.status[0] == "n/a" &&
                                <><div className="statsLabel"> CPU:</div> <div className="statsValue"> - </div></> ||
                                <><div className="statsLabel"> CPU:</div> <div className="statsValue"> {client.status[1]}% </div></>
                            }
                        </div>
                        <div className="progressBarExt">
                            {client.status[0] == "n/a" &&
                                <div className="progressBarInt" style={{ width: `-`, backgroundColor: `transparent`}}></div> ||
                                <div className="progressBarInt" style={{ width: `${client.status[1]}%`, backgroundColor: `#ffd138`}}></div>
                            }

                        </div>

                        <div className="actionMenu">
                            {client.status[0] == "n/a" &&
                                <button className="actionButton" onClick={() => reconnect(client.ip, client.user)}>reconnect</button> ||
                                <button className="actionButton" onClick={() => shutdownClient(client.ip)}>Shutdown</button>
                            }
                            {authState == "admin" &&
                            (client.status[0] == "n/a" &&
                                <button className="actionButton" onClick={() => removeClient(client.ip)}>Remove</button> ||
                                <>
                                    <button className="actionButton" onClick={() => deleteClient(client.ip)}>Delete</button>
                                    <button className="actionButton" onClick={() => openDetails(client.ip, client.user)}>Details</button>
                                </>
                            )}
                        </div>

                    </div>
                ))}
            </div>

        </>
    );
}
