import logging

events = dict()

def add(event_type: str, fn):
    logging.debug(f"Adding event: {event_type}")
    if not event_type in events:
        events[event_type] = []
    events[event_type].append(fn)

def post(event_type: str, *args):
    output = {}
    if not event_type in events:
        return output
        
    for fn in events[event_type]:
        o = fn(*args)
        output.update({fn.__name__ :o})
    #logging.debug(f"Event.post output: {output}")
    return output