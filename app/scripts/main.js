initStars();

var STAR_HOVER_MILLIS = 200;

function initStars() {
	var starWidth = 200;

	var s = Snap(starWidth,starWidth);

	var restingStarGradient = 'r(0.5, 0.5, 0.5)#fff:0-rgba(255,255,255,128):25-rgba(255,255,255,0)';
	var hoverStarGradient = 'r(0.5, 0.5, 0.5)#fff:0-rgba(255,255,255,128):{{offset}}-rgba(255,255,255,0)';

	var bigCircle = s.circle(starWidth / 2,starWidth / 2,starWidth / 2);
	bigCircle.attr({
		fill: restingStarGradient,
		strokeWidth: 0
	});

	//TODO: find better scope for this once > 1 star
	var currentStop = 25;

	function adjustGradientStop(offset) {
		currentStop = offset;
		var newGradient = hoverStarGradient.replace('{{offset}}', offset);
		bigCircle.attr({fill: newGradient});
	}

	bigCircle.hover(
		function() {
			Snap.animate(currentStop, 50, adjustGradientStop, STAR_HOVER_MILLIS)
		},
		function() {
			Snap.animate(currentStop, 25, adjustGradientStop, STAR_HOVER_MILLIS)
		}
	);
}