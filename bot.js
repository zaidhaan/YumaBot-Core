/*
This is an example of how you could run the bot, the variable client can also be replaced with require("YumaBot-Core");
*/

var client = require("./client.js");
var config = require("./config.json");
var bot = new client(config);

bot.connect();
