
	function createSquareMesh(width, height) {
		var squareShape = new THREE.Shape();

		squareShape.moveTo(-width/2,  height/2);
		squareShape.lineTo( width/2,  height/2);
		squareShape.lineTo( width/2, -height/2);
		squareShape.lineTo(-width/2, -height/2);
		squareShape.lineTo(-width/2,  height/2);

		var squareGeom = new THREE.ShapeGeometry(squareShape);
		return new THREE.Mesh(squareGeom, new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
	}

	function createBoydMesh(size) {
		var boydShape = new THREE.Shape();

		boydShape.moveTo(      0,  size/2);
		boydShape.lineTo(-size/2, -size/2);
		boydShape.lineTo(      0, -size/4);
		boydShape.lineTo( size/2, -size/2);
		boydShape.lineTo(      0,  size/2);

		var boydGeom = new THREE.ShapeGeometry(boydShape);
		return new THREE.Mesh(boydGeom, new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
	}