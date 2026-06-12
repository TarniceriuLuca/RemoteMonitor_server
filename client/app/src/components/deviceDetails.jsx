import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import './style/deviceDetails.css'

const DeviceDetails = ({setPageTitle}) => {

    const [data, setData] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState("Loading...");
    const [command, setCommand] = useState();
    const [output, setOutput] = useState(["waiting for command..."]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [runButtonText, setRunButtonText] = useState("Run");
    const [uploadButtonText, setUploadButtonText] = useState("upload")
    const [selectedTime, setSelectedTime] = useState("transfer");

     useEffect(() => {
        updateStatus(localStorage.getItem('currentIP'));
    }, []);

    useEffect(() => {
    const interval = setInterval(() => {
        if(localStorage.getItem('currentPage') == "deviceDetails")
            updateStatus(localStorage.getItem('currentIP'));
    }, 5000);



    return () => clearInterval(interval);
    }, []);


    const updateStatus = async(ip) => {
        const body = {"ip": ip, "username":localStorage.getItem('username')};
        const response = await axios.post("http://127.0.0.1:8000/api/ipStatus/", body,
            {headers:{'Content-Type':'multipart/form-data',}})

        setData(response.data[0])
        setPageTitle(response.data[0].name)
        try{
        setStatus(response.data[0].status)
        } catch(err){
            console.log(err)
        }
        setLoading("")
    }

    const sendCommand = async() => {
        setRunButtonText("running...");
        const body = {"ip":localStorage.getItem('currentIP'), "command": command, "username":localStorage.getItem('username')};
        const response = await axios.post("http://127.0.0.1:8000/api/runCommand/", body,
            {headers:{'Content-Type':'multipart/form-data',}})


        console.log(response.data);
        setOutput(response.data)
        setRunButtonText("Run");
    }


    const uploadFile = async() => {

        setUploadButtonText("uploading...");
        const formData = new FormData();
        formData.append("script", selectedFile);
        formData.append("ip", localStorage.getItem('currentIP'));
        formData.append("fileName", selectedFile.name);
        formData.append("time", selectedTime);
        formData.append("username", localStorage.getItem('username'));

        try{
            const response = await axios.post(
                "http://127.0.0.1:8000/api/uploadFile/",
                formData,{
                    headers: {"Content-Type": "multipart/form-data"},
                    maxBodyLength: 10000000,
                    maxContentLength: 10000000
            },);
            console.log(response.data[0]);
        } catch (error){
            console.error(error.response.data);
        }
        setUploadButtonText("upload");
    }

    const handleTimeChange = (event) =>{
        setSelectedTime(event.target.value);
    }

    if(loading === "Loading..."){
        return(
            <>
            <h2>{loading}</h2>
            </>
        )
    }else{
        return (
        <>
        <div className="mainCanvas">
            <div className="actionCard">
                <div className="cardContent">

                    <div className="containerTitle"> SYSTEM INFO </div>
                    <div className="stats-deviceDetails"> <div className="statsLabel-deviceDetails"> Hostname</div> <div className="statsValue-deviceDetails"> {data.name}</div></div>                             <div className="separator"></div>
                    <div className="stats-deviceDetails"> <div className="statsLabel-deviceDetails"> IP Address</div> <div className="statsValue-deviceDetails"> {data.ip}</div></div>                             <div className="separator"></div>
                    <div className="stats-deviceDetails"> <div className="statsLabel-deviceDetails"> User</div> <div className="statsValue-deviceDetails"> {data.user}</div></div>                                 <div className="separator"></div>
                    <div className="stats-deviceDetails"> <div className="statsLabel-deviceDetails"> Platform</div> <div className="statsValue-deviceDetails"> {status[3]}</div></div>                             <div className="separator"></div>
                    <div className="stats-deviceDetails"> <div className="statsLabel-deviceDetails"> Cpu</div> <div className="statsValue-deviceDetails"> {status[4]}</div></div>                                  <div className="separator"></div>
                    <div className="stats-deviceDetails"> <div className="statsLabel-deviceDetails"> Total memory</div> <div className="statsValue-deviceDetails"> {status[5]} GB</div></div>                      <div className="separator"></div>
                    <div className="stats-deviceDetails"> <div className="statsLabel-deviceDetails"> Disk(free/total)</div> <div className="statsValue-deviceDetails"> {status[7]} / {status[6]} GB</div></div>    <div className="separator"></div>
                    <div className="stats-deviceDetails"> <div className="statsLabel-deviceDetails"> Last reboot</div> <div className="statsValue-deviceDetails"> {status[2]}</div></div>                          <div className="separator"></div>

                    <div className="separator" style={{ width: `20%`, marginTop:`3vw`}}></div>
                    <div className="containerTitle" style={{ marginTop:`3vw`}}> LIVE METRICS </div>
                    <div className="stats-deviceDetails">
                        <div className="statsLabel-deviceDetails"> MEMORY USAGE:</div> <div className="statsValue"> {status[0]}% </div>
                    </div>
                    <div className="progressBarExt">
                        <div className="progressBarInt" style={{ width: `${status[0]}%`, backgroundColor: `purple`}}></div>
                    </div>
                    <div className="stats-deviceDetails">
                        <div className="statsLabel-deviceDetails"> CPU USAGE:</div> <div className="statsValue"> {status[1]}% </div>
                    </div>
                    <div className="progressBarExt">
                        <div className="progressBarInt" style={{ width: `${status[1]}%`, backgroundColor: `#ffd138`}}></div>
                    </div>
                </div>
            </div>


            <div className="actionCard">
                <div className="cardContent">

                    <div className="containerTitle"> RUN COMMAND </div>

                    <div className="commandGroup">
                        <input className="commandInput" type="text" placeholder="e.g. ls ~/Documents" onChange={(e) => setCommand(e.target.value)}/>
                        <button className="runButton" onClick={() => sendCommand()}>{runButtonText}</button>
                    </div>
                    <div className="commandOutput">
                        <div style={{color: `blue`, paddingLeft: `12px`, paddingRight: `12px`, paddingBottom: `12px`}}>$</div>
                        <div className="outputText">{
                            output.map((outputLine) => (
                                <div className="outputLine"> {outputLine}</div>
                            ))
                        }</div>
                    </div>

                    <div className="containerTitle"> TRANSFER FILE </div>

                    <div className="deviceDetails-fileInput">
                        <input className="file" type="file" id="file" onChange={(e) => setSelectedFile(e.target.files[0])}/>
                        <label for="file">Choose file <span className="fileName"> • {selectedFile ? selectedFile.name : "No file choosen"}</span> </label>

                    </div>

                    <div className="containerTitle"> RUN FREQUENCY </div>

                    <div className="timeOptions">
                        <label className="option">
                            <input type="radio" name="selectedTime" value="transfer" checked={selectedTime === 'transfer'} onChange={handleTimeChange}/>
                            Transfer
                        </label>
                        <label className="option">
                            <input type="radio" name="selectedTime" value="run" checked={selectedTime === 'run'} onChange={handleTimeChange}/>
                            Run now
                        </label>
                        <label className="option">
                            <input type="radio" name="selectedTime" value="day" checked={selectedTime === 'day'} onChange={handleTimeChange}/>
                            Every day
                        </label>

                        <label className="option">
                            <input type="radio" name="selectedTime" value="hour" checked={selectedTime === 'hour'} onChange={handleTimeChange}/>
                            Every hour
                        </label>

                        <label className="option">
                            <input type="radio" name="selectedTime" value="startup" checked={selectedTime === 'startup'} onChange={handleTimeChange}/>
                            At startup
                        </label>
                    </div>
                    <button className="uploadButton" onClick={() => uploadFile()}>Upload</button>
                </div>
            </div>
        </div>
        </>
    );
    }



}
export default DeviceDetails