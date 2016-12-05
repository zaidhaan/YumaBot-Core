module.exports = {
    execute: function(bot, guild){
        bot.logger.logGuildCreate(guild.name, bot.guilds.size);
    }
}
