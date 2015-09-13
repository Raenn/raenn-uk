initStars();

function initStars() {
	var STAR_HOVER_MILLIS = 200;
	var STAR_BASE_STOP = 20;
	var STAR_MAX_STOP = 30;

	var starWidth = 2;

	// var s = Snap(starWidth,starWidth);
	var s = Snap('#stars');

	var restingStarGradient = 'r(0.5, 0.5, 0.7)rgba(255,255,255,20):0-rgba(255,255,255,10):' + STAR_BASE_STOP + '-rgba(255,255,255,0):80';
	var hoverStarGradient = 'r(0.5, 0.5, {{sizeOffset}})rgba(255,255,255,20):0-rgba(255,255,255,10):{{offset}}-rgba(255,255,255,0):80';

	for(var i = 0; i < 500; i++) {

		var thisStarWidth = getRandomishInt(starWidth, starWidth * 6);

		var bigCircle = s.circle(
			Math.random() * 1000,
			Math.random() * 1000,
			thisStarWidth / 2
		);

		bigCircle.attr({
			fill: restingStarGradient,
			strokeWidth: 0
		});

		bigCircle.currentStop = STAR_BASE_STOP;

		bigCircle.hover(
			function() {
				var self = this;
				Snap.animate(self.currentStop, STAR_MAX_STOP, function(offset) {
					adjustGradientStop.call(self, offset);
				}, STAR_HOVER_MILLIS);
			},
			function() {
				var self = this;
				Snap.animate(self.currentStop, STAR_BASE_STOP, function(offset) {
					adjustGradientStop.call(self, offset);
				}, STAR_HOVER_MILLIS * 6);
			}
		);
	};

	function adjustGradientStop(offset) {
		this.currentStop = offset;
		var newGradient = hoverStarGradient
			.replace('{{offset}}', this.currentStop)
			.replace('{{sizeOffset}}', 0.5 + 0.01 * this.currentStop);
		this.attr({fill: newGradient});
	}
}

//more likely to be in the middle (think rolling two dice) - bit hacky, formula needs improvement
function getRandomishInt(min, max) {
  return Math.floor(Math.random() / 2 * (max - min) + Math.random() / 2 * (max - min)) + min;
}