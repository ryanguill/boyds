/*global _, jQuery, THREE, Stats, console, window, document, Boyd */

var APP  = APP || {};

APP.simulation = (function simulation() {
    "use strict";

	function update (delta, boyds, top, right, bottom, left) {

		delta /= 1000;

		var totals = {
			speed: 0,
			heading: 0
		},
		avg = {
			speed: 0,
			heading: 0
		},
		i = 0,
		boyd,
		boydsLen = boyds.length;


		var speedChange = 0.5;
		var headingChange = 2;

		for (i = 0; i < boydsLen; i++) {
			boyd = boyds[i];
			totals.speed += boyd.speed;
			totals.heading += boyd.heading;
		}

		avg.speed = totals.speed / boydsLen;
		avg.heading = totals.heading / boydsLen;

		for (i = 0; i < boydsLen; i++) {
			boyd = boyds[i];

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
				var otherBoyd = boyds[j];
				if (otherBoyd !== boyd) {
					var distSq = boyd.distSq(otherBoyd);
					if (distSq < boyd.neighborRangeSq) {
						neighborTotals.count++;
						neighborTotals.speed += otherBoyd.speed;// / distSq;
						neighborTotals.heading += otherBoyd.heading;// / distSq;
/*
						if (distSq < boyd.tooCloseRangeSq) {

						}*/
					}
				}
			}

			if (neighborTotals.count > 0) {
				boyd.speed += (neighborTotals.speed / neighborTotals.count > boyd.speed ? speedChange : -speedChange);
				boyd.heading += (neighborTotals.heading / neighborTotals.count > boyd.heading ? headingChange : -headingChange);
			}

			//boyd.speed += (avg.speed > boyd.speed ? speedChange : -speedChange);
			//boyd.heading += (avg.heading > boyd.heading ? headingChange : -headingChange);

			//var didFlip = boyd.didFlip;

			boyd.update(delta);
			


			//wrap around
			/*if (Math.abs(boyd.mesh.position.x) > Math.abs(width)) {
				boyd.mesh.position.x = -1 * _.min(boyd.mesh.position.x, width);
			}
			if (Math.abs(boyd.mesh.position.y) > Math.abs(height)) {
				boyd.mesh.position.y *= -1;
			}*/

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


		return boyds;
	}

	function plusOrMinus () {
		return Math.random() <= 0.4 ? 1 : -1;
	}

	function trend (volatility, value) {
		var rnd = Math.random(); // generate number, 0 <= x < 1.0
		var change_percent = 2 * volatility * rnd;
		if (change_percent > volatility)
		    change_percent -= (2 * volatility);
		var change_amount = value * change_percent;
		return value + change_amount;
	}

    return {
		update: update
    };

}());
