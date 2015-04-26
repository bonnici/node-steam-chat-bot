var util = require('util');
var winston = require('winston');
var youtube_node = require('youtube-node');

var BaseTrigger = require('./baseTrigger.js').BaseTrigger;

/*
Trigger that responds to messages with the first matching YouTube search result.
command = string - a message must start with this + a space before a response will be given
rickrollChance = float - a probability (between 0 and 1) that the trigger will respond with a rickroll
*/

var YoutubeTrigger = function() {
	YoutubeTrigger.super_.apply(this, arguments);
};

util.inherits(YoutubeTrigger, BaseTrigger);

exports.RickrollUrl = 'http://www.youtube.com/watch?v=oHg5SJYRHA0';

var type = "YoutubeTrigger";
exports.triggerType = type;
exports.create = function(name, chatBot, options) {
	var trigger = new YoutubeTrigger(type, name, chatBot, options);

	trigger.options.youtube = trigger.options.youtube || new youtube_node();

	trigger.options.youtube.setKey(trigger.options.apiKey);
	
	return trigger;
};

// Return true if a message was sent
YoutubeTrigger.prototype._respondToFriendMessage = function(userId, message) {
	return this._respond(userId, message);
}

// Return true if a message was sent
YoutubeTrigger.prototype._respondToChatMessage = function(roomId, chatterId, message) {
	return this._respond(roomId, message);
}

YoutubeTrigger.prototype._respond = function(toId, message) {
	var query = this._stripCommand(message);
	if (query) {

		if (this._shouldRickroll()) {
			this._sendMessageAfterDelay(toId, exports.RickrollUrl);
			return true;
		}

		var that = this;
		this.options.youtube.search(query, 1, function(error, result) {
			if (error) {
				winston.error("Error querying youtube: " + error);
				that._sendMessageAfterDelay(toId, "¯\\_(ツ)_/¯");
			}
			else {
				if (!result || !result.items || result.items.length < 1) {
					winston.error("No results from youtube");
					that._sendMessageAfterDelay(toId, "¯\\_(ツ)_/¯");
				} else {
					that._sendMessageAfterDelay(toId, "http://www.youtube.com/watch?v=" + result.items[0].id.videoId);
				}
			}
		});

		return true;
	}
	return false;
}

YoutubeTrigger.prototype._shouldRickroll = function() {
	if (this.options.rickrollChance) {
		var random = Math.random();
		return random < this.options.rickrollChance;
	}
	return false;
}

YoutubeTrigger.prototype._stripCommand = function(message) {
	if (this.options.command && message && message.toLowerCase().indexOf(this.options.command.toLowerCase() + " ") == 0) {
		return message.substring(this.options.command.length + 1);
	}
	return null;
}