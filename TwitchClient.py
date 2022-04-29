from email import message
import requests
import socket
import Event as event
import time
import sys
import random
import IrcParser as ircparser
import json
import logging
import collections

class TwitchClient():
    def __init__(self, client_id) -> None:
        self.twitch_server= "irc.chat.twitch.tv"
        self.twitch_port = 6667
        self.client_id = client_id #"8kdkq4ayzclx1uwnpj5jyehlsksxgx"
        self.access_token = ""#"gb7ix1flmzj5zmyttmdfjvjofw7c4e"
        self.account_data = None
        self.joined_channels = []#["SmallAnt", "linkus7"]
        self.sock = None
        self.b_receive_messages = False
        self.stop = False
        self.message_buffer = []
        self.interval_end_time = time.time()
        self.message_interval = 0
        self.k_messages = 1
        self.command_list = []
        self.wait_until_reconnect = 1

    def connect(self):
        if self.sock:
            self.disconnect()

        #print(f"Connect account_data: {self.account_data}")

        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((self.twitch_server, self.twitch_port))
        self.sock.send(f"PASS oauth:{self.access_token}\n".encode('utf-8'))
        self.sock.send(f"NICK {self.account_data['login']}\n".encode('utf-8'))
        resp = ircparser.parse(self.sock.recv(4096).decode('utf-8'))
        if not resp["type"] == "001":
            #do something?
            return False
        
        for channel in self.joined_channels:
            logging.info(f"Re-joining channel {channel}")
            self.__send_join_request(channel)

        self.message_buffer = []
        #self.b_receive_messages = True
        self.continue_receiving_messages()
        self.interval_end_time = time.time() + self.message_interval

        #CAP REQ :twitch.tv/commands
        self.sock.send(f"CAP REQ :twitch.tv/commands\r\n".encode('utf-8'))

        while not self.stop:
            try:
                #TODO DO NOT WAIT FOR NEXT INPUT WHEN INTERVAL IS USED
                #The socket can receive multiple messages at once which, therefore, they need to be split up and processed separatly
                responses = self.sock.recv(4096).decode('utf-8').split("\r\n")[:-1]
                for resp in responses:
                    parsed = ircparser.parse(resp)        
                    
                    if parsed["type"] == "PRIVMSG" and self.b_receive_messages:
                        self.receive_messages(parsed)
                        continue

                    if parsed["type"] == "CLEARMSG":
                        event.post("server_delete_chat_message", parsed['user'], parsed['msg'])

                    if parsed["type"] == "PING":
                        logging.debug("PONG")
                        self.sock.send("PONG\n".encode('utf-8'))
                        continue

                    #if parsed["type"] == "JOIN":
                    #    pass

                    #On channel join
                    if parsed["type"] == "353":
                        channel = parsed["channel"]                 
                        logging.info(f"Joining channel {channel}")
                        self.joined_channels.append(channel)
                        event.post("server_join_channel", channel)
                        event.post("server_send_alert_message", "success", f"Joined channel {channel}")
                        continue

                    #On channel part
                    if parsed["type"] == "PART":
                        channel = parsed["channel"]
                        logging.info(f"Leaving channel {channel}")
                        self.joined_channels.remove(channel)          
                        event.post("server_leave_channel", channel)
                        event.post("server_send_alert_message", "success", f"Left channel {channel}")
                        continue

            except Exception as e:
                logging.error('Unexpected connection error. Reconnecting in a second...', e)
                self.stop_receiving_messages()

    def disconnect(self):
        self.stop_receiving_messages()   
        if self.sock: 
            self.sock.close()    

    def __send_join_request(self, channel):        
        channel = channel.lower()
        self.sock.send(f"JOIN #{channel}\n".encode('utf-8'))

    def join_channel(self, channel):
        channel = channel.lower()
        if not self.sock:
            return False

        if not channel in self.joined_channels:
            self.__send_join_request(channel)
            return True
            
        logging.info(f"Already joined channel {channel}")
        return True

    def __send_part_request(self, channel):
        channel = channel.lower()
        self.sock.send(f"PART #{channel}\n".encode('utf-8'))

    def leave_channel(self, channel):
        channel = channel.lower()
        if not self.sock:
            return False

        if channel in self.joined_channels:
            self.__send_part_request(channel)
            return True
            
        logging.info(f"[{channel}]: How can you leave something what you never joined")
        return True

    def revoke_token(self, msg="Authentication was revoked"):
        #TODO
        #curl -X POST 'https://id.twitch.tv/oauth2/revoke' \
        #-d 'client_id=<client id goes here>&token=<access token goes here>'
        self.disconnect()
        event.post("server_revoke_authentication", msg)

    def log_out(self):
        if self.account_data:
            logging.info("Logging out")
            self.account_data = None
            self.stop_receiving_messages()
            self.revoke_token("Just logged out.\n Please authenticate your twitch account")
            return True
        return False
    
    def set_access_token(self, access_token):
        self.access_token = access_token

    def log_in(self, token = None):    
        #try previously saved acces token if none is provided else login via browser
        if token == None:
            token = self.access_token

        if self.validate_token(token):
            logging.info("Login successfull")
            #TODO Save accesstoken
            self.access_token = token
            event.post("server_send_access_token")
            self.account_data = self.get_account_data()
            event.post("server_is_authenticated")
            return True
        else:
            logging.info("Login unsuccessful")
            #Message might be different on the website due to browser loading-times, but this still sets the authenticated flag to false
            event.post("server_revoke_authentication", "Please authenticate your twitch account")
        return False

    def validate_token(self, token = None):   
        if token == None:
            token = self.access_token

        headers = {
            'Authorization': f'Bearer {token}'
        }
        response = requests.get('https://id.twitch.tv/oauth2/validate', headers=headers) 
        if response.status_code == 200:
            logging.debug(f"Access token is valid")
            return True
        logging.debug(f"Access token is INVALID")
        self.log_out()
        return False

    def get_account_data(self):
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Client-Id': self.client_id
        }
        response = requests.get('https://api.twitch.tv/helix/users', headers=headers)
        logging.debug(f"get_account_data: {response.text}")
        if json.loads(response.text).get("status") == 401:
            event.post("server_authenticate")
            return False
        return json.loads(response.text)["data"][0]

    def receive_messages(self, parsed):
        #TODO DO NOT WAIT FOR NEXT INPUT WHEN INTERVAL IS USED
        #The socket can receive multiple messages at once which, therefore, they need to be split up and processed separatly
        #logging.debug(resp["msg"])
        channel = parsed['channel']
        user = parsed['user']
        if parsed['msg'].lower() in self.command_list:                    
            self.message_buffer.append({"user": user, "msg":parsed['msg'].lower()})
        else:
            event.post("server_add_chat_message", channel, user, parsed['msg'])

        #There is always at least on message, but not necessary a command, per interval.
        #=> We wait at least @message_interval
        if time.time() >= self.interval_end_time:
            #Get k most common commands
            #If multiple commands have the same occurance, choose random(?)/ first one
            commands = collections.Counter(message["msg"] for message in self.message_buffer).most_common(self.k_messages)
            #Send commands to controller
            for command in commands:
                logging.debug(command[0])
                event.post("twitch_controller_command", {"user": user, "type": "MSG", "value": command[0]})
            #Reset buffer and time
            self.message_buffer = []
            self.interval_end_time = time.time() + self.message_interval

    def stop_receiving_messages(self):
        #add mutex?
        self.b_receive_messages = False
        event.post("server_twitch_plays_set_pause_button")

    def continue_receiving_messages(self):
        #add mutex?
        self.b_receive_messages = True
        event.post("server_twitch_plays_set_pause_button")

    def get_b_receive_messages(self):
        return self.b_receive_messages

    def set_message_interval(self, time):
        self.message_interval = time

    def set_k_messages(self, k):
        self.k_messages = k

    def set_command_word_list(self, commands):
        list = []
        for e_dict in commands.get("value"):
            list += e_dict.get("chat_msgs")
        self.command_list = list

    def get_client_id(self):
        return self.client_id

    def get_access_token(self):
        return self.access_token

    def get_joined_channels(self):
        return self.joined_channels


    def setup_event_handlers(self):
        event.add("twitch_access_token", self.set_access_token)#self.log_in)
        event.add("twitch_revoke_access_token", self.revoke_token)
        event.add("twitch_set_message_interval", self.set_message_interval)
        event.add("twitch_set_k_messages", self.set_k_messages)
        event.add("twitch_update_commands", self.set_command_word_list)
        event.add("twitch_get_client_id", self.get_client_id)
        event.add("twitch_get_access_token", self.get_access_token)
        event.add("twitch_get_joined_channels", self.get_joined_channels)
        event.add("twitch_validate_token", self.validate_token)
        event.add("twitch_stop_receiving_messages", self.stop_receiving_messages)        
        event.add("twitch_continue_receiving_messages", self.continue_receiving_messages)
        event.add("twitch_get_b_receive_messages", self.get_b_receive_messages)
        