initStars();

function initStars() {
	var STAR_HOVER_MILLIS = 200;
	var STAR_BASE_STOP = 20;
	var STAR_MAX_STOP = 30;

	var starWidth = 20;

	// var s = Snap(starWidth,starWidth);
	var s = Snap('#stars');

	var restingStarGradient = 'r(0.5, 0.5, 0.7)rgba(255,255,255,128):' + STAR_BASE_STOP + '-rgba(255,255,255,0):80';
	var hoverStarGradient = 'r(0.5, 0.5, {{sizeOffset}})rgba(255,255,255,128):{{offset}}-rgba(255,255,255,0):80';

	for(var i = 0; i < 100; i++) {
		var bigCircle = s.circle(
			(i % 10) * ((starWidth * 2)) + starWidth / 1.8, //1.8 so slightly larger 
			(i / 10 | 0) * ((starWidth * 2)) + starWidth / 1.8, //1.8 so slightly larger
			starWidth / 2
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
				}, STAR_HOVER_MILLIS * 3);
			}
		);
	};

	function adjustGradientStop(offset) {
		this.currentStop = offset;
		var newGradient = hoverStarGradient
			.replace('{{offset}}', this.currentStop)
			.replace('{{sizeOffset}}', 0.7 + 0.01 * this.currentStop);
		this.attr({fill: newGradient});
	}
}