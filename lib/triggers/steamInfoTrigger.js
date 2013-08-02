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
		var steamrep={};
		winston.info("Checking steamrep.com for " + steamid);
		request.get({method:'GET',encoding:'utf8',uri:'http://steamrep.com/api/beta/reputation/'+steamid+'?json=1&extended=1',json:true,followAllRedirects:true}, function(error, response, body) {
			if (error) {
				that._sendMessageAfterDelay(toId, "¯\\_(ツ)_/¯");
				winston.warn("Code " + response.statusCode + " from steamrep for steamid " + steamid);
				return;
			}
			steamrep = body;
			var result = that._getParsedResult(steamrep);
			if (result) {
				that._sendMessageAfterDelay(toId, result);
			}
			else {
				that._sendMessageAfterDelay(toId, "¯\\_(ツ)_/¯");
			}
		});
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

SteamInfoTrigger.prototype._getParsedResult = function(steamrep) {
	if (steamrep.steamrep) {
		var status = steamrep.steamrep.flags.status;
		var name = steamrep.steamrep.displayname;
		var membersince = steamrep.steamrep.membersince;
		var joined = new Date(membersince*100000);
		var customurl = steamrep.steamrep.customurl;
		var joinDate = joined.getDate();
		var joinMonth = "January,February,March,April,May,June,July,August,September,October,November,December".split(",")[joined.getMonth()];
		var joinYear = joined.getFullYear();
		var joinString = joinMonth + " " + joinDate + ", " + joinYear;
		var reputation = steamrep.steamrep.reputation;
		var url64 = "http://steamcommunity.com/profiles/"+steamrep.steamrep.steamID64;

		if(status=="exists")
			result = name + "'s account " + (membersince>0 ? "was created on " + joinString + ", ": " ")
				+ (customurl!="" ? "has a custom url of http://steamcommunity.com/id/" + customurl : "has no custom url set")
				+ (membersince>0 ? ", was created on " + joinString: "")
				+ (reputation!="" ? ", and has a steamrep reputation of '" + reputation +".'": ", and has no particular reputation on steamrep.")
				+ " For more information, please visit " + url64;
		else result = "This user has not yet been added to steamrep's database. To add them, please visit "+url64;
		return result;
	}
	return null;
}
//console.log("Status: " + steamreps.steamrep.flags.status);
//console.log("reputation: " + steamreps.steamrep.reputation);
/*{ steamrep: 
   { flags: { status: 'exists' },
     steamID32: 'STEAM_0:1:69137174',
     steamID64: '76561198098540077',
     reputation: '',
     displayname: 'Old Annoying Chatbot',
     avatar: 'http://media.steampowered.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
     membersince: '1374178236',
     customurl: 'annoyingchatbot-old' } }
*/
