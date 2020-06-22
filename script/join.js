var sock;
var join, summit_ip, ip_address, port;
/**
 * # 待完善：
 * 1、mine对象中multicast_list首先是空的，需要先判断在比较；
 * 2、更换button的处理方式为jquery
 * 3、判断多播ip是否符合要求：是否已经在mine中，是否是一个ip地址，是否是有个合法的多播地址
 * 4、端口：判断端口是否在mine中，是否已经被占用；
 * 5、中间bar的右边框可以向右或者向左拉
 * 6、对按钮进行美化
 * 扩展：
 * 1、中间bar可以进行隐藏，就像vscode一样
 */

/**
 * 处理左侧边框中点击加入按钮
 */
$("#join").click(() => {
	$("#main_window_up_mid_bar_origin").hide();
	$("#main_window_up_mid_bar_join").show();
	summit_ip = document.getElementById("summit_ip");
	ip_address = document.getElementById("ip_address");
	port = document.getElementById("port");
	summit_ip.addEventListener('click', handle_summit_ip);
})

/**
 * 处理提交ip和端口的按钮
 */
function handle_summit_ip() {
	if (join_multicast(ip_address.value, Number(port.value))) {//判断是否加入成功
		window.alert(`欢迎加入多播组${ip_address.value}`)//加入成功后执行;
	}
	ip_address.value = "";
	port.value = "";
}


/**
 * 加入多播组
 */
function join_multicast(ip, port) {
	if (!is_valid_multicast_ip(ip)) {
		window.alert("不是一个合法的多播地址，请重新输入");
		return false;
	}
	var i = mine.multicast_list.length;
	while (i--) {
		if (mine.multicast_list[i].multicast_ip == ip) {
			window.alert("已经在该多播组中了，无需重复加入");
			return false;
		}
	}
	//创建socket并加入多播组
	sock = dgram.createSocket('udp4');
	sock.bind(port);
	init_socket(ip, sock, port);
	mine.multicast_list.push({
		multicast_ip: ip,
		port: port,
		socket: sock
	});
	multicast_members.push({
		multicast_ip: ip,
		member: []
	})
	received_message.push({
		multicast_ip: ip,
		multicast_ip_message: []
	})
	return true;

}
/**
 * ？？？？？？？？？？？？？？？？？？？
 * 判断当前输入的ip是否为合法的多播ip地址
 * 并判断当前ip是否已经加入
 * 判断当前端接口是否被占用
 * @param ip:String
 */
function is_valid_multicast_ip(ip) {
	var pattern = /.*/;
	return pattern.test(ip);
}
/**A？？？？？？？？？？？？？？？？
 * 中间bar的右边框可以向右向左拉
 * ？？？？？？？？？？？？？？？？？？？
 */
// $(function () {
// 	$("#test").l_zoom('free');
// });
