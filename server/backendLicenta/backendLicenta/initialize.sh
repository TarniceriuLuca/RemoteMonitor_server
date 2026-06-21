#!/bin/bash

ssh-copy-id $1@$2

ssh $1@$2 "mkdir ~/RemoteMonitor"
ssh $1@$2 "curl --output ~/RemoteMonitor/TCP_receive.py 'https://raw.githubusercontent.com/TarniceriuLuca/proiectLicenta/refs/heads/main/TCP_receive.py'"
ssh $1@$2 "curl --output ~/RemoteMonitor/getInfo.py 'https://raw.githubusercontent.com/TarniceriuLuca/proiectLicenta/refs/heads/main/getInfo.py'"
ssh $1@$2 "curl --output ~/RemoteMonitor/pipRequirements.txt 'https://raw.githubusercontent.com/TarniceriuLuca/proiectLicenta/refs/heads/main/pipRequirements.txt'"

ssh $1@$2 "python3 -m venv ~/RemoteMonitor/.venv"
ssh $1@$2 "source ~/RemoteMonitor/.venv/bin/activate"
ssh $1@$2 "pip install -r ~/RemoteMonitor/pipRequirements.txt"

read -n 1 -p "Press enter to continue";