// based on John's code from Three.js demo 1

DataControls = function(camera, el) {
	
	this.el = el;
	this.camera = camera;
	this.enabled = false;

	var scope = this;

	var mstart = new THREE.Vector3();
	var mend = new THREE.Vector3();
	var mdelta = new THREE.Vector3();

	var plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);

	var raycaster = new THREE.Raycaster();

	this.el.addEventListener('mousedown', onMouseDown, false);

	function onMouseDown(event) {
		if (!scope.enabled) { return; }

		mstart.copy(castPoint(event));

		document.addEventListener('mousemove', onMouseMove, false);
		document.addEventListener('mouseup', onMouseUp, false);
	}

	function onMouseMove(event) {
		if (!scope.enabled) { return; }

		mend.copy(castPoint(event));
		mdelta.subVectors(mend, mstart);

		pan(mdelta.x, mdelta.z);

		mstart.copy(mend);
	}

	function onMouseUp(event) {
		if (!scope.enabled) { return; }

		document.removeEventListener('mousemove', onMouseMove, false);
		document.removeEventListener('mouseup', onMouseUp, false);
	}

	function castPoint(event) {

		var coord = {
			x: (event.clientX / el.width)  * 2 - 1,
			y: - (event.clientY / el.height) * 2 + 1
			};
		raycaster.setFromCamera(coord, scope.camera);

		return raycaster.ray.intersectPlane(plane);

	}

	function pan(x, z) {
		var vr = viewRange;
		var mzdiff = -x * (vr.mzrange / gridrange);
		var rtdiff = -z * (vr.rtrange / gridrange);
		panGraph(mzdiff, rtdiff);
	}
}
