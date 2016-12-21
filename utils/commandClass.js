class Command {
    constructor(name, info, config){
        this.name = name;
        this.usage = info.usage || "";
        this.execTimes = 0;
        this.process = info.process;
        this.cooldown = info.cooldown || null;
        this.guildOnly = info.guildOnly || false;
        this.prefix = config.prefix;
        this.aliases = info.aliases || null;
        this.tag = info.tag || null;
        this.description = info.description || "No description provided!";
        this.ownerOnly = info.ownerOnly || false;
        this.perms = info.perms || null;
        this.lastExecTime = {};
    }

    get help(){
        return `
        **Command:** ${this.prefix}${this.name}

**Usage:** ${this.prefix}${this.name}${this.usage || ""}
**Description:** ${this.description}
${this.cooldown ? "**Cooldown:** "+this.cooldown : "None!"}
${this.aliases ? typeof this.aliases == "string" ? "**Alias:** "+this.aliases : "**Aliases:** "+this.aliases.join(", ") : ""}
${this.guildOnly && this.guildOnly == true ? "**Guild Only:** "+this.guildOnly : ""}
${this.ownerOnly && this.ownerOnly == true ? "**Owner Only:** "+this.ownerOnly : ""}
`
    }

    exec(bot, msg, suffix, plugins, logger){
        var cmd = this.name
    	if(this.hasOwnProperty("cooldown")){
    		if(!this.lastExecTime.hasOwnProperty(msg.author.id))
    			this.lastExecTime[msg.author.id] = Date.now();
    		else{
    			var now = Date.now();
    			if(now < this.lastExecTime[msg.author.id] + (this.cooldown * 1000)){
    				msg.channel.createMessage(msg.author.username.replace(/@/g, "@\u200b")+", you need to *cooldown* (" + Math.round(((this.lastExecTime[msg.author.id] + this.cooldown * 1000) - now) / 1000) + " seconds)").then(m=>{setTimeout(()=>{bot.deleteMessage(m.channel.id, m.id)}, 8000)});
                    if(msg.guild && msg.guild.members.get(bot.user.id).permission.has("manageMessages")){
                        setTimeout(()=>{bot.deleteMessage(msg.channel.id, msg.id)}, 8000);
                    }
    				return;
    			}
    			this.lastExecTime[msg.author.id] = now;
    		}
    	}
    	logger.logCommand(msg);
    	/*if(msg.channel.guild) console.log(msg.channel.guild.name+" : #"+msg.channel.name+" : "+msg.author.username+" : "+msg.cleanContent.replace(/\n/g, " "));
    	else console.log(msg.author.username+" : "+msg.cleanContent.replace(/\n/g, " "));*/
    	if(this.guildOnly && this.guildOnly == true){
    		if(!msg.guild) return bot.createMessage(msg.channel.id, msg.author.username.replace(/@/g, "@\u200b")+", this command can only be executed in a guild!");
    	}
    	if(this.ownerOnly && this.ownerOnly == true){
    		if(msg.author.id !== config.ownerId) return bot.createMessage(msg.channel.id, msg.author.username.replace(/@/g, "@\u200b")+", this command is restricted to the owner only!");
    	}
        /*
        TODO: Permissions
        */
    	if(this.perms){
    		if(!msg.member.permission.has(this.perms)){
    			return bot.createMessage(msg.channel.id, msg.author.username.replace(/@/g, "@\u200b")+", you must have **"+this.perms+"** permission to execute this command!");
    		}
    	}

    	try{
    		bot.commandsProcessed++;
    		this.process(bot, msg, suffix, plugins);
    	}catch(e){
    		bot.createMessage("Command "+this.name+" failed to execute! Please inform the bot owner about this!");
    	}
    }
}

module.exports = Command;
