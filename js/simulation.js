/*global _, jQuery, THREE, Stats, console, window, document, Boyd */

var APP  = APP || {};

APP.simulation = (function simulation(util) {
    "use strict";

	var state = {
		boyds: []
	};

	function init (config, scene) {
		var boyd;

		//todo: preycount
		for (var i = 0; i < 100; ++i) {

			//new THREE.Color(Math.random(), Math.random(), Math.random()),
			boyd = new Boyd({
				size: 25,
				speed: 200 * Math.random(),
				influenceRange: 150 * Math.random(),
				avoidRangeSimilar: 25,
				avoidRangeDifferent: 200,
				heading: -180 * Math.random(),
				color: new THREE.Color(0x00ff00),
				velocity: new THREE.Vector2(1, 0),
				type: "PREY",
				acceleration: 7,
				headingChange: 5
			});

			scene.add(boyd.mesh);

			//randomize first position
			boyd.mesh.translateX(Math.random() * 1000 - 500);
			boyd.mesh.translateY(Math.random() * 1000 - 500);


			state.boyds.push(boyd);
		}
		//todo: predator count
		for (var j = 0; j < 2; ++j) {

			//new THREE.Color(Math.random(), Math.random(), Math.random()),
			boyd = new Boyd({
				size: 35,
				speed: 200 * Math.random(),
				influenceRange: 400,
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

		var totals = {
			speed: 0,
			heading: 0
		},
		avg = {
			speed: 0,
			heading: 0
		},
		info = {

		},
		i = 0,
		boyd,
		boydsLen = state.boyds.length;

		for (i = 0; i < boydsLen; i++) {
			boyd = state.boyds[i];
			totals.speed += boyd.speed;
			totals.heading += boyd.heading;
		}

		avg.speed = totals.speed / boydsLen;
		avg.heading = totals.heading / boydsLen;

		for (i = 0; i < boydsLen; i++) {
			boyd = state.boyds[i];

			//console.log("b", boyd.mesh.position);
			//boyd.mesh.translateX(delta * trend(0.5, 0.1));
			//boyd.mesh.translateY(delta * trend(0.5, 0.1));
			//boyd.mesh.rotation.z += THREE.Math.degToRad(plusOrMinus() * 1);
			//console.log("a", boyd.mesh.position);

			//boyd.speed = trend(0.01, boyd.speed);
			//boyd.heading = trend(0.01, boyd.heading);

			//find neighbors within x distance

			var neighborTotals = {
				speed: 0,
				heading: 0,
				position: new THREE.Vector3(0, 0, 0),
				count: 0
			};
			for (var j = 0; j < boydsLen; j++) {
				var otherBoyd = state.boyds[j];
				if (otherBoyd !== boyd) {
					var distVect = boyd.distVector(otherBoyd);
					var distSq = distVect.lengthSq();
					if (distSq < boyd.influenceRangeSq) {
						neighborTotals.count++;
						if (boyd.type === otherBoyd.type) {
							neighborTotals.speed += otherBoyd.speed;// / distSq;
							neighborTotals.heading += otherBoyd.heading;// / distSq;
							//neighborTotals.position.add(otherBoyd.position);
						} else {
							neighborTotals.speed += otherBoyd.speed;// / distSq;
							if (boyd.isPrey) {
								neighborTotals.heading += 180 + otherBoyd.heading;// / distSq;
							} else {
								neighborTotals.heading += otherBoyd.heading;// / distSq;
							}
						}
					}

					//console.log(boyd.type === otherBoyd.type);
					if (distSq < (boyd.type === otherBoyd.type ? boyd.avoidRangeSimilarSq : boyd.avoidRangeDifferentSq)) {
						boyd.addVelocityOffset(distVect);
					}
				}
			}

			if (neighborTotals.count > 0) {
				//console.log(boyd.acceleration);
				boyd.speed += (neighborTotals.speed / neighborTotals.count > boyd.speed ? boyd.acceleration : -boyd.acceleration);
				boyd.heading += (neighborTotals.heading / neighborTotals.count > boyd.heading ? boyd.headingChange : -boyd.headingChange);

					//boyd.addVelocityOffset(neighborTotals.position.multiplyScalar(1 / neighborTotals.count));

			}

			//boyd.speed += (avg.speed > boyd.speed ? acceleration : -acceleration);
			//boyd.heading += (avg.heading > boyd.heading ? headingChange : -headingChange);

			//var didFlip = boyd.didFlip;

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

		return info;
	}


    return {
	    init: init,
		update: update
    };

}(APP.util));
