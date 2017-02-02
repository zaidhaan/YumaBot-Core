# YumaBot-Core [![NPM Version](https://img.shields.io/npm/v/yumabot-core.svg?style=flat-square)](https://www.npmjs.com/package/yumabot-core) [![Dependency Status](https://img.shields.io/david/thevexatious/yumabot-core.svg?style=flat-square)](https://david-dm.org/thevexatious/yumabot-core)
![YumaBot-Core](http://i.imgur.com/M3HhEQL.png)

A lightweight [Discord](https://discordapp.com/) bot framework made in NodeJS using [Eris](https://github.com/abalabahaha/eris)

Visit the [gallery](http://imgur.com/a/Rwz1m) to see some pictures of what this framework does

## Installing
> Fun Fact: The bot can automatically create the commands and events folder with default files in it so you don't need to copy and paste every thing in the GitHub repository

1. In the command line execute `npm install yumabot-core --save`
2. Create a js file with the following contents:
```js
var Yuma = require("yumabot-core");
var bot = new Yuma({
	  "token": "TOKEN", // (required) The token of your bot
    "prefix": ">", // (required) The prefix of the commands of the bot
    "ownerId": "OWNER_ID", // (required) The ID of the user acting as the bots owner
    "dbotsApiKey": "DBOTS_KEY", // (not required) bots.discord.pw api key
    "carbonKey": "CARBON_KEY", // (not required) carbonitex api key
    "cleverbot": true, // (not required) whether or not to enabled cleverbot (talking with the bot with @mention)
		"commandSpaces": true, // (no required) if true, then it will allow a space between the prefix and command like, would work for both "[prefix] [command]" and "[prefix][command]", if set as false, it will not allow a space between command and prefix, would only react to "[prefix][command]"
});

bot.connect();
```
Next, Run the code. The first time you run the code you will recieve a message like shown below:  
 "*Done initializing the command/event folders! Please run the code again to begin*"  
 That means it finished creating the default commands and events, so now you are ready to run the code again and you will be ready to go! :smiley:

You could also replace the object within Yuma with `new Yuma(config)` where config would be a json file containing those contents.

And that's it!  :thumbsup:


### Example Command:
Create a new javascript file in `./commands/` and add the following:
```js
// eg: ./commands/kawaii.js
module.exports = {
    ownerOnly: false, // Whether only owner (from ./config.json) can execute this command
    guildOnly: true, // Whether command cannot be executed outside a guild
    cooldown: 2, // Simple cooldown
    aliases: "cute", // An alias of the command. Can also be an array: ["alias1", "alias2"]
    tag: "Basic", // A tag
    description: "Responds with what you said is kawaii", // Short description of the command
    usage: "<name>", // Usage of the command
	perms: { // Object containing required/non-required perms for using the command
		manageMessages: true
	},
    process: function(bot, msg, suffix){ // Process function of the command
        if(suffix){
            bot.createMessage(msg.channel.id, suffix + " is kawaii! :3");
        }else bot.createMessage(msg.channel.id, "Please try again with some arguments")
    }
}
```

### Example Event:
Create a new javascript file in `./events/` and add the following:
```js
// eg: ./events/guildCreate.js
module.exports = {
    execute: function(bot, guild){
        console.log("New guild: "+guild.name);
    }
}
```

### Adding More Tags (help message):
In the help message, you might like your own custom tags, here is how you will do it:

It's very simple! Just go to the file of the command in which you want to add the tag in, and just pop it in like shown below
```js
module.exports = {
    tag: "ExampleTag",
    process: function(bot, msg, suffix){
        // code
    }
}
```
And that's it! The help command will automatically detect all the tags from all the files and generate them into groups of command names to each specific tag. *(behold, the power of code..!)*

- - - -
## Features:
* **Beautiful** logs :tada:  
![Image 1](http://i.imgur.com/tXjzpFt.png)

---

 * Easy to spot errors  
![Image 2](http://i.imgur.com/VjRSPve.png)

---

 * Commands and Events nested in folders  
 *this also makes it easier to add/edit commands*  
![Image 3](http://i.imgur.com/rn5lXMJ.png)  


---

 * Configurable Commands and Events  
![Image 3](http://i.imgur.com/u1SfmQs.png)

---

 * Plugins.    
 *With plugins you can dump all short scripts or functions into a file in the plugins folder to avoid flood of files/code*  
![Image 4](http://i.imgur.com/ucatKap.png)

---

### Other Features
* In-Built Reload Command
* In-Built Eval Command
* Help Message Generator
* Display Errors without bot crashing  

And more..!
