module.exports = {
    execute: function(bot, guild){
        bot.logger.logGuildDelete(guild.name, bot.guilds.size);
    }
}
