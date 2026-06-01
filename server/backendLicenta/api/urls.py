from django.urls import path
from .views import *

urlpatterns = [
    path('status/', get_status, name='get_status'),
    path('listDevices/', list_devices, name='list_devices'),
    path('addDevice/', add_device, name='add_device'),
    path('reconnect/', reconnect, name='reconnect'),
    path('ipStatus/', get_status_by_ip, name='get_status_by_ip'),
    path('runCommand/', run_command, name='run_command'),
    path('deleteClient/', delete_client, name='delete_client'),
    path('removeClient/', remove_client, name='remove_client'),
    path('shutdownClient/', shutdown_client, name='shutdown_server'),
    path('uploadFile/', upload_file, name="upload_file"),
    path('authenticate/', login, name="authenticate"),
    path('logout/', logout, name="logout"),
    path('getUsers/', get_users, name="get_users"),
    path('setPermissions/', set_permissions, name="set_permissions"),
    path('createAccount/', create_account, name="create_account"),

]