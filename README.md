node-steam-chat-bot
===================

Note: I'm not really planning to update this anymore, check out [Efreak's fork](https://github.com/Efreak/node-steam-chat-bot) for more functionality.

Simplified interface for a steam chat bot. This is a wrapper around [Steam for Node.js](https://github.com/seishun/node-steam) which is aimed at making an easily configurable chatbot that sits in Steam groups chat rooms and responds to various events. Responses are handled as a set of triggers of various types which can be configured to respond to a number of different chat messages. Steam requires that a user has at least one game before it can join chat rooms (unless it's a mod), so you'll need to buy a game for the bot account or make it a mod before it will be able to join.

If you have Steam Guard enabled you'll get a failed logon attempt the first time you try to log on and you'll be sent a Steam Guard code. Pass this code in with the constructor (e.g. new ChatBot('username', 'password', { guardCode: 'XXXX' };) and you should be able to log in. A 'sentry' file will be stored, which should allow you to log in with a different computer using the same guard code but I've honestly never tried this so ¯\\_(ツ)_/¯. If you start getting logon failures again you should delete the sentry file, remove the guard code, and try to log in with neither so you get a fresh code emailed to you.

The triggers that currently exist are:

AcceptChatInviteTrigger - Joins a specified chatroom when invited and says an optional welcome message.

AcceptFriendRequestTrigger - Automatically accepts any friend requests sent to the bot.

BotCommandTrigger - Runs a specified callback when a specific command message is typed. The callback is passed the bot object allowing bot functions (e.g. mute, unmute, joinGame) to be run regardless of scope. This is a breaking change going from v1.1.x to v1.2.0.

ButtBotTrigger - Repeats a message, but with one word randomly replaced with a specific other word. The canonical example is replacing a random word with "butt".

ChatReplyTrigger - Detects a message (either an exact match or a "contains" match) and replies with a specified message.

CleverbotTrigger - Uses cleverbot to reply to a message, optionally only when a specific word is mentioned.

GoogleImagesTrigger - Prints a link to the first search result on Google Images. Requires setup, see https://www.npmjs.com/package/google-images#set-up-google-custom-search-engine.

GoogleTrigger - Prints out the title and link of the first search result on Google. Requires the same setup as GoogleImagesTrigger.

RegexReplaceTrigger - Detects a regex match in a message and uses the matches to construct a reply.

TumblrTrigger - Allows the bot to post things to a tumblr blog, either by commands (!postphoto, !postquote, !posttext, !postlink, !postchat, !postaudio, !postvideo), or by monitoring the chatrooms the bot is in for links. You will need to register an app here: http://www.tumblr.com/oauth/apps and follow these instructions to get the keys: https://groups.google.com/d/msg/tumblr-api/gz8Zv-Mhex4/8-eACnkArkgJ.

WolframAlphaTrigger - Queries Wolfram Alpha if a message starts with a specified command. This only displays a textual representation of the primary result (if it exists) so it's not always a good answer. You will need an appId from http://products.wolframalpha.com/api/.

YoutubeTrigger - Responds to a message with the top YouTube search result if it starts with a specific command. Also has an option to randomly rickroll instead of returning the best result. Requires a Google API key (see GoogleImagesTrigger).

To get this running in Windows you'll need to follow the setup instructions for [node-gyp](https://github.com/TooTallNate/node-gyp#installation) and also use a branch of libxmljs as described in [this issue](https://github.com/polotek/libxmljs/issues/176) (TLDR is to run 'npm install polotek/libxmljs#vendor-src' before 'npm install').

See [example.js](https://github.com/bonnici/node-steam-chat-bot/blob/master/example.js) for an example usage.
