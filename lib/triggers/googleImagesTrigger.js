var util = require('util');
var winston = require('winston');
var images = require('google-images');

var BaseTrigger = require('./baseTrigger.js').BaseTrigger;

/*
 Trigger that responds to messages with the first matching google image result.
 command = string - a message must start with this + a space to search google images
 */

var GoogleImagesTrigger = function() {
	GoogleImagesTrigger.super_.apply(this, arguments);
};

util.inherits(GoogleImagesTrigger, BaseTrigger);

var type = "GoogleImagesTrigger";
exports.triggerType = type;
exports.create = function(name, chatBot, options) {
	var trigger = new GoogleImagesTrigger(type, name, chatBot, options);

	trigger.options.imagesClient = trigger.options.imagesClient || images(trigger.options.csiId, trigger.options.apiKey);

	return trigger;
};

// Return true if a message was sent
GoogleImagesTrigger.prototype._respondToFriendMessage = function(userId, message) {
	return this._respond(userId, message);
}

// Return true if a message was sent
GoogleImagesTrigger.prototype._respondToChatMessage = function(roomId, chatterId, message) {
	return this._respond(roomId, message);
}

GoogleImagesTrigger.prototype._respond = function(toId, message) {
	var query = this._stripCommand(message);
	if (query) {
		var that = this;
		this.options.imagesClient.search(query).then(
			function(images) {
				if (!images || images.length < 1) {
					that._sendMessageAfterDelay(toId, "¯\\_(ツ)_/¯");
				} else {
					that._sendMessageAfterDelay(toId, images[0].url);
				}
			},
			function(err) {
				winston.error("Error querying google images: " + err);
				that._sendMessageAfterDelay(toId, "¯\\_(ツ)_/¯");
			});

		return true;
	}
	return false;
}

GoogleImagesTrigger.prototype._stripCommand = function(message) {
	if (this.options.command && message && message.toLowerCase().indexOf(this.options.command.toLowerCase() + " ") == 0) {
		return message.substring(this.options.command.length + 1);
	}
	return null;
}
