var Eris = require("eris");
var fs = require("fs");
var request = require("request");
var logger = require("./utils/logger.js");
var reload = require("require-reload")(require);

class Bot extends Eris.Client{
    constructor(config){
        super(config.token, config.options)

        this.on("ready", ()=>{
            this.init().catch(e => console.log(e));
        });

        this.on("disconnected", ()=>{
            this.logger.warn("Disconnected from Discord!");
        });

        this.on("error", (error)=>{
            this.logger.error(error);
        });

        this.commandsProcessed = 0;
        this.cleverResponses = 0;
        this.config = config;
        this.logger = new logger(true);
        this.commands = {};
        this.events = {};
    }

    processEvent(val){
        if(val == "messageCreate"){
            this.on(val, (msg)=>{
                if(msg.content.startsWith(this.config.prefix + "reload") && msg.author.id == this.config.ownerId){
                    var suffix = msg.content.substring(this.config.prefix.length + 6).trim();
                    if(!this.commands[suffix]) return msg.channel.createMessage(`Command **${suffix}** does not exist!`);
                    delete this.commands[suffix];
                    this.commands[suffix] = reload(`./commands/${suffix}.js`);
                    msg.channel.createMessage(`Sucessfully reloaded command **${suffix}**!`);
                }
                if(msg.content.startsWith(this.config.prefix + "eval") && msg.author.id == this.config.ownerId){
                    this.evaluate(msg, (result) => {
                        msg.channel.createMessage(result);
                    });
                } else this.events.messageCreate.execute(this, msg, this.config, this.commands, this.logger);
            });
        }
        if(val == "guildCreate"){
            this.on(val, (guild)=>{
                this.events.guildCreate.execute(this, guild);
            });
        }
        if(val == "guildDelete"){
            this.on(val, (guild)=>{
                this.events.guildDelete.execute(this, guild);
            });
        }
    }

    loadEvents(){
        return new Promise((resolve, reject)=>{
            fs.readdir("./events/", (err, files)=>{
                if(err) reject("Could not read events file!");
                if(!files || files.length == 0){
                    reject("No files found in events folder!");
                }else{
                    var js = 0;
                    var i = 0;
                    for(let val of files){
                        i++
                        if(val.endsWith(".js")){
                            js++
                            val = val.replace(/\.js$/, ""); // replace the value which ends .js with nothing
                            try{
                                this.events[val] = require(`./events/${val}.js`);
                                this.processEvent(val);
                                this.logger.logFileLoaded(`./events/${val}.js`);
                                if(files.length == i) this.logger.logEnd("EVENTS", js, i);
                            }catch(e){
                                this.logger.logFileError(`./events/${val}.js`, e);
                                js--;
                                if(files.length == i) this.logger.logEnd("EVENTS", js, i);
                            }
                        }
                    }
                }
            });
        });
    }

    loadCommands(){
        return new Promise((resolve, reject)=>{
            fs.readdir("./commands/", (err, files)=>{
                if(err) reject("Could not read events file!");
                if(!files || files.length == 0){
                    reject("No files found in commands folder!");
                }else{
                    var js = 0;
                    var i = 0;
                    for(let val of files){
                        i++
                        if(val.endsWith(".js")){
                            js++
                            val = val.replace(/\.js$/, ""); // replace the value which ends .js with nothing
                            try{
                                this.commands[val] = require(`./commands/${val}.js`);
                                this.logger.logFileLoaded(`./commands/${val}.js`);
                                if(files.length == i) this.logger.logEnd("COMMANDS", js, i);
                            }catch(e){
                                this.logger.logFileError(`./commands/${val}.js`, e);
                                js--;
                                if(files.length == i) this.logger.logEnd("COMMANDS", js, i);
                            }
                        }
                    }
                }
            });
        });
    }

    sendReady(){
        return new Promise(resolve => {
            this.logger.logReady(`${this.user.username}#${this.user.discriminator}`, this.guilds.size);
        })
    }

    init(){
        return new Promise((resolve, reject)=>{
            this.loadEvents()
                .then(this.loadCommands())
                .then(this.sendReady())
                .catch(e => reject("Error during init: "+e));
        });
    }

    updateCarbon(key){
        if(!key && !this.config.carbonKey || this.config.carbonKey == "") return this.logger.warn("Could not update Carbon stats because no key was configured!");
        request.post({
    			"url": "https://www.carbonitex.net/discord/data/botdata.php",
    			"headers": {"content-type": "application/json"}, "json": true,
    			body: {
    				"key": key || this.config.carbonKey,
    				"servercount": this.guilds.size
    			}
    		}, (e, r) => {
    		    if (e) return this.logger.error("Error updating carbon stats: " + e);
    		    if (r.statusCode !== 200) return this.logger.error("Error updating Carbon stats: Status Code " + r.statusCode);
                this.logger.debug("Updated Carbon guild count");
            }
        );
    }

    updateDBots(key){
        if(!key && (!this.config.dbotsApiKey || this.config.dbotsApiKey == "")) return this.logger.warn("Could not update Discord Bots stats because no key was configured!");
        request.post(`https://bots.discord.pw/api/bots/${this.user.id}/stats`, {
            body: {
                "server_count": this.guilds.size
            },
            headers: {
                'Authorization': key || this.config.dbotsApiKey
            },
            json: true
        }, (error, response, body) => {
            if (error) return this.logger.error("Error updating Discord Bots stats: " + error);
            if (response.statusCode !== 200) return this.logger.error("Error updating Discord Bots stats: Status Code " + response.statusCode);
            this.logger.debug("Updated Discord Bots guild count");
        });
    }

    evaluate(msg, callback){
        var code = msg.content.substring(this.config.prefix.length + 4).trim();
        var result = "No Result!";
        try{
            result = eval("let bot = this;\n"+code);
        }catch(e){
            result = "Error: "+e;
        }
        callback(result);
    }
}

module.exports = Bot;
