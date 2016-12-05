var client = require("./client.js");
var config = require("./config.json");
var bot = new client(config);

bot.connect();

module.exports = {
    eval: function(msg){
        return new Promise(resolve => {
            var config = require("./config.json");
            var code = msg.content.substring(config.prefix.length + 4).trim();
            var result = "No Result!";
            try{
                result = eval(code);
            }catch(e){
                result = "Error: "+e;
            }
            resolve(result);
        });
    }
}
