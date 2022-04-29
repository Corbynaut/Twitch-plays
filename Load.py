from cmath import log
import json
import logging
from jsonschema import validate, exceptions

__schema = {
                "type": "object",
                "additionalProperties": False,           
                "required": ["game", "commands"],
                "properties": {
                    "game": {"type": "string"},
                    "box_art_url": {"type": "string"},
                    "updated": {"type": "number"},
                    "commands": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "additionalProperties": False,
                            "required": ["chat_msgs", "percentage", "actions"],
                            "properties" : {
                                "chat_msgs": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                },
                                "percentage": {"type": "integer"},
                                "actions": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",                                        
                                        "additionalProperties": False,
                                        "required": ["buttons", "activation", "duration"],
                                        "properties" : {
                                            "buttons": {
                                                "type": "array",
                                                "items": {"type": "string"}
                                                },
                                            "activation": {"type": "string"},
                                            "duration": {"type": "integer"}
                                        }
                                    }
                                }
                            }   
                        }
                    }
                }
}
    

def load_json_file(file_name):
    jsn = {}
    with open(f"./commands/{file_name}.json", 'r', encoding='utf8') as file:
        jsn = json.load(file)
    if check_json(jsn):
        return jsn
    return None

def load_json_string(str):
    jsn = json.loads(str)
    if check_json(jsn):
        return jsn
    return None

def check_json(json):
    try:
        validate(instance=json, schema=__schema)
    except exceptions.ValidationError as err:
        logging.warning("JSON is not in the right format")
        return False
    return True

def save_json(jsn, file_name):    
    if not check_json(jsn):
        logging.error(f"{file_name}: JSON is not in the right format and cannot be saved to {file_name}")
        return False

    with open(f"./commands/{file_name}.json", 'w', encoding='utf8') as file:
        json.dump(jsn, file, ensure_ascii=False, indent=4)

    logging.info(f"Successfully saved data to {file_name}")
    return True

if __name__ == "__main__":
    print(load_json_file("test"))