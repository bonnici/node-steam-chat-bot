var util = require('util');
var winston = require('winston');
var request = require('request');

var BaseTrigger = require('./baseTrigger.js').BaseTrigger;

/*
 Trigger that responds to messages with the first matching google result.
 command = string - a message must start with this + a space to search google
 */

var GoogleTrigger = function() {
	GoogleTrigger.super_.apply(this, arguments);
};

util.inherits(GoogleTrigger, BaseTrigger);

var type = "GoogleTrigger";
exports.triggerType = type;
exports.create = function(name, chatBot, options) {
	var trigger = new GoogleTrigger(type, name, chatBot, options);

	return trigger;
};

// Return true if a message was sent
GoogleTrigger.prototype._respondToFriendMessage = function(userId, message) {
	return this._respond(userId, message);
}

// Return true if a message was sent
GoogleTrigger.prototype._respondToChatMessage = function(roomId, chatterId, message) {
	return this._respond(roomId, message);
}

GoogleTrigger.prototype._respond = function(toId, message) {
	var query = this._stripCommand(message);
	if (query) {
		var url = "https://www.googleapis.com/customsearch/v1?q=" + encodeURIComponent(query) + "&num=1&key=" + encodeURIComponent(this.options.apiKey) + "&cx=" + encodeURIComponent(this.options.csiId);
		var that = this;
		request(url, function (err, response, body) {
			if (err || response.statusCode != 200) {
				winston.error("Error querying google or invalid response: " + err + "/" + response.statusCode);
				that._sendMessageAfterDelay(toId, "¯\\_(ツ)_/¯");
			} else {
				var result = JSON.parse(body)
				that._sendMessageAfterDelay(toId, result.items[0].title + ": " + result.items[0].link);
			}
		});

		return true;
	}
	return false;
}

GoogleTrigger.prototype._stripCommand = function(message) {
	if (this.options.command && message && message.toLowerCase().indexOf(this.options.command.toLowerCase() + " ") == 0) {
		return message.substring(this.options.command.length + 1);
	}
	return null;
}
