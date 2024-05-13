const Rcon = require("rcon");

module.exports = function(RED) {
    function RCONNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        let client = null;
	let clientAuthenticated = false;
	let lastmsg = {}
	let connIp = "0.0.0.0"
	let connPort = 25575
	let connPassword = ""

	function authenticateRcon(ip, port, password){
		clientAuthenticated = false;
		if(!(ip && port && password)){
			return null
		}
		let client = new Rcon(ip, port, password);
		client.on("auth", function(){
			clientAuthenticated = true;
		});
		client.on("response", function(str){
			if(lastmsg && str){
				lastmsg.payload = str;
				lastmsg.error = false
				node.send.call(node,lastmsg);
			}
		})
		client.on("error", function(str){
			console.log("Error",str)
			let newmsg = lastmsg
			newmsg.error = true
			node.send.call(node,lastmsg)
		})
		client.connect();
		return client;
	}
	node.on("input", function(msg){
		if(!msg) return;
		if(msg.options){
			if(msg.options.ip){
				connIp = msg.options.ip;
				if(client) client.disconnect();
				client = null;
			}
			if(msg.options.port){
				connPort = msg.options.port;
				if(client) client.disconnect();
				client = null;
			}
			if(msg.options.password){
				connPassword = msg.options.password;
				if(client) client.disconnect();
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
    RED.nodes.registerType("rcon-command",RCONNode);
}
