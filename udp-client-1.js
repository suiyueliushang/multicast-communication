const dgram = require('dgram');
const readline = require('readline');
const fs = require("fs");
const server = dgram.createSocket('udp4');
const os = require("os");
const LOCAL_IP = os.networkInterfaces()['WLAN 2'].slice(-1)[0]['address'];

const PORT = 8889;
const multicast_ip = "225.0.0.100";
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
server.bind(PORT); // 随机绑定本机一个端口

server.on('close', () => {
	console.log('close socket');
	rl.close();
	server.dropMembership(multicast_ip);
});

server.on('listening', () => {
	console.log('listening...');
	server.setBroadcast(true);
	server.setMulticastTTL(10);
	server.addMembership(multicast_ip, LOCAL_IP);
});

var filename;//接收文件名
server.on('message', (msg, rinfo) => {
	// if (msg.toString().indexOf('filename') == 0) {
	// 	filename = msg.toString().substring(8);
	// 	console.log(`${filename}接受开始。。。`)
	// 	//判断是不是个文件名，名字没有传输正确
	// 	//??????????????????????
	// 	//创建文件
	// }
	// else if (msg.toString().charAt(0) == 'h') {
	// 	fs.writeFileSync(`D:/${filename}`, msg);
	// 	//文件正确性检查
	// 	//??????????????
	// 	console.log(`文件${filename}接受成功`)
	// }
	// else
	console.log(`${rinfo.address}[${rinfo.port}]: 	${msg}`);
});


rl.on("line", (input) => {
	server.send(input, PORT, multicast_ip)
});

