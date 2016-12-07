var client = require("./client.js");
var config = require("./config.json");
var bot = new client(config);

bot.connect();
