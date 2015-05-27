var map;
function initialize() {
	var mapOptions = {
	    zoom: 12,
	    center: new google.maps.LatLng(43.809785, -79.454099)
		};

	map = new google.maps.Map(document.getElementById('gmap'), mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);