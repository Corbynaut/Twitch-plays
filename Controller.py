import time
import sys
import threading
import queue
import vgamepad as vg
from random import randint
import json
import multiprocessing
from  enum import IntFlag

class XBOX_BUTTON(IntFlag):
    A = vg.XUSB_BUTTON.XUSB_GAMEPAD_A
    B = vg.XUSB_BUTTON.XUSB_GAMEPAD_B
    X = vg.XUSB_BUTTON.XUSB_GAMEPAD_X
    Y = vg.XUSB_BUTTON.XUSB_GAMEPAD_Y
    DPAD_UP = vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_UP
    DPAD_DOWN = vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_DOWN
    DPAD_LEFT = vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_LEFT
    DPAD_RIGHT = vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_RIGHT
    START = vg.XUSB_BUTTON.XUSB_GAMEPAD_START
    BACK = vg.XUSB_BUTTON.XUSB_GAMEPAD_BACK    
    LEFT_THUMB = vg.XUSB_BUTTON.XUSB_GAMEPAD_LEFT_THUMB
    LEFT_SHOULDER = vg.XUSB_BUTTON.XUSB_GAMEPAD_LEFT_SHOULDER
    RIGHT_THUMB = vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_THUMB
    RIGHT_SHOULDER = vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_SHOULDER
    GUIDE = vg.XUSB_BUTTON.XUSB_GAMEPAD_GUIDE

def controller_process(mp_queue: multiprocessing.Queue):
    controller = Controller(mp_queue)
    controller_index = controller.gamepad.get_index()
    mp_queue.put(controller_index)
    #Wait until controller index is received
    while(mp_queue.qsize() > 0):
        pass
    controller.start()

class Controller():
    def __init__(self, mp_queue) -> None:
        self.process_queue = mp_queue

        self.__active = False
        self.threads = []
        self.task_queue = queue.Queue()
        self.workers = []
        self.message_queue = []
        self.commands_json = {}
        self.gamepad = vg.VX360Gamepad()

    def update_commands(self, json):
        self.commands_json = json
        print("updating controller commands")
        print(self.commands_json)
        sys.stdout.flush()

    def press_buttons(self, buttons: list, duration):
        self.hold_buttons(buttons)
        time.sleep(duration/1000)
        self.release_buttons(buttons)

    def hold_buttons(self, buttons: list):
        for button in buttons:
            self.gamepad.press_button(button=XBOX_BUTTON[button])
        self.gamepad.update()

    def release_buttons(self, buttons: list):
        for button in buttons:
            self.gamepad.release_button(button=XBOX_BUTTON[button])
        self.gamepad.update()

    def hold_stick(self, buttons: list):
        #send hold buttom to server
        pass

    def add_to_task_queue(self, chat_msg: str):
        self.task_queue.put(chat_msg)

    def clear_task_queue(self):
        with self.task_queue.mutex:
            self.task_queue.queue.clear()

    def execute_action(self, chat_msg: str, force_activation = False):
        for command in self.commands_json:
            if chat_msg in command.get("chat_msgs"):
                if randint(0, 99)<command.get("percentage") or force_activation:
                    for action in command.get("actions"):
                        if action.get("activation").lower() == "press":
                            self.press_buttons(action.get("buttons"), action.get("duration"))
                        elif action.get("activation").lower() == "hold":
                            self.hold_buttons(action.get("buttons"))
                        elif action.get("activation").lower() == "release":
                            self.release_buttons(action.get("buttons"))
                return        

    def worker(self):
        while self.__active:     
            chat_msg = self.task_queue.get()
            self.execute_action(chat_msg)

    def create_workers(self, n_threads = 100):
        for n in range(n_threads):
            t = threading.Thread(target=self.worker)
            t.start()
            self.threads.append(t)
        return True
    
    def start(self, n_threads=100):
        self.__active = True
        self.create_workers(n_threads)

        while self.__active:
            q_msg = self.process_queue.get()
            if q_msg.get("type") == "STOP":
                self.stop()
                return
            elif q_msg.get("type") == "PAUSE":
                pause = True
                self.clear_task_queue()
            elif q_msg.get("type") == "RESUME":
                pause = False
            elif q_msg.get("type") == "UPDATE":
                #pause is maybe not necessary
                pause = True
                self.clear_task_queue()
                self.update_commands(q_msg.get("value"))
                pause = False

            if pause:
                continue
            if q_msg.get("type") == "MSG" and q_msg.get("value"):
                self.add_to_task_queue(q_msg.get("value"))

            if q_msg.get("type") == "TEST" and q_msg.get("value"):
                self.execute_action(q_msg.get("value"), force_activation = True)


    def stop(self):
        self.__active = False
        self.clear_task_queue()
        for t in self.threads:
            t.join()