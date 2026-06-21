import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import './style/newDevice.css'

const NewDevice = ({ navigate, setPageTitle }) => {

     const[devices, setDevices] = useState();
     const[viewState, setViewState] = useState("Loading...");
     const[backButtonText, setBackButtonText] = useState("Back")

     const [deviceName, setDeviceName] = useState("");
     const [selectedUser, setSelectedUser] = useState("");
     const [selectedIP, setSelectedIP] = useState("");
     const [loading, setLoading] = useState("");

     const [customIP, setCustomIP] = useState("");

     const data = {};

     useEffect(() => {
         getHosts();
         setPageTitle("add device");
     }, []);

    const handleSelection = (ip) => {
        setSelectedIP(ip);
        setViewState("setName")
    }


    const postData = async(ip, name, user) => {
        const body = {"ip": ip, "name": name, "user":user, "username": localStorage.getItem('username')};
        const response = await axios.post("http://127.0.0.1:8000/api/addDevice/", body,
            {headers:{'Content-Type':'multipart/form-data',}})

        console.log(response)
        setViewState(response.data)
        console.log("viewstate = " + viewState)
        return response.data
    }

    const addDevice = async(ip, name, user) => {
        if(name != "" && user != ""){
            setLoading("Loading...")
            const newData = await postData(ip, name, user)
            navigate("monitoring")
        }
    }


    const getHosts = async () => {

        try{
            setBackButtonText("Loading...")
            const response = await fetch("http://127.0.0.1:8000/api/listDevices/");
            const data = await response.json();
            var parsedData = JSON.parse(data)

            console.log(parsedData);
            setDevices(parsedData);
            setViewState("deivces");
            setBackButtonText("Back")
        } catch(err){
            console.log(err)
        }
    };

    if(viewState == "Loading..."){
        return(
        <>
        <h1> Add new device </h1>
        <div>
            {viewState}
        </div>
        </>
        )
    }
    if(viewState == "setName"){
        setPageTitle("register device")
        return(
            <>
            <div className="formContainer">
                <div className="heroText">
                    <div className="titleText"> Add a new device </div>
                    <div className="subtitleText"> Set a name and enter the username for the selected device </div>
                </div>
                <form>
                    <div className="label"> NAME </div>
                    <input className="registerInput" type="text" placeholder="e.g. web server" onChange={(e) => setDeviceName(e.target.value)}/>
                    <div className="label"> USER </div>
                    <input className="registerInput" type="text" placeholder="e.g. admin" onChange={(e) => setSelectedUser(e.target.value)}/>
                </form>
                {loading}
                <div className="buttonGroup">
                    <button className="registerButton" onClick={() => addDevice(selectedIP, deviceName, selectedUser)}>Register Device</button>
                    <button className="registerButton" onClick={() => getHosts()}>{backButtonText}</button>
                </div>
            </div>
            </>
        )
    }
    if(viewState == "OK"){
        return(
            <>
            <h1> Data sent! </h1>
            </>
        )
    }
    return(
        <>

        <div className="parentContainer">
            <form className="formStyle">
                <input type="text" placeholder="ip address" className="ipInput" onChange={(e) => setCustomIP(e.target.value)}/>
                <button className="ipButton" onClick={() => handleSelection(customIP)}>Send IP</button>
            </form>
            {devices.map((host) => (

                <>
                <div className="deviceEntry">
                    <div className="childIP">
                        <div key={host.ip}>{host.connected ? host.ip : <a className="deviceIP" onClick={() => handleSelection(host.ip)}>{host.ip}</a>}</div>
                    </div>
                    <div className="childVendor">
                        <div key={host.ip}>{host.connected ? <div style={{color:'#fcba03' }}> {host.vendor + " <connected> "}</div>: host.vendor}</div>
                    </div>
                </div>
                <div className="separator" style={{width:`50%`}}></div>
                </>
            ))}
        </div>
        </>
    );
}

export default NewDevice