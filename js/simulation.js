/*global _, jQuery, THREE, Stats, console, window, document, Boyd */

var APP  = APP || {};

APP.simulation = (function simulation(util) {
    "use strict";

	var state = {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		boyds: []
	};

	function init (config, scene) {
		
		console.log(config);
		
		state.top = config.simulationHeight / 2;
		state.bottom = -config.simulationHeight / 2;
		state.right = config.simulationWidth / 2;
		state.left = -config.simulationWidth / 2;
		
		var boyd,
			rand,
			avoidRangeSimilarVariance = 30,
			minAvoidRangeSimilar = 20,
			influenceRangeVariance = 50,
			minInfluenceRange = 50,
			flockHeadingChangeVariance = 0,
			minFlockHeadingChange = 3,
			personalSpaceHeadingChangeVariance = 0,
			minPersonalSpaceHeadingChange = 4;

		for (var i = 0; i < config.preyCount; ++i) {

			//new THREE.Color(Math.random(), Math.random(), Math.random()),

			rand =  Math.random();
			boyd = new Boyd({
				size: 25,
				speed: 200 * rand + 50,
				targetSpeed: 200,
				acceleration: 2,
				influenceRange: influenceRangeVariance * rand + minInfluenceRange,
				avoidRangeSimilar: avoidRangeSimilarVariance * rand + minAvoidRangeSimilar,
				avoidRangeDifferent: 200,
				heading: 360 * Math.random(),
				color: new THREE.Color(0x00ff00),
				type: "PREY",
				flockHeadingChange: flockHeadingChangeVariance * rand + minFlockHeadingChange,
				personalSpaceHeadingChange: personalSpaceHeadingChangeVariance * rand + minPersonalSpaceHeadingChange,
				drawInfluenceRange: false,
				drawAvoidRangeSimilar: false,
				drawVelocityVector: false
			});

			scene.add(boyd.mesh);

			//randomize first position
			boyd.mesh.translateX(Math.random() * config.simulationWidth - state.right);
			boyd.mesh.translateY(Math.random() * config.simulationHeight - state.top);


			state.boyds.push(boyd);
		}

		for (var j = 0; j < config.predatorCount; ++j) {

			//new THREE.Color(Math.random(), Math.random(), Math.random()),
			boyd = new Boyd({
				size: 35,
				speed: 200 * Math.random(),
				influenceRange: 600,
				avoidRangeSimilar: 25,
				avoidRangeDifferent: 0,
				heading: -180 * Math.random(),
				color: new THREE.Color(0xff0000),
				velocity: new THREE.Vector2(1, 0),
				type: "PREDATOR",
				acceleration: 15,
				headingChange: 3
			});

			scene.add(boyd.mesh);

			//randomize first position
			boyd.mesh.translateX(Math.random() * 1000 - 500);
			boyd.mesh.translateY(Math.random() * 1000 - 500);


			state.boyds.push(boyd);
		}

		/*
			Test cases below for trying specific behavior.
		*/

		// boyd = new Boyd({
		// 	size: 25,
		// 	speed: 400,
		// 	heading: 0, //degrees
		// 	influenceRange: 300,
		// 	avoidRangeSimilar: 30,
		// 	avoidRangeDifferent: 200,
		// 	color: new THREE.Color(0x00ff00),
		// 	velocity: new THREE.Vector2(1, 0),
		// 	type: "PREY",
		// 	acceleration: 7,
		// 	headingChange: 5,
		// 	drawInfluenceRange: true,
		// 	drawAvoidRangeSimilar: true,
		// 	drawVelocityVector: true
		// });
		// scene.add(boyd.mesh);
		// boyd.mesh.translateX(-200);
		// boyd.mesh.translateY(0);
		// state.boyds.push(boyd);

		// boyd = new Boyd({
		// 	size: 25,
		// 	speed: 400,
		// 	heading: 180, //degrees
		// 	influenceRange: 300,
		// 	avoidRangeSimilar: 30,
		// 	avoidRangeDifferent: 200,
		// 	color: new THREE.Color(0x00ff00),
		// 	velocity: new THREE.Vector2(1, 0),
		// 	type: "PREY",
		// 	acceleration: 7,
		// 	headingChange: 5,
		// 	drawInfluenceRange: true,
		// 	drawAvoidRangeSimilar: true,
		// 	drawVelocityVector: true
		// });
		// scene.add(boyd.mesh);
		// boyd.mesh.translateX(200);
		// boyd.mesh.translateY(100);
		// state.boyds.push(boyd);

		// boyd = new Boyd({
		// 	size: 25,
		// 	speed: 400,
		// 	heading: 180, //degrees
		// 	influenceRange: 300,
		// 	avoidRangeSimilar: 30,
		// 	avoidRangeDifferent: 200,
		// 	color: new THREE.Color(0x00ff00),
		// 	velocity: new THREE.Vector2(1, 0),
		// 	type: "PREY",
		// 	acceleration: 7,
		// 	headingChange: 5,
		// 	drawInfluenceRange: true,
		// 	drawAvoidRangeSimilar: true,
		// 	drawVelocityVector: true,
		// 	dataPrint: function (theboyd) {

		// 		// debugger;
		// 		console.log('myVelocity: ', theboyd.velocity);
		// 		console.log('friendlyVe: ', theboyd.friendlyVelocity);
		// 		console.log('^len: ', theboyd.friendlyVelocity.length());

		// 	}
		// });
		// scene.add(boyd.mesh);
		// boyd.mesh.translateX(200);
		// boyd.mesh.translateY(-100);
		// state.boyds.push(boyd);

		
	}

	function update (delta) {

		delta /= 1000;

		var i = 0,
			boyd,
			otherBoyd,
			boydsLen = state.boyds.length;

		for (i = 0; i < boydsLen; i++) {
			boyd = state.boyds[i];

			for (var j = 0; j < boydsLen; j++) {
				otherBoyd = state.boyds[j];

				if (otherBoyd !== boyd) {

					var distSq = boyd.distSq(otherBoyd);

                  	if (boyd.type === boyd.PREY && otherBoyd.type === boyd.PREY) {

                  		if (distSq < boyd.avoidRangeSimilarSq) {
							boyd.addPersonalSpaceIntruder(otherBoyd.position);
                  		}
						if (distSq < boyd.influenceRangeSq) {
							boyd.addFriendlyVelocity(otherBoyd.velocity);
                  		}
                  		
                  	}
				}
			}
		}

		for (i = 0; i < boydsLen; i++) {
			boyd = state.boyds[i];

			boyd.update(delta);

			//wrap around
			if (boyd.position.x >= state.right) {
				boyd.position.x = state.left;
			} else if (boyd.position.x < state.left) {
				boyd.position.x = state.right;
			}

			if (boyd.position.y >= state.top) {
				boyd.position.y = state.bottom;
			} else if (boyd.position.y < state.bottom) {
				boyd.position.y = state.top;
			}
		}
	}


    return {
	    init: init,
		update: update
    };

}(APP.util));
