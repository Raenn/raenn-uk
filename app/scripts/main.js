initStars();

function initStars() {
	var STAR_HOVER_MILLIS = 200;
	var FADE_STEP_COUNT = 50;

	var starWidth = 2.2;

	// var s = Snap(starWidth,starWidth);
	var s = Snap('#stars');

	var fillTemplate = 'r(0.5, 0.5, 0.5)rgba({{fillValue}},20):0-rgba({{fillValue}},10):20-rgba({{fillValue}},0):80';
	var whiteFillValue = '255,255,255';
	var whiteFill = fillTemplate.replace(/\{\{fillValue\}\}/g, whiteFillValue)

	for(var i = 0; i < 300; i++) {
		var thisStarWidth = getRandomishInt(starWidth, starWidth * 4);

		var bigCircle = s.circle(
			Math.random() * 1920,
			Math.random() * 1000,
			thisStarWidth
		);

		bigCircle.attr({
			fill: whiteFill,
			strokeWidth: 0
		});

		//add a gradual colour change to 1/10 elements
		if (i%10 === 0) {
			var origValues = whiteFillValue.split(',');
			var valueToAnimateTo = '255,204,0';
			var newValues = valueToAnimateTo.split(',');

			var increments = calculateArrayIncrements(origValues, newValues, FADE_STEP_COUNT);

			setInterval(function(thisCircle) {
				Snap.animate(
					0, FADE_STEP_COUNT * 2,
					function(offset) {
						var newRGBVals = calculateTransitionStateColour(origValues, increments, Math.floor(offset), FADE_STEP_COUNT * 2);
						thisCircle.attr({fill: fillTemplate.replace(/\{\{fillValue\}\}/g, newRGBVals.join())})
					},
					2000
				)
			}, 5000 + i * 2, bigCircle)
		}

		//store what to revert to post-hover
		bigCircle.originalWidth = thisStarWidth;

		bigCircle.hover(
			function() {
				this.animate({r: this.originalWidth * 2.5}, 500)
			},
			function() {
				this.animate({r: this.originalWidth}, 1500);
			}
		);
	};
}

//more likely to be in the middle (think rolling two dice) - bit hacky, formula needs improvement
function getRandomishInt(min, max) {
  return Math.floor(Math.random() / 2 * (max - min) + Math.random() / 2 * (max - min)) + min;
}

function calculateArrayIncrements(original, destination, steps) {
	return [
		( destination[0] - original[0] ) / steps,
		( destination[1] - original[1] ) / steps,
		( destination[2] - original[2] ) / steps,
	];
}


function calculateTransitionStateColour(original, increments, counter, maxCounter) {
	var offset = 0;
	//if in first half, count from 0 -> halfway;
	//if in second half, count backwards halfway -> 0;
	if(counter < maxCounter / 2) {
		offset = counter;
	} else {
		offset = maxCounter - counter
	}

	return [
		Math.round(parseInt(original[0]) + offset * increments[0]),
		Math.round(parseInt(original[1]) + offset * increments[1]),
		Math.round(parseInt(original[2]) + offset * increments[2])
	]
}
