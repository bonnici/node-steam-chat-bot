var sinon = require('sinon');

var YoutubeTrigger = require('../lib/triggers/youtubeTrigger.js');

describe("YoutubeTrigger", function() {
	var fakeBot;
	var fakeYoutubeClient;

	beforeEach(function() {
		fakeBot = jasmine.createSpyObj('fakeBot', ['sendMessage']);
		fakeYoutubeClient = jasmine.createSpyObj('fakeYoutubeClient', ['search', 'setKey']);
	});

	it("should only respond to messages that start with the command", function() {
		var trigger = YoutubeTrigger.create("YoutubeTrigger", fakeBot, { command: '!yt', youtube: fakeYoutubeClient } );

		expect(trigger.onFriendMessage('userId', 'yt not the right command', false)).toEqual(false);
		expect(fakeYoutubeClient.search).not.toHaveBeenCalled();

		expect(trigger.onChatMessage('roomId', 'userId', 'yt not the right command', false, false)).toEqual(false);
		expect(fakeYoutubeClient.search).not.toHaveBeenCalled();

		expect(trigger.onFriendMessage('userId', '!yts also not the right command', false)).toEqual(false);
		expect(fakeYoutubeClient.search).not.toHaveBeenCalled();

		expect(trigger.onChatMessage('roomId', 'userId', '!yts also not the right command', false, false)).toEqual(false);
		expect(fakeYoutubeClient.search).not.toHaveBeenCalled();

		expect(trigger.onFriendMessage('userId', '!yt is the right command', false)).toEqual(true);
		expect(fakeYoutubeClient.search).toHaveBeenCalled();

		expect(trigger.onChatMessage('roomId', 'userId', '!yt is the right command', false, false)).toEqual(true);
		expect(fakeYoutubeClient.search.calls.length).toEqual(2);

		expect(trigger.onFriendMessage('userId', '!YT case insensitive', false)).toEqual(true);
		expect(fakeYoutubeClient.search.calls.length).toEqual(3);

		expect(trigger.onChatMessage('roomId', 'userId', '!Yt case insensitive', false, false)).toEqual(true);
		expect(fakeYoutubeClient.search.calls.length).toEqual(4);
	});

	it("should not respond to messages that only contain the command", function() {
		var trigger = YoutubeTrigger.create("YoutubeTrigger", fakeBot, { command: '!yt', youtube: fakeYoutubeClient } );

		expect(trigger.onFriendMessage('userId', '!yt', false)).toEqual(false);
		expect(fakeYoutubeClient.search).not.toHaveBeenCalled();

		expect(trigger.onFriendMessage('userId', '!yt ', false)).toEqual(false);
		expect(fakeYoutubeClient.search).not.toHaveBeenCalled();
	});

	it("should strip out the command before querying youtube", function() {
		var trigger = YoutubeTrigger.create("YoutubeTrigger", fakeBot, { command: '!yt', youtube: fakeYoutubeClient } );

		expect(trigger.onFriendMessage('userId', '!yt should be stripped', false)).toEqual(true);
		expect(fakeYoutubeClient.search).toHaveBeenCalled();
		expect(fakeYoutubeClient.search.calls[0].args[0]).toEqual("should be stripped");
	});
});
