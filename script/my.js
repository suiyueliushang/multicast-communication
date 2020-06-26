const os = require("os");
const $ = require("jquery");
const fs = require("fs");
const dgram = require("dgram");
const sd = require('silly-datetime');
const path = require("path");
const remote = require('electron').remote;
const dialog = remote.dialog;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
if (os.networkInterfaces()['WLAN'])
	var ip = os.networkInterfaces()['WLAN'].slice(-1)[0]['address'];
else if (os.networkInterfaces()['WLAN 2'])
	var ip = os.networkInterfaces()['WLAN 2'].slice(-1)[0]['address'];
var mine = {
	LOCAL_IP: ip,
	name: "liushang",
	multicast_list: [
		{
			multicast_ip: "",
			port: [],
			socket: [] //一个socket类型
		},
		{
			multicast_ip: "hello world",
			port: [],
			socket: [] //一个socket类型
		}
	]
};
var file_path = "E:/test";//文件默认存储路径

$('#mine').click(() => {
	$("#main_window_up_mid_bar_origin").html(`name<br/ >${mine.name}<br/><br/>default file download path<br />${file_path}<br/><br/>\
		<button id="change_name" onclick="handle_change_name()">change name</button><br/><input id="new_name" type="text" required='required'></input><br/><br/>\
		<button id="change_file_path" onclick="handle_change_path()">change default download file path</button><br/><input id="new_path" type="text" required='required'></input><br/ ><br/>`);
	$("#main_window_up_mid_bar_origin").show();
	$('#main_window_up_mid_bar_join').hide();
})

/**
 * 处理更该名字
 */
function handle_change_name() {
	if (document.getElementById("new_name").value) {
		mine.name = document.getElementById("new_name").value;
		$('#main_window_down').html(mine.name);
		$("#main_window_up_mid_bar_origin").html(`name<br/ >${mine.name}<br/><br/>default file download path<br />${file_path}<br/><br/>\
		<button id="change_name" onclick="handle_change_name()">change name</button><br/><input id="new_name" type="text" required='required'></input><br/><br/>\
		<button id="change_file_path" onclick="handle_change_path()">change default download file path</button><br/><input id="new_path" type="text" required='required'></input><br/ ><br/>`);
		$("#main_window_up_mid_bar_origin").show();
		$('#main_window_up_mid_bar_join').hide();
	}
}

/**
 * 处理更改路径
 */
function handle_change_path() {
	if (document.getElementById("new_path").value) {
		if (fs.existsSync(document.getElementById("new_path").value) && fs.statSync(document.getElementById("new_path").value).isDirectory()) {
			file_path = document.getElementById("new_path").value;
			$("#main_window_up_mid_bar_origin").html(`name<br/ >${mine.name}<br/><br/>default file download path<br />${file_path}<br/><br/>\
		<button id="change_name" onclick="handle_change_name()">change name</button><br/><input id="new_name" type="text" required='required'></input><br/><br/>\
		<button id="change_file_path" onclick="handle_change_path()">change default download file path</button><br/><input id="new_path" type="text" required='required'></input><br/ ><br/>`);
			$("#main_window_up_mid_bar_origin").show();
			$('#main_window_up_mid_bar_join').hide();
		}
		else window.alert("不是一个合法的路径，请重新输入");
	}
}

/**
 * 判断元素是否在数组中
 * @param {*} obj 
 */
Array.prototype.contains = function (obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
}


let menu = new Menu();//new一个菜单//添加菜单功能
menu.append(new MenuItem({ label: '退出多播', click: function () { leave_multicast(); } }));//添加菜单分割线  
menu.append(new MenuItem({ type: 'separator' }));//添加菜单功能  
menu.append(new MenuItem({ label: '移除成员', type: 'checkbox', checked: true, click: printString }));
window.addEventListener('contextmenu', function (e) { e.preventDefault(); menu.popup(remote.getCurrentWindow()); }, false);
function printString() { console.log('item 2 clicked') }
