from flask import Flask, render_template, redirect, request,  flash, jsonify , url_for
from flask_socketio import join_room, SocketIO, emit
import json
import os
import argparse
import logging
import requests
import Event as event
import Load as load

authenticated = False
async_mode = None

app = Flask(__name__)
app.config['WTF_CSRF_CHECK_DEFAULT'] = False
socketio = SocketIO(app)#, async_mode=async_mode)

global_room = []


def authenticate(msg="You need to authenticate your Twitch account"):
    logging.debug("Authenticate")
    socketio.emit('authenticate_response', msg)

def is_authenticated():
    global authenticated
    authenticated = True
    logging.debug("IS AUTHENTICATED")
    socketio.emit('is_authenticated_response')

def revoke_authentication(msg = "Authentication was revoked"):
    global authenticated    
    authenticated = False
    authenticate(msg)

def add_chat_message(channel, user, msg):
    #logging.debug(f"{user}: {msg}")
    socketio.emit("chat_message_response", {"channel": channel, "user": user, "msg": msg})

def delete_chat_message(user, msg):
    socketio.emit("delete_chat_message", data = (user, msg))

@socketio.event
def connect():   
    sid = request.sid
    logging.info("Flask.socketio connected to the server")
    if event.post("twitch_validate_token").get("validate_token"):
        event.post("server_is_authenticated")
    else:
        event.post("server_authenticate")

    #Send channels
    channels = event.post("twitch_get_joined_channels").get("get_joined_channels")
    for channel in channels:
        join_channel(channel)

    #Send controllers
    controllers = event.post("twitch_get_controllers").get("get_controllers")
    for controller in controllers:
        index = controller.get("Index")
        regex = controller.get("Partition")
        if index and regex:      
            client_add_controller(index, regex, receiver=sid) 

    #Update Commands
    client_update_commands(receiver = sid)

    #Set pause button
    set_pause_button(receiver = sid) 

    
@socketio.on("access_token_event")
def access_token_event(msg):
    if msg:
        #is_authenticated()
        event.post("twitch_access_token", msg["access_token"])
    #if not authenticated:
    #    authenticate()

@socketio.on("update_commands")
def update_commands(dict_list):
    event.post("twitch_update_commands", {"type": "UPDATE", "value": dict_list})
    event.post("twitch_save_commands", "test", dict_list)

@socketio.on("update_command_interval")
def update_command_interval(interval):
    event.post("twitch_set_message_interval", interval)

@socketio.on("update_command_k_most")
def update_command_k_most(k_most):
    event.post("twitch_set_k_messages", k_most)

@socketio.on("test_command")
def test_command(msg):
    event.post("twitch_controller_command", {"user": "","type": "TEST", "value": msg})

@socketio.on("load_commands")
def load_commands(game):
    event.post("twitch_load_commands", game)

def client_update_commands(receiver = None):
    current_commands = event.post("twitch_get_commands").get("get_commands")
    json = current_commands.get("json")
    file = current_commands.get("file")
    if json == None or file == None:
        return
    socketio.emit("update_commands", data = (json, file), room = receiver)

@socketio.on("send_client_id")
def send_client_id(client_id = None):
    if not client_id:
        client_id = event.post("twitch_get_client_id").get("get_client_id")
    socketio.emit("client_id", client_id)

@socketio.on("send_access_token")
def send_access_token(access_token = None):
    if not access_token:
        access_token = event.post("twitch_get_access_token").get("get_access_token")
    socketio.emit("access_token", access_token)

@socketio.on("join_channel_request")
def join_channel_request(channel):
    event.post("twitch_join_channel", channel)

def join_channel(channel):
    socketio.emit("join_channel", channel)

def leave_channel(channel):
    socketio.emit("leave_channel", channel)

@socketio.on("leave_channel_request")
def leave_channel_request(channel):
    event.post("twitch_leave_channel", channel)

@socketio.on("add_controller")
def add_controller():
    event.post("twitch_add_controller")

@socketio.on("pause_twitch_plays")
def pause_twitch_plays():
    event.post("twitch_stop_receiving_messages")

@socketio.on("resume_twitch_plays")
def resume_twitch_plays():
    event.post("twitch_continue_receiving_messages")

def set_pause_button(receiver = None):
    """
        b_receive_messages == False: currently receiving messages
        b_receive_messages == True: currently twitch plays is currenty paused
    """
    b_receive_messages = event.post("twitch_get_b_receive_messages").get("get_b_receive_messages")
    socketio.emit("set_pause_button", data=(b_receive_messages), room=receiver)


@socketio.on("command_file_infos_request")
def command_file_infos_request():
    #Check every .json file in the commands directory if it is valid and then
    #Get the file info of every command save file
    json_files = [pos_json for pos_json in os.listdir("./commands") if pos_json.endswith('.json')]
    save_files = []
    for i, file_name in enumerate(json_files):
        with open(f"./commands/{file_name}", 'r', encoding='utf8') as file:
            jsn = json.load(file)
            save_file_dict = {}
            if load.check_json(jsn):
                save_file_dict.update({"game": jsn.get("game"), "file_name": file_name[:-5], "box_art_url": jsn.get("box_art_url")})
                save_files.append(save_file_dict)
    print(save_file_dict)  # for me this prints ['foo.json']
    socketio.emit("command_file_infos", save_files)

@socketio.on("save_as")
def save_as(jsn, file_name):
    print("SAVE AS")

    json_files = [pos_json[:-5].lower() for pos_json in os.listdir("./commands") if pos_json.endswith('.json')]
    if file_name.lower() in json_files:
        print("DUPLICATE FILE")
        socketio.emit("save_as_window_duplicate")
        return
    else:
        save(jsn, file_name)
    #socketio.emit("save_as_window_error", {"status": status, "value": value})

@socketio.on("save")
def save(jsn, file_name):
    print(f"SAVE: {jsn}")
    if load.save_json(jsn, file_name):
        socketio.emit("alert_message", {"type": "success", "msg": f"Saved {file_name}"})
    else:
        socketio.emit("alert_message", {"type": "error", "msg": f"Could not save {file_name}"})
    #socketio.emit("hide_save_modal")

@socketio.on("update_partition")
def update_partitions(controller_index, regex):
    event.post("twitch_set_partition", controller_index, regex)

@app.route("/home")
def home():
    return render_template('home.html')

@socketio.on("shutdown")
def shutdown_event():
    socketio.stop()
    logging.info("Shutting down the webserver")

def send_alert_message(type, msg):
    socketio.emit("alert_message", {"type": type, "msg": msg})

def client_add_controller(index, regex, receiver = None):
    socketio.emit("add_controller", data=(index, regex), room = receiver)

def start(): 
    parser = argparse.ArgumentParser(description='Starts a local webserver providing a GUI.')
    parser.add_argument('--port', help='output format (default: %(default)s)', type=int, default=5000)
    app.secret_key = os.urandom(24)
    logging.info("Starting webserver ...")
    app.config['TEMPLATE_AUTO_RELOAD'] = True
    os.environ['FLASK_ENV'] = "development"
    os.environ['TEMPLATE_AUTO_RELOAD'] = "True"
    socketio.run(app, debug=True, use_reloader=False, host="0.0.0.0")

def shutdown():
    socketio.emit("shutdown_request")

def setup_event_handlers():
    event.add("server_authenticate", authenticate)
    event.add("server_is_authenticated", is_authenticated)
    event.add("server_revoke_authentication", revoke_authentication)
    event.add("server_add_chat_message", add_chat_message)
    event.add("server_delete_chat_message", delete_chat_message)
    event.add("client_update_commands", client_update_commands)
    event.add("server_send_client_id", send_client_id)
    event.add("server_send_access_token", send_access_token)    
    event.add("server_join_channel", join_channel) 
    event.add("server_leave_channel", leave_channel)
    event.add("server_send_alert_message", send_alert_message)    
    event.add("client_add_controller", client_add_controller)
    event.add("server_twitch_plays_set_pause_button", set_pause_button)

if __name__ == "__main__":
    #start()
    command_file_infos_request()