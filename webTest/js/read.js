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
      document.getElementById('a').innerHTML = "Loaded"
      parse (xhttp.responseText)
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
  connectivity = xml.find('[Name="connectivity"]')
  offsets = xml.find('[Name="offsets"]')
  types = xml.find('[Name="types"]')
  pData = xml.find('PointData')
  build(points, offsets, numberOfComponents)
}

function build(pointsXml, offsets, numberOfComponents){
  // nPts = pointsXml.split(" ")
  if(numberOfComponents == 3){
    points = pointsXml.text().split(' ')
    nPoints = points.length
    for(i = 0; i < nPoints; i += Number(numberOfComponents)){
      x = points[i]
      y = points[i+1]
      z = points[i+2]

    }
  }

}
