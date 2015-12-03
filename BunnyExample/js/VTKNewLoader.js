/**
 * @author Carlos Albaladejo & Michael Kinsey
 */

var xmlDoc, xml, points, cells, connectivity, offsets, types, pData;

THREE.VTKNewLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.VTKNewLoader.prototype = {

	constructor: THREE.VTKNewLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( data ) {

		var xmlDoc = $.parseXML( data )
        var xml = $( xmlDoc )
        // get specific data
        var pts = xml.find('Points')
        var numberOfComponents = pts.find('DataArray').attr('NumberOfComponents')
        var cells = xml.find('Cells')
        var numberOfCells = xml.find('Piece').attr('NumberOfCells')
        var connectivity = xml.find('[Name="connectivity"]')
        var offsets = xml.find('[Name="offsets"]')
        var types = xml.find('[Name="types"]')
        var pData = xml.find('PointData')


		var indices = [];
        var positions = [];
        var decimal = /(-?\d+\.?\d*)/g
        var scalar = /(-?\d+\.?\d*[eE+]?[+-]\d*)/g
				//test
				scalars = pData.text().match(scalar)

        if(numberOfComponents == 3){
            points = pts.text().match(decimal)
            cellsArray = connectivity.text().match(decimal)
            nPoints = points.length
            var minX = parseFloat(points[2]), minY = parseFloat(points[1]), maxX = parseFloat(points[2]), maxY = parseFloat(points[1]);
            for(i = 3; i < nPoints; i += 3){
                if(parseFloat(points[i+2]) < minX ) minX = parseFloat(points[i+2]);
                else if(parseFloat(points[i+2]) > maxX ) maxX = parseFloat(points[i+2]);
                if(parseFloat(points[i+1]) < minY ) minY = parseFloat(points[i+1]);
                else if(parseFloat(points[i+1]) > maxY ) maxY = parseFloat(points[i+1]);
            }
            var averageX = (parseFloat(maxX) + parseFloat (minX))/2;
            var averageY = (parseFloat(maxY) + parseFloat (minY))/2;
            for(i = 0; i < nPoints; i += 3){
                positions.push( parseFloat( points[i+2] ) - parseFloat(averageX), parseFloat( points[ i+1 ] ) - parseFloat(averageY), parseFloat( points[ i ] )  );
            }
            for(var j = 0; j < numberOfCells; j+=3){
                indices.push( parseFloat( cellsArray[j] ), parseFloat( cellsArray[ j+1 ] ), parseFloat( cellsArray[ j+2 ] ) );
            }
        }


        var geometry = new THREE.BufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( new ( indices.length > 65535 ? Uint32Array : Uint16Array )( indices ), 1 ) );
        geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );


        return geometry

	}

};

THREE.EventDispatcher.prototype.apply( THREE.VTKNewLoader.prototype );
