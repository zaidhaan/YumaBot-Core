var lastExecTime = {};

function execCommand(msg, cmd, suffix, bot, commands, logger){
	bot.commandsProcessed += 1;
	if(commands[cmd].hasOwnProperty("cooldown")){
        if(!lastExecTime[cmd]) lastExecTime[cmd] = [];
		if(!lastExecTime[cmd].hasOwnProperty(msg.author.id))
			lastExecTime[cmd][msg.author.id] = Date.now();
		else{
			var now = Date.now();
			if(now < lastExecTime[cmd][msg.author.id] + (commands[cmd].cooldown * 1000)){
				msg.channel.createMessage(msg.author.username.replace(/@/g, "@\u200b")+", you need to *cooldown* (" + Math.round(((lastExecTime[cmd][msg.author.id] + commands[cmd].cooldown * 1000) - now) / 1000) + " seconds)").then(m=>{setTimeout(()=>{bot.deleteMessage(m.channel.id, m.id)}, 8000)});
                if(msg.guild && msg.guild.members.get(bot.user.id).permission.has("manageMessages")){
                    setTimeout(()=>{bot.deleteMessage(msg.channel.id, msg.id)}, 8000);
                }
				return;
			}
			lastExecTime[cmd][msg.author.id] = now;
		}
	}
	logger.logCommand(msg);
	/*if(msg.channel.guild) console.log(msg.channel.guild.name+" : #"+msg.channel.name+" : "+msg.author.username+" : "+msg.cleanContent.replace(/\n/g, " "));
	else console.log(msg.author.username+" : "+msg.cleanContent.replace(/\n/g, " "));*/
	var cmand = commands[cmd];
	if(cmand.guildOnly && cmand.guildOnly == true){
		if(!msg.guild) return bot.createMessage(msg.channel.id, msg.author.username.replace(/@/g, "@\u200b")+", this command can only be executed in a guild!");
	}
	if(cmand.ownerOnly && cmand.ownerOnly == true){
		if(msg.author.id !== config.ownerId) return bot.createMessage(msg.channel.id, msg.author.username.replace(/@/g, "@\u200b")+", this command is restricted to the owner only!");
	}
	if(cmand.perms){
		if(!msg.member.permission.has(cmand.perms)){
			return bot.createMessage(msg.channel.id, msg.author.username.replace(/@/g, "@\u200b")+", you must have **"+cmand.perms+"** permission to execute this command!");
		}
	}

	try{
		commands[cmd].process(bot, msg, suffix);
	}catch(e){
		bot.createMessage("Command "+suffix+" failed to execute! Please inform the bot owner about this!");
	}
}

function sendHelpMessage(bot, msg, suffix, commands, config){
	if(msg.channel.guild){
		bot.createMessage(msg.channel.id, " Alright! Check your PM :thumbsup: ");
	};
	var cmdlen = 0;
	if(!suffix){
		var basic = [];
		var other = [];
		var msgArray = [];
		for(let cmd in commands){
			if(commands[cmd].display == null || commands[cmd].display == true){
				var info = "`"+config.prefix + cmd+"`";
				if(commands[cmd].tag == "Basic"){
					basic.push(" "+info);
				}else{
					other.push(" "+info);
				}
			}
		}
		msgArray.push(`**Basic: **${basic}\n**Other :**${other}`);
		msgArray.push("\n**Tag Info**\n`Basic`: Most basic commands");
		msgArray.push("\n\n**Want more information on the command?\nTry `>help <command-name>`**");
		bot.getDMChannel(msg.author.id).then(c => {c.createMessage(msgArray.join("\n"))})
	}
	if(suffix){
		if(!msg.guild){
			if(commands[suffix]){
				var cmand = commands[suffix];
				var msgArr = [];
				msgArr.push("**Command:** `>"+suffix+"`");
				msgArr.push("");
				if(cmand.hasOwnProperty("usage")){
					msgArr.push("**Usage:** `" + config.prefix + suffix+" "+cmand.usage+"`");
				}else{
					msgArr.push("**Usage:** `" + config.prefix + suffix+"`");
				}

				var description = cmand.description || "No description!"
				msgArr.push("**Description:** `"+description+"`");

				var cooldown = cmand.cooldown || "None!";
				if(cooldown !== "None!") cooldown = cooldown + " seconds";
				msgArr.push("**Cooldown: **`"+cooldown.toString()+"`");
			}else{
				bot.createMessage(msg.channel.id, msg.author.username+", There is no such\""+suffix+"\" command!");
				return;
			}
			bot.createMessage(msg.channel.id, msgArr.join("\n"));
		}else{
			bot.createMessage(msg.channel.id, "Please execute this in DM")
		}
	}
}

module.exports = {
    execute(bot, msg, config, commands, logger){
        if(!msg.channel.guild){
    		if(/(^https?:\/\/discord\.gg\/[A-Za-z0-9]+$|^https?:\/\/discordapp\.com\/invite\/[A-Za-z0-9]+$)/.test(msg.content)){
    			msg.channel.createMessage("**Please use this to invite me to your server: ** https://discordapp.com/oauth2/authorize?client_id="+config.clientID+"&scope=bot");
    		}
    	}
        if(msg.author.bot){
        	return;
        }
        if(msg.author.id != bot.user.id && (msg.content.startsWith(config.prefix) || msg.content.indexOf(bot.user.mention) == 0)){
            var cmdtxt = msg.content.split(" ")[0].substring(config.prefix.length);
            var suffix = msg.content.substring(config.prefix.length + cmdtxt.length + 1);
            if(msg.content.indexOf(bot.user.mention) == 0){
                if(msg.content.length == bot.user.mention.length){
                    bot.createMessage(msg.channel.id, "Yeah?");
                }else{
                    // Cleverbot
                }
            }
            var cmd;
            for(let name in commands){
                if(name == cmdtxt || (commands[name].aliases && commands[name].aliases.includes(cmdtxt))){
                    cmd = name;
                }
            }
			if(commands[cmdtxt]) cmd = cmdtxt;
            if(commands[cmd]){
                execCommand(msg, cmd, suffix, bot, commands, logger);
            }

			if(cmdtxt == "help" || cmdtxt == "halp"){
				sendHelpMessage(bot, msg, suffix, commands, config)
			}
        }
    }
}
