import json, time
import subprocess
import os
from datetime import datetime

from django.contrib.gis.gdal.prototypes.srs import new_ct
from rest_framework.decorators import api_view
from rest_framework.response import Response
import socket
from .models import Client
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.contrib.auth.models import User

def add_log(log_data, err=False):
    today = datetime.today().strftime('%d-%m-%Y')
    time = datetime.today().strftime('%H:%M:%S')
    path = os.path.expanduser("~") + "/RemoteMonitor/"
    if err:
        with open(path + today + ".log", "a+") as f:
            f.write("[Error]" + time + " " + log_data + "\n")
    else:
        with open(path + today + ".log", "a+") as f:
            f.write("[Log]" + time + " " + log_data + "\n")

def perform_shutdown(client):
    port = 65432
    data = "shutdown"
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.connect((client.ip, port))
        sock.sendall(bytes(data, "utf-8"))

        received = str(sock.recv(1024), "utf-8")
        return received

@api_view(['POST'])
def login(request):
    username = request.POST['username']
    password = request.POST['password']

    user = authenticate(username=username, password=password)
    print(user)
    print("checking auth info")
    if user is not None:

        django_login(request, user)
        if request.user.is_staff:
            add_log("admin: '" + username + "'"+ " logged in", err=False)
            return Response("admin")
        else:
            add_log("operator: '" + username + "'" + " logged in", err=False)
            return Response("operator")

    else:
        add_log("authentication error", err=True)
        return Response("auth_error")

@api_view(['GET'])
def logout(request):
    add_log("user logging out", err=False)
    django_logout(request)
    return Response("logout_OK")

@api_view(['GET'])
def get_status(request):
    clients = Client.objects.all()
    port = 65432
    data = "request_status"
    responseData = []
    for client in clients:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                sock.connect((client.ip, port))
                sock.sendall(bytes(data, "utf-8"))

                received = str(sock.recv(1024), "utf-8")
        except:
            received = '["n/a", "n/a"]'
        # print("Received:", json.loads(received))
        responseData.append({"name" : client.name, "ip": client.ip, "user": client.user, "status" : json.loads(received)})

    return Response(responseData)

@api_view(['GET'])
def list_devices(request):
    responseData = []

    command = ["sudo", "arp-scan", "--plain", "--format=${ip}, ${vendor}", "-l"]
    activeHosts = subprocess.run(command, capture_output=True, text=True).stdout
    activeHosts = activeHosts.split("\n")
    del activeHosts[-1]  # sterge ultimul element null, creat din cauza ultimului caracter newline '\n'

    add_log("admin queried network devices", err=False)

    activeHosts.sort()
    activeHosts.insert(0, '127.0.0.0, Localhost')
    activeHosts = list(dict.fromkeys(activeHosts)) #sterge intrarile duplicate
    for hosts in activeHosts:
        formatedData = hosts.split(",")
        if Client.objects.filter(ip=formatedData[0]):
            responseData.append({"ip": formatedData[0], "vendor": formatedData[1], "connected": 1})
        else:
            responseData.append({"ip": formatedData[0], "vendor": formatedData[1], "connected": 0})

    return Response(responseData)

@api_view(['POST'])
def add_device(request):
    ip = request.POST['ip']
    name = request.POST['name']
    user = request.POST['user']

    newDevice = Client.objects.update_or_create(
        ip=ip,
        user=user,
        name=name
    )

    command1 = "./backendLicenta/create_sshKey.sh " + user + " " + ip
    subprocess.Popen(command1, shell=True)

    command2 = "ssh " + user + "@" + ip + " bash < ./backendLicenta/initialize.sh"
    subprocess.Popen(command2, shell=True)

    add_log("deivce: " + user + "@" + ip + " has been connected", err=False)
    response = "OK"
    return Response(response)

@api_view(['POST'])
def reconnect(request):
    ip = request.POST['ip']
    user = request.POST['user']

    command = "ssh " + user+"@"+ip + " \" nohup python3 ~/RemoteMonitor/TCP_receive.py\""
    subprocess.Popen(command, shell=True)
    add_log("deivce: " + user + "@" + ip + " reconnected", err=False)
    response = "success"

    return Response(response)

@api_view(['POST'])
def get_status_by_ip(request):
    clientIP = request.POST['ip']
    client = Client.objects.get(pk=clientIP)
    port = 65432
    data = "request_status"
    responseData = []

    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.connect((client.ip, port))
            sock.sendall(bytes(data, "utf-8"))

            received = str(sock.recv(1024), "utf-8")
            time.sleep(0.3)
    except:
        received = '["n/a", "n/a"]'
    # print("Received:", json.loads(received))
    responseData.append({"name": client.name, "ip": client.ip, "user": client.user, "status": json.loads(received)})
    return Response(responseData)

@api_view(['POST'])
def delete_client(request):
    clientIP = request.POST['ip']
    client = Client.objects.get(pk=clientIP)
    try:
        received = perform_shutdown(client)
    except:
        received = "none"
    command = "ssh " + client.user + "@" + client.ip + " 'rm -r ~/RemoteMonitor'"
    subprocess.check_output(command, shell=True)
    if client.delete() and received != "none":
        add_log("device " + client.user + "@" + clientIP + " has been deleted", err=False)
        response = "success"
    else:
        add_log("deleting device " + client.user + "@" + clientIP + " failed", err=True)
        response = "delete_error"
    return Response(response)

@api_view(['POST'])
def remove_client(request):
    clientIP = request.POST['ip']
    client = Client.objects.get(pk=clientIP)

    if client.delete():
        add_log("device " + client.user + "@" + clientIP + "has been removed", err=False)
        response = "success"
    else:
        add_log("removing device " + client.user + "@" + clientIP + "failed", err=True)
        response = "remove_error"
    return Response(response)

@api_view(['POST'])
def shutdown_client(request):
    clientIP = request.POST['ip']
    client = Client.objects.get(pk=clientIP)
    try:
        received = perform_shutdown(client)
        add_log("device " + client.user + "@" + clientIP + " has been shut down", err=False)
    except:
        add_log("shutting down device " + client.user + "@" + clientIP + "failed", err=True)
        received = "shutdown_error"

    responseData = [{"result": received}]
    return Response(responseData)

@api_view(['POST'])
def run_command(request):
    clientIP = request.POST['ip']
    commandInput = request.POST['command']
    client = Client.objects.get(pk=clientIP)

    responseData = []

    command = "ssh " + client.user + "@" + client.ip + " '" + commandInput + "'"

    try:
        result = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT)
        add_log("admin ran '" + command + "' on device " + client.user + "@" + clientIP, err=False)
        print(str(result, "utf-8"))
    except subprocess.CalledProcessError as e:
        result = ">" + e.output + "<"
        add_log(result, err=True)
        print(result)

    responseData.append({"result":str(result, "utf-8")})

    return Response(responseData)

@api_view(['POST'])
def upload_file(request):
    responseData = []
    # sunt preluate: fișierul transmis, adresa IP a clientului, numele fișierului și
    # opțiunea de rulare selectate în formularul din interfața web, transmise
    # prin formularul de tip POST
    if request.method == "POST":
        script = request.FILES.get('script')
        clientIP = request.POST['ip']
        fileName = request.POST['fileName']
        time = request.POST['time']
        # este selectat obiectul client din baza de date, dupa adresa IP a acestuia
        client = Client.objects.get(pk=clientIP)
        responseData.append({"result": "received"})

        add_log("file was uploaded to device " + client.user + "@" + clientIP, err=False)

        # fișierul primit este citit, iar conținutul este copiat într-un
        # fișier temporar pentru a putea fi trimis către dispozitivul client
        file_content = script.read().decode("utf_8")
        with open("/tmp/remoteScript", 'w') as tmp:
            tmp.write(file_content)
        print(file_content, time)

        # pentru toate opțiunile în care fișierul nu trebuie rulat imediat, se va transfera fișierul
        # pe dispozitivul client folosind comanda pentru transfer securizat "scp",
        # și se atribuie permisiunile necesare fișierului pentru a putea fi rulat.
        if time != "run":
            command = "scp /tmp/remoteScript " + client.user + "@" + client.ip + ":~/RemoteMonitor/" + fileName
            subprocess.check_output(command, shell=True)
            command = "ssh " + client.user + "@" + client.ip + " \"chmod +x ~/RemoteMonitor/\"" + fileName
            subprocess.check_output(command, shell=True)
        # pentru fiecare optiune, este specificată comanda care trebuie rulată, respectiv string-ul "null"
        # daca nu trebuie rulată nici o altă comandă, și string-ul care trebuie adaugat în sistemul crontab
        # pentru rularea periodică a fișierului.
        if time == "transfer":
            command = "null"
            cronString = "null"
        elif time == "run":
            command = "ssh " + client.user + "@" + client.ip + " bash < ~/RemoteMonitor/" + fileName
            cronString = "null"
        elif time == "day":
            command = "null"
            cronString = "@daily ~/RemoteMonitor/" + fileName
        elif time == "hour":
            command = "null"
            cronString = "@hourly ~/RemoteMonitor/" + fileName
        elif time == "startup":
            command = "null"
            cronString = "@reboot ~/RemoteMonitor/" + fileName
        else:
            command = "null"
            cronString = "null"

        # atunci când este necesară adăugarea unei reguli pentru rulare periodică,
        # sunt copiate toate regulile anterioare din sistemul crontab,
        # se crează un fișier temporar cu regulile precedente, la care se adaugă noua regulă,
        # și se aplică fișierul creat in sistemul crontab, după care fisierul temporar este șters
        if cronString != "null":
            print(cronString)
            copy_current_crontab = "ssh " + client.user + "@" + client.ip + " \"crontab -l > /tmp/cronjob\""
            subprocess.check_output(copy_current_crontab, shell=True)
            edit_tmp_file = "ssh " + client.user + "@" + client.ip + " \"echo \'" + cronString + "\' >> /tmp/cronjob\""
            subprocess.check_output(edit_tmp_file, shell=True)
            apply_new_crontab = "ssh " + client.user + "@" + client.ip + " crontab /tmp/cronjob"
            subprocess.check_output(apply_new_crontab, shell=True)
            remove_temp_file = "ssh " + client.user + "@" + client.ip + " rm -rf /tmp/cronjob"
            subprocess.check_output(remove_temp_file, shell=True)
        # dacă este necesară rularea unei comenzi, aceasta este este executată folosind subprocess
        if command != "null":
            subprocess.check_output(command, shell=True)
    return Response(responseData)

@api_view(['POST'])
def get_users(request):
    username = request.POST['username']
    formatedUserList = []
    if User.objects.get(username=username).is_staff:
        userList = User.objects.all()
        add_log("admin '" + username + "' requested user list", err=False)
        for users in userList:
            formatedUserList.append({"username": users.username, "is_staff": str(users.is_staff)})


    if len(formatedUserList) == 0:
        add_log("user list could not be provided", err=True)
        return Response("user list error")
    return Response(formatedUserList)

@api_view(['POST'])
def set_permissions(request):
    activeUser = request.POST['activeUser']
    username = request.POST['username']
    status = request.POST['status']

    print(activeUser, username, status)

    if User.objects.get(username=activeUser).is_staff:

        user = User.objects.get(username=username)
        if status == "admin":
            user.is_staff = True
            add_log("admin '" + activeUser + "' set " + username + "status to admin")
        else:
            user.is_staff = False
            add_log("admin '" + activeUser + "' set " + username + "status to operator")
        user.save()
    else:
        add_log("user '" + activeUser + "' does not have permission to change user status")
        return Response("set_permissions error")
    return Response("OK")

@api_view(['POST'])
def create_account(request):
    username = request.POST['username']
    password = request.POST['password']
    newUser = User.objects.create_user(username, "", password)
    newUser.save()
    return Response("OK")