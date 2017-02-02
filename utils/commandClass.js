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
        let cmd = this.name;
    	if(this.hasOwnProperty("cooldown")){
    		if(!this.lastExecTime.hasOwnProperty(msg.author.id))
    			this.lastExecTime[msg.author.id] = Date.now();
    		else{
    			let now = Date.now();
    			if(now < this.lastExecTime[msg.author.id] + (this.cooldown * 1000)){
    				msg.channel.createMessage(msg.author.username.replace(/@/g, "@\u200b")+", you need to *cooldown* (" + Math.round(((this.lastExecTime[msg.author.id] + this.cooldown * 1000) - now) / 1000) + " seconds)").then(m=>{setTimeout(()=>{bot.deleteMessage(m.channel.id, m.id)}, 8000)});
                    if(msg.channel.guild && msg.channel.guild.members.get(bot.user.id).permission.has("manageMessages")){
                        setTimeout(()=>{bot.deleteMessage(msg.channel.id, msg.id)}, 8000);
                    }
    				return;
    			}
    			this.lastExecTime[msg.author.id] = now;
    		}
    	}
    	logger.logCommand(msg);
    	if(this.guildOnly && this.guildOnly == true){
    		if(!msg.channel.guild) return bot.createMessage(msg.channel.id, msg.author.username.replace(/@/g, "@\u200b")+", this command can only be executed in a guild!");
    	}
    	if(this.ownerOnly && this.ownerOnly == true){
    		if(msg.author.id !== bot.config.ownerId) return bot.createMessage(msg.channel.id, msg.author.username.replace(/@/g, "@\u200b")+", this command is restricted to the owner only!");
    	}
    	if(this.perms){
            if(msg.channel.guild && !this.checkPerms(msg)){
                let m = [];
                Object.keys(this.perms).forEach((p) => {let z = (this.perms[p] == true) ? "should have **"+p+"**" : "shouldn't have **"+p+"**"; m.push(z)})
                return bot.createMessage(msg.channel.id, `**${msg.author.username}**, You ${m.join(", ")} permissions to execute this command!`);
            }
        }

    	try{
            this.execTimes++;
    		bot.commandsProcessed++;
    		this.process(bot, msg, suffix, plugins);
    	}catch(e){
    		bot.createMessage("Command "+this.name+" failed to execute! Please inform the bot owner about this!");
    	}
    }

    checkPerms(msg){
        let hasPermission = true;
        if(this.perms !== null && msg.channel.guild){
            let keys = Object.keys(this.perms);
            let uPerms = msg.channel.permissionsOf(msg.author.id).json;
            for(let key of keys){
                if(this.perms[key] !== uPerms[key]){
                    hasPermission = false;
                    break;
                }
            }
        }
        return hasPermission;
    }
}

module.exports = Command;
