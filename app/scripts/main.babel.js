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
const parallaxMultiplier = 0.5;
let starNum = 1000;
let starLocations = [];
let ticking = false;

const interests = [
	'images/japan.png',
	'images/js.png',
	'images/origami.png',
	'images/ruby.png',
	'images/steam.png',
	'images/coffee.png',
	'images/stormtrooper.png',
	'images/android.png'
];
//will be used to store the above images once loaded
const interestImages = [];
const interestSteps = 2 * Math.PI / interests.length;

function init() {
	initStarCanvas();
	initMoonCanvas();
};

function initStarCanvas() {
	starCanvas = document.getElementById('star-canvas');
	starCanvas.width = document.body.clientWidth;
	starCanvas.height = document.body.clientHeight + 60; //extra 60 avoids URL bar issues on mobile

	//aim for 8 stars per 10000px² (i.e. 100x100 square)
	starNum = Math.ceil((starCanvas.width * starCanvas.height) / 1250);

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

	let parallaxAmount = 0;
	const parallaxThreshold = 75;
	const parallaxLayers = Math.ceil(starLocations.length / parallaxThreshold);
	const parallaxStep = -parallaxMultiplier * scrollY;

	let starRadiusModifier = 1;
	const starMinRadiusModifier = 0.4;
	const starStep = (starRadiusModifier - starMinRadiusModifier) / parallaxLayers;

	starLocations.forEach( (star, index) => {
		//start a new parallax layer every so often
		if(index % parallaxThreshold == 0) {
			parallaxAmount += parallaxStep;
			starRadiusModifier -= starStep;
			context.translate(0, parallaxStep);
		}

		//reuse elements that go above top of screen
		var yPos = star.y;
		while (yPos < -parallaxAmount) {
			yPos += starCanvas.height;
		}

		let starRadiusScale = star.scale * starRadiusModifier;

		context.beginPath();
		context.arc(star.x, yPos,
					minStarRadius * starRadiusScale,
					0, 2 * Math.PI,
					true
					);
		//scale gradient to match star size
		context.save();
		context.scale(starRadiusScale, starRadiusScale);
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

	let imagePromises = [];

	interests.forEach((interest, index) => {
		let img = new Image();
		interestImages.push(img);
		let imagePromise = new Promise((resolve, reject) => {
			img.addEventListener('load', () => {
				resolve();
			});
			img.src = interest;
		});
		imagePromises.push(imagePromise);
	});

	Promise.all(imagePromises).then(drawMoon)
};

var offset = 0;

function drawMoon() {
	const context = moonCanvas.getContext('2d');
	//clear canvas
	context.clearRect(0, 0, moonCanvas.width, moonCanvas.height)

	//TODO: actual calculation
	let orbitCenterX = 250;
	let orbitCenterY = 250;
	let moonRadius = 100;

	let orbitXRadius = 2 * moonRadius;
	let orbitYRadius = 0.5 * moonRadius;
	let orbitYOffset = -0.1 * moonRadius;

	let gradient = generateMoonGradient(context, moonRadius);

	//first draw moon
	context.save();
		context.translate(orbitCenterX, orbitCenterY)
		context.beginPath();
		context.fillStyle = gradient;
		context.arc(0, 0, moonRadius, 0, Math.PI*2, true);
		context.closePath();
		context.translate( moonRadius * 0.35, -moonRadius * 1.1);
		context.fill();
	context.restore();

	//now draw interest icons - capped at 100px
	const iconSize = Math.min(moonRadius * 0.7, 100);

	context.save();
	context.translate(orbitCenterX, orbitCenterY + orbitYOffset)
	context.rotate(20 * Math.PI / 180)

	interestImages.forEach((img, index) => {
		let x = orbitXRadius * Math.cos(interestSteps * index + orbitOffset);
		let y = orbitYRadius * Math.sin(interestSteps * index + orbitOffset);
		let aspectRatio = img.naturalWidth / img.naturalHeight;

		context.save();
		context.globalCompositeOperation = (y < 0) ? 'destination-over' : 'source-over';
		context.translate(x, y);
		context.rotate(-10 * Math.PI / 180);

		context.drawImage(img, - (iconSize / 2), - (iconSize / 2), iconSize, iconSize / aspectRatio)
		context.restore();
	});

	context.restore();

	orbitOffset = (orbitOffset + orbitIncrement) % orbitMax;
	window.requestAnimationFrame(drawMoon);
};

function generateMoonGradient(context, moonRadius) {
	let gradient = context.createRadialGradient(0, 0, 0,
												0, 0, moonRadius * 3);
	gradient.addColorStop(0, '#FF9D5C');
	gradient.addColorStop(0.2, '#FFC68C');
	gradient.addColorStop(0.42, '#FF8B6F');
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
