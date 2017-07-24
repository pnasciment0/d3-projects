/*
  You do your work for Project 3 in this file, within the regions
  indicated below.  Comments throughout give details.
*/

/* module syntax directly copied from d3.v4.js */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
        (factory((global.p3 = global.p3 || {})));
}(this, (function (exports) { 'use strict';

const transDur = 500; // if using transitions
const hexWidth = 39.5; // size of hexagons in US map
const txtWidth = 20; // width of state label on each row of grid
const plotOpac = 0.25; // opacity of plots
const plotStrokeWidth = 2.5; // width of stroke for drawing plot

var sortBy = "alpha"; // in synch with index.html
var colorBy = "value"; // in synch with index.html

// these are set by index.html
var popYears; // array of years for which there is population data
var caseYears; // array of all years for which we have case counts
var mapData; // data from hex map file
var popData; // (processed) data from population file
var caseData; // (processed) data from measles case counts
var plotWdth, plotHght; // dimensions of rectangle in which plots are drawn
var plotXScale; // linear scale for mapping years to position

// these are set by index.html, but
// YOU HAVE TO COMPUTE AND FILL IN THE CORRECT VALUES
var stRate; // per-state rate of measles per 1 million people
var usRate; // national average rate of measles per 1 million people

// little utility for making link to google search for measles
// in given year and state. If no state is passed, "US" is used.
// The year and state are made to be required in the search results
// by enclosing them in (escaped) quotes.
function searchLink(year, state) {
    state = state ? state : "US";
    return ("<a href=\"https://www.google.com/search?q="
            + "measles" + "+%22" + year + "%22+%22" + state + "%22"
            + "\" target=_blank>measles " + year + " " + state + "</a>");
}

/* ------------------------- do not change anything above this line */

/* YOUR CODE HERE. The functions already here are called by index.html,
   you can see what they do by uncommenting the console.log() */


var slctdYr;
			      
function sortBySet(wat) {
    console.log("sortBy ", wat);
    // maybe more of your code here ...

}
function colorBySet(wat) {
    console.log("colorBy ", wat);
    // maybe more of your code here ...

}

function caseRowFinish(d) {
    //console.log("caseRowFinish: ", d);
    // maybe more of your code here ...

    return d; // keep this line
}

function caseDataFinish(Data) {
    // console.log("caseDataFinish: Data=", Data);
    p3.caseData = Data;
    // initialize the per-state and US rate data arrays;
    // your code will compute correct rates
    p3.stRate = Data.map(row => ({
         state: row.StateAbbr,
         rates: Data.columns
                  .filter(y => !isNaN(y)) // keep only the (numeric) years
                  .map(y => ({year: +y, rate: 0})) // initialize to zero
         })
    );
    p3.usRate = p3.stRate[0].rates.map(y => y);
    // maybe more of your code here ...

    // uncomment this to see structure of stRate Object
    // console.log("caseFinish: stRate=", p3.stRate);
}

function popRowFinish(d) {
    // console.log("popRowFinish: ", d);
    // maybe more of your code here ...

    return d; // keep this line
}

function popDataFinish(Data) {
    //console.log("popDataFinish: ", Data);
    p3.popData = Data;
    // maybe more of your code here ...

}

// maybe more of your code here ...


function finalFinish() {
    // This would be a good place to compute rate per-state per-year
    // maybe more of your code here ...

    console.log("finalFinish");

    // console.log("p3.popData: ", p3.popData);    
    // console.log("p3.stRate: ", p3.stRate);
    // console.log("p3.caseData: ", p3.caseData);

    // looping from 0 to 50, work by state (including DC, apparently)

    var years = [];
    for (var i = 0; i < 9; i++)
	years[i] = 1930 + 10 * i;
    //    console.log("years", years);

    var stPopLerps = {}; // empty object to be given state populations
    var states = p3.stRate.map(i => i.state); // list of all states
    
    for (var i = 0; i < 51; i++) {
	if (!( (p3.popData[i].StateAbbr === p3.caseData[i].StateAbbr) &&
	       (p3.popData[i].StateAbbr === p3.stRate[i].state) ))
	    console.log("data not consistently sorted across csvs");
	else
	    console.log("sorting consistent");

	// make a lerp for estimating populations
	var stPopLerp = d3.scaleLinear()
	    .domain(years)
	    .range(years.map(y => p3.popData[i][y]));

	// store that lerp in stPopLerps for later usage
	stPopLerps[p3.stRate[i].state] = stPopLerp;
	
	for (var j = 0; j < 87; j++) {
	    var yr = 1930 + j;
	    if (p3.stRate[i].rates[j].year !== yr)
		console.log("stRate out of order relative to years");
	    p3.stRate[i].rates[j].rate = 1000000 * p3.caseData[i][yr] / stPopLerp(yr);
	}
    }

    // console.log("p3.stRate, after finalFinish: ", p3.stRate);

    // now compute for entire US
    for (var j = 0; j < 87; j++) {
    	var yr = 1930 + j;
    	if (p3.usRate[j].year !== yr)
    	    console.log("usRate out of order relative to years");
    	var usCases, usPop;
    	usCases = p3.caseData.map(d => d[yr]).reduce((a, b) => a + b, 0);
    	usPop = states.map(i => stPopLerps[i](yr)).reduce((a, b) => a + b, 0);

	p3.usRate[j] = {};
	p3.usRate[j].year = yr;
    	p3.usRate[j].rate = 1000000 * usCases / usPop;
    }

        // fill in line plot
    var rateScale = d3.scaleLinear()
	.domain(d3.extent(p3.usRate.map(i => i.rate)))
	.range([p3.plotHght, 0]);

    d3.select("#plot-us")
	.datum(d => p3.usRate).transition(p3.transDur)
	.attr("d",
	      d3.line()
	      .x(d => p3.plotXScale(d.year))
              .y(d => rateScale(d.rate))
	     );


    d3.select("#plotUSG")
        .call(d3.axisLeft(rateScale))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Measles Cases"); 

}

function yearSelect(year) {
    console.log("yearSelect: ", year);
    // indicate the selected year
    d3.select("#stateMapY").text(year);
    // maybe more of your code here ...

    slctdYr = year;

    var rateSlice = p3.stRate.map(d => [d.state, d.rates[year-1930].rate]);
    // console.log(rateSlice);
    // console.log(d3.extent(rateSlice.map(i => i[1])));

    // fill in grid with colormap

    function colormapBase(d) {
        //var e = rateSlice.filter(sr => sr[0] === d.StateAbbr)[0][1];
        var scale = d3.scaleLinear().domain([0, 30000])
        //console.log(scale);
        var phi = scale.range([0, 3.14159])(d);
        //console.log(phi);
        //console.log(d);
        //console.log(scale.range([330, 0])(d));
        var ret = d3.hcl(scale.range([330, 0])(d),
                        23*Math.pow(Math.sin(phi),2),
                        scale.range([10,100])(d));
        //console.log(ret);
        return ret;
    }

    var controls = []
    for (var i = 0; i <= 30000; i+=1000)
	controls.push(i);

    var intMap = d3.scaleLinear()
	.domain([
            0,
            10,
            25,
            50,
            75,
            1000,
            15000,
            20000,
            24000,
            28000,
            30000])
    	.range([
            0, 
            0.08,
            0.2, 
            0.5,
            1,
            2,
            10,
            1000,
            10000,
            20000,
            30000]);
	       
    
    var colormap = d3.scaleLinear()
	.domain(controls.map(intMap))
	.range(controls.map(colormapBase));

    d3.select("#stateGrid")
	.selectAll("g")
	.data(p3.stRate)
	.selectAll("rect")
	.data(d => d.rates)
	.style("fill",
	       d => colormap(d.rate));

    // fill in map with colormap
    
    d3.selectAll(".stateHex")
	.data(p3.mapData)
	.transition(p3.transDur)
	.style("fill", d => colormap(rateSlice.filter(sr=>sr[0]===d.StateAbbr)[0][1]));


}

/* onMouse() is called with mousedown (downward part of click) and
 mousemove events. The first argument is what element was under the cursor
 at the time, and the second argument is the XY position of the cursor
 within that element, which can used (if "plot" == IDspl[0]) to recover,
 via p3.plotXScale the corresponding year */
function onMouse(ID, xy) {
    var IDspl = ID.split("-"); // splits ID string at "-"s into array
    console.log("onMouse: ", ID, IDspl, xy, d3.event.type);
    // maybe more of your code here ...
    console.log("IDspl", IDspl);

    // use grid clicks to select year
    if (IDspl[0] === "grid")
	p3.yearSelect(+IDspl[2]);
    // use plot clicks to select year
    else if (IDspl[0] === "plot")
	p3.yearSelect(Math.round(p3.plotXScale.invert(xy[0])));

}

/* ------------------------- do not change anything below this line */

exports.hexWidth = hexWidth;
exports.txtWidth = txtWidth;
exports.plotOpac = plotOpac;
exports.plotStrokeWidth = plotStrokeWidth;
exports.transDur = transDur;
exports.sortBySet = sortBySet;
exports.colorBySet = colorBySet;
exports.popRowFinish = popRowFinish;
exports.caseRowFinish = caseRowFinish;
exports.popDataFinish = popDataFinish;
exports.caseDataFinish = caseDataFinish;
exports.mapData = mapData;
exports.popData = popData;
exports.caseData = caseData;
exports.stRate = stRate;
exports.usRate = usRate;
exports.searchLink = searchLink;
exports.plotWdth = plotWdth;
exports.plotHght = plotHght;
exports.plotXScale = plotXScale;
exports.popYears = popYears;
exports.finalFinish = finalFinish;
exports.yearSelect = yearSelect;
exports.onMouse = onMouse;
Object.defineProperty(exports, '__esModule', { value: true });
})));
