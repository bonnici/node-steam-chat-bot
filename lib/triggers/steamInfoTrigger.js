var util = require('util');
var request = require('request');
var winston = require('winston');
var BaseTrigger = require('./baseTrigger.js').BaseTrigger;

/*
Trigger that responds to messages using Wolfram Alpha.
command = string - a message must start with this + a space before a response will be given
appId = string - the app ID to use when creating a new client
OR
client = wolfram client - use this as the client if it is passed as an option
*/

var SteamInfoTrigger = function() {
	SteamInfoTrigger.super_.apply(this, arguments);
};

util.inherits(SteamInfoTrigger, BaseTrigger);

var type = "SteamInfoTrigger";
exports.triggerType = type;
exports.create = function(name, chatBot, options) {
	var trigger = new SteamInfoTrigger(type, name, chatBot, options);
	return trigger;
};

// Return true if a message was sent
SteamInfoTrigger.prototype._respondToFriendMessage = function(userId, message) {
	return this._respond(userId, message);
}

// Return true if a message was sent
SteamInfoTrigger.prototype._respondToChatMessage = function(roomId, chatterId, message) {
	return this._respond(roomId, message);
}


SteamInfoTrigger.prototype._respond = function(toId, message) {
	var steamid = this._stripCommand(message);
	if (steamid) {
		var that = this;
		var vacbansinfo={};
		var steamrepinfo={};
		var vacbansurl="http://www.vacbans.com/api/?call=profile&comm_id="+steamid;
			winston.info("Checking vacbans.com for " + steamid + " at " + vacbansurl);
		request(vacbansurl, function(error, response, body) {
			if (error) {
				that._sendMessageAfterDelay(toId, "¯\\_(ツ)_/¯");
				winston.warn("Code " + response.statusCode + " from vacbans.com for steamid " + steamid);
				return;
			}
			vacbansinfo = body;
		});
			winston.info("Checking steamrep.com for " + steamid);
		request.get({url:'http://steamrep.com/api/beta/reputation/'+steamid+'?json=1',json:true,followAllRedirects:true}, function(error, response, body) {
			if (error) {
				that._sendMessageAfterDelay(toId, "¯\\_(ツ)_/¯");
				winston.warn("Code " + response.statusCode + " from steamrep for steamid " + steamid);
				return;
			}
			steamrepinfo = body;
		});
		var result = that._getParsedResult(vacbansinfo,steamrepinfo);
		if (result) {
			that._sendMessageAfterDelay(toId, result);
		}
		else {
			that._sendMessageAfterDelay(toId, "¯\\_(ツ)_/¯");
		}

		return true;
	}
	return false;
}

SteamInfoTrigger.prototype._stripCommand = function(message) {
	if (this.options.command && message && message.toLowerCase().indexOf(this.options.command.toLowerCase() + " ") == 0) {
		return message.substring(this.options.command.length + 1);
	}
	return null;
}

SteamInfoTrigger.prototype._getParsedResult = function(inputvacbaninfo,inputsteamrepinfo) {
	if (inputvacbaninfo && inputsteamrepinfo) {
		var vacbaninfo = inputvacbaninfo;
		var steamrepinfo = inputsteamrepinfo;
		if(vacbaninfo.success==false) return null;
		var created = new Date(vacbaninfo["account_created"]);

result = vacbaninfo.name + "'s " + (vacbaninfo.public==1 ? "public" : "private") + " account was created on " + Date(vacbaninfo["account_created"]).toDateString;
result += ", has " + (vacbaninfo.vacban==1 ? "not" : "") + "been VAC banned and ";
//result += (steamrepinfo.steamrep[0].flags[0].status=="exists" ? (steamrepinfo.steamrep.flags.reputation ? "has a steamrep status of '" + steamrepinfo.steamrep.flags.reputation + ".": "has no special status on steamrep.") : "is not in steamrep's database");

		return result;
	}
	return null;
}

var _extractResult = function(result) {
	if (result.subpods[0] && result.subpods[0].value) {
		return result.subpods[0].value;
	}
	else if (result.subpods[0] && result.subpods[0].image) {
		return result.subpods[0].image;
	}
	return null;
}
