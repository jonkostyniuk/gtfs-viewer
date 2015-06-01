// ##########################################################################################################
// GTFS CLIENT-SIDE APPLICATION
// Created by Jon Kostyniuk on 28MAY2015
// Last modified by Jon Kostyniuk on 28MAY2015
// Property of JK Enterprises
// v0.01a
// ##########################################################################################################
//
// Version History:
// ----------------
// 28MAY2015 v0.01a - JK
//   - Initial Version.
//
// Usage:
// ------
// Describe usage.
//
// Instructions:
// -------------
// None currently.
//

// ##########################################################################################################
// DEFINITIONS
// ##########################################################################################################

// Map Variables
var $map = null;													// Google Map Variable

// GTFS Data Variables
var $AgencyData = null; 											// JSON Object for Agency Data
var $SelAgency = null;												// Selected Transit Agency ID
var $GTFS_API = "http://www.gtfs-data-exchange.com/api/agencies"	// GTFS Exchange API Data

// GUI Variables
var $diaName = null;												// Name of Dialogue Window Open


// ##########################################################################################################
// DEFINED FUNCTIONS
// ##########################################################################################################

// MODULE FUNCTIONS
// ----------------

// Function to Clear Agency
function clearAgency() {
	$SelAgency = null; // Clear Selected Agency
	$(".list-item").css("color", "#000000"); // Clear selected styles
	$(".list-item").css("background", "#ffffff"); // Clear selected styles
	$('#load-agency').prop('disabled', true); // Disable submit button
	$('#mAgency').modal('hide'); // Hide dialogue
	$diaName = null; // Clear active dialogue name
}

// Function to Initialize Google Map
function initMap() {
	// Create New Google Maps Object
	var $mapOptions = {
	    zoom: 12,
	    center: new google.maps.LatLng(43.809785, -79.454099)
		};
	$map = new google.maps.Map($('#gmap')[0], $mapOptions);
}

// Function to Load Agency
function loadAgency() {
	$(".list-item").css("color", "#000000"); // Clear selected styles
	$(".list-item").css("background", "#ffffff"); // Clear selected styles
	$('#load-agency').prop('disabled', true);
	$('#mAgency').modal('hide');
	$diaName = null;
    alert($SelAgency);
}

// Function to Load GTFS Exchange Data
function loadGTFS() {
    $("#mAgency").modal('show'); // Load dialogue window
    $diaName = "Agency"; // Set active dialogue name

	$.ajax({
	    url: $GTFS_API,
	    dataType: "jsonp",
	    success: function($data) {
	    	parseGTFS($data)
	    	//$('#agency-data').html(JSON.stringify($data));  //WORKS
	    	alert($data["status_code"]) //TEMP
	    }
	});	
}

// Function to Handle List Clicks
function listClick($listID) {
	// Determine which dialogue to handle
	switch($diaName) {
	    case "Agency": // Agency Select Dialogue Window
			$SelAgency = $listID
			$('#load-agency').prop('disabled', false);
	        break;
	    // Add more cases as needed
	}

	// Clear selected styles
	$(".list-item").css("color", "#000000");
	$(".list-item").css("background", "#ffffff");
	
	// Add selected item style
	$("#" + $listID).css("color", "#ffffff");
	$("#" + $listID).css("background", "#0000ff");
}


// HELPER (MONKEY) FUNCTIONS
// -------------------------

// Function to Parse GTFS Data
function parseGTFS($gtfsjson) {
	var $gtfsline = "";
	//for(var $i = 0; $i < $gtfsjson["data"]; $i++) {
	//	$gtfsline += "<div class='list-item' id='t1' onClick='listClick(this.id)''>Junk</div>"
	//}
	// START HERE
	//<div class="list-item" id="t1" onClick="listClick(this.id)">Junk</div>
}


// ##########################################################################################################
// MAIN PROGRAM
// ##########################################################################################################

// When HTML Document Loaded, Add Listeners Here
$(document).ready(function() {
	// Event Handler to Load Selected Agency on Click
	$('#load-agency').on('click', function (e) {
		loadAgency();
	});

	// Event Handler to Select Agency on Click
	$('#select-agency').on('click', function (e) {
		loadGTFS();
	});
});

// Initialize Google Maps DOM on Page Load
google.maps.event.addDomListener(window, 'load', initMap());