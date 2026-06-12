#!/bin/bash
ssh-keygen -t rsa
mkdir RemoteMonitor_admin
echo "$USER ALL=(ALL) NOPASSWD: $(which arp-scan)" | sudo tee /etc/sudoers.d/arp-scan > /dev/null
sudo chmod 440 /etc/sudoers.d/arp-scan