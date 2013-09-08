var util = require('util');
var winston = require('winston');
var Cleverbot = require('cleverbot-node');

var BaseTrigger = require('./baseTrigger.js').BaseTrigger;

/*
Trigger that responds to messages using cleverbot.
keywords = array of string - if this option exists, the message must contain one of these words to trigger a response

cleverbot = Cleverbot object - use this as the cleverbot if it is passed as an option
OR 
session = string - construct a new cleverbot with this session (or no session if this is not specified)
*/

var CleverbotTrigger = function() {
	CleverbotTrigger.super_.apply(this, arguments);
};

util.inherits(CleverbotTrigger, BaseTrigger);

var type = "CleverbotTrigger";
exports.triggerType = type;
exports.create = function(name, chatBot, options) {
	var trigger = new CleverbotTrigger(type, name, chatBot, options);

	if (trigger.options.cleverbot) {
		trigger.cleverbot = trigger.options.cleverbot
	}
	else {
		trigger.cleverbot = new Cleverbot();
		if (trigger.options.session) {
			winston.info("Setting Cleverbot session: " + trigger.options.session);
			trigger.cleverbot.params.sessionid = trigger.options.session;
			trigger.session = trigger.options.session;
		}
	}

	return trigger;
};

// Return true if a message was sent
CleverbotTrigger.prototype._respondToFriendMessage = function(userId, message) {
	return this._respond(userId, message);
}

// Return true if a message was sent
CleverbotTrigger.prototype._respondToChatMessage = function(roomId, chatterId, message) {
	return this._respond(roomId, message);
}


CleverbotTrigger.prototype._respond = function(toId, message) {
	message = this._stripMessage(message);
	if (message) {
		this.cleverbot.params.sessionid = this.session; // Reset session in case it gets set to DENIED
		var that = this;
		this.cleverbot.write(message, function(response) {
			if (response.message != '<html>' && response.message.trim() != '') {
				that._sendMessageAfterDelay(toId, response.message.trim());
			}
		});

		return true;
	}
	return false;
}

CleverbotTrigger.prototype._stripMessage = function(message) {
	if (!this.options.keywords || this.options.keywords.length == 0) {
		return true; // Match all
	}

	for (var i=0; i < this.options.keywords.length; i++) {
		var re = new RegExp("^.*\\b" + this.options.keywords[i] + "\\b.*$", "i");
		var matches = message.match(re);
		if (matches && matches.length > 0) {
			message = message.replace(this.options.keywords[i], "");
			stripped = message.trim();
			if (stripped) {
				return message;
			}
			else {
				return null;
			}
		}
	}
	return null;
}
