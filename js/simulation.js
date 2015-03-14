/*global _, jQuery, THREE, Stats, console, window, document, Boyd */

var APP  = APP || {};

APP.simulation = (function simulation() {
    "use strict";

	function update (delta, boyds, width, height) {

		for (var i = 0; i < boyds.length; i++) {
			var boyd = boyds[i];

			//console.log("b", boyd.mesh.position);
			boyd.mesh.translateX(delta * trend(0.5, 0.1));
			boyd.mesh.translateY(delta * trend(0.5, 0.1));
			boyd.mesh.rotation.z += THREE.Math.degToRad(plusOrMinus() * 1);
			//console.log("a", boyd.mesh.position);

			//I have no idea what this does, but its cool as shit
			//boyd.mesh.translateX(delta * Math.random() * (Math.random() < 0.5 ? 0.1 : -0.1));
			//boyd.mesh.translateY(delta * Math.random() * (Math.random() < 0.5 ? 0.1 : -0.1));
			//boyd.mesh.rotateOnAxis(new THREE.Vector3(), THREE.Math.degToRad(10));
			//end cool as shit

			//boyd.mesh.translateZ(boyd.position.z);


			//wrap around
			if (Math.abs(boyd.mesh.position.x) > Math.abs(width / 2)) {
				boyd.mesh.position.x *= -1;
			}
			if (Math.abs(boyd.mesh.position.y) > Math.abs(height / 2)) {
				boyd.mesh.position.y *= -1;
			}
		}


		return boyds;
	}

	function plusOrMinus () {
		return Math.random() < 0.5 ? 1 : -1;
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
