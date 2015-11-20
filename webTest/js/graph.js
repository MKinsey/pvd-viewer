var camera, graphControls, dataControls, detailControl, scene, renderer;

var gridgroup, datagroup;

// Adjusts the size of the baseline grid
var gridrange = 20;
var yrange = 10;

var pcamera, protate, pdatactl;
var ocamera, orotate, odatactl;

var gradientcache = [];

var lastData = null;
var dataRange = { mzmin: 0, mzmax: 1.0, mzrange: 1.0, rtmin: 0, rtmax: 1.0, rtrange: 1.0, intmin: 0, intmax: 1.0, intrange: 1.0 };

function init(){

	scene = new THREE.Scene();

	// size of 3d render environment
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0xC8C8C8, 1);
	renderer.setSize(600, 600);
	document.querySelector("#container").appendChild(renderer.domElement);

	// window resizing
	window.addEventListener("resize", function(e) {
		renderer.setSize(600, 600);
	});
	
	// perspective camera
	pcamera = new THREE.PerspectiveCamera( 60, 600 / 600, 1, 100 );
	pcamera.position.set(10,20,25);
	pcamera.lookAt(scene.position);

	protate = new THREE.OrbitControls( pcamera, renderer.domElement );
	protate.addEventListener( 'change', render );
	protate.center.set(gridrange/2, 0, gridrange/2); // so 0,0 isn't the center
	
	pdatactl = new DataControls(pcamera, renderer.domElement);

	camera = pcamera;
	graphControls = protate;
	dataControls = pdatactl;

	// ortho camera
	var viewSize = 25;
	var aspecRatio = 600/600;
	ocamera = new THREE.OrthographicCamera( viewSize*aspecRatio / - 2, viewSize*aspecRatio / 2, viewSize / 2, viewSize / - 2, - 100, 100 );

	orotate = new THREE.OrbitControls( ocamera, renderer.domElement );
	orotate.addEventListener( 'change', render );
	orotate.center.set(gridrange/2, 0, gridrange/2); // so 0,0 isn't the center

	odatactl = new DataControls(ocamera, renderer.domElement);
	
	orotate.enabled = false;

	// make grid, axis, labels, and datagroup
	gridgroup = new THREE.Group();
	datagroup = new THREE.Group();

	gridgroup.add(drawGrid());
	plotAxis(6);

	scene.add(gridgroup);
	scene.add(datagroup);

	updateViewRange({ mzmin: 0, mzmax: 1.0, mzrange: 1.0, rtmin: 0, rtmax: 1.0, rtrange: 1.0 }, true);

	// generate gradient cache
	var cachesize = 50;
	for (var i = 0; i < cachesize; i++) {
		var gradientcolor = getGradientColor(i, cachesize);
		var mat = new THREE.LineBasicMaterial({ color: gradientcolor })
		gradientcache.push(mat);
	}
	
	//draws labels on respective axises
	//drawAxisLabels();

	// start rendering scene
	render();
	animate();
}

function animate() {

  requestAnimationFrame( animate );
  graphControls.update();

}

function render() {
  renderer.render( scene, camera );
}

/*function drawAxisLabels() {

	var mzsprite = makeTextSprite('X', {r: 255, g: 0, b: 0}, 20);
	var rtsprite = makeTextSprite('Y', {r: 0, g: 150, b: 0}, 20);
	var intsprite = makeTextSprite('Z', {r: 0, g: 0, b: 255}, 20);
	mzsprite.position.set(3,0,-1);
	rtsprite.position.set(-1,0,3);
	intsprite.position.set(-1,3,-1);
	gridgroup.add(mzsprite, rtsprite, intsprite);
}*/

function makeTextSprite(msg, textColor, fontsize) {
	//need to change font size based on whether it is data or axis label
	var border = 6;
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	var fontwidth = context.measureText(msg).width;
	context.font = fontsize + "px Arial";
	context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
	context.fillText(msg, ((canvas.width/2) - (fontwidth/2)), ((canvas.height/2) - (fontsize/2)));

	var texture = new THREE.Texture(canvas)
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
	return sprite;
}

// === DATA ===

function loadPoints(dataArray, range) {
	/* use dataPoints and dataRange variables here to reset the graph.
	this function is called after the csv sample data has been
	loaded and converted to our format*/
	
	for (var i = 0; datagroup.children.length < 10000 && i < dataArray.length; i++) {
		var point = dataArray[i];
		if (isInRange(point, range)) {
			datagroup.add(makePoint(point));
		}
  	}
	
	//document.getElementById("statusText").innerHTML = "Displaying: " + datagroup.children.length + "/" + dataArray.length + " points";
}

function roundTo(number, places) {
	var power = Math.pow(10, places);
	return Math.round(number * power) / power;
}

function updateViewRange(newViewRange, forceRedraw) {
	// sets a new viewRange and redraws all points that are in the range
	viewRange = newViewRange;
	if (forceRedraw) {
		clearScene();
	}
	
	if (lastData) {
		loadPoints(lastData, newViewRange);
	}
	
	render();
	
	document.getElementById("updateRange").innerHTML =
		"<b>MZ: </b>[" + roundTo(viewRange.mzmin, 3) + ", " + roundTo(viewRange.mzmax, 3) +
		"]<br><b>RT: </b>[" + roundTo(viewRange.rtmin, 3) + ", " + roundTo(viewRange.rtmax, 3) + "]";
}

/*function panGraph(xpan, zpan) {
	var vr = viewRange;
	var dr = dataRange
	
	// clamp panning to stay in the borders of the data range
	var minXpan = dr.mzmin - vr.mzmin;
	var maxXpan = dr.mzmax - vr.mzmax;
	var minZpan = dr.rtmin - vr.rtmin;
	var maxZpan = dr.rtmax - vr.rtmax;
	
	xpan = Math.min(Math.max(minXpan, xpan), maxXpan);
	zpan = Math.min(Math.max(minZpan, zpan), maxZpan);
	
	
	// find new view range
	var newvr = { mzrange: vr.mzrange, rtrange: vr.rtrange };
	newvr.mzmin = vr.mzmin + xpan;
	newvr.mzmax = vr.mzmax + xpan;
	newvr.rtmin = vr.rtmin + zpan;
	newvr.rtmax = vr.rtmax + zpan;
	
	// remove points not in the new range
	datagroup.children.filter(function(pt) {
		return !isInRange(pt.coord, newvr);
	}).forEach(function(pt) {
		datagroup.remove(pt);
		disposePoint(pt);
	});
	
	// move points already on the graph
	var dx = xpan * (gridrange / viewRange.mzrange);
	var dz = zpan * (gridrange / viewRange.rtrange);
	
	datagroup.children.forEach(function(pt) {
		pt.translateX(-dx);
		pt.translateZ(-dz);
	});
	
	// update new view range, includes adding the new points
	updateViewRange(newvr, false);
}*/

function isInRange(point, range) {
	// checks if a point is inside the bounds of the given range
	return (point[0] >= range.mzmin && point[0] <= range.mzmax) &&
		(point[1] >= range.rtmin && point[1] <= range.rtmax);
}

function makePoint(point) {

	var gradientindex = Math.floor((gradientcache.length*point[2])/dataRange.intmax);
	var material = gradientcache[Math.floor(gradientindex)];
	var geo = new THREE.Geometry();

	//  x / gridrange = (mz - mzmin) / mzrange
	var x = (gridrange * (point[0] - viewRange.mzmin)) / viewRange.mzrange;
	var y = (yrange * (point[2] - dataRange.intmin)) / dataRange.intrange;
	var z = (gridrange * (point[1] - viewRange.rtmin)) / viewRange.rtrange;

	geo.vertices.push(
		new THREE.Vector3(x, 0, z),
		new THREE.Vector3(x, y, z)
	);

	var line = new THREE.Line(geo, material);
	line.coord = point.concat([]);
	return line;
}

function getGradientColor(val, max) {

	var mid = max/2;
	var redColor = 0;
	var greenColor = 0;
	var blueColor = 0;

	if(val<mid) {
		redColor = Math.round((val/mid) * 255);
		greenColor = Math.round((val/mid) * 255);
		blueColor = Math.round(255 - ((val/mid) * 255));
	} else {
		redColor = 255;
		greenColor = Math.round(255 - ((((val-mid)/mid) * 255)));
		blueColor = 0;
	}

	return "rgb(" + redColor + ", " + greenColor + ", " + blueColor +")";
}

function plotAxis(length) {

	var material = new THREE.LineBasicMaterial({color: 0x000000});
	
	var offset = 0;

	// draw x axis
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(-lenth, offset, 0),
		new THREE.Vector3(length, offset, 0)
	);

	gridgroup.add(new THREE.Line(geometry, material));

	// draw y axis
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(0, -length, 0),
		new THREE.Vector3(0, length, 0)
	);

	gridgroup.add(new THREE.Line(geometry, material));

	// draw z axis
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(0, offset, -length),
		new THREE.Vector3(0, offset, length)
	);

	gridgroup.add(new THREE.Line(geometry, material));
}

function drawGrid() {

	var gridgeo = new THREE.Geometry();
	var gridmaterial = new THREE.LineBasicMaterial({ color: 0xA0A0A0 });

	for (var i = 0; i <= gridrange; i++) {
		gridgeo.vertices.push(new THREE.Vector3(i, 0, 0));
		gridgeo.vertices.push(new THREE.Vector3(i, 0, gridrange));
		gridgeo.vertices.push(new THREE.Vector3(-i, 0, 0));
		gridgeo.vertices.push(new THREE.Vector3(-i, 0, gridrange));
	}

	for (var i = 0; i <= gridrange; i++) {
		gridgeo.vertices.push(new THREE.Vector3(0, 0, i));
		gridgeo.vertices.push(new THREE.Vector3(gridrange, 0, i));
		gridgeo.vertices.push(new THREE.Vector3(0, 0, -i));
		gridgeo.vertices.push(new THREE.Vector3(gridrange, 0, -i));
	}

	return new THREE.LineSegments(gridgeo, gridmaterial);
}

function disposePoint(obj) {
	if (obj.geometry) {
		obj.geometry.dispose();
	}
	if (obj.dispose) {
		obj.dispose();
	}
}

function clearScene() {
	while(datagroup.children.length > 0) {
		var obj = datagroup.children.pop();
		disposePoint(obj);
	}
}

function cameraChange() {
	protate.enabled = false;
	orotate.enabled = false;
	pdatactl.enabled = false;
	odatactl.enabled = false;
	if(document.getElementById('perspective').checked){
		camera = pcamera;
		graphControls = protate;
		dataControls = pdatactl;
	}else if(document.getElementById('orthographic').checked){
		camera = ocamera;
		graphControls = orotate;
		dataControls = odatactl;
	}

	render();
	
	camera.position.set(10,20,25);
	camera.lookAt(scene.position);
	
	graphControls.enabled = true;
	document.getElementById("ctlGraph").checked = true;
}

function controlChange() {
	var ctlType = document.forms[0]["controlType"].value;
	graphControls.enabled = ctlType === "graph";
	dataControls.enabled = ctlType === "data";
}

document.getElementById("perspective").addEventListener("click", cameraChange);
document.getElementById("orthographic").addEventListener("click", cameraChange);
document.getElementById("ctlGraph").addEventListener("click", controlChange);
document.getElementById("ctlData").addEventListener("click", controlChange);
detailControl = new DetailControl(document.getElementById("detailSlider"), document.getElementById("detailLevel"));


