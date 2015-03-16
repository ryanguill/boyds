/*global _, jQuery, THREE, Stats, console, window, document, Boyd */

var APP  = APP || {};

APP.simulation = (function simulation(util) {
    "use strict";

	var state = {
		boyds: []
	};

	function init (config, scene) {
		var boyd;

		for (var i = 0; i < config.preyCount; ++i) {

			//new THREE.Color(Math.random(), Math.random(), Math.random()),
			boyd = new Boyd({
				size: 25,
				speed: 200 * Math.random(),
				influenceRange: 50,//150 * Math.random(),
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

		var totals = {
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
			var neighborTotals = {
				speed: 0,
				heading: 0,
				position: new THREE.Vector3(0, 0, 0),
				count: 0,
              	avoidanceCount: 0
			};
			for (var j = 0; j < boydsLen; j++) {
				var otherBoyd = state.boyds[j];
				if (otherBoyd !== boyd) {
					var distVect = boyd.distVector(otherBoyd);//<-
					var distSq = distVect.lengthSq();
                  	var avoidanceRangeSq = boyd.type === otherBoyd.type ? boyd.avoidRangeSimilarSq : boyd.avoidRangeDifferentSq;
                  	//if (boyd.isPrey) console.log(avoidanceRangeSq);
                    //console.log(this.isPrey);
					if (distSq < avoidanceRangeSq) {
                        neighborTotals.avoidanceCount++;
                      	var gradient = (avoidanceRangeSq / distSq) * 100;
                      //console.log(gradient);
						boyd.addVelocityOffset(distVect.normalize().multiplyScalar(gradient));
					} else if (distSq < boyd.influenceRangeSq) {
						neighborTotals.count++;
						if (boyd.type === otherBoyd.type) {
							neighborTotals.speed += otherBoyd.speed;// / distSq;
							neighborTotals.heading += otherBoyd.heading;// / distSq;
							//neighborTotals.position.add(otherBoyd.position);
						} else {
							neighborTotals.speed += otherBoyd.speed;// / distSq;
							//todo: this is close, but not really right
							//neighborTotals.heading += (-90) + otherBoyd.heading;// / distSq;

						}
					}

					//console.log(boyd.type === otherBoyd.type);
				}
			}

			if (neighborTotals.avoidanceCount === 0 && neighborTotals.count > 0) {
				//console.log(boyd.acceleration);
				//boyd.speed += (neighborTotals.speed / neighborTotals.count > boyd.speed ? boyd.acceleration : -boyd.acceleration);
				//boyd.heading += (neighborTotals.heading / neighborTotals.count > boyd.heading ? boyd.headingChange : -boyd.headingChange);

					//boyd.addVelocityOffset(neighborTotals.position.multiplyScalar(1 / neighborTotals.count));

			}

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
