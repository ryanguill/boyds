/*global THREE */
"use strict";

function Boyd (args) {
	args = args || {};

	var DEFAULT_SIZE = 1,
		DEFAULT_COLOR = new THREE.Color(1, 0, 0);

	this.size = args.size || DEFAULT_SIZE;
	this.color = args.color || DEFAULT_COLOR;
	this.position = args.position || new THREE.Vector3();
	this.velocity = args.velocity || new THREE.Vector3();

	var boydShape = new THREE.Shape();
	
	boydShape.moveTo(           0,  this.size/2);
	boydShape.lineTo(-this.size/2, -this.size/2);
	boydShape.lineTo(           0, -this.size/4);
	boydShape.lineTo( this.size/2, -this.size/2);
	boydShape.lineTo(           0,  this.size/2);

	var geometry = new THREE.ShapeGeometry(boydShape);
	var material = new THREE.MeshBasicMaterial({ color: this.color.getHex() });
	this.mesh = new THREE.Mesh(geometry, material);
}

Boyd.prototype.getMesh = function getMesh() {
	return this.mesh;
};
