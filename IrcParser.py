"""
Adapted from https://github.com/Tehnix/PyIRCParser
"""

"""
Parse IRC output.

The main function of this module is the `parse` function. It takes in some
IRC output, and generates a tuple/dict/list/object (the kwarg `output` in the `parse` function) looking like the following:

From: :irc.codetalk.io 332 Innocence #lobby :Let's all have great fun! :D
To: {
    'channel': '#lobby',
    'user': None,
    'type': '332',
    'msg': 'Let us all have great fun! :D'
}
    
This will indicate that a topic has been found for a channel. An example of 
a user action would be:

From: :Tehnix!Tehnix@ghost-EC31B3C1.rdns.scalabledns.com NICK :BlaBliBlu
To: {
    'channel': None,
    'user': ('Tehnix', 'Tehnix', 'ghost-EC31B3C1.rdns.scalabledns.com'),
    'type': 'NICK',
    'msg': 'BlaBliBlu'
}

Here, the user changed his nickname from 'Tehnix' to 'BlaBliBlu'.

"""        

from pickle import NONE


def tokenize(s):
    """Tokenize the given IRC output."""
    s = s.split(':')
    if len(s) > 1:
        return s[1:]
    else:
        return []

def getNickname(t):
    """Take in a token list, and return the nickname."""
    return t[0].split('!')[0]

def strippedNickname(s):
    """Take a nickname and strip it from excessive information."""
    if len(s) > 1 and s[0:1] in ['@', '!', '&', '~']:
        return s[1:]
    else:
        return s

def getHostname(t):
    """Return the users host from a tokenized list."""
    return t[0].split('!')[1].split('@')[1].split()[0]

def getUser(t):
    """Return the user from a tokenized list."""
    return t[0].split('!')[1].split('@')[0]

def getChannel(t):
    """Return the channel from a tokenized list."""
    for item in t[0].split():
        if item.startswith('#'):
            return item[1:]
    return None

def isServerMessage(t):
    """Check if the IRC output is a server message."""
    if '!' not in t[0].split()[0]:
        return True
    return False
        
def getIRCCode(t):
    """Return the IRC code from a tokenized list."""
    c = t[0].split()[1]
    #try:
    #    int(c)
    #except ValueError:
    #    return None
    return c

def getMsg(t, code=None):
    """Return the message from a tokenized list."""
    if len(t) > 1:
        return ':'.join(t[1:])
    elif code == '333':
        return ' '.join(t[0].split()[4:])
    elif code == 'MODE':
        return ' '.join(t[0].split()[3:])
    return None

def _parse(s):
    """Parse the IRC output. By default, return a tuple. Optionally return a dict, list or an object."""
    t = tokenize(s)
    if s.startswith('PING'):
        msg = t[0]
        user = None
        channel = None
        code = 'PING'
    else:
        if isServerMessage(t):
            user = None
        else:
            user = getUser(t)

        code = getIRCCode(t)
        channel = getChannel(t)
        msg = getMsg(t, code=code)
        if code == 'PART':
            msg = channel
        if code == 'JOIN':
            channel = getMsg(t, code=code)
        if code == "CLEARMSG":
            user = channel
            channel = None

    return {
        'channel': channel,
        'user': user,
        'type': code,
        'msg': msg
    }

def parse(s):
    """Wrapper for the _parse function to handle IndexError a bit neater."""
    try:
        return _parse(s)
    except IndexError:
        return {
            'channel': None,
            'user': None,
            'type': None,
            'msg': None
        }