/**功能：
 * 处理多播组相关事件
 * 包括展示所加入的多播组；
 * 展示多播组中成员信息
 * 接收某个多播组中的消息并显示
 * 接收某个多播组中的文件
 * 成员管理：
 * 创建黑名单和白名单
 * 发送消息，文件
 */

/**
* 多播组的所有成员
* 对象列表
*/
var multicast_members = [
	{
		multicast_ip: "hello world",	//多播ip
		member: [			//成员对象列表
			{
				name: "小明",
				ip: "192",
				if_logic: true
			}
		]
	}
]

/**
 * 点击多播组展示按钮执行
 * 显示当前加入的多播组
 */
$("#show").click(() => {
	var multicast_list = get_joined_multicast_list();
	var multicast_list_length = multicast_list.length;
	var str = "<center>多播组列表</center>";
	for (var i = 0; i < multicast_list_length; i++) {
		str += `<details><summary onclick="handle_click_summary(this)">${multicast_list[i]}</summary><ul>`;
		var members = get_one_multicast_member(multicast_list[i]);
		for (var j = 0; j < members.length; j++) {
			str += `<li><a href="#" onclick="handle_member(this)">${members[j].name}	${members[j].ip}</a></li>`;
		}
		str += "</ul></details>";
	}
	$("#main_window_up_mid_bar_origin").html(str);
	$("#main_window_up_mid_bar_origin").show();
	$("#main_window_up_mid_bar_join").hide();
})

/**
 * 点击多播
 * @param {Object} data
 */
function handle_click_summary(data) {
	var multicast_ip = $(data).html();
	$("#communication_title").html(multicast_ip);
	var message = (() => {
		return received_message.filter((item) => {
			return item.multicast_ip == multicast_ip;
		})[0].multicast_ip_message
	})();
	var str = ""
	message.forEach((item) => {
		str += item.name+`(${item.ip})` + " " + item.time + '<br/>'
		str += item.msg + '<br/><br/>';
	})
	$('#communication_text').html(str)
	var html = $("#communication_box").html();
	$("#communication_box").html(html);
	$("#communication_box").show();
}

/**
 * 点击成员
 * @param {Object} data 
 */
function handle_member(data) {
	var member_info = $(data).html().split("	");
	$("#communication_title").html(member_info[0]);
	var html = $("#communication_box").html();
	$(communication_box).html(html);
	$("#communication_box").show();
}
/**
 * 点击多播组某个成员时
 */
$("li").click(() => {
	console.log($("li").html());
});

/**
 * 点击提交按键时
 */
function handle_summit_text() {
	var multicast_ip = $('#communication_title').html();
	console.log(multicast_ip);
	var default_socket_port = get_default_socket_port(multicast_ip);
	console.log(default_socket_port)
	console.log($('textarea').val());
	send_msg(default_socket_port.socket, multicast_ip, default_socket_port.port, $('textarea').val());
	$('textarea').val("");
}

/**
 * 更新multicast_members
 */
function update_multicast_members(multicast_ip, member_ip, name) {
	for (var i = 0; i < multicast_members.length; i++) {
		if (multicast_members[i].multicast_ip == multicast_ip) {
			var members_ip_list = multicast_members[i].member.map((v) => {
				return v.ip;
			})
			if (!(members_ip_list.contains(member_ip))) {
				multicast_members[i].member.push({
					name: name,
					ip: member_ip,
					if_logic: true
				});
			}
		}
	}
}

$('#main_window_down').html(mine.name);
/**
 * 返回已加入的多播组列表
 */
function get_joined_multicast_list() {
	var res = []
	for (var i = 1; i < mine.multicast_list.length; i++) {
		res.push(mine.multicast_list[i].multicast_ip)
	}
	return res;
}

/**
 * 返回某个已加入的多播组所有逻辑成员信息列表
 */
function get_one_multicast_member(multicast_ip) {
	var res = [];
	for (var i = 0; i < multicast_members.length; i++) {
		if (multicast_members[i].multicast_ip == multicast_ip) {
			for (var j = 0; j < multicast_members[i].member.length; j++) {
				if (multicast_members[i].member[j].if_logic)
					res.push({
						name: multicast_members[i].member[j].name,
						ip: multicast_members[i].member[j].ip
					});
			}
			return res;
		}
	}
	return [];
}

/**
 * 逻辑上的成员管理，黑名单
 * @param {string} multicast_ip 
 * @param {string} member_ip 
 * @returns boolen
 */
function remove_multicast_membber(multicast_ip, member_ip) {
	/**???????????????????????????
	 * 进行逻辑上的删除操作
	 * ？？？？？？？？？？？？？
	 */
	for (var i = 0; i < multicast_members.length; i++) {
		if (multicast_members[i].multicast_ip == multicast_ip) {
			for (var j = 0; j < multicast_members[i].member.length; j++) {
				if (multicast_members[i].member[j].ip == member_ip)
					if (multicast_members[i].member[j].if_logic) {
						multicast_members[i].member[j].if_logic = false;
						window.alert(`${member_ip}删除成功`);
						return true;
					}
					else {
						window.alert(`${member_ip}已经被删除了，无须任何操作`);
						return true;
					}
			}
		}
	}
	return false;
}

/**
 * 通过多播和对方ip查找对方名称
 * @param {String} multicast_ip 
 * @param {String} ip 
 */
function get_name(multicast_ip, ip) {
	var a="";
	multicast_members.forEach((item) => {
		if (item.multicast_ip == multicast_ip) {
			var res = item.member.filter((key) => { return key.ip == ip })
			if (res.length == 1){
				a=res[0].name;
			}
		}
	})
	return a;
}