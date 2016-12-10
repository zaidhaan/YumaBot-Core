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
	"token": "TOKEN", // required
    "prefix": ">", // required
    "ownerId": "OWNER_ID", // required
    "dbotsApiKey": "DBOTS_KEY", // not required
    "carbonKey": "CARBON_KEY", // not required
    "cleverbot": true
});

bot.connect();
```
You could also replace the object within Yuma with `new Yuma(config)` where config would be a json file containing those contents.

And that's it! for the first time when you run it there is a change of errors, but that's ok, you can just type CTRL+C in cmd to exit it and just try running it again and it *should* be fine :smiley:


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
> * **Beautiful** logs :tada:
>
> ![Image 1](http://i.imgur.com/tXjzpFt.png)

---

> * Easy to spot errors
>
>  ![Image 2](http://i.imgur.com/VjRSPve.png)

---

> * Commands and Events nested in folders
>
> > this also makes it easier to add/edit commands
>
> ![Image 3](http://i.imgur.com/rn5lXMJ.png)
>

---

> * Configurable Commands and Events
>
> ![Image 3](http://i.imgur.com/u1SfmQs.png)
