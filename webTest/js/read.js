$(document).ready(function(){
  loadDoc("Bed000000.vtu")
})
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
  points = xml.find('Points')
  cells = xml.find('Cells')
  connectivity = xml.find('[Name="connectivity"]')
  offsets = xml.find('[Name="offsets"]')
  types = xml.find('[Name="types"]')
  pData = xml.find('PointData')
}
