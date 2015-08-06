/*global THREE */
"use strict";

function Boyd (args) {
	args = args || {};

	var DEFAULT_SIZE = 25,
		DEFAULT_COLOR = new THREE.Color(1, 0, 0),
		DEFAULT_SPEED = 200,
		DEFAULT_TARGET_SPEED = 200,
		DEFAULT_HEADING = 0,
		DEFAULT_INFLUENCE_RANGE = 100,
		DEFAULT_AVOID_RANGE_SIMILAR = 25,
		DEFAULT_AVOID_RANGE_DIFFERENT = 0,
		DEFAULT_ACCELERATION = 10,
		DEFAULT_FLOCK_HEADING_CHANGE = 2,
		DEFAULT_PERSONAL_SPACE_HEADING_CHANGE = 2;


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
	this.flockHeadingChange = args.flockHeadingChange || DEFAULT_FLOCK_HEADING_CHANGE;
	this.personalSpaceHeadingChange = args.personalSpaceHeadingChange || DEFAULT_PERSONAL_SPACE_HEADING_CHANGE;

	this.velocityOffset = new THREE.Vector3(0,0,0);
	this.friendlyVelocity = new THREE.Vector3(0,0,0);
	this.personalSpaceIntruderPosition = new THREE.Vector3(0,0,0);
	this.numNeighborsThisFrame = 0;
	this.numPersonalSpaceIntruders = 0;
	this.targetSpeed = args.targetSpeed || DEFAULT_TARGET_SPEED;

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
	
	this._positiveZVector = new THREE.Vector3(0, 0, 1);
	this._leftRotationRadians = 90 * Math.PI / 180;
	
}


Boyd.prototype = {
	get velocity () {
		return this._velocity;
	},
	set velocity (v) {
		this._velocity = v;
	},
	get targetSpeed () {
		return this._targetSpeed;
	},
	set targetSpeed (s) {
		this._targetSpeed = s;
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
	set flockHeadingChange (value) {
		this._flockHeadingChange = Math.max(value, 0);
	},
	get flockHeadingChange () {
		return this._flockHeadingChange;
	},
	set personalSpaceHeadingChange (value) {
		this._personalSpaceHeadingChange = Math.max(value, 0);
	},
	get personalSpaceHeadingChange () {
		return this._personalSpaceHeadingChange;
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

Boyd.prototype.getLeftTurnUnitVector = function () {
	return this.velocity.clone().applyAxisAngle(this._positiveZVector, this._leftRotationRadians).normalize();
};

Boyd.prototype.turnLeft = function (magnitude) {
	this.velocity.add(this.getLeftTurnUnitVector().multiplyScalar(magnitude));
};

Boyd.prototype.turnRight = function (magnitude) {
	this.turnLeft(-magnitude);
};

Boyd.prototype.update = function (delta) {
	var currentVelocity = this.velocity.clone();
	var velocityDirection = currentVelocity.clone().normalize();
	var crossZComponent;
	
	var speed = this.velocity.length();
	var averageFriendlySpeed = this.friendlyVelocity.length() / this.numNeighborsThisFrame;

	if (this.numPersonalSpaceIntruders !== 0) {

		var averagePersonalSpaceIntruderPosition = this.personalSpaceIntruderPosition.multiplyScalar(1.0 / this.numPersonalSpaceIntruders);

		var targetVector = this.mesh.position.clone().sub(averagePersonalSpaceIntruderPosition);
		var targetVectorDirection = targetVector.normalize();
		
		crossZComponent = (new THREE.Vector3()).crossVectors(velocityDirection, targetVectorDirection).z;

		if (crossZComponent < 0) {
			//turn right
			this.turnRight(this.personalSpaceHeadingChange);
			//this.turnRight();
		} else if (crossZComponent > 0) {
			//turn left
			this.turnLeft(this.personalSpaceHeadingChange);
			//this.turnLeft();
		} else {
			//we are either going the correct direction, or the opposite direction
			//still need to figure this out
		}
	}
	if (this.numNeighborsThisFrame !== 0) {
		// TODO: IWB @paul @ryan - Consider the following:
		// Not sure if the above should be an 'else if' or not:
		
		// I feel like having an 'else if' is contributing to the situations where we have a boyd
		// going against the grain and won't turn around because they keep hitting
		// other boyds' personal spaces.
		
		// But on the other hand, having just another 'if' makes them clump up much quicker
		// and they seem to stay that way much longer unless we double (or similar) the turns
		// that each boyd does for personal space intruders.

		var averageFriendlyVelocity = this.friendlyVelocity.multiplyScalar(1.0 / this.numNeighborsThisFrame);
		var averageFriendlyVelocityDirection = averageFriendlyVelocity.normalize();

		crossZComponent = (new THREE.Vector3()).crossVectors(velocityDirection, averageFriendlyVelocityDirection).z;

		if (crossZComponent < 0) {
			//turn right
			this.turnRight(this.flockHeadingChange);
		} else if (crossZComponent > 0) {
			//turn left
			this.turnLeft(this.flockHeadingChange);
		} else {
			//we are either going the correct direction, or the opposite direction
			//still need to figure this out
		}
		
		if (speed < (averageFriendlySpeed + this.targetSpeed) / 2) {
			this.velocity.setLength(speed + this.acceleration + Math.random());
		} else if (speed > (averageFriendlySpeed + this.targetSpeed) / 2) {
			this.velocity.setLength(speed - this.acceleration - Math.random());
		}

	} else {
		if (speed < this.targetSpeed) {
			this.velocity.setLength(speed + this.acceleration + Math.random());
		} else if (speed > this.targetSpeed) {
			this.velocity.setLength(speed - this.acceleration - Math.random());
		}
	}

	//the below scale values are slightly different so that (hopefully) an infinite
	//oscillation doesn't occur around the targetVelocity.

	// if (this.velocity.lengthSq() < this.targetVelocity * this.targetVelocity) {
	// 	this.velocity.multiplyScalar(1.01);
	// } else if (this.velocity.lengthSq() > this.targetVelocity * this.targetVelocity) {
	// 	this.velocity.multiplyScalar(0.9);
	// }

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