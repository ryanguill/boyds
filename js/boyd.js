/*global THREE */
"use strict";

function Boyd (args) {
	args = args || {};

	var DEFAULT_SIZE = 25,
		DEFAULT_COLOR = new THREE.Color(1, 0, 0),
		DEFAULT_SPEED = 50,
		DEFAULT_HEADING = 0,
		DEFAULT_INFLUENCE_RANGE = 100,
		DEFAULT_AVOID_RANGE_SIMILAR = 25,
		DEFAULT_AVOID_RANGE_DIFFERENT = 0,
		DEFAULT_ACCELERATION = 7,
		DEFAULT_HEADING_CHANGE = 5;


	this.size = args.size || DEFAULT_SIZE;
	this.color = args.color || DEFAULT_COLOR;
	this.speed = args.speed || DEFAULT_SPEED;
	this.heading = args.heading || DEFAULT_HEADING; //degrees
	this.influenceRange = args.influenceRange || DEFAULT_INFLUENCE_RANGE;
	this.acceleration = args.acceleration || DEFAULT_ACCELERATION;
	this.headingChange = args.headingChange || DEFAULT_HEADING_CHANGE;

	this.velocityOffset = new THREE.Vector3(0,0,0);

	this.type = args.type || "PREY";

	this.avoidRangeSimilar = args.avoidRangeSimilar || DEFAULT_AVOID_RANGE_SIMILAR;
	this.avoidRangeDifferent = args.avoidRangeDifferent || DEFAULT_AVOID_RANGE_DIFFERENT;

	var boydShape = new THREE.Shape();
	
	boydShape.moveTo( this.size/2,			  0);
	boydShape.lineTo(-this.size/2,  this.size/2);
	boydShape.lineTo(-this.size/4,			  0);
	boydShape.lineTo(-this.size/2, -this.size/2);
	boydShape.lineTo( this.size/2,			  0);

	var geometry = new THREE.ShapeGeometry(boydShape);
	var material = new THREE.MeshBasicMaterial({ color: this.color.getHex() });
	this.mesh = new THREE.Mesh(geometry, material);

	var influenceRangeRingGeometry = new THREE.RingGeometry(this.influenceRange, this.influenceRange + 1, 32);
	var influenceRangeRingMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide});
	this.influenceRangeRingMesh = new THREE.Mesh(influenceRangeRingGeometry, influenceRangeRingMaterial);

	this._mesh.add(this.influenceRangeRingMesh);

	var avoidRangeSimilarRingGeometry = new THREE.RingGeometry(this.avoidRangeSimilar, this.avoidRangeSimilar + 1, 32);
	var avoidRangeSimilarRingMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
	this.avoidRangeSimilarRingMesh = new THREE.Mesh(avoidRangeSimilarRingGeometry, avoidRangeSimilarRingMaterial);

	//this.mesh.add(this.avoidRangeSimilarRingMesh);
  
  	var avoidRangeDifferentRingGeometry = new THREE.RingGeometry(this.avoidRangeDifferent, this.avoidRangeDifferent + 1, 32);
	var avoidRangeDifferentRingMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
	this.avoidRangeDifferentRingMesh = new THREE.Mesh(avoidRangeDifferentRingGeometry, avoidRangeDifferentRingMaterial);

	this._mesh.add(this.avoidRangeDifferentRingMesh);

	//this.vectorArrow = new THREE.ArrowHelper( this.velocityOffset.clone().normalize(), new THREE.Vector3(0,0,0), this.velocityOffset.length(), 0xff0000 );
	//this._mesh.add(this.vectorArrow);

	var vectorLineGeometry = new THREE.Geometry();
	vectorLineGeometry.dynamic = true;
	var vectorLineMaterial = new THREE.LineBasicMaterial({color: 0xFF0000});
	this.vectorLine = new THREE.Line(vectorLineGeometry, vectorLineMaterial);
	this._mesh.add(this.vectorLine);

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
		this._heading = (value < 0 ? 360 + value : value) % 360;
		this._headingRad = THREE.Math.degToRad(this._heading);
	},
	get heading () {
		return this._heading;
	},
	get headingRad () {
		return this._headingRad;
	},
	set speed (value) {

		/*if (Boyd.normalize(value) !== Boyd.normalize(this._speed)) {
			if (value < 0) {
				this._color = new THREE.Color(1, 0, 0);
			} else {
				this._color = new THREE.Color(0, 1, 0);
			}

			if (this._mesh !== undefined) this._mesh.material = new THREE.MeshBasicMaterial({ color: this._color.getHex() });
		}*/
		//this._speed = value;
		this._speed = Math.min(Math.max(value, 50), 200);
	},
	get speed () {
		return this._speed;
	},
	set influenceRange (value) {
		this._influenceRange = Math.max(value, this._size);
		this._influenceRangeSq = this._influenceRange * this._influenceRange;
	},
	get influenceRange () {
		return this._influenceRange;
	},
	get influenceRangeSq () {
		return this._influenceRangeSq;
	},
	set influenceRangeRingMesh (value) {
		this._influenceRangeRingMesh = value;
	},
	get influenceRangeRingMesh () {
		return this._influenceRangeRingMesh;
	},
	set avoidRangeSimilar (value) {
		this._avoidRangeSimilar = Math.max(value, 1);
		this._avoidRangeSimilarSq = this._avoidRangeSimilar * this._avoidRangeSimilar;
	},
	get avoidRangeSimilar () {
		return this._avoidRangeSimilar;
	},
	get avoidRangeSimilarSq () {
		return this._avoidRangeSimilarSq;
	},
	set avoidRangeDifferent (value) {
		this._avoidRangeDifferent = Math.max(value, 1);
		this._avoidRangeDifferentSq = this._avoidRangeDifferent * this._avoidRangeDifferent;
	},
	get avoidRangeDifferent () {
		return this._avoidRangeDifferent;
	},
	get avoidRangeDifferentSq () {
		return this._avoidRangeDifferentSq;
	},
	set type (value) {
		this._type = value;
	},
	get type () {
		return this._type;
	},
	get isPrey () {
		return this._type === "PREY";
	},
	get isPredator () {
		return this._type === "PREDATOR";
	},
	set acceleration (value) {
		this._acceleration = Math.max(value, 0);
	},
	get acceleration () {
		//todo: could make this a random number between 1 and the max...
		return this._acceleration;
	},
	set headingChange (value) {
		this._headingChange = Math.max(value, 0);
	},
	get headingChange () {
		//todo: could make this a random number between 1 and the max...
		return this._headingChange;
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
	var vel  = this.velocity.sub(this.velocityOffset);

   	var headingTarget = THREE.Math.radToDeg(Math.atan2(vel.y, vel.x));
  	var headingDiff = headingTarget - this.heading;
  	var avoidanceHeading = Boyd.normalize(headingDiff) * this.headingChange;
  	if (this.isPredator) {
    	avoidanceHeading *= -1;
  	}
  
  	this.heading += avoidanceHeading;

	this.vectorLine.geometry.vertices = [new THREE.Vector3(), new THREE.Vector3(1, 0, 0).multiplyScalar(this.speed)];
	this.vectorLine.geometry.verticesNeedUpdate = true;

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
	//+/- current position with width and height
	//think about rollover

	return otherBoyd.position.clone().sub(this._mesh.position);
};