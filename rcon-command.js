
const Rcon = require("rcon");

/*let client = new Rcon("localhost", 25575, "Test1234");

client.on("auth", function(){
        console.log("auth")
        client.send("tps")
}).on("response", function(str){
        console.log("RESP",str);
        client.disconnect()
})
client.connect();*/


module.exports = function(RED) {
    function LowerCaseNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        let client = new Rcon("172.20.17.247", 25575, "Test1234");
	let lastmsg = {}



        client.on("auth", function(){
            node.on('input', function(msg) {
		lastmsg = msg
                client.send(msg.payload)                
                //msg.payload = msg.payload.toLowerCase();
                //node.send(msg);
            });
        })
        client.on("response", function(str){
            console.log("RESP",str);
            lastmsg.payload = str;
            node.send(lastmsg);
            //client.disconnect()
        })
        client.connect();

        
    }
    RED.nodes.registerType("rcon-command",LowerCaseNode);
}
