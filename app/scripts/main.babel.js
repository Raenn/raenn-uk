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

var starScenes = [];

// window.onresize = updateOrbitCenter;
// window.onload = initSpace;

window.onload = initCanvasSpace;
window.onresize = debounce(resizeCanvases, 200);

var ticking = false;

window.onscroll = handleScroll;
window.ontouchmove = handleScroll;

function handleScroll(event) {
	if(!ticking) {
		ticking = true;
		requestAnimationFrame(function() {
			drawStars(window.pageYOffset)
		});
	}
}

var starCanvas;
var minRadius = 1.5;
var starNum = 1000;
var starLocations = [];
var parallaxMultiplier = 0.6;

function initCanvasSpace() {
	starCanvas = document.getElementById('star-canvas');

	initCanvasSizes();
	generateStars();
};

function resizeCanvases() {
	if (!starCanvas) { return; }
	var widthBefore = starCanvas.width;
	var widthAfter = document.body.clientWidth;

	if (widthAfter > widthBefore) {
		//increase the scale of the canvas; quicker than a whole redraw and preserves element recycling logic
		var scaleFactor = widthAfter / widthBefore;
		starCanvas.style.width = `${starCanvas.width * scaleFactor}px`;
		starCanvas.style.height = `${(starCanvas.height + 60) * scaleFactor}px`;
	}
};

function initCanvasSizes() {
	starCanvas.width = document.body.clientWidth;
	starCanvas.height = document.body.clientHeight + 60; //extra 60 avoids URL bar issues on mobile
	drawStars(window.pageYOffset);
}

function generateStars() {
	for(var i = 0; i < starNum; i++) {
		var x = Math.round(Math.random() * starCanvas.width);
		var y = Math.round(Math.random() * starCanvas.height);
		var scale = 0.8 + 0.2 * Math.random();

		starLocations.push({x: x, y: y, scale: scale});
	}
	drawStars(window.pageYOffset);
}

function drawStars(scrollY) {
	if(!starCanvas) { return; }

	var context = starCanvas.getContext('2d');
	//clear canvas
	context.clearRect(0, 0, starCanvas.width, starCanvas.height)

	if(!starLocations) { return; }

	context.save();
	context.fillStyle = '#E6E6E6';
	var parallaxStep = -parallaxMultiplier * scrollY;
	var parallaxAmount = 0;

	starLocations.forEach( (star, index) => {
		//start a new parallax layer every so often
		if(index % 100 == 0) {
			parallaxAmount += parallaxStep;
			context.translate(0, parallaxStep);
		}

		context.save();

		//reuse elements that go above top of screen
		var yPos = star.y;
		while (yPos < -parallaxAmount) {
			yPos += starCanvas.height;
		}

		//translate to star position so gradient center is correct
		context.translate(star.x, yPos);

		context.beginPath();
		context.arc(0, 0, minRadius * star.scale, 0, 2 * Math.PI, true);
		//scale gradient to match star size
		context.scale(star.scale, star.scale);
		context.fill();
		context.closePath();

		context.restore();
	});

	context.restore();

	//we're ready to do more parallax on next scroll
	ticking = false;
};

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this,
			args = arguments;

		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};

		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) { func.apply(context, args) };
	}
}

/*
function initSpace() {
	initSVGs();
	initOrbit();
}

function initSVGs() {
	var starScene1 = Snap('#stars-near');
	var starScene2 = Snap('#stars-mid');
	var starScene3 = Snap('#stars-far');
	var moonScene = Snap('#moon');
	//use less parallax layers if on mobile
	starScenes = [starScene1, starScene2, starScene3];
	if (isMobile()) {
		starScenes.pop();
	}
	initStars(starScenes);
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
	starScenes.forEach(function(scene, index) {
		var scrollMultiplier = scene.node.getAttribute('parallax-amount');
		scene.node.style.top = -scrollY * scrollMultiplier + 'px';
	})
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
*/

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

function isMobile() {
	var mobileRegex = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/;
	return mobileRegex.test(window.navigator.userAgent);
}
