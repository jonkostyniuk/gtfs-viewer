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
var $AgencyData = null; 											// JSON Object for Agency Feed Data
var $AgencyPreset = null;											// JSON Object for User Agency Preset Data
var $SelAgency = null;												// Selected Transit Agency ID
var $GTFS_API = "http://www.gtfs-data-exchange.com/api/agencies"	// GTFS Exchange API Data
var $GTFS_ZIP = new RegExp(/\.(zip$)/);								// GTFS ZIP File Regular Expression
var $ZipType = null;												// ZIP Radio - URL or File

// GUI Variables
var $diaName = null;												// Name of Dialogue Window Open
var $UUID = null;													// Client Side Unique User ID


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

	return;
}

// Function to Clear Upload
function clearUpload() {
	$('#upload-ZIP').prop('disabled', true); // Disable submit button
	$('#mUploadZIP').modal('hide'); // Hide dialogue
	$diaName = null; // Clear active dialogue name

	return;
}

// Function to Create and/or Verify Unique User ID
function createUUID() {
	if(localStorage.getItem("uuid") == "null") {
		$.ajax({
			url: "./api/uuid",
			method: "GET",
			dataType: "text",
			success: function($data) {
				localStorage.setItem("uuid", $data);
				$UUID = $data;
				preloadGTFS();
			},
		    error: function ($jqXHR, $textStatus, $errorThrown) {
	            if ($jqXHR.status == 500) {
	            	alert("Internal error: " + $jqXHR.responseText);
	            } else {
	            	alert("Unexpected error!!");
	            }
	        }
		});
	} 
	else {
		$UUID = localStorage.getItem("uuid");
		preloadGTFS();
	}

	return;
}

// Function to Initialize Google Map
function initMap() {
	// Create New Google Maps Object
	var $mapOptions = {
	    zoom: 5,
	    center: new google.maps.LatLng(49.176623, -97.962114)
		};
	$map = new google.maps.Map($('#gmap')[0], $mapOptions);

	return;
}

// Function to Load Agency
function loadAgency() {
	$(".list-item").css("color", "#000000"); // Clear selected styles
	$(".list-item").css("background", "#ffffff"); // Clear selected styles
	$('#load-agency').prop('disabled', true);
	$('#mAgency').modal('hide');
	$diaName = null;
    

    alert($SelAgency); //TEMP, DO SOMETHING HERE

    return;
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

	// Load Preview Data
	for(var $i = 0; $i < $AgencyData["data"].length; $i++) {
		if($AgencyData["data"][$i]["dataexchange_id"] == $listID) {
			var $curData = $AgencyData["data"][$i];
		}
	}

	// Construct Location Data
	var $locInfo = "";
	if($curData["state"] != "") $locInfo += $curData["state"] + ", ";
	if($curData["country"] != "") $locInfo += $curData["country"];

	// Construct Date and Time
	var $datetime = new Date($curData["date_last_updated"] * 1000);
	//$dtStr = $datetime.format("dd.mm.yyyy hh:MM:ss");

	// Construct Official Feed or Not
	var $aOfficial = "Unofficial";
	if($curData["is_official"] == true) $aOfficial = "Official";	

	// Change Agency Dialogue Preview Values
	$("#aName").html($curData["name"]);
	$("#aLocation").html($locInfo);
	$("#aURL").html("<a href='" + $curData["url"] + "' target='_blank'>" + $curData["url"] + "</a>");
	$("#aFeed").html("<a href='" + $curData["feed_baseurl"] + "' target='_blank'>" + $curData["feed_baseurl"] + "</a>");
	$("#aOfficial").html($aOfficial);
	$("#aFeedLastUpdated").html($datetime);

	return;
}

// Function to Preload GTFS Agency Data from Server
function preloadGTFS() {
	if($UUID != "null") {
		$.ajax({
			url: "./api/agencies",
			method: "POST",
			contentType: 'application/json',
			data: JSON.stringify({"uuid": $UUID}),
			dataType: "json",
			success: function($data) {
				// Save Agency Preset JSON Data
				$AgencyPreset = $data;


				$("#testout").html($AgencyPreset["uuid"]);
				//alert($data); // need to handle json here
			},
		    error: function ($jqXHR, $textStatus, $errorThrown) {
	            if ($jqXHR.status == 500) {
	            	alert("Preload Agency Data: Internal error: " + $jqXHR.responseText);
	            } else {
	            	alert("Preload Agency Data: Unexpected error!!");
	            }
	        }
		});		
	}
	else {
		x=0;
	}

	// If Error, replace Agency Dropdown and throw Error Message
	///code here

	return;
}

// Function to Select GTFS Exchange Feed
function selectFeed() {
    $("#mAgency").modal('show'); // Load dialogue window
    $diaName = "Agency"; // Set active dialogue name

	$.ajax({
	    url: $GTFS_API,
	    method: "GET",
	    dataType: "jsonp",
	    success: function($data) {
	    	parseGTFS($data);
	    }
	});

	return;
}

// Function to Select GTFS ZIP File
function selectZIP() {
    $("#mUploadZIP").modal("show"); // Load dialogue window
    $diaName = "Upload"; // Set active dialogue name
    $('#zipurl').prop('disabled', true); // Disable field until radio checked
    $('#zipfile').prop('disabled', true); // Disable field until radio checked 

	return;
}

// Function to Validate and Upload ZIP File
function uploadZIP() {


	// ADD VALIDATION HANDLING HERE
	if($ZipType == "url") alert($('#zipurl').val());
	else alert($('#zipfile').val());



	// Clear and close dialogue after validation
	$("#upload-ZIP").prop("disabled", true);
	$("#mUploadZIP").modal("hide");
	$("input[name='ziptype']").prop("checked", false); // Clear radio boxes
	$diaName = null; // Clear active dilogue
	$ZipType = null; // Clear Radio Box Type
	$('#zipfile').val(""); // Clear field value
	$('#zipurl').val(""); // Clear field value

	return;
}


// HELPER (MONKEY) FUNCTIONS
// -------------------------

// Function to Check if Agency Official
function aIsOfficial($isOfficial) {
	if($isOfficial == true) {
		return "<span class='glyphicon glyphicon-star' aria-hidden='true' style='color:#cccc00'></span>";
	}
	else {
		return "<span class='glyphicon glyphicon-star-empty' aria-hidden='true' style='color:#999999'></span>";
	}	
}

// Function to Parse GTFS Data
function parseGTFS($gtfsjson) {
	$AgencyData = $gtfsjson; // Save Active GTFS Global Object
	var $gtfsline = "";
	var $aCount = 0;
	for(var $i = 0; $i < $gtfsjson["data"].length; $i++) {
		// Verify Feed Link Present
		if($GTFS_ZIP.test($gtfsjson["data"][$i]["feed_baseurl"])) { // Test whether feed contains '.zip' extension
			// Check if official feed
			$isOfficial = aIsOfficial($gtfsjson["data"][$i]["is_official"])
			// Construct GTFS List
			$gtfsline += "<div class='list-item' id='" + $gtfsjson["data"][$i]["dataexchange_id"];
			$gtfsline += "' onClick='listClick(this.id)'>" + $isOfficial + " " + $gtfsjson["data"][$i]["name"];
			$gtfsline += "</div>";
			$aCount++;
		}
	}
	// Output Results
	$("#agency-data").html($gtfsline);
	$("#aTotal").html("Total Agencies: " + $aCount);
	return ;
}

// TEMP FOR TESTING
function removeUUID() {
	$UUID = null;
	localStorage.setItem("uuid", $UUID)
	alert("UUID is " + localStorage.getItem("uuid"));

	return;
}


// ##########################################################################################################
// MAIN PROGRAM
// ##########################################################################################################

// When HTML Document Loaded, Add Listeners Here
$(document).ready(function() {
	// Event Handler to Load Selected Agency ZIP on Click
	$("#load-agency").on("click", function (e) {
		loadAgency();
	});

	// Event Handler to Select Feed Agency on Click
	$("#select-feed").on("click", function (e) {
		selectFeed();
	});

	// Event Handler to Select Upload Method on Click
	$("#select-zip").on("click", function (e) {
		selectZIP();
	});

	// TEMP FOR TESTING
	$("#remuuid").on("click", function (e) {
		removeUUID();
	});

	// Event Handler to Upload ZIP from URL or File
	$("#upload-ZIP").on("click", function (e) {
		uploadZIP();
	});

	// Event Handler for All Popovers
	$("[data-toggle='popover']").popover();

	// ZIP File Form Validator
	/*
	jQuery.validator.setDefaults({
		debug: true,
		success: "valid"
	});
	$("#zipform").validate({
        rules: {
            zipurl: {
                //regex: /(http(s?):)|([/|.|\w|\s])*\.(?:zip)/,
                regex: /(http(s?):)|([/|.|\w|\s])*\.(zip)/,
                required: "#zipfile:blank"
            },
            zipfile: {
                //minlength: 2,
                //accept: "application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed",
                required: "#zipurl:blank",
                extension: "zip"
                //accept: "application/zip,application/octet-stream,application/x-zip,application/x-zip-compressed"
            }
        },
        highlight: function (e) {
            $(e).closest('.control-group').removeClass('success').addClass('error');
        },
        success: function (e) {
            e.text('OK!').addClass('valid')
                .closest('.control-group').removeClass('error').addClass('success');
        }
	});*/
});

// Determine ZIP Radio Button Value and Call Function
$(document).on("change", "input[name='ziptype']:radio", function() {
	$ZipType = $(this).val();
	$('#upload-ZIP').prop('disabled', false);
	if($(this).val() == "url") {
		$('#zipurl').prop('disabled', false);
		$('#zipfile').prop('disabled', true);
		$('#zipfile').val(""); // Clear disabled field value
	}
	else {
		$('#zipurl').prop('disabled', true);
		$('#zipfile').prop('disabled', false);
		$('#zipurl').val(""); // Clear disabled field value
	}
});

// Initialize Google Maps DOM on Page Load
google.maps.event.addDomListener(window, 'load', initMap());

// Create and/or Verify Unique User ID on Client Side
createUUID();

// Preload GTFS Agency Data from Server
//preloadGTFS();


// ##########################################################################################################
// END OF SCRIPT
// ##########################################################################################################