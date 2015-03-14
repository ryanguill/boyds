/*global THREE */
"use strict";

function Boyd (args) {
	args = args || {};

	var DEFAULT_SIZE = 1,
		DEFAULT_COLOR = new THREE.Color(1, 0, 0),
		DEFAULT_SPEED = 50,
		DEFAULT_HEADING = 0,
		DEFAULT_NEIGHBOR_RANGE = 100,
		DEFAULT_TOOCLOSE_RANGE = 1;

	this.size = args.size || DEFAULT_SIZE;
	this.color = args.color || DEFAULT_COLOR;
	this.speed = args.speed || DEFAULT_SPEED;
	this.heading = args.heading || DEFAULT_HEADING; //degrees
	this.neighborRange = args.neighborRange || DEFAULT_NEIGHBOR_RANGE;
	this.tooCloseRange = args.tooCloseRange || DEFAULT_TOOCLOSE_RANGE;
	this.velocityOffset = new THREE.Vector3(0,0,0);
	this.didFlip = false;

	var boydShape = new THREE.Shape();
	
	boydShape.moveTo( this.size/2,			  0);
	boydShape.lineTo(-this.size/2,  this.size/2);
	boydShape.lineTo(-this.size/4,			  0);
	boydShape.lineTo(-this.size/2, -this.size/2);
	boydShape.lineTo( this.size/2,			  0);

	var geometry = new THREE.ShapeGeometry(boydShape);
	var material = new THREE.MeshBasicMaterial({ color: this.color.getHex() });
	this.mesh = new THREE.Mesh(geometry, material);

	var neighborRingGeometry = new THREE.RingGeometry(this.neighborRange, this.neighborRange + 1, 32);
	var neighborRingMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide});
	this.neighborRingMesh = new THREE.Mesh(neighborRingGeometry, neighborRingMaterial);

	//this.mesh.add(this.neighborRingMesh);

	var tooCloseRingGeometry = new THREE.RingGeometry(this.tooCloseRange, this.tooCloseRange + 1, 32);
	var tooCloseRingMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
	this.tooCloseRingMesh = new THREE.Mesh(tooCloseRingGeometry, tooCloseRingMaterial);

	//this.mesh.add(this.tooCloseRingMesh);
}


Boyd.prototype = {
	set size (value) {
		this._size = value;
	},
	get size () {
		return this._size;
	},
	set color (value) {
		this._color = value;
	},
	get color () {
		return this._color;
	},
	get position () {
		return this._mesh.position;
	},
	set mesh (value) {
		this._mesh = value;
	},
	get mesh () {
		return this._mesh;
	},
	set heading (value) {
		this._heading = (value < 0 ? 360 + value : value);
		this._headingRad = THREE.Math.degToRad(this._heading);
	},
	get heading () {
		return this._heading;
	},
	get headingRad () {
		return this._headingRad;
	},
	set speed (value) {

		if (Boyd.normalize(value) !== Boyd.normalize(this._speed)) {
			if (value < 0) {
				this._color = new THREE.Color(1, 0, 0);
			} else {
				this._color = new THREE.Color(0, 1, 0);
			}
			this._didFlip = true;
			if (this._mesh !== undefined) this._mesh.material = new THREE.MeshBasicMaterial({ color: this._color.getHex() });
		}
		//this._speed = value;
		this._speed = Math.max(value, 50);
	},
	get speed () {
		return this._speed;
	},
	set didFlip (value) {
		this._didFlip = value;
	},
	get didFlip () {
		return this._didFlip;
	},
	set neighborRange (value) {
		this._neighborRange = Math.max(value, this._size);
		this._neighborRangeSq = this._neighborRange * this._neighborRange;
	},
	get neighborRange () {
		return this._neighborRange;
	},
	get neighborRangeSq () {
		return this._neighborRangeSq;
	},
	set neighborRingMesh (value) {
		this._neighborRingMesh = value;
	},
	get neighborRingMesh () {
		return this._neighborRingMesh;
	},
	set tooCloseRange (value) {
		this._tooClose = Math.max(value, 1);
		this._tooCloseSq = this._tooClose * this._tooClose;
	},
	get tooCloseRange () {
		return this._tooClose;
	},
	get tooCloseRangeSq () {
		return this._tooCloseSq;
	},
	get velocity () {
		return new THREE.Vector3(Math.cos(this._headingRad) * this._speed, Math.sin(this._headingRad) * this._speed, 0);
	}

};

Boyd.normalize = function (value) {
	if (value === 0) return 0;
	return value / Math.abs(value);
};

Boyd.prototype.addVelocityOffset = function (vector) {
	this.velocityOffset.add(vector);
};

Boyd.prototype.update = function (delta) {

	this._didFlip = false;

	//sin(heading) = y / speed
	//cos(heading) = x / speed
	//have to use a vec3 because position.add is expecting a vec3

	//this.mesh.position.translateX(velocity.x * delta);
	//this.mesh.position.translateY(velocity.y * delta);
	var vel  = this.velocity.sub(this.velocityOffset);

	this._mesh.position.add(vel.multiplyScalar(delta));
	this._mesh.rotation.z = this.headingRad;

	this.velocityOffset = new THREE.Vector3(0,0,0);
};

Boyd.prototype.dist = function (otherBoyd) {
	return otherBoyd.position.clone().sub(this._mesh.position).length();
};

Boyd.prototype.distSq = function(otherBoyd) {
	return otherBoyd.position.clone().sub(this._mesh.position).lengthSq();
};

Boyd.prototype.distVector = function (otherBoyd) {
	return otherBoyd.position.clone().sub(this._mesh.position);
};