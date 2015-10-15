var MIN_DETAIL = 0;
var MAX_DETAIL = 5;
	
function DetailControl(slider, label) {
	var self = this;
	self.detailLevel = MIN_DETAIL;
	self.sliderElem = slider;
	self.labelElem = label;

	// initialize slider and detail level label
	slider.min = MIN_DETAIL;
	slider.max = MAX_DETAIL;
	slider.value = MIN_DETAIL;
	label.innerHTML = MIN_DETAIL;
	
	slider.addEventListener('change', this.sliderChanged.bind(this), false);
};

DetailControl.prototype.sliderChanged = function(e) {
	var newLevel = Number(this.sliderElem.value);
	
	// calculate the new view range
	// each detail level increase = 1/4 the view range (1/2 of each axis)
	// detail level 0 is all data in view, level 1 is one fourth,
	// level 2 = one sixteenth of data, etc.
	var detailFrac = 1 / Math.pow(2, newLevel);
	
	var newvr = {
		mzrange: dataRange.mzrange * detailFrac,
		rtrange: dataRange.rtrange * detailFrac,
	};
	
	// calculate "center" of graph to zoom around
	var mzmid = (viewRange.mzmax + viewRange.mzmin) / 2.0;
	var rtmid = (viewRange.rtmax + viewRange.rtmin) / 2.0;
	
	// calculate new min/max based on the "center" value
	newvr.mzmin = mzmid - (newvr.mzrange / 2);
	newvr.mzmax = mzmid + (newvr.mzrange / 2);
	newvr.rtmin = rtmid - (newvr.rtrange / 2);
	newvr.rtmax = rtmid + (newvr.rtrange / 2);
	
	// TODO: get data from other group
	updateViewRange(newvr, true);
	this.detailLevel = newLevel;
	this.labelElem.innerHTML = newLevel;
}
