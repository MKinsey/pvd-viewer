$(document).ready(function(){
  loadDoc("simple.vtu")
})
function loadDoc(url) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      document.getElementById('a').innerHTML = "Loaded"
      parse (xhttp)
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

function parse(xml){
  xmlDoc = $.parseXML( xml ),
  $xml = $( xmlDoc ),
  $test = $xml.find("DataArray")
  console.log($test);
}
