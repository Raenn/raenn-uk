//loops between 0 and 2*Math.PI
let orbitOffset = 0;
let orbitIncrement = Math.PI / 512;
const orbitMax = 2 * Math.PI;

// let orbitCenterX = 0;
// let orbitCenterY = 0;
// let orbitXRadius = 200;
// let orbitYRadius = 80;

let cvActive = false;
let activeCVSection = 0;

window.onload = init;
window.onresize = debounce(resizeCanvases, 200);
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

let starCanvas, moonCanvas;
const minStarRadius = 1.5;
const parallaxMultiplier = 0.6;
let starNum = 1000;
let starLocations = [];
let ticking = false;

function init() {
	initStarCanvas();
	initMoonCanvas();
};

function initStarCanvas() {
	starCanvas = document.getElementById('star-canvas');
	starCanvas.width = document.body.clientWidth;
	starCanvas.height = document.body.clientHeight + 60; //extra 60 avoids URL bar issues on mobile

	generateStars();
	drawStars(window.pageYOffset);
};

function resizeCanvases() {
	//TODO: resize moon canvas too
	if (!starCanvas) { return; }
	const widthBefore = starCanvas.width;
	const widthAfter = document.body.clientWidth;

	if (widthAfter > widthBefore) {
		//increase the scale of the canvas; quicker than a whole redraw and preserves element recycling logic
		let scaleFactor = widthAfter / widthBefore;
		starCanvas.style.width = `${starCanvas.width * scaleFactor}px`;
		starCanvas.style.height = `${(starCanvas.height + 60) * scaleFactor}px`;
	}
};

function generateStars() {
	for(var i = 0; i < starNum; i++) {
		let x = Math.round(Math.random() * starCanvas.width);
		let y = Math.round(Math.random() * starCanvas.height);
		let scale = 0.8 + 0.2 * Math.random();

		starLocations.push({x: x, y: y, scale: scale});
	}
	drawStars(window.pageYOffset);
}

function drawStars(scrollY) {
	if(!starCanvas) { return; }

	const context = starCanvas.getContext('2d');
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
		context.arc(0, 0, minStarRadius * star.scale, 0, 2 * Math.PI, true);
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

function initMoonCanvas() {
	moonCanvas = document.getElementById('moon-canvas');
	//TODO: actual calculation
	moonCanvas.width = 500;
	moonCanvas.height = 500;
	drawMoon();
};

function drawMoon() {
	const context = moonCanvas.getContext('2d');
	//clear canvas
	context.clearRect(0, 0, starCanvas.width, starCanvas.height)

	//TODO: actual calculation
	let orbitCenterX = 250;
	let orbitCenterY = 250;
	let moonRadius = 100;

	let gradient = generateMoonGradient(context, moonRadius);

	//first draw moon
	context.save();
		context.translate(orbitCenterX + moonRadius, orbitCenterY + moonRadius)
		context.beginPath();
		context.fillStyle = gradient;
		context.arc(0, 0, moonRadius, 0, Math.PI*2, true);
		context.closePath();
		context.translate( moonRadius * 0.35, -moonRadius * 1.1);
		context.fill();
	context.restore();
};

function generateMoonGradient(context, moonRadius) {
	let gradient = context.createRadialGradient(0, 0, 0,
												0, 0, moonRadius * 3);
	gradient.addColorStop(0, '#FF9D5C');
	gradient.addColorStop(0.2, '#FFC68C');
	gradient.addColorStop(0.4, '#FF8B6F');
	gradient.addColorStop(0.6, '#FFCC99');
	gradient.addColorStop(0.78, '#FFA375');

	return gradient;
}

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
};

/*
function initSpace() {
	initSVGs();
	initOrbit();
}

function initMoon(scene) {
	//TODO: figure out how to preserve aspect ratio when scaling with snap
	var cX = 0;
	var cY = 0;
	var cRadius = 180;

	var moon = scene.circle('50%', '50%', '20%');
	moon.attr({'fill': 'r(0.75,-0.25,2.5)-#FF9D5C-#FFCC99:20-#FF8B6F:35-#FFCC99:42-#FFA375:53'});
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

	let setActiveSection = (elements, activeIndex, newIndex) => {
		elements[activeIndex].className = elements[activeIndex].className.replace(/\s?active/, '')
		elements[newIndex].className += ' active'
	}

	setActiveSection(cvSections, activeCVSection, index);
	setActiveSection(copySections, activeCVSection, index);

	activeCVSection = index;
};

function isMobile() {
	var mobileRegex = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/;
	return mobileRegex.test(window.navigator.userAgent);
}