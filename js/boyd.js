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
		DEFAULT_HEADING_CHANGE = 2;


	if (args.dataPrint) {
		this.dataPrint = args.dataPrint;
	}

	this.size = args.size || DEFAULT_SIZE;
	this.color = args.color || DEFAULT_COLOR;
	var speed = args.speed || DEFAULT_SPEED;
	var heading = args.heading || DEFAULT_HEADING; //degrees

	this.velocity = (new THREE.Vector3(Math.cos(heading * Math.PI / 180), Math.sin(heading * Math.PI / 180), 0)).multiplyScalar(speed);

	this.influenceRange = args.influenceRange || DEFAULT_INFLUENCE_RANGE;
	this.acceleration = args.acceleration || DEFAULT_ACCELERATION;
	this.headingChange = args.headingChange || DEFAULT_HEADING_CHANGE;

	this.velocityOffset = new THREE.Vector3(0,0,0);
	this.friendlyVelocity = new THREE.Vector3(0,0,0);
	this.personalSpaceIntruderPosition = new THREE.Vector3(0,0,0);
	this.numNeighborsThisFrame = 0;
	this.numPersonalSpaceIntruders = 0;
	this.targetVelocity = 100;

	this.type = args.type || this.PREY;

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

	this.drawInfluenceRange = false;
	this.drawAvoidRangeSimilar = false;
	this.drawAvoidRangeDifferent = false;
	this.drawVelocityVector = false;

	if (args.drawInfluenceRange) {
		var influenceRangeRingGeometry = new THREE.RingGeometry(this.influenceRange, this.influenceRange + 1, 32);
		var influenceRangeRingMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide});
		this.influenceRangeRingMesh = new THREE.Mesh(influenceRangeRingGeometry, influenceRangeRingMaterial);

		this._mesh.add(this.influenceRangeRingMesh);
		this.drawInfluenceRange = true;
	}
	if (args.drawAvoidRangeSimilar) {

		var avoidRangeSimilarRingGeometry = new THREE.RingGeometry(this.avoidRangeSimilar, this.avoidRangeSimilar + 1, 32);
		var avoidRangeSimilarRingMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide});
		this.avoidRangeSimilarRingMesh = new THREE.Mesh(avoidRangeSimilarRingGeometry, avoidRangeSimilarRingMaterial);

		this.mesh.add(this.avoidRangeSimilarRingMesh);
		this.drawAvoidRangeSimilar = true;
	}
	if (args.drawAvoidRangeDifferent) {
	  
	  	var avoidRangeDifferentRingGeometry = new THREE.RingGeometry(this.avoidRangeDifferent, this.avoidRangeDifferent + 1, 32);
		var avoidRangeDifferentRingMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
		this.avoidRangeDifferentRingMesh = new THREE.Mesh(avoidRangeDifferentRingGeometry, avoidRangeDifferentRingMaterial);

		this._mesh.add(this.avoidRangeDifferentRingMesh);
		this.drawAvoidRangeDifferent = true;
	}
	if (args.drawVelocityVector) {

		var vectorLineGeometry = new THREE.Geometry();
		vectorLineGeometry.dynamic = true;
		var vectorLineMaterial = new THREE.LineBasicMaterial({color: 0xFF0000});
		this.vectorLine = new THREE.Line(vectorLineGeometry, vectorLineMaterial);

		this._mesh.add(this.vectorLine);
		this.drawVelocityVector = true;
	}

}


Boyd.prototype = {
	get velocity () {
		return this._velocity;
	},
	set velocity (v) {
		this._velocity = v;
	},
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
		return  this.headingRad * 180 / Math.PI;
	},
	get headingRad () {
		return Math.atan2(this.velocity.y, this.velocity.x);
	},
	get speed () {
		return this._velocity.length();
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
		return this._type === this.PREY;
	},
	get isPredator () {
		return this._type === this.PREDATOR;
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
		return this._headingChange;
	}

};

Boyd.normalize = function (value) {
	if (value === 0) return 0;
	return value / Math.abs(value);
};

Boyd.prototype.PREY = 'PREY';

Boyd.prototype.PREDATOR = 'PREDATOR';

Boyd.prototype.addFriendlyVelocity = function (velocity) {
	this.friendlyVelocity.add(velocity);
	this.numNeighborsThisFrame++;
};

Boyd.prototype.addPersonalSpaceIntruder = function (position) {
	this.personalSpaceIntruderPosition.add(position);
	this.numPersonalSpaceIntruders++;
};

Boyd.prototype.update = function (delta) {
	var currentVelocity = this.velocity.clone();

	if (this.numPersonalSpaceIntruders !== 0) {

		var averagePersonalSpaceIntruderPosition = this.personalSpaceIntruderPosition.multiplyScalar(1.0 / this.numPersonalSpaceIntruders);

		var positionDiff = this.mesh.position.clone().sub(averagePersonalSpaceIntruderPosition);

		this.velocity.add(positionDiff.normalize().multiplyScalar(this.headingChange));


	} else if (this.numNeighborsThisFrame !== 0) {

		var averageFriendlyVelocity = this.friendlyVelocity.multiplyScalar(1.0 / this.numNeighborsThisFrame);

		// var velocityDiff = averageFriendlyVelocity.sub(currentVelocity);
		
		// this.velocity.add(velocityDiff.normalize().multiplyScalar(this.headingChange));

		var crossZComponent = (new THREE.Vector3()).crossVectors(currentVelocity.clone().normalize(), averageFriendlyVelocity.clone().normalize()).z;

		var rotationAxis = new THREE.Vector3(0, 0, 1);
		var rotationRadians = 90 * Math.PI / 180;

		if (crossZComponent < 0) {
			//turn right
			this.velocity.add(currentVelocity.clone().applyAxisAngle(new THREE.Vector3(0, 0, -1), rotationRadians).normalize().multiplyScalar(this.headingChange));
		} else if (crossZComponent > 0) {
			//turn left
			this.velocity.add(currentVelocity.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), rotationRadians).normalize().multiplyScalar(this.headingChange));
		} else {
			//we are either going the correct direction, or the opposite direction
			//still need to figure this out
		}

	}

	//the below scale values are slightly different so that (hopefully) an infinite
	//oscillation doesn't occur around the targetVelocity.

	if (this.velocity.lengthSq() < this.targetVelocity * this.targetVelocity) {
		this.velocity.multiplyScalar(1.001);
	} else if (this.velocity.lengthSq() > this.targetVelocity * this.targetVelocity) {
		this.velocity.multiplyScalar(0.999);
	}

  	if (this.drawVelocityVector) {
		this.vectorLine.geometry.vertices = [new THREE.Vector3(), new THREE.Vector3(1, 0, 0).multiplyScalar(this.speed)];
		this.vectorLine.geometry.verticesNeedUpdate = true;
  	}

	this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));
	this.mesh.rotation.z = Math.atan2(this.velocity.y, this.velocity.x);

	this.friendlyVelocity = new THREE.Vector3(0,0,0);
	this.personalSpaceIntruderPosition = new THREE.Vector3(0,0,0);
	this.numNeighborsThisFrame = 0;
	this.numPersonalSpaceIntruders = 0;
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