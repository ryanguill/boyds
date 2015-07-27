/*global _, jQuery, THREE, Stats, console, window, document, Boyd */

var APP  = APP || {};

APP.simulation = (function simulation(util) {
    "use strict";

	var state = {
		boyds: []
	};

	function init (config, scene) {
		var boyd;

		var rand;
		for (var i = 0; i < config.preyCount; ++i) {

			//new THREE.Color(Math.random(), Math.random(), Math.random()),

			rand = Math.random();
			boyd = new Boyd({
				size: 25,
				speed: 200 * rand,
				influenceRange: 150 * rand,//150 * Math.random(),
				avoidRangeSimilar: 30 * rand + 10,
				avoidRangeDifferent: 200,
				heading: 360 * rand,
				color: new THREE.Color(0x00ff00),
				velocity: new THREE.Vector2(1, 0),
				type: "PREY",
				acceleration: 7,
				headingChange: 5,
				drawDebugLines: false,
				drawInfluenceRange: false,
				drawAvoidRangeSimilar: false,
				drawVelocityVector: false
			});

			scene.add(boyd.mesh);

			//randomize first position
			boyd.mesh.translateX(Math.random() * 1000 - 500);
			boyd.mesh.translateY(Math.random() * 1000 - 500);


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
	}

	function update (delta, top, right, bottom, left) {

		delta /= 1000;

		var i = 0,
			boyd,
			boydsLen = state.boyds.length;

		for (i = 0; i < boydsLen; i++) {
			boyd = state.boyds[i];

			for (var j = 0; j < boydsLen; j++) {
				var otherBoyd = state.boyds[j];

				if (otherBoyd !== boyd) {

					var distVect = boyd.distVector(otherBoyd);
					var distSq = distVect.lengthSq();



                  	if (boyd.type === boyd.PREY && otherBoyd.type === boyd.PREY) {

                  		if (distSq < boyd.avoidRangeSimilarSq) {
							boyd.addPersonalSpaceIntruder(otherBoyd.position);
                  		} else if (distSq < boyd.influenceRangeSq) {
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
			if (boyd.position.x >= right) {
				boyd.position.x = left;
			} else if (boyd.position.x < left) {
				boyd.position.x = right;
			}

			if (boyd.position.y >= top) {
				boyd.position.y = bottom;
			} else if (boyd.position.y < bottom) {
				boyd.position.y = top;
			}
		}
	}


    return {
	    init: init,
		update: update
    };

}(APP.util));
