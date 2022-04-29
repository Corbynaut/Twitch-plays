import queue
from TwitchClient import TwitchClient
import Server as server
import Event as event
import Controller
import time
import sys
import threading
import webbrowser
import re
import logging
import multiprocessing
import json
import Load as load

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(asctime)s: %(message)s', datefmt='%H:%M:%S')# format='%(asctime)s:%(levelname)s:%(message)s')

class TwitchPlays():
    def __init__(self) -> None:
        self.client_id = "8kdkq4ayzclx1uwnpj5jyehlsksxgx"
        self.tc = TwitchClient(self.client_id)
        self.setup_event_handlers()
        self.tc.setup_event_handlers() 
        server.setup_event_handlers()
        self.__server_thread = threading.Thread(target=server.start)
        self.__twitchplays_thread = threading.Thread(target=self.start_twitch_plays)
        self.controllers = []

        self.current_commands = {"file": None, "json": None}
        
        #for i in range(4):
        #    self.create_controller()

        self.test_channel = ["dougdougw", "xqcow", "smallant", "corbynaut"][3]

    def create_controller(self):
        #Programs might only see 4 controllers
        if len(self.controllers) >= 4:
            #TODO send error msg
            return

        controller_index = 0
        controller = {}
        controller.update({"Queue": multiprocessing.Queue()})
        controller.update({"Controller": multiprocessing.Process(target=Controller.controller_process, args=(controller.get("Queue"), ))})
        controller.update({"Partition": "^.*"})
        controller.get("Controller").start()
        #Wait for controller index
        controller_index = controller.get("Queue").get()
        controller.update({"Index": controller_index})
        self.controllers.append(controller)
        logging.debug(f"Created controller with index {controller_index}")
        event.post("client_add_controller", controller_index, controller.get("Partition"))
        event.post("server_send_alert_message", "sucess", f"Added controller with index {controller_index}")

    def get_controllers(self):
        return self.controllers

    def start_twitch_plays(self):
        while True:
            #TODO: REWORK
            while not self.tc.log_in(): time.sleep(5)
            while self.tc.validate_token():
                logging.debug("LOGED IN AND TRYING TO CONNECT TO TWITCH IRC")
                self.tc.connect()
                #while True: 
                #    print("connect")
                #    time.sleep(5)
                #self.tc.receive_messages()

        #    self.tc.log_in()
        #    while self.tc.validate_token():
        #        self.tc.connect()
        #        if not self.tc.join_channel(self.test_channel):
        #            continue
        #        self.tc.receive_messages()
        #        self.tc.leave_channel(self.test_channel)
        #        time.sleep(5)

    def start(self):
        logging.info("Starting Twitch Plays")
        self.__server_thread.start()
        self.__twitchplays_thread.start()
        
    def stop(self):  
        if self.__server_thread:
            logging.info("shutting down twitch plays")
            self.__server_thread.join()
        if self.__twitchplays_thread:
            logging.info("shutting down webserver")
            self.__twitchplays_thread.join()
        self.reset_keys()

    def reset_keys(self):
        pass

    def controller_command(self, command):
        for controller in self.controllers:
            user = command.get("user")
            if user == None:
                user = ""

            print(controller.get("Partition"))
            print(re.search(controller.get("Partition"), user))
            print(bool(re.search(controller.get("Partition"), user)))
            if re.search(controller.get("Partition"), user) or command.get("type") == "TEST": 
                print(f"send {command} to controller {controller.get('Index')}")
                controller.get("Queue").put(command)

    def save_commands(self, game, commands):
        date = 0
        data = {
            "game" : game,
            "updated" : date,
            "commands" : commands
        }
        if load.check_json(data):
            with open(f"./commands/{game}.json", 'w', encoding='utf8') as file:
                json.dump(data, file, indent=2)
            logging.info(f"Saved {game} commands")
        else:
            logging.warning(f"Failed to save the commands for {game}")

    def join_channel(self, channel):
        return self.tc.join_channel(channel)

    def leave_channel(self, channel):
        return self.tc.leave_channel(channel)

    def get_commands(self):
        return self.current_commands

    def load_commands(self, file_name):
        data = load.load_json_file(file_name)
        #with open(f"./commands/{game}.json", 'r', encoding='utf8') as file:
        #    data = json.load(file)
        if data:
            event.post("twitch_update_commands", {"type": "UPDATE", "value": data.get("commands")})
            self.current_commands.update({"file": file_name})
            self.current_commands.update({"json": data})
            event.post("client_update_commands")
            logging.info(f"Loaded {file_name} commands")
        else:
            logging.warning(f"Failed to load the commands for {file_name}")

    def set_partition(self, controller_index, regex):
        if regex == "" or regex == None:
            #change regex to accept every input
            regex = "^.*"
        
        try:
            re.compile(regex)        
        except re.error:
            logging.warning(f"Non valid regex pattern")
            return

        for controller in self.controllers:
            index = int(controller.get("Index"))
            if index == int(controller_index):
                controller.update({"Partition": regex})
                logging.info(f"set partition of {controller_index} to {regex}")
                return

    def setup_event_handlers(self):
        event.add("twitch_controller_command", self.controller_command)
        event.add("twitch_update_commands", self.controller_command)
        event.add("twitch_save_commands", self.save_commands)
        event.add("twitch_load_commands", self.load_commands)
        event.add("twitch_join_channel", self.join_channel)
        event.add("twitch_leave_channel", self.leave_channel)
        event.add("twitch_add_controller", self.create_controller)
        event.add("twitch_get_controllers", self.get_controllers)
        event.add("twitch_set_partition", self.set_partition)
        event.add("twitch_get_commands", self.get_commands)

if __name__ == "__main__":   
    tp = TwitchPlays()
    tp.start()