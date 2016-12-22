var Eris = require("eris");
var fs = require("fs");
var path = require("path");
var request = require("request");
/*var validateConfig = require("./utils/validateConfig.js")
var logger = require("./utils/logger.js");*/
var validateConfig = require(path.join(__dirname, 'utils')+"/validateConfig.js")
var logger = require(path.join(__dirname, 'utils')+"/logger.js");
var reload = require("require-reload")(require);
var Command = require("./utils/commandClass.js");

var defaultCommands = {};
var defaultEvents = {};

require("fs").readdirSync(path.join(__dirname, 'commands')).forEach(function(file) {
  defaultCommands[file.substring(0, file.length - 3)] = require("./commands/" + file);
});
require("fs").readdirSync(path.join(__dirname, 'events')).forEach(function(file) {
  defaultEvents[file.substring(0, file.length - 3)] = require("./events/" + file);
});

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
        this.plugins = {};
        this.dCommands = defaultCommands;
        this.dEvents = defaultEvents;
    }

    processEvent(val){
        if(val == "messageCreate"){
            this.on(val, (msg)=>{
                if(msg.content.startsWith(this.config.prefix + "reload") && msg.author.id == this.config.ownerId){
                    var suffix = msg.content.substring(this.config.prefix.length + 6).trim();
                    if(!this.commands[suffix]) return msg.channel.createMessage(`Command **${suffix}** does not exist!`);
                    var neew;
                    try{
                        neew = reload(`./commands/${suffix}.js`)
                    }catch(e){
                        return this.logger.error(e);
                    }
                    delete this.commands[suffix];
                    this.commands[suffix] = new Command(suffix, require(`./commands/${suffix}.js`), this.config);
                    msg.channel.createMessage(`Sucessfully reloaded command **${suffix}**!`);
                }
                if(msg.content.startsWith(this.config.prefix + "eval") && msg.author.id == this.config.ownerId){
                    this.evaluate(msg, (result) => {
                        msg.channel.createMessage(result);
                        this.logger.logCommand(msg);
                    });
                } else this.events.messageCreate.execute(this, msg, this.config, this.commands, this.logger, this.plugins);
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

    checkFolders(){
        return new Promise((resolve, reject)=>{
            if (!fs.existsSync("./commands")){
                this.logger.dInfo("./commands/", "Does not exist, Attempting to create ./commands/ with default commands...");
                fs.mkdirSync("commands");
                var keys = Object.keys(this.dCommands);
                var j;
                for(var i = 0; i < keys.length; i++){
					j = keys[i]+".js";
                    fs.readFile(path.join(__dirname, "commands", j), 'utf8', (err, data) => {
                        if (err) reject(err);
                        fs.writeFile("./commands/"+j, data, (err)=>{
							if(err) reject(err);
						});
                    });
					this.logger.dInfo("Added", `./commands/${keys[i]}.js`, true);
                }
                this.logger.dInfo("./commands/", "Finished adding default commands to");

                if(!fs.existsSync("./events")){
                    this.logger.dInfo("./events/", "Does not exist, Attempting to create ./events/ with default events...");
                    fs.mkdirSync("events");
                    var keyss = Object.keys(this.dEvents);
                    var e;
                    e = keyss;
    				keyss.forEach(es => e[keyss.indexOf(es)] = es+".js");
    				//e = ["guildCreate.js", "guildDelete.js", "messageCreate.js"];
                    var logr = this.logger
                    function kek(){
                        fs.readFile(path.join(__dirname, "events", e[0]), 'utf8', (err, data) => {
                            if (err) reject(err);
                            fs.writeFile("./events/"+e[0], data, (err)=>{
        						if(err) reject(err);
                                logr.dInfo("Added", `./events/${e[0]}.js`, true);
                                e.shift();
                                if(e.length !== 0){
                                    kek();
                                }else{
                                    resolve("kek");
                                }
        					});
                        });
                    }
                    kek();
                }else resolve("kek");
            }else if(!fs.existsSync("./events")){
                this.logger.dInfo("./events/", "Does not exist, Attempting to create ./events/ with default events...");
                    fs.mkdirSync("events");
                    var keysss = Object.keys(this.dEvents);
                    var k;
                    for(var i = 0; i < keysss.length; i++){
    					k = keysss[i]+".js";
                        fs.readFile(path.join(__dirname, "events", k), 'utf8', (err, data) => {
                            if (err) reject(err);
                            fs.writeFile("./events/"+k, data, (err)=>{
    							if(err) reject(err);
    						});
                        });
    					this.logger.dInfo("Added", `./events/${keysss[i]}.js`, true);
                    }
            }else resolve("kek");
        });
    }

    loadPlugins(){
        return new Promise((resolve, reject)=>{
            fs.access('./plugins', fs.constants.R_OK | fs.constants.W_OK, (err) => {
                if(err){
                    return console.log('Plugins folder does not exist!');
                }else{
                    fs.readdir("./plugins/", (err, files)=>{
                        if(err) reject("Could not read plugins folder!");
                        if(!files || files.length == 0){
                            console.log("No files found in plugins folder!");
                        }else{
                            var js = 0;
                            var i = 0;
                            for(let val of files){
                                i++
                                if(val.endsWith(".js")){
                                    js++
                                    val = val.replace(/\.js$/, ""); // replace the value which ends .js with nothing
                                    try{
                                        plugins[val] = require(`./plugins/${val}.js`);
                                        if(files.length == i) resolve();
                                    }catch(e){
                                        console.log(`Error loading ./plugins/${val}.js`, e);
                                        js--;
                                        if(files.length == i) resolve();
                                    }
                                }
                            }
                        }
                    });
                }
            });
        });
    }

    loadEvents(){
        return new Promise((resolve, reject)=>{
            fs.access('./events', fs.constants.R_OK | fs.constants.W_OK, (err) => {
                if(err){
                    this.logger.error('./events Does not exist!');
                    process.exit(0);
                }else{
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
                                        if(files.length == i) this.logger.logEnd("EVENTS", js, i); resolve();
                                    }catch(e){
                                        this.logger.logFileError(`./events/${val}.js`, e);
                                        js--;
                                        if(files.length == i) this.logger.logEnd("EVENTS", js, i); resolve();
                                    }
                                }
                            }
                        }
                    });
                }
            });
        });
    }

    loadCommands(){
        return new Promise((resolve, reject)=>{
            fs.access('./commands', fs.constants.R_OK | fs.constants.W_OK, (err) => {
                if(err){
                    this.logger.error('./commands Does not exist!');
                    process.exit(0);
                }else{
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
                                        this.commands[val] = new Command(val, require(`./commands/${val}.js`), this.config);
                                        this.logger.logFileLoaded(`./commands/${val}.js`);
                                        if(files.length == i) this.logger.logEnd("COMMANDS", js, i); resolve();
                                    }catch(e){
                                        this.logger.logFileError(`./commands/${val}.js`, e);
                                        js--;
                                        if(files.length == i) this.logger.logEnd("COMMANDS", js, i); resolve();
                                    }
                                }
                            }
                        }
                    });
                }
            });
        });
    }

    validateConfig(){
        return new Promise((resolve) => {
            validateConfig(this.config, this.logger).catch(() => process.exit(0));
            return resolve();
        });
    }

    sendReady(){
        return new Promise(resolve => {
            this.logger.logReady(`${this.user.username}#${this.user.discriminator}`, this.guilds.size);
            return resolve();
        });
    }

    init(){
        if(fs.existsSync("./commands") && fs.existsSync("./events")){
            return new Promise((resolve, reject)=>{
                this.validateConfig()
                    .then(this.loadEvents())
                    .then(this.loadCommands())
                    .then(this.loadPlugins())
                    .then(this.sendReady())
                    .catch(e => reject("Error during init: "+e));
            });
        }else{
            return new Promise((resolve) => {
                this.checkFolders().then(() => {
                    this.logger.logCustom("Done initializing the command/event folders! Please run the code again to begin", "bgMagenta");
                    process.exit(0);
                });
            });
        }
    }

    updateCarbon(key){
        if(!key && !this.config.carbonKey || this.config.carbonKey == ""){
            this.logger.warn("Could not update Carbon stats because no api key was configured!");
            return;
        }
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
        if(!key && (!this.config.dbotsApiKey || this.config.dbotsApiKey == "")){
            this.logger.warn("Could not update Discord Bots stats because no api key was configured!");
            return;
        }
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
        if(result == "" || result == undefined || result == null) result = "undefined";
        callback(result);
    }
}

module.exports = Bot;
