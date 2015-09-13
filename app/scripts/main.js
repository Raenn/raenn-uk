initStars();

function initStars() {

	var starWidth = 20;

	var s = Snap(starWidth,starWidth);

	var bigCircle = s.circle(starWidth / 2,starWidth / 2,starWidth / 2);
	bigCircle.attr({
		fill: 'r(0.5, 0.5, 0.5)#fff:0-rgba(255,255,255,128):25-rgba(255,255,255,0)',
		strokeWidth: 0
	})

	bigCircle.hover(function() { console.log("hover in!") }, function() { console.log("hover out!") } )

	//TODO: animate, as so, on hover
	// var newGradient = s.gradient("r(0.5, 0.5, 0.5)#fff:0-rgba(255,255,255,128):25-rgba(255,255,255,0)");
	// bigCircle.attr({
	// 	fill: newGradient
	// })
}