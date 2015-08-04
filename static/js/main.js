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
var $SelAgency = null;												// Selected Transit Agency ID
var $GTFS_API = "http://www.gtfs-data-exchange.com/api/agencies"	// GTFS Exchange API Data
var $GTFS_ZIP = new RegExp(/\.(zip$)/);								// GTFS ZIP File Regular Expression
var $ZipType = null;												// ZIP Radio - URL or File

// Loaded Agency Variables
var $AgencyPreset = null;											// JSON Object for User Agency Preset Data
var $RoutesData = null;												// JSON Object for Agency Route Data
var $TripData = null;												// JSON Object for Route Trip Data

// GUI Variables
var $diaName = null;												// Name of Dialogue Window Open
var $UUID = null;													// Client Side Unique User ID
var $TimeOffset = new Date().getTimezoneOffset();					// Timezone Offset in Minutes

// Google Maps Polyline Options
var $polyline = null;
var $polypts = [];

var $busPath;
var $gmPolyOpts = {
	path: [],
	geodesic: true,
	strokeColor: "#ff0000",
	strokeOpacity: 1.0,
	strokeWeight: 2
};
var $busPath = new google.maps.Polyline($gmPolyOpts);

// AJAX Loading 'spin.js' Variables
var $SpinOpts = { 														// Set Spin Options
   lines: 13, // The number of lines to draw
   length: 7, // The length of each line
   width: 4, // The line thickness
   radius: 10, // The radius of the inner circle
   rotate: 0, // The rotation offset
   color: '#efefef', // #rgb or #rrggbb
   speed: 0.75, // Rounds per second
   trail: 50, // Afterglow percentage
   shadow: true, // Whether to render a shadow
   hwaccel: false, // Whether to use hardware acceleration
   className: 'spinner', // The CSS class to assign to the spinner
   zIndex: 2000000000, // The z-index (defaults to 2000000000)
   top: 'auto', // Top position relative to parent in px
   left: 'auto' // Left position relative to parent in px
};
var spinner = new Spinner($SpinOpts);									// Spinner Object Initialize
var ajax_cnt = 0;													// Support for parallel AJAX requests
 

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

// Function to Create Trip Map from Route Data
function createTripMap() {
	if($("#route").val() != "NULL") {
		var $reqData = {
			"uuid": $UUID,
			"agency_id": $('#agency').val().split("aID_")[1],
			"route_id": $("#route").val().split("rtID_")[1],
			"datetime": $("#rtdatetime").val()
		}
		// AJAX Call and JSON Response
		$.ajax({
			url: "./api/createmap",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify($reqData),
			dataType: "json",
			success: function($data) {
				// Save Global JSON Data
				$TripData = $data;

				//// ADD DATA VALIDATION HERE
				/*
				jsondata["service_id"] = []

				jsondata["trip_id"] = []

				jsondata["trip_id"] = -1
   				jsondata["stop_sequence"] = []

   				jsondata["shape_id"] = -1
    			jsondata["service_id"] = -1

				jsondata["shape_sequence"] = []
				*/

				// Clear existing polyline
				if($polyline) {
					$polyline.setMap(null);
				}
				$polypts = [];

				// Set Bounds Object
				var $bounds = new google.maps.LatLngBounds();
				// Define Polyline Shape Sequence
				for(var $i =0; $i < $TripData["shape_sequence"].length; $i++) {
					var $polypt = new google.maps.LatLng(
						$TripData["shape_sequence"][$i]["shape_pt_lat"],
						$TripData["shape_sequence"][$i]["shape_pt_lon"]
						);
					$polypts.push($polypt); // Add new point to polyline
					$bounds.extend($polypt); // Extend polyline boundary fit
				}

				// Set new polyline on map
				$polyline = new google.maps.Polyline({
					path: $polypts,
					strokeColor: "#ff0000",
					map: $map
				});
				$polyline.setMap($map);
				$map.fitBounds($bounds);
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
	else alert("ERROR: Please select transit route!!");

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
	    center: new google.maps.LatLng(49.895529, -97.138449)
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

// Function to Load Agency
function loadRoutes() {
	// If a Valid Agency is selected
	if($('#agency').val() != "null") {
		// Clear Dropdown List and Add Null Option
		$("#route").empty();
		$("#route").append(new Option("[ Select Route ]","NULL"));
		// Prepare AJAX Send Data
		var $reqData = {
			"uuid": $UUID,
			"agency_id": $('#agency').val().split("aID_")[1]
		}
		// AJAX Call and JSON Response
		$.ajax({
			url: "./api/routes",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify($reqData),
			dataType: "json",
			success: function($data) {
				// Save Routes Data and Enable Routes Fields
				$RoutesData = $data;
				$("#route").prop("disabled", false);
				$("#datetime").children().prop("disabled", false);
				$("#create-map").prop("disabled", false);

				// Clear Date/Time Selector Data
				$("#datetime").data("DateTimePicker").defaultDate(false);
				$("#datetime").data("DateTimePicker").minDate(false);
				$("#datetime").data("DateTimePicker").maxDate(false);

				// Load Agency Dropdown Data
				var RouteOpt = {}
				for(var $i = 0; $i < $RoutesData["data_count"]; $i++) {
					RouteOpt["rtID_" + $RoutesData["data"][$i]["route_id"]] = $RoutesData["data"][$i]["route_short_name"] + " " + $RoutesData["data"][$i]["route_long_name"];
				}
				$.each(RouteOpt, function(val, text) {
				    $("#route").append(new Option(text,val));
				});

				// Load Agency Info Output
				$AgencyInfo = $RoutesData["agency_info"]["name"] + "<br />";
				$AgencyInfo += "<a href='" + $RoutesData["agency_info"]["url"] + "' target='_blank'>";
				$AgencyInfo += $RoutesData["agency_info"]["url"] + "</a>";
				$("#agency-out").html($AgencyInfo);

				// Load Calendar Info Output
				$CalendarInfo = ISOtoLongDate($RoutesData["calendar_dates"]["start"].toString()) + "<br />";
				$CalendarInfo += "to<br />";
				$CalendarInfo += ISOtoLongDate($RoutesData["calendar_dates"]["end"].toString()) + "<br />";
				$("#calendar-out").html($CalendarInfo);

				// Set Date/Time Selector Min/Max/Default Values
				$("#datetime").data("DateTimePicker").defaultDate(new Date(ISOtoLongDate($RoutesData["calendar_dates"]["start"].toString()) + " 00:00"));
				$("#datetime").data("DateTimePicker").minDate(new Date(ISOtoLongDate($RoutesData["calendar_dates"]["start"].toString()) + " 00:00"));
				$("#datetime").data("DateTimePicker").maxDate(new Date(ISOtoLongDate($RoutesData["calendar_dates"]["end"].toString()) + " 23:59"));
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
	else { // If no valid agency is selected
		// Disable Routes Dropdown on NULL
		$("#route").prop("disabled", true);
		$("#datetime").children().prop("disabled", true);
		$("#create-map").prop("disabled", true);
		
		// Clear Dropdown List and Add Null Option
		$("#route").empty();
		$("#route").append(new Option("[ Select Route ]","NULL"));

		// Clear Date/Time Selector Data
		$("#datetime").data("DateTimePicker").defaultDate(false);
		$("#datetime").data("DateTimePicker").minDate(false);
		$("#datetime").data("DateTimePicker").maxDate(false);
		$("#rtdatetime").val("");

		// Clear Output Data
		$("#agency-out").html("--");
		$("#calendar-out").html("--");		
	}

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
				$("#testout").html($AgencyPreset["uuid"]);//TEMP OUTPUT

				// Load Agency Dropdown Data
				var AgencyOpt = {}
				for(var $i = 0; $i < $AgencyPreset["data_count"]; $i++) {
					AgencyOpt["aID_" + $AgencyPreset["data"][$i]["timestamp"]] = $AgencyPreset["data"][$i]["agency_name"];
				}
				$.each(AgencyOpt, function(val, text) {
				    $("#agency").append(new Option(text,val));
				});
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
		alert("ERROR: User preloaded agencies unavailable!! Please try again later.")
	}

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

// Function to Convert ISO Date String to Long Date Format
function ISOtoLongDate($isostr) {
	// Check for ISO String Format
	if($isostr.length == 8 || $isostr.length == 10) {
		if($isostr.length == 8) {
			$isostr = insertStr(insertStr($isostr, 6, "-"), 4, "-");
		}
		// Convert to Long Date Format
		$longdate = new Date($isostr + " 00:00");
		return $longdate.toDateString();
	}
	else {
		return "!ERROR";
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

// Function to Insert Into String
function insertStr(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
}


// ##########################################################################################################
// MAIN PROGRAM
// ##########################################################################################################

// When HTML Document Loaded, Add Event Listeners Here
$(document).ready(function() {
	// Event Handler to Create Map from Route Data
	$("#create-map").on("click", function (e) {
		createTripMap();
	});	

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

// Global functions to show/hide spinner on ajax requests
$(document).ajaxStart(function() {
   $("<div id='spinner_center' style='position:fixed;top:70px;left:49%;'>&nbsp;</div>").appendTo("body");
   spinner.spin($("#spinner_center")[0]);
   ajax_cnt++;
});
$(document).ajaxStop(function() {
   ajax_cnt--;
   if (ajax_cnt <= 0) {
      spinner.stop();
      $("#spinner_center").remove();
      ajax_cnt = 0;
   }
});

// Event Handler on Transit Agency Change, Load Transit Routes
$("#agency").change(function() {
	loadRoutes();
});

// Initialize Route Date/Time Picker
$("#datetime").datetimepicker({
	format: "ddd MMM DD YYYY, HH:mm"
	//defaultDate: new Date("2015-07-01"),
	//minDate: new Date("2015-07-01 00:00"),
	//maxDate: new Date("2015-07-31 23:59")
});
$("#datetime").children().prop("disabled", true);

// Initialize Google Maps DOM on Page Load
google.maps.event.addDomListener(window, 'load', initMap());

// Create and/or Verify Unique User ID on Client Side
createUUID();


// ##########################################################################################################
// END OF SCRIPT
// ##########################################################################################################