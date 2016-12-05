# Bot-Framework
![Bot-Framework](http://i.imgur.com/M3HhEQL.png)

A lightweight [Discord](https://discordapp.com/) bot framework made in NodeJS using [Eris](https://github.com/abalabahaha/eris)

### Example Command:
Create a new javascript file in ./commands/ and add the following:
```js
// eg: ./commands/hello.js
module.exports = {
    ownerOnly: false, // Whether only owner (from ./config.json) can execute this command
    guildOnly: true, // Whether command cannot be executed outside a guild
    cooldown: 2, // Simple cooldown
    process: function(bot, msg, suffix){ // Process of the command
        bot.createMessage("Hi there!");
    }
}
```

### Example Event:
Create a new javascript file in ./events/ and add the following:
```js
// eg: ./events/guildCreate.js
module.exports = {
    execute: function(bot, guild){
        console.log("New guild: "+guild.name);
    }
}
```
