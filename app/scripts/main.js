window.onload = initSpace;

function initSpace() {
	initSVGs();
	initOrbit();
}

function initSVGs() {
	var starScene = Snap('#stars');
	var moonScene = Snap('#moon');
	// initStars(starScene);
	initMoon(moonScene);
}

function initMoon(scene) {
	//TODO: figure out how to preserve aspect ratio when scaling with snap
	var cX = 0;
	var cY = 0;
	var cRadius = 180;

	var moon = scene.circle('50%', '50%', '20%');
	moon.attr({'fill': 'r(0.75,-0.25,2.5)-#FF9D5C-#FFCC99:20-#FF8B6F:35-#FFCC99:42-#FFA375:53'});
}

function initStars(scene) {
	var STAR_HOVER_MILLIS = 200;
	var FADE_STEP_COUNT = 10;

	var starWidth = 2.2;
	var fadeColours = ['153,194,255', '255,219,77', '193,156,230'];
	var fadeGroups = {};

	fadeColours.forEach(function(colour) {
		fadeGroups[colour] = scene.group();
	});

	var fillTemplate = 'r(0.5, 0.5, 0.5)rgba({{fillValue}},20):0-rgba({{fillValue}},10):20-rgba({{fillValue}},0):80';
	var whiteFillValue = '255,255,255';
	var whiteFill = fillTemplate.replace(/\{\{fillValue\}\}/g, whiteFillValue);

	for(var i = 0; i < 150; i++) {
		var thisStarWidth = getRandomishInt(starWidth, starWidth * 4);

		var bigCircle = scene.circle(
			Math.random() * 1920,
			Math.random() * 1000,
			thisStarWidth
		);

		bigCircle.attr({
			fill: whiteFill,
			strokeWidth: 0
		});

		//add a gradual colour change to some elements
		if (i%20 === 0) {
			var colourGroup = fadeGroups[sampleOneFrom(fadeColours)];
			colourGroup.add(bigCircle);
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

	var groupIndex = 0;
	Object.keys(fadeGroups).forEach(function(key) {

		groupIndex += 1;

		var origValues = whiteFillValue.split(',');
		var destValues = key.split(',');
		var group = fadeGroups[key];
		var increments = calculateArrayIncrements(origValues, destValues, FADE_STEP_COUNT);

		setTimeout(function() {
			setInterval(function() {
				Snap.animate(
					0, FADE_STEP_COUNT * 2,
					function(offset) {
						var newRGBVals = calculateTransitionStateColour(
							origValues,
							increments,
							Math.floor(offset),
							FADE_STEP_COUNT * 2
						);
						group.children().forEach(function(child) {
							child.attr({
								fill: fillTemplate.replace(/\{\{fillValue\}\}/g, newRGBVals.join())
							});
						})
					},
					1500
				)

			}, 4000);
		}, groupIndex * 1000);
	})
}

//loops between 0 and 2*Math.PI
var orbitOffset = 0;
var orbitIncrement = Math.PI / 512;
var orbitMax = 2 * Math.PI;

function initOrbit() {
	var orbitElements = document.getElementsByClassName('orbit-image');

	//TODO: pause/start interval only when moon is in view
	var interval = setInterval(function() {
		updateOrbit(orbitElements);
	}, 20);
}

//TODO: position moon + orbit seriously
//TODO: fix z-index of SVG moon not being applied...?
function updateOrbit(elements) {
	var step = 2 * Math.PI / elements.length;
	var a = 200;
	var b = 80;
	var theta = -25 * (2 * Math.PI / 360); //rotation angle

	var i = 0;

	for(var angle = 0; angle < 2*Math.PI; angle += step) {
		var x = a * Math.cos(angle + orbitOffset);
		var y = b * Math.sin(angle + orbitOffset);

		var cosTheta = Math.cos(theta);
		var sinTheta = Math.sin(theta);

		var xDash = x * cosTheta + y * sinTheta;
		var yDash = y * cosTheta - x * sinTheta;

		elements[i].style.left = 443 + xDash + 'px';
		elements[i].style.top = 961 + yDash + 'px';

		if(y < 0) {
			elements[i].style.zIndex = 0;
		} else {
			elements[i].style.zIndex = 2;
		}

		i += 1;
	}

	orbitOffset = (orbitOffset + orbitIncrement) % orbitMax;
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
		offset = maxCounter - counter;
	}

	return [
		Math.round(parseInt(original[0]) + offset * increments[0]),
		Math.round(parseInt(original[1]) + offset * increments[1]),
		Math.round(parseInt(original[2]) + offset * increments[2])
	];
}

function sampleOneFrom(array) {
	var index = Math.round(Math.random() * (array.length - 1));
	return array[index];
}
