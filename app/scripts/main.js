//loops between 0 and 2*Math.PI
var orbitOffset = 0;
var orbitIncrement = Math.PI / 512;
var orbitMax = 2 * Math.PI;
var orbitCenterX = 0;
var orbitCenterY = 0;
var orbitXRadius = 200;
var orbitYRadius = 80;

var cvActive = false;
var activeCVSection = 0;

window.onresize = updateOrbitCenter;
window.onload = initSpace;

function initSpace() {
	initSVGs();
	initOrbit();
}

function initSVGs() {
	var starScene1 = Snap('#stars-near');
	var starScene2 = Snap('#stars-mid');
	var starScene3 = Snap('#stars-far');
	var moonScene = Snap('#moon');
	initStars([starScene1, starScene2, starScene3]);
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

function initStars(scenes) {
	var STAR_HOVER_MILLIS = 200;

	var starWidth = 2.2;

	var fillTemplate = 'r(0.5, 0.5, 0.5)rgba({{fillValue}},20):0-rgba({{fillValue}},10):20-rgba({{fillValue}},0):80';
	var whiteFillValue = '255,255,255';
	var whiteFill = fillTemplate.replace(/\{\{fillValue\}\}/g, whiteFillValue);

	//make more stars if given a wider area
	var sceneSize = scenes[0].node.getBoundingClientRect();
	var starCount = Math.pow((sceneSize.width * sceneSize.height), 0.8) / 600;

	for(var i = 0; i < starCount; i++) {
		var thisStarWidth = getRandomishInt(starWidth, starWidth * 4);

		var scene = scenes[i % scenes.length];

		var bigCircle = scene.circle(
			Math.random() * 100 + '%',
			Math.random() * 100 + '%',
			thisStarWidth
		);

		bigCircle.attr({
			fill: whiteFill,
			strokeWidth: 0
		});

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

window.onscroll = function() {
	var scroll = window.pageYOffset || document.body.scrollTop;
	window.requestAnimationFrame(function() {
		updateParallax(scroll);
	})
};

function updateParallax(scrollY) {
	var elements = document.getElementsByClassName('stars');
	//can't forEach on a html collection :'(

	for(var i = 0; i < elements.length; i++) {
		var scrollMultiplier = elements[i].getAttribute('parallax-amount');
		elements[i].style.top = -scrollY * scrollMultiplier + 'px';
	}
}

function updateOrbitCenter() {
	var moonAttrs = document.getElementById('moon').getBoundingClientRect();

	if(window.innerWidth < 768) {
		//on mobile, moon is BENEATH copy; Y position needs to be calculated differently
		orbitCenterX = (moonAttrs.width / 2) -30;
		orbitCenterY = moonAttrs.height * 1.4;
	} else {
		//slight shifts needed because of rotation
		orbitCenterX = moonAttrs.left * 0.98 + (moonAttrs.width / 2) - 30;
		orbitCenterY = moonAttrs.height / 2.2;
	}

	orbitXRadius = Math.min(280, (moonAttrs.width / 2) * 0.75);
	orbitYRadius = orbitXRadius * 0.4;
}

function initOrbit() {
	//TODO: pause/start interval only when moon is in view
	updateOrbitCenter();
	var orbitElements = document.getElementsByClassName('orbit-image');

	window.requestAnimationFrame(function() {
		updateOrbit(orbitElements);
	})
}

//TODO: position moon + orbit seriously
function updateOrbit(elements) {
	var step = 2 * Math.PI / elements.length;
	var theta = -25 * (2 * Math.PI / 360); //rotation angle

	var i = 0;

	for(var angle = 0; angle < 2*Math.PI; angle += step) {
		var x = orbitXRadius * Math.cos(angle + orbitOffset);
		var y = orbitYRadius * Math.sin(angle + orbitOffset);

		var cosTheta = Math.cos(theta);
		var sinTheta = Math.sin(theta);

		//rotate by theta degrees
		var xDash = x * cosTheta + y * sinTheta;
		var yDash = y * cosTheta - x * sinTheta;

		elements[i].style.left = orbitCenterX + xDash + 'px';
		elements[i].style.top = orbitCenterY + yDash + 'px';

		if(y < 0) {
			elements[i].style.zIndex = 0;
		} else {
			elements[i].style.zIndex = 2;
		}

		i += 1;
	}

	orbitOffset = (orbitOffset + orbitIncrement) % orbitMax;

	window.requestAnimationFrame(function() {
		updateOrbit(elements);
	});
}

window.requestAnimationFrame = window.requestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.msRequestAnimationFrame
	|| function(f){return setTimeout(f, 1000/60)} //fall back method, run roughly 60 times per second

function toggleCV() {
	var cvBox = document.getElementById('cv-container');
	if(cvActive) {
		cvBox.className = cvBox.className.replace('show', '');
	} else {
		cvBox.className = cvBox.className + ' show';
	}
	cvActive = !cvActive;
}

function setActiveCVSection(index) {
	var cvSections = document.getElementsByClassName('cv-section');
	var copySections = document.getElementsByClassName('copy-section');
	if(index < 0 || index > cvSections.length) {
		//wat r u doin
		return;
	}
	cvSections[activeCVSection].className = cvSections[activeCVSection].className.replace(/\s?active/, '')
	cvSections[index].className += ' active'
	copySections[activeCVSection].className = copySections[activeCVSection].className.replace(/\s?active/, '')
	copySections[index].className += ' active'
	activeCVSection = index;
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
