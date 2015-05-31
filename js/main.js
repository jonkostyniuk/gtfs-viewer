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
var $map = null;		// Google Map Variable

// GTFS Data Variables
var $SelAgency = null;	// Selected Transit Agency ID

// GUI Variables
var $diaName = null;		// Name of Dialogue Window Open


// ##########################################################################################################
// DEFINED FUNCTIONS
// ##########################################################################################################

// MODULE FUNCTIONS
// ----------------

// Function to Initialize on On Page Load
function initialize() {
	// Create New Google Maps Object
	var $mapOptions = {
	    zoom: 12,
	    center: new google.maps.LatLng(43.809785, -79.454099)
		};
	$map = new google.maps.Map($('#gmap')[0], $mapOptions);

	// Event Handler to Load Selected Agency on Click
	$('#load-agency').on('click', function (e) {
		loadAgency();
	})

	// Event Handler to Select Agency on Click
	$('#select-agency').on('click', function (e) {
	    $("#mAgency").modal('show'); // Load dialogue window
	    $diaName = "Agency"; // Set active dialogue name
	})
}

// Function to Clear Agency
function clearAgency() {
	$SelAgency = null; // Clear Selected Agency
	$(".list-item").css("color", "#000000"); // Clear selected styles
	$(".list-item").css("background", "#ffffff"); // Clear selected styles
	$('#load-agency').prop('disabled', true); // Disable submit button
	$('#mAgency').modal('hide'); // Hide dialogue
	$diaName = null; // Clear active dialogue name
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

// n/a


// ##########################################################################################################
// MAIN PROGRAM
// ##########################################################################################################

// Initialize Google Maps DOM Listener
google.maps.event.addDomListener(window, 'load', initialize);
