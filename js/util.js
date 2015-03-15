/*global _, jQuery, THREE, console, window, document, Boyd */

var APP  = APP || {};

APP.util = (function util(THREE) {
    "use strict";

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

	function createSquareMesh(width, height) {
		var squareShape = new THREE.Shape();

		squareShape.moveTo(-width/2,  height/2);
		squareShape.lineTo( width/2,  height/2);
		squareShape.lineTo( width/2, -height/2);
		squareShape.lineTo(-width/2, -height/2);
		squareShape.lineTo(-width/2,  height/2);

		var squareGeom = new THREE.ShapeGeometry(squareShape);
		return new THREE.Mesh(squareGeom, new THREE.MeshBasicMaterial({ color: 0x000000 }));
	}

	function normalize (value) {
		if (value === 0) return 0;
		return value / Math.abs(value);
	}

    return {
		plusOrMinus: plusOrMinus,
	    trend: trend,
	    createSquareMesh: createSquareMesh,
	    normalize: normalize
    };

}(THREE));
