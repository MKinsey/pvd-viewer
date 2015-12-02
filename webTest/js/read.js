var geometry;

$(document).ready(function(){
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 1e10 );
  camera.position.z = 5;

  controls = new THREE.TrackballControls( camera );

  controls.rotateSpeed = 5.0;
  controls.zoomSpeed = 5;
  controls.panSpeed = 2;

  controls.noZoom = false;
  controls.noPan = false;

  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  scene = new THREE.Scene();

  scene.add( camera );

  //load data
  loadDoc("Bed000000.vtu")

  // light
  var dirLight = new THREE.DirectionalLight( 0xffffff );
  dirLight.position.set( 200, 200, 1000 ).normalize();

  camera.add( dirLight );
  camera.add( dirLight.target );
  // renderer

  renderer = new THREE.WebGLRenderer( { antialias: false } );
  renderer.setPixelRatio( window.devicePixelRatio );
  // renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setSize( 800, 500);

  container = document.createElement( 'div' );
  // document.body.appendChild( container );
  $("#container").append(container)
  container.appendChild( renderer.domElement );
  // add to scene


  var material = new THREE.MeshLambertMaterial( { color:0xffffff, side: THREE.DoubleSide } );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.setY( - 0.09 );
  scene.add( mesh );

  animate()
})

function animate() {
  requestAnimationFrame( animate );
  controls.update();
  renderer.render( scene, camera );
  //stats.update();
}
function loadDoc(url) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      parse (xhttp.responseText)
      document.getElementById('a').innerHTML = "Loaded"
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

function parse(x){
  xmlDoc = $.parseXML( x )
  xml = $( xmlDoc )
  // get specific data
  pts = xml.find('Points')
  numberOfComponents = pts.find('DataArray').attr('NumberOfComponents')
  cells = xml.find('Cells')
  numberOfCells = xml.find('Piece').attr('NumberOfCells')
  connectivity = xml.find('[Name="connectivity"]')
  offsets = xml.find('[Name="offsets"]')
  types = xml.find('[Name="types"]')
  pData = xml.find('PointData')
  console.log('Building')
  build(pts.text(), offsets, numberOfComponents, connectivity.text(), numberOfCells)
  console.log('Done Building')
}

function build(pts, offsets, numberOfComponents, connect, nOfCells){

  var indices = [];
  var positions = [];
  var decimal = /(-?\d+\.?\d*)/g

  if(numberOfComponents == 3){
    // x = decimal.match(points)
    points = pts.match(decimal)
    cellsArray = connect.match(decimal)
    // points = pointsXml.text().split(/( )+/)
    // cellsArray = connect.text().split(/( )+/);
    nPoints = points.length
    for(i = 0; i < nPoints; i += 3){
      positions.push( parseFloat( points[i] ), parseFloat( points[ i+1 ] ), parseFloat( points[ i+2 ] ) );
    }
    for(var j = 0; j < nOfCells; j+=3){
      indices.push( parseFloat( cellsArray[i] ), parseFloat( cellsArray[ i+1 ] ), parseFloat( cellsArray[ i+2 ] ) );
    }
  }


  geometry = new THREE.BufferGeometry();
  geometry.setIndex( new THREE.BufferAttribute( new ( indices.length > 65535 ? Uint32Array : Uint16Array )( indices ), 1 ) );
  geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
  geometry.computeVertexNormals();

  return

}
