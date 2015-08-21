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

// Map Object Variables
var $map = null; // Google Map Variable
var $mapStyles = [
	{
		"featureType": "administrative.land_parcel",
		"elementType": "all",
		"stylers": [
			{"visibility": "off"}
		]
	},{
		"featureType": "landscape.man_made",
		"elementType": "all",
		"stylers": [
			{"visibility": "off"}
		]
	},{
		"featureType": "poi",
		"elementType": "labels",
		"stylers": [
			{"visibility": "off"}
		]
	},{
		"featureType": "road",
		"elementType": "labels",
		"stylers": [
			{"visibility": "simplified"},
			{"lightness": 20}
		]
	},{
		"featureType": "road.highway",
		"elementType": "geometry",
		"stylers": [
			{"hue": "#f49935"}
		]
	},{
		"featureType": "road.highway",
		"elementType": "labels",
		"stylers": [
			{"visibility": "simplified"}
		]
	},{
		"featureType": "road.arterial",
		"elementType": "geometry",
		"stylers": [
			{"hue": "#fad959"}
		]
	},{
		"featureType": "road.arterial", 
		"elementType": "labels",
		"stylers": [
			{"visibility": "off"}
		]
	},{
		"featureType": "road.local",
		"elementType": "geometry",
		"stylers": [
			{"visibility": "simplified"}
		]
	},{
		"featureType": "road.local",
		"elementType": "labels",
		"stylers": [
			{"visibility": "simplified"}
		]
	},{
		"featureType": "transit",
		"elementType": "all",
		"stylers": [
			{"visibility": "off"}
		]
	},{
		"featureType": "water",
		"elementType": "all",
		"stylers": [
			{"hue":"#a1cdfc"},
			{"saturation":30},
			{"lightness":49}
		]
	}
];
var $mapOptions = { // Map Options Variables
	zoom: 5,
	center: new google.maps.LatLng(49.895529, -97.138449),
	styles: $mapStyles,
	mapTypeControl: false,
};
var $MapBounds = { // Map Bounds Coordinates
	upLat: null,
	loLat: null,
	ltLng: null,
	rtLng: null
};
var $ehMapIdle = null; // Google Map Idle Event Handler Object
var $bsZoom = 17; // Threshold zoom level to show bus stop locations
var $BusStops = null; // JSON Object for Bus Stops Data
google.setOnLoadCallback(initMap); // Asynchronous Call Back to Initialize Map

// GTFS Data Variables
var $AgencyData = null; // JSON Object for Agency Feed Data
var $SelAgency = null; // Selected Transit Agency ID
var $GTFS_API = "http://www.gtfs-data-exchange.com/api/agencies"; // GTFS Exchange API Data
var $GTFS_ZIP = new RegExp(/\.(zip$)/); // GTFS ZIP File Regular Expression
var $ZipType = null; // ZIP Radio - URL or File

// Loaded Agency Variables
var $AgencyPreset = null; // JSON Object for User Agency Preset Data
var $RoutesData = null;	// JSON Object for Agency Route Data
var $TripData = null; // JSON Object for Route Trip Data

// GUI Variables
var $diaName = null; // Name of Dialogue Window Open
var $UUID = null; // Client Side Unique User ID
var $TimeOffset = new Date().getTimezoneOffset(); // Timezone Offset in Minutes

// Google Maps Polyline Options
var $polyline = null; // Polyline Object Initialization
var $polypts = []; // Array to hold polyline points
var $polyopts = { // Options for polyline styling
	geodesic: true,
	strokeColor: "#0000ff",
	strokeOpacity: 1.0,
	strokeWeight: 3
};
var $bounds = null; // Map Bounds Object Initialization

// Google Maps Marker References
var $sMarker = null; // Start Marker Object Initialization
var $eMarker = null; // End Marker Object Initialization
var $gmMarkers = { // Google Map Marker References
	green: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
	red: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
	blue: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
	yellow: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
};
var $bsMarkers = []; // Bus Stop Markers Object Initialization
var $bsInfoWindow = null; // Bus Stop Marker Info Window Initialization

// AJAX Loading 'spin.js' Variables
var $SpinOpts = { // Set Spin Options
   lines: 13, // The number of lines to draw
   length: 7, // The length of each line
   width: 5, // The line thickness
   radius: 12, // The radius of the inner circle
   rotate: 0, // The rotation offset
   color: "#efefef", // #rgb or #rrggbb
   speed: 0.75, // Rounds per second
   trail: 50, // Afterglow percentage
   shadow: true, // Whether to render a shadow
   hwaccel: false, // Whether to use hardware acceleration
   className: "spinner", // The CSS class to assign to the spinner
   zIndex: 2000000000, // The z-index (defaults to 2000000000)
   top: "auto", // Top position relative to parent in px
   left: "auto" // Left position relative to parent in px
};
var $spinner = new Spinner($SpinOpts); // Spinner Object Initialize
var $ajax_cnt = 0; // Support for parallel AJAX requests
 

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

				// Validate Returned JSON Data
				var $tdMsg = valTripData($TripData);
				if($tdMsg == "success") {
					// Clear existing polyline
					if($polyline) {
						$polyline.setMap(null); // Remove polyline
						$sMarker.setMap(null); // Remove start marker
						$eMarker.setMap(null); // Remove end marker
					}
					$polypts = [];
					// Set Bounds Object
					$bounds = new google.maps.LatLngBounds();
					// Define Polyline Shape Sequence
					for(var $i =0; $i < $TripData["shape_sequence"].length; $i++) {
						// Create Lat/Lon Point Object
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
						map: $map,
						strokeColor: $polyopts["strokeColor"],
						geodesic: $polyopts["geodesic"],
						strokeOpacity: $polyopts["strokeOpacity"],
						strokeWeight: $polyopts["strokeWeight"]
					});
					$polyline.setMap($map);
					$map.fitBounds($bounds);

					// Set new start and end markers
					$sPoint = $polypts[0]; // Set Start Point of Polyline
					$sMarker = new google.maps.Marker({
						position: $sPoint,
						map: $map,
						icon: $gmMarkers["green"]
					});
					$ePoint = $polypts[$polypts.length - 1]; // Set End Point of Polyline
					$eMarker = new google.maps.Marker({
						position: $ePoint,
						map: $map,
						icon: $gmMarkers["red"]
					});

					// Set Route Information for Trip
					$rtOutput = "";
					$rtOutput += "Route ID: <i>" + $TripData["route_id"] + "</i><br />";
					$rtOutput += "Service ID: <i>" + $TripData["service_id"] + "</i><br />";
					$rtOutput += "Trip ID: <i>" + $TripData["trip_id"] + "</i><br />";
					$rtOutput += "Shape ID: <i>" + $TripData["shape_id"] + "</i><br />";
					$rtOutput += "Start Time: <i>" + $TripData["stop_sequence"][0]["departure_time"] + "</i><br />";
					$rtOutput += "End Time: <i>" + $TripData["stop_sequence"][$TripData["stop_sequence"].length - 1]["arrival_time"] + "</i><br />";
					$("#route-out").html($rtOutput);
				}
				else {
					alert($tdMsg); // Development - Handle through Bootstrap in production
				}


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

// Function to Control Map Click Event Handler
function ehMapClick() {
	// Check that map meets zoom threshold
	if($map.getZoom() >= $bsZoom) {
		// Get Current Map Bounds
		var $curBounds = $map.getBounds();
		// Save Map Bound Coordinates
		scMapBndCoord("set", $curBounds);
		var $reqData = {
			"uuid": $UUID,
			"agency_id": $('#agency').val().split("aID_")[1],
			"bounds": $MapBounds
		}
		// AJAX Call and JSON Response
		$.ajax({
			url: "./api/stops",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify($reqData),
			dataType: "json",
			success: function($data) {
				// Save Global JSON Data
				var $prevBusStops = $BusStops;
				$BusStops = $data;
				getBusStopInfo(); // Function call to supplement data - '$BusStops' global variable modified
				$modstops = sortBusStops($prevBusStops, $BusStops);
				$addBusStops = $modstops[0];
				$remBusStops = $modstops[1];
				//console.log($addBusStops);
				//console.log($remBusStops);


				//// NEED TO ADD FOR NEW LOCATIONS AND REMOVE OLD, function to sort add and removeal stops

				
				// If Stops present, map to current bounds
				if($BusStops["stops"].length > 0) {
					// Clear existing bus stop points
				    for (var $i in $bsMarkers) {
				    	//// ADD IF STATEMENTS HERE TO REMOVE ONLY IF NOT IN NEW LIST
				    	$bsMarkers[$i]["marker"].setMap(null);
				    }
				    $bsMarkers = [];
				    // Define Marker Info Window Object Placeholder
				    $bsInfoWindow = new google.maps.InfoWindow({
						content: "Loading..."
					});
					// Loop through and plot stop points
					for(var $i = 0; $i < $BusStops["stops"].length; $i++) {
						// Check if on current trip route
						if($BusStops["stops"][$i]["on_trip"]) $mcolor = "blue"; // Blue for route stops
						else $mcolor = "yellow"; // Yellow for other stops
						// Map Current Bus Stop Lat/Lng Object
						var $bspt = new google.maps.LatLng(
							$BusStops["stops"][$i]["stop_lat"],
							$BusStops["stops"][$i]["stop_lon"]
							);				
						var $bsmarker = new google.maps.Marker({
							position: $bspt,
							map: $map,
							icon: $gmMarkers[$mcolor],
							html: makeBusStopHTML($BusStops["stops"][$i])
						});
						// Add event listener for marker click
      					google.maps.event.addListener($bsmarker, "click", function() {
							$bsInfoWindow.setContent(this.html);
							$bsInfoWindow.open($map, this);
  						});
						$bsMarkers.push({"id": $BusStops["stops"][$i]["stop_id"], "marker": $bsmarker});
					}
				}
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
		// Clear existing bus stop points
		$BusStops = null;
		for (var $i in $bsMarkers) {
			$bsMarkers[$i]["marker"].setMap(null);
		}
		$bsMarkers = [];
	}

	return;
}

// Function to Initialize Google Map
function initMap() {
	// Create New Google Maps Object
	$map = new google.maps.Map($('#gmap')[0], $mapOptions);
	
	google.maps.event.addListener($map, "idle", ehMapClick);

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

// Function to Supplement Bus Stop Data
function getBusStopInfo() {
	// For each bus stop
	for (var $i in $BusStops["stops"]) {
		$found = false;
		for (var $j in $TripData["stop_sequence"]) {
			if(!$found) {
				// If bus stop on current route, supplement data from trip data
				if($BusStops["stops"][$i]["stop_id"] == $TripData["stop_sequence"][$j]["stop_id"]) {
					$found = true;
					$BusStops["stops"][$i]["on_trip"] = true;
					$BusStops["stops"][$i]["arrival_time"] = $TripData["stop_sequence"][$j]["arrival_time"];
					$BusStops["stops"][$i]["departure_time"] = $TripData["stop_sequence"][$j]["departure_time"];
				}
				else { // When bus stop not within trip route
					$BusStops["stops"][$i]["on_trip"] = false;
					$BusStops["stops"][$i]["arrival_time"] = "";
					$BusStops["stops"][$i]["departure_time"] = "";
				}
			}
		}
	}
	return;
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

// Function to Make Bus Stop HTML for Marker Info Windows
function makeBusStopHTML($bsdata) {
	if($bsdata["on_trip"]) {
		var $bsHTML = "<div class='gmapinfo'>" +
			"<b>" + $bsdata["stop_name"] + "</b><br />" +
			"Stop ID: <i>" + $bsdata["stop_id"] + "</i><br />" +
			"Arrival: <i>" + $bsdata["arrival_time"] + "</i><br />" +
			"Departure: <i>" + $bsdata["departure_time"] + "</i><br />" +
			"</div>";		
	}
	else {
		var $bsHTML = "<div class='gmapinfo'>" +
			"<b>" + $bsdata["stop_name"] + "</b><br />" +
			"Stop ID: " + $bsdata["stop_id"] + "<br />" +
			"</div>";		
	}
	return $bsHTML;
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
	return;
}

// Function to Set or Clear Map Bound Coordinates
function scMapBndCoord($scsave, $mbounds) {
	var $NE = $mbounds.getNorthEast();
	var $SW = $mbounds.getSouthWest();
	if($scsave == "set") {
		$MapBounds["upLat"] = $NE.lat();
		$MapBounds["loLat"] = $SW.lat();
		$MapBounds["ltLng"] = $SW.lng();
		$MapBounds["rtLng"] = $NE.lng();
	}
	else {
		$MapBounds["upLat"] = null;
		$MapBounds["loLat"] = null;
		$MapBounds["ltLng"] = null;
		$MapBounds["rtLng"] = null;
	}

	return;
}

// Function to Sort Previous and Current Bus Stops
function sortBusStops($prevbs, $currbs) {
	// Initialize add and remove lists
	var $addbs = [];
	var $rembs = [];
	// Check for first condition
	if($prevbs != null) {
		// Look for added bus stop location data
		for(var $i in $currbs["stops"]) {
			var $found = false;
			for(var $j in $prevbs["stops"]) {
				if($currbs["stops"][$i]["stop_id"] == $prevbs["stops"][$j]["stop_id"]) $found = true;
			}
			if(!$found) $addbs.push($currbs["stops"][$i]);
		}
		// Look for removed bus stop location data
		for(var $i in $prevbs["stops"]) {
			var $found = false;
			for(var $j in $currbs["stops"]) {
				if($prevbs["stops"][$i]["stop_id"] == $currbs["stops"][$j]["stop_id"]) $found = true;
			}
			if(!$found) $rembs.push($prevbs["stops"][$i]);
		}	
	}
	else $addbs = $currbs["stops"]; // On first condition
	return [$addbs, $rembs];
}

// Functions to Validate Trip Data
function valTripData($tdata) {
	if($tdata["service_id"] == []) {
		return "ERROR: Service ID failed to resolve for selected date and time!!";
	}
	if($tdata["trip_id"] == []) {
		return "ERROR: Initial Trip ID failed to resolve for selected date and time!!";
	}
	if($tdata["trip_id"] == -1 || $tdata["stop_sequence"] == []) {
		return "ERROR: Final Trip ID and/or Stop Sequence failed to resolve for selected date and time!!";
	}
	if($tdata["shape_id"] == -1 || $tdata["service_id"] == -1) {
		return "ERROR: Shape ID and/or Service ID failed to resolve for selected date and time!!";
	}
	if($tdata["shape_sequence"] == []) {
		return "ERROR: Shape Sequence failed to resolve for selected date and time!!";
	}

	return "success";
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
	// Procedures to call with AJAX Start
	$(document).ajaxStart(function() {
		// Start Spinner Object
		$("<div id='spinner_center' style='position:fixed;top:200px;left:49%;'>&nbsp;</div>").appendTo("body");
		$spinner.spin($("#spinner_center")[0]);
		$ajax_cnt++;
	});

	// Procedures to call with AJAX Stop
	$(document).ajaxStop(function() {
		// Stop Spinner Object
		$ajax_cnt--;
		if ($ajax_cnt <= 0) {
			$spinner.stop();
			$("#spinner_center").remove();
			$ajax_cnt = 0;
		}
	});


	/* INITIALIZE ON DOCUMENT READY */

	// Initialize Route Date/Time Picker
	$("#datetime").datetimepicker({
		format: "ddd MMM DD YYYY, HH:mm"
		//defaultDate: new Date("2015-07-01"),
		//minDate: new Date("2015-07-01 00:00"),
		//maxDate: new Date("2015-07-31 23:59")
	});
	$("#datetime").children().prop("disabled", true);

	// Event Handler to Load Transit Routes on Transit Agency Change
	$("#agency").change(function() {
		loadRoutes();
	});


	/* EVENT HANDLERS */

	// Event Handler to Create Map from Route Data
	$("#create-map").on("click", function() {
		createTripMap();
	});
	// Event Handler to Manage Clicks and Double Clicks on Google Map
	/*$("#gmap").on("click", function() {
		ehMapClick();
	});	
	$("#gmap").on("dblclick", function() {
		ehMapClick();
	});	*/
	// Event Handler to Load Selected Agency ZIP on Click
	$("#load-agency").on("click", function() {
		loadAgency();
	});
	// Event Handler to Select Feed Agency on Click
	$("#select-feed").on("click", function() {
		selectFeed();
	});
	// Event Handler to Select Upload Method on Click
	$("#select-zip").on("click", function() {
		selectZIP();
	});
	// Event Handler to Upload ZIP from URL or File
	$("#upload-ZIP").on("click", function() {
		uploadZIP();
	});



	// TEMP FOR TESTING
	$("#remuuid").on("click", function() {
		removeUUID();
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

// Determine ZIP Radio Button Value and Call Function //// CONSIDER MOVING INTO DOC READY
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

// Create and/or Verify Unique User ID on Client Side
createUUID(); //// TEMP - CONSIDER MOVING INTO DOCUMENT READY FOR PRODUCTION


// ##########################################################################################################
// END OF SCRIPT
// ##########################################################################################################