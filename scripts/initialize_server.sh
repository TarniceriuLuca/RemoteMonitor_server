#!/bin/bash
# instalare pachete necesare serverului
pkgsFedora=(gnome-terminal arp-scan openssh openssh-server openssh-clients nodejs npm)
echo "installing packages using dnf"
sudo dnf -y install "${pkgsFedora[@]}"

# clonare cod sursa
mkdir -p ~/RemoteMonitor_server
cd ~/RemoteMonitor_server
git clone https://github.com/TarniceriuLuca/RemoteMonitor_server.git ~/RemoteMonitor_server && echo "source code cloned succesfully"

# instalare yarn
sudo npm install --global yarn@1 && echo "installed yarn"

# instalare depentendte node prin npm
cd ~/RemoteMonitor_server/client/app
sudo npm install
cd ~/RemoteMonitor_server
sudo npm install

# obtinere lista pachete pip
curl --output ~/RemoteMonitor_server/pipRequirements_server.txt 'https://raw.githubusercontent.com/TarniceriuLuca/proiectLicenta/refs/heads/main/pipRequirements_server.txt' && echo "obtained pip requirements"

# instalare dependente pip intr-un mediu virtual
python3 -m venv ~/RemoteMonitor_server/.venv
source ~/RemoteMonitor_server/.venv/bin/activate
pip install -r ~/RemoteMonitor_server/pipRequirements_server.txt
pip list

# generare cheie de criptare ssh
ssh-keygen -t rsa

# crearea folderului pentru fisierele de log vizibile administratorului
mkdir -p ~/RemoteMonitor_admin

# configurarea comenzii arp-scan pentru a nu necesita introducerea parolei la fiecare rulare
echo "Reached arp-scan section"
set -x
ARP_SCAN=$(command -v arp-scan) || { 
    echo "arp-scan not found"
    exit 1 
}
echo "ARP_SCAN: $ARP_SCAN"
echo "$USER ALL=(ALL) NOPASSWD: $ARP_SCAN" | sudo tee /etc/sudoers.d/arp-scan > /dev/null
sudo visudo -cf /etc/sudoers.d/arp-scan
sudo chmod 440 /etc/sudoers.d/arp-scan
set +x 
echo "finished apr-scan section"

read -n 1 -p "Press enter to continue";
