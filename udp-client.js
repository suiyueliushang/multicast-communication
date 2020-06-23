const dgram = require('dgram');
const readline = require('readline');
const fs = require("fs");
const server = dgram.createSocket('udp4');
const os = require("os");
const { Socket } = require('net');
const LOCAL_IP = os.networkInterfaces()['WLAN'].slice(-1)[0]['address'];
const path = require('path')
const PORT = 8080;
const multicast_ip = "225.0.0.100";
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
const mtu = 1500;
server.bind(PORT); // 随机绑定本机一个端口

var receving_files = [//当前正在接收的文件对象
	{
		filename: '',
		fileid: "",
		file_number: 0,
		content: []
	}
]
server.on('close', () => {
	server.dropMembership(multicast_ip);
	console.log('close socket');
	rl.close();
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
	receive_file(msg, rinfo, multicast_ip);

});

function receive_file(msg, rinfo, multicast_ip) {
	if (msg.toString().substr(0, 3) == '$f+') {
		var a = msg.toString().split("+");
		receving_files.push({
			filename: a[1],
			fileid: a[2],
			file_number: a[4],
			content: new Array(a[4])
		})
		console.log(`总计 ${a[4]}`)
	}
	else {
		var n = Number(msg.toString().split("+")[0].slice(2));
		var id = msg.toString().split("+")[1];
		var length = msg.toString().split("+")[0].length + id.length + 2;
		receving_files.forEach((item, index) => {
			if (item.fileid == id) {
				item.content[n] = Buffer.from(msg.slice(length));
				console.log(`接受 ${n}`)
				if (n == item.file_number - 1) {//当前文件收取完成
					fs.writeFileSync('E:/test/' + item.filename, Buffer.concat(item.content));
					console.log(`${item.filename}接收完毕`)
					receving_files.splice(index, 1);
				}
			}
		})
	}
}
function send_file(socket, multicast_ip, port, file) {
	//判断文件路径合法
	if (!fs.existsSync(file)) {
		console.log("文件不存在，请重试");
		return false;
	}
	var file_stat = fs.statSync(file);
	if (!file_stat.isFile()) {
		window.alert("请检查是否是一个合法的文件路径")
		return false;
	}
	var file_size = file_stat.size;
	if (file_size > 1073741824) {
		window.alert("文件不得超过1GiB")
		return false;
	}
	var file_number = Math.ceil(file_size / mtu);//单个块的大小不能超过64k
	var file_id = LOCAL_IP + Math.round(Math.random() * 100000).toString();
	var file_name = path.basename(file)
	fs.readFile(file, (err, data) => {
		if (err) {
			console.log(err);
			throw err;
		} else {
			socket.send(`$f+${file_name}+${file_id}+${file_size}+${file_number}`, port, multicast_ip);
			for (var i = 0; i < file_number; i++) {
				socket.send([`$f${i}+${file_id}+`, data.slice(i * mtu, (i + 1) * mtu)], port, multicast_ip)
			}
			console.log(`${file_name}已经成功发送`);
		}
	});
	return true;
}


rl.on("line", (input) => {
	send_file(server, multicast_ip, PORT, input);
});