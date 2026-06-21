#!/bin/bash
# instalare pachete necesare serverului in functie de sistemul de operare
pkgs=(gnome-terminal arp-scan openssh openssh-server openssh-clients nodejs npm)
source /etc/os-release
case "$ID" in
  linuxmint|ubuntu)
    sudo apt-get -y --ignore-missing install "${pkgs[@]}"
    ;;
  fedora)
    sudo dnf -y install "${pkgs[@]}"
    ;;
esac
# instalare axios prin npm
mkdir ~/RemoteMonitor
cd ~/RemoteMonitor
sudo npm install axios
# instalare yarn
sudo npm install --global yarn@1
# instalare dependente pip
python3 -m venv ~/RemoteMonitor/.venv
source ~/RemoteMonitor/.venv/bin/activate
pip install -r ~/RemoteMonitor/pipRequirements(server).txt
# generare cheie de criptare ssh
ssh-keygen -t rsa
# crearea folderului pentru fisierele de log vizibile administratorului
mkdir ~/RemoteMonitor_admin
# configurarea comenzii arp-scan pentru a nu necesita introducerea parolei la fiecare rulare
echo "$USER ALL=(ALL) NOPASSWD: $(which arp-scan)" | sudo tee /etc/sudoers.d/arp-scan > /dev/null
sudo chmod 440 /etc/sudoers.d/arp-scan

