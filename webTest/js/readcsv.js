function readCsvData(data) {
	var points = [];
	var range = {};
	
	var lines = data.split(/\r\n|\n/);

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		if (line) { // only process non-blank lines
			var vals = line.split(",");
			// first two indices (0, 1) are not relevant to us
			var mz = parseFloat(vals[2]);
			var rt = parseFloat(vals[3]);
			var int = parseFloat(vals[4]);
			
			points.push([mz, rt, int]);

			// "range.* || *" to use the specified value as default the first time around
			range.mzmin = Math.min(range.mzmin || mz, mz);
			range.mzmax = Math.max(range.mzmax || mz, mz);
			range.rtmin = Math.min(range.rtmin || rt, rt);
			range.rtmax = Math.max(range.rtmax || rt, rt);
			range.intmin = Math.min(range.intmin || int, int);
			range.intmax = Math.max(range.intmax || int, int);
		}
	}

	range.mzrange = range.mzmax - range.mzmin;
	range.rtrange = range.rtmax - range.rtmin;
	range.intrange = range.intmax - range.intmin;

	return { "points": points, "range": range };
}

function handleFileSelect(e) {
	var files = e.target.files; // FileList object

	var f = files[0];

	var reader = new FileReader();
	reader.onload = function() {
		var csvData = readCsvData(reader.result);
		dataRange = csvData.range;
		lastData = csvData.points;
		updateViewRange(dataRange, true);
	}
	reader.readAsText(f);

}

document.getElementById('fileselect').addEventListener('change', handleFileSelect, false);
