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

  alert('Loaded')
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
  points = xml.find('Points')
  numberOfComponents = points.find('DataArray').attr('NumberOfComponents')
  cells = xml.find('Cells')
  numberOfCells = xml.find('Piece').attr('NumberOfCells')
  connectivity = xml.find('[Name="connectivity"]')
  offsets = xml.find('[Name="offsets"]')
  types = xml.find('[Name="types"]')
  pData = xml.find('PointData')
  alert('Building')
  build(points, offsets, numberOfComponents, connectivity, numberOfCells)
  alert('Builded')
}

function build(pointsXml, offsets, numberOfComponents, connect, nOfCells){
  
  var indices = [];
  var positions = [];
  
  if(numberOfComponents == 3){
    points = pointsXml.text().split('( )+')
    cellsArray = connect.text().split('( )+');
    nPoints = points.length
    for(i = 0; i < nPoints; i += Number(numberOfComponents)){
      positions.push( parseInt( points[i] ), parseInt( points[ i+1 ] ), parseInt( points[ i+2 ] ) );
    }
    for(var j = 0; j < nOfCells; j+=3){
      indices.push( parseInt( cellsArray[i] ), parseInt( cellsArray[ i+1 ] ), parseInt( cellsArray[ i+2 ] ) );
    }
  }
  
  
  geometry = new THREE.BufferGeometry();
  geometry.setIndex( new THREE.BufferAttribute( new ( indices.length > 65535 ? Uint32Array : Uint16Array )( indices ), 1 ) );
  geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
  geometry.computeVertexNormals();
  
  return
  
}
