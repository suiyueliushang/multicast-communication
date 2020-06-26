var a = [1, 2, 3, 4, 5]
a.forEach((item, index) => {
	if (item == 3)
		a.splice(index, 1);
})
function sleep(numberMillis) {
	var now = new Date();
	var exitTime = now.getTime() + numberMillis;
	while (true) {
		now = new Date();
		if (now.getTime() > exitTime)
			return;
	}
}
sleep(5000);
console.log(a)