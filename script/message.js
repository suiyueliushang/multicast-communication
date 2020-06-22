
//1、文件接收如果长时间没有收到最后一个报文怎么处理？
//2、文件传输的超时；
//3、用类还是用对象？？？

const { readFileSync } = require("fs");




/**
 * 为socket的各种事件添加处理函数
 * @param {String} multicast_ip
 * @param {Socket} socket
 */
var received_message = [
	{
		multicast_ip: "hello world",
		multicast_ip_message: [
			{
				name: "小明",
				ip: "192",
				msg: "大家好，我是小明",
				time: "2020/6/21 19:50"
			},
			{
				name: "小明",
				ip: "192",
				msg: "很高兴认识大家",
				time: "2020/6/21 19:58"
			}
		]
	}
]

var receving_files = [//当前正在接收的文件对象
	{
		filename: '',
		fileid: "",
		file_number: 0,
		content: []
	}
]

function init_socket(multicast_ip, socket, port) {
	/**
	 * socket关闭，将socket和端口从本地记录中移除
	 */
	socket.on('close', () => {
		for (var i = 0; i < mine.multicast_list.length; i++) {
			if (mine.multicast_list[i].multicast_ip == multicast_ip) {
				mine.multicast_list[i].socket.forEach((item, index) => {
					if (item == socket) {
						mine.multicast_list[i].socket.splice(index, 1);
						mine.multicast_list[i].port.splice(index, 1);
					}
				});
			}
		}
	});

	socket.on('listening', () => {
		console.log("listening ...")
		socket.setBroadcast(true);
		socket.setMulticastTTL(255);
		socket.addMembership(multicast_ip, mine.LOCAL_IP);
		setInterval(() => {
			socket.send(`$a+${mine.name}+${mine.LOCAL_IP}`, port, multicast_ip)
		}, 60000)//每1分钟发送一次心跳信息
	});

	/**
	 * 过滤自己发送的消息
	 * 处理接受到的消息，可能有以下几种情况
	 * 1、心跳信息: $a+name+ip
	 * 2、用户离开的消息:$b+name+ip
	 * 3、发送的文件: $f+filename+filesize+id+分割份数
	 * 				$f0+id+第一份文件
	 * 				$f1+id+第二份文件
	 * 				............
	 * 				$fn+id+第n份文件
	 */
	socket.on('message', (msg, rinfo) => {
		var message = msg.toString();
		console.log(`${rinfo.address}[${rinfo.port}]:	${msg.toString()}`)
		if (message.substr(0, 2) == "$a" && /\$a\+.*\+.*/.test(message)) {//如果是心跳信息
			get_users(multicast_ip, message);
		}
		else if (message.substr(0, 2) == "$b" && /\$b\+.*\+.*/.test(message)) {//如果是用户离开信息
			user_leave(multicast_ip, message);
		}
		else if (is_logic_user(multicast_ip, rinfo.address)) {//是逻辑上的用户
			if (message.substr(0, 3) == '$f' && /\$f.*\+.*\+.*/.test(message)) {//如果发送的是文件
				receive_file(msg, rinfo, multicast_ip);
			}
		}
		else receive_text(msg, rinfo, multicast_ip);
	});

}

/**
 * 通过socket往指定多播ip和端口发送消息
 * @param {Socket} socket 
 * @param {string} multicast_ip 
 * @param {Number} port 
 * @param {String|Buffer} msg 
 */
function send_msg(socket, multicast_ip, port, msg) {
	//如果当前多播地址不在我的多播列表中，返回false
	if (!mine.multicast_list.map((key) => {
		return key.multicast_ip;
	}).contains(multicast_ip)) {
		window.alert(`未找到当前多播地址${multicast_ip}，请确认后重试`);
		return false;
	}
	socket.send(msg, port, multicast_ip);
	console.log(`发往${multicast_ip} 消息成功`);
	return true;
}

/**
 * 通过socket往指定多播地址，端口发送文件
 * 文件最大不得超过1G
 * ??????????
 * 加密处理
 * @param {Socket} socket 
 * @param {String} multicast_ip 
 * @param {Number} port 
 * @param {String} file 
 */
function send_file(socket, multicast_ip, port, file) {
	//判断文件路径合法
	if (!fs.existsSync(file)) {
		window.alert("文件不存在，请重试");
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
	var file_number = Math.ceil(file_size / 65500);//单个块的大小不能超过64k
	var file_id = mine.LOCAL_IP + Math.round(Math.random() * 100000).toString();
	var file_name = path.basename(file)
	socket.send(`$f+${file_name}+${file_id}+${file_size}+${file_number}`, port, multicast_ip);
	fs.readFile('文件名', (err, data) => {
		if (err) throw err;
		for (var i = 0; i < file_id; i++) {
			socket.send([`$f${i}+${file_id}+`, data.slice(i * 65500, (i + 1) * 65500)], port, multicast_ip)
		}
		console.log(`${file_name}已经成功发送`);
	});
	return true;
}

/**
 * 接受用户输入心跳信息
 * @param {String} multicast_ip 
 * @param {String} msg 
 * msg："$+name+ip"
 */
function get_users(multicast_ip, msg) {
	var name, ip;
	name = msg.split('+')[1];
	ip = msg.split("+")[2];
	multicast_members.forEach((item, index) => {
		if (item.multicast_ip == multicast_ip) {
			if (!(multicast_members[index].member.map((key) => { return key.ip; })).contains(ip))
				multicast_members[index].member.push({
					name: name,
					ip: ip,
					if_logic: true
				})
			else {
				multicast_members[index].member.forEach((a) => {
					if (a.ip == ip && a.name != name)
						a.name = name;
				})
			}
		}
	})
}

/**
 * 判断一个多播内的用户是否为逻辑组用户
 * @param {String} multicast_ip 
 * @param {String} ip 
 */
function is_logic_user(multicast_ip, ip) {
	multicast_members.forEach((item, index) => {
		if (item.multicast_ip == multicast_ip) {
			multicast_members[index].member.forEach((a, b) => {
				if (a.ip == ip)
					return a.if_logic;
			})
		}
	})
	return false;
}

/**
 * 处理用户离开多播组,将用户从列表中删除
 * @param {String} multicast_ip 
 * @param {String} ip 
 */
function user_leave(multicast_ip, msg) {
	var name, ip;
	name = msg.split('+')[1];
	ip = msg.split("+")[2];
	multicast_members.forEach((item, index) => {
		if (item.multicast_ip == multicast_ip) {
			multicast_members[index].member.forEach((a, b) => {
				if (a.ip == ip)
					multicast_members[index].member.splice(b, 1)
			})
		}
	})
}

/**
 * 接收文件
 * 需要完整性验证以及正确性验证
 * @param {Buffer} msg 
 * @param {Object} rinfo 
 */
function receive_file(msg, rinfo, multicast_ip) {
	if (msg.toString().substr(0, 3) == '$f+') {
		var a = msg.toString().split("+");
		receving_files.push({
			filename: a[1],
			fileid: a[2],
			file_number: a[4],
			content: new Array(a[4])
		})
	}
	else {
		var n = Number(msg.toString().split("+")[0].slice(2));
		var id = msg.toString().split("+")[1];
		receving_files.forEach((item, index) => {
			if (item.fileid == id) {
				item.content[n] = Buffer.from(msg.toString().split("+")[2])
				if (n == item.file_number - 1) {//当前文件收取完成
					fs.writeFileSync(file_path + '/' + item.filename, Buffer.from(item.content));
					window.alert(`${item.filename}接受完毕`);
					receive_file.splice(index, 1);
					received_message.forEach((a) => {
						if (a.multicast_ip == multicast_ip)
							a.multicast_ip_message.push({
								name: get_name(multicast_ip, rinfo.address),
								ip: rinfo.address,
								msg: item.filename,
								time: sd.format(new Date(), 'YYYY-MM-DD HH:mm')
							})
					})
				}
			}
		})
	}
}

/**
 * 接收文本消息
 * @param {String} multicast_ip 
 * @param {String} ip 
 */
function receive_text(msg, rinfo, multicast_ip) {
	received_message.forEach((a) => {
		if (a.multicast_ip == multicast_ip)
			a.multicast_ip_message.push({
				name: get_name(multicast_ip, rinfo.address),
				ip: rinfo.address,
				msg: msg.toString(),
				time: sd.format(new Date(), 'YYYY-MM-DD HH:mm')
			})
	})
	console.log(`${rinfo.address}:	${msg.toString()} ${sd.format(new Date(), 'YYYY-MM-DD HH:mm')}`)
}

/**
 * 获取对应多播地址的默认socket和port
 * @param {String} multicast_ip
 * @returns {Object}
 */
function get_default_socket_port(multicast_ip) {
	var res = mine.multicast_list.filter((item) => {
		return item.multicast_ip == multicast_ip;
	})[0];
	return {
		socket: res.socket[0],
		port: res.port[0]
	}
}

/**
 * 处理点击文件按钮，打开选择文件对话框
 */
function handle_select_file_button() {
	dialog.showOpenDialog({ properties: ['openFile'] }).then(result => {
		if (!result.canceled && result.filePaths.length == 1) {
			var multicast_ip = $('#communication_title').html();
			var default_socket_port = get_default_socket_port(multicast_ip);
			$('#communication_title').html(multicast_ip + "  " + result.filePaths[0] + "发送中...");
			send_file(default_socket_port.socket, multicast_ip, default_socket_port.port, result.pathfilePaths[0])
			$('#communication_title').html(multicast_ip);
		}
	}).catch(err => {
		console.log(err)
	});
}

