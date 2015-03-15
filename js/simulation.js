/*global _, jQuery, THREE, Stats, console, window, document, Boyd */

var APP  = APP || {};

APP.simulation = (function simulation(util) {
    "use strict";

	var state = {
		boyds: []
	};

	function init (config, scene) {
		for (var i = 0; i < 400; ++i) {

			//new THREE.Color(Math.random(), Math.random(), Math.random()),
			var boyd = new Boyd({
				size: 25,
				speed: 200 * Math.random(),
				neighborRange: 150 * Math.random(),
				tooCloseRange: 25,
				heading: -180 * Math.random(),
				color: new THREE.Color(0x00ff00),
				velocity: new THREE.Vector2(1, 0)
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


		var acceleration = 7;
		var headingChange = 6;

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
				count: 0
			};
			for (var j = 0; j < boydsLen; j++) {
				var otherBoyd = state.boyds[j];
				if (otherBoyd !== boyd) {
					var distSq = boyd.distSq(otherBoyd);
					if (distSq < boyd.neighborRangeSq) {
						neighborTotals.count++;
						neighborTotals.speed += otherBoyd.speed;// / distSq;
						neighborTotals.heading += otherBoyd.heading;// / distSq;

						if (distSq < boyd.tooCloseRangeSq) {
							var vec = boyd.distVector(otherBoyd);
							var dir = vec.normalize();
							var mag = boyd.tooCloseRange - vec.length();

							boyd.addVelocityOffset(dir.multiplyScalar(mag));
							//boyd.addVelocityOffset(boyd.distVector(otherBoyd));
						}
					}
				}
			}

			if (neighborTotals.count > 0) {
				boyd.speed += (neighborTotals.speed / neighborTotals.count > boyd.speed ? acceleration : -acceleration);
				boyd.heading += (neighborTotals.heading / neighborTotals.count > boyd.heading ? headingChange : -headingChange);
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
