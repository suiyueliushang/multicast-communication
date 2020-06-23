var a = [1, 2, 3, 4, 5]
a.forEach((item, index) => {
	if (item == 3)
		a.splice(index, 1);
})
console.log(a)