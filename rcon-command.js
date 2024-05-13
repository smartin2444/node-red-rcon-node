
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

        let client = null; //new Rcon("172.20.17.247", 25575, "Test1234");
	let clientAuthenticated = false;
	let lastmsg = {}
	let connIp = "0.0.0.0"
	let connPort = 25575
	let connPassword = ""

	function authenticateRcon(ip, port, password){
		//console.log("trying")
		clientAuthenticated = false;
		if(!(ip && port && password)){
			return null
		}

		let client = new Rcon(ip, port, password);
		client.on("auth", function(){
			clientAuthenticated = true;
			//lastmsg = msg
			//client.send(msg.payload)
			//msg.payload = msg.payload.toLowerCase();
			//node.send(msg);
		});
		client.on("response", function(str){
			//console.log("RESP",str);
			if(lastmsg && str){
				lastmsg.payload = str;
				lastmsg.error = false
				node.send.call(node,lastmsg);
			}
			//client.disconnect()
		})
		client.on("error", function(str){
			console.log("Error",str)
			let newmsg = lastmsg
			newmsg.error = true
			node.send.call(node,lastmsg)
		})
		client.connect();
		//console.log("opened")
		return client;
	}

	
	node.on("input", function(msg){
		if(!msg) return;

		if(msg.options){
			if(msg.options.ip){
				connIp = msg.options.ip;
				client = null;
			}
			if(msg.options.port){
				connPort = msg.options.port;
				client = null;
			}
			if(msg.options.password){
				connPassword = msg.options.password;
				client = null;
			}
		}
	
		if(client == null){
			client = authenticateRcon(connIp, connPort, connPassword)
		}
		if(clientAuthenticated){
			lastmsg = msg;
			client.send(msg.payload);
		}




	})

    }
    RED.nodes.registerType("rcon-command",LowerCaseNode);
}
