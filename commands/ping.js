var responses = ["can't you see me?", "gotta go fast", "( ͡° ͜ʖ ͡°)", "try to take this [̲̅$̲̅(̲̅5̲̅)̲̅$̲̅]", "vex is a meme"];

module.exports = {
    cooldown: 2,
    aliases: "p",
    process: function(bot, msg){
        let inbf = Date.now();
        msg.channel.createMessage(responses[Math.floor(Math.random() * responses.length)]).then(sentMsg => {
            let naw = Date.now();
            let final = naw - inbf;
            msg.channel.editMessage(sentMsg.id, `**Pong** ${final}ms`);
        });
    }
}
