/*global _, jQuery, THREE, Stats, console, window, document, Boyd */

var APP = APP || {};

APP.main = (function main(THREE, Stats, $, simulation, config, util){
	"use strict";

	var stats,
		showStats = true,
		scene,
		camera,
		renderer;

	var mouseDown,
		lastMousePos = { x: 0, y: 0 },
		currentMousePos = { x: 0, y: 0 },
		keyDown = [];

	var NEAR = 0.1,
		FAR = 100,
		WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight,
		CAMERA_Z = 1,
		ZOOM_DELTA = 0.02,
		CURRENT_ZOOM = 2.5,
		MIN_ZOOM = 0.1,
		MAX_ZOOM = 3;

	// var squareMesh;

	var now,
		lastFrameTime,
		timeDelta;

	var info = {

	};

	function init() {

		scene = new THREE.Scene();

		renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		renderer.setSize(WIDTH, HEIGHT);
		renderer.setClearColor(0x000000, 1);

		document.body.appendChild(renderer.domElement);

		if (showStats) {
			stats = new Stats();
			stats.domElement.style.position = "absolute";
			stats.domElement.style.left = "0px";
			stats.domElement.style.top = "0px";
			document.body.appendChild(stats.domElement);
		}

		initControls();
		initSimulation();
		run();
	}

	function initControls() {
		$(window).on("resize", function () {
			updateWindowSize();
		});
		$(window).on("mousedown", function(event) {
			currentMousePos = {x: event.clientX, y: event.clientY};
			lastMousePos = currentMousePos;
			mouseDown = true;
		});
		$(window).on("mouseup mouseleave mouseenter", function() {
			mouseDown = false;
		});
		$(window).on("mousemove", function (event) {
			if (mouseDown) {
				currentMousePos = {x: event.clientX, y: event.clientY};
			}
		});
		$(window).on("mousewheel", function (event) {
			event = event.originalEvent;

			if (event.wheelDeltaY > 0) {
				zoom(ZOOM_DELTA);
			} else if (event.wheelDeltaY < 0) {
				zoom(-ZOOM_DELTA);
			}
			
		});

		$(window).on("keydown", function (event) {
			keyDown[event.keyCode] = true;
		});

		$(window).on("keyup", function (event) {
			keyDown[event.keyCode] = false;
		});

		$(window).on("contextmenu", function() {
			return false;
		});
	}

	function initSimulation() {
		config = config || {};

		camera = createCamera();
		scene.add(camera);

		//background
		//var mesh = createSquareMesh(1000, 1000);
		//scene.add(mesh);

		info = simulation.init(config, scene);

		lastFrameTime = Date.now();
	}

	function run() {

		now = Date.now();
		timeDelta = (now - lastFrameTime);
		lastFrameTime = now;

		update(timeDelta);
		render();

		if (showStats) {
			stats.update();
		}

		window.requestAnimationFrame(run);
	}

	function update(delta) {

		// squareMesh.rotation.z += delta * 0.001;
		simulation.update(delta, scene);

		//console.log(boyd.mesh);

		updateCameraPosition(delta);
	}

	function render() {
		renderer.render(scene, camera);
	}

	function updateCameraPosition(timeDelta) {

		var motionFactor = 0.08 * timeDelta;

		var motion = new THREE.Vector3();

		if (keyDown["W".charCodeAt(0)]) {
			motion.y += motionFactor;
		}
		if (keyDown["S".charCodeAt(0)]) {
			motion.y -= motionFactor;
		}
		if (keyDown["A".charCodeAt(0)]) {
			motion.x -= motionFactor;
		}
		if (keyDown["D".charCodeAt(0)]) {
			motion.x += motionFactor;
		}

		camera.position.add(motion);

	}

	function updateWindowSize() {

		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;

		camera.left = -WIDTH / 2;
		camera.right = WIDTH / 2;
		camera.top = HEIGHT / 2;
		camera.bottom = -HEIGHT / 2;
		camera.updateProjectionMatrix();
		
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function zoom(amt) {

		var newZoom = CURRENT_ZOOM - amt;

		if (newZoom < MIN_ZOOM) {
			newZoom = MIN_ZOOM;
		} else if (newZoom > MAX_ZOOM) {
			newZoom = MAX_ZOOM;
		}

		var zoomRatio = newZoom / CURRENT_ZOOM;

		if (zoomRatio !== 1) {
			/*
				This is the equivalent of doing the following:
				
					camera.left \= CURRENT_ZOOM;
					camera.left *= newZoom;
					.
					.
					.

					CURRENT_ZOOM = newZoom;
			*/
			
			camera.left   *= (zoomRatio);
			camera.right  *= (zoomRatio);
			camera.bottom *= (zoomRatio);
			camera.top    *= (zoomRatio);

			CURRENT_ZOOM = newZoom;

			camera.updateProjectionMatrix();
		}
	}

	function createCamera() {
		var left   = (-WIDTH / 2)  * CURRENT_ZOOM;
		var right  = ( WIDTH / 2)  * CURRENT_ZOOM;
		var bottom = (-HEIGHT / 2) * CURRENT_ZOOM;
		var top    = ( HEIGHT / 2) * CURRENT_ZOOM;

		var cam = new THREE.OrthographicCamera( left, right, top, bottom, NEAR, FAR );
		cam.position.z = CAMERA_Z;

		return cam;
	}

	return {
		init: init
	};
}(THREE, Stats, jQuery, APP.simulation, APP.config, APP.util));