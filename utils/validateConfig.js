const reload = require("require-reload")(require);

module.exports = function(config, logger){
    return new Promise((resolve, reject) => {
        if(!config.token){
            logger.configError("token is not defined!");
            return reject();
        }
        if(typeof config.prefix !== "string" || config.prefix == ""){
            logger.configError("prefix must be a string");
            return reject();
        }
        if(!config.dbotsApiKey || config.dbotsApiKey == ""){
            logger.configWarn("dbotsApiKey is not defined!");
        }
        if(!config.carbonKey || config.carbonKey == ""){
            logger.configWarn("carbonKey is not defined!");
        }
        if(config.dbotsApiKey && typeof config.dbotsApiKey !== "string"){
            logger.configError("dbotsApiKey must be a string!");
            return reject();
        }
        if(config.carbonKey && typeof config.carbonKey !== "string"){
            logger.configError("carbonKey must be a string!");
            return reject();
        }
        if(!config.ownerId){
            logger.configError("ownerId is not defined!");
            return reject();
        }
        if(typeof config.ownerId !== "string"){
            logger.configError("ownerId must be a string!");
            return reject();
        }
        if(!config.hasOwnProperty("cleverbot")){
            logger.configError("cleverbot is not defined!");
            return reject();
        }
        if(typeof config.cleverbot !== "boolean"){
            logger.configError("cleverbot must be a boolean!");
            return reject();
        }
        return resolve();
    });
}
