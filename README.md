# Bot-Framework
![Bot-Framework](http://i.imgur.com/M3HhEQL.png)

A lightweight [Discord](https://discordapp.com/) bot framework made in NodeJS using [Eris](https://github.com/abalabahaha/eris)

Visit the [gallery](http://imgur.com/a/Rwz1m) to see some pictures of what this framework does

### Example Command:
Create a new javascript file in `./commands/` and add the following:
```js
// eg: ./commands/kawaii.js
module.exports = {
    ownerOnly: false, // Whether only owner (from ./config.json) can execute this command
    guildOnly: true, // Whether command cannot be executed outside a guild
    cooldown: 2, // Simple cooldown
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
First of all, on the commands you want the tag to be in, put it in like
```js
module.exports = {
    tag: "ExampleTag",
    process: function(bot, msg, suffix){
        // code
    }
}
```
Then go to `./events/messageCreate.js` and follow the instructions that are stated from line 62
