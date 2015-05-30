// Initialize Variables
var map = null;		// Google Map Variable
var listClk = null;	// ID on List Click



// On Page Load, Initialize Below
function initialize() {
	
	// Create New Google Maps Object
	var mapOptions = {
	    zoom: 12,
	    center: new google.maps.LatLng(43.809785, -79.454099)
		};
	map = new google.maps.Map($('#gmap')[0], mapOptions);

	// Event Handler to Load Selected Agency on Click
	$('#load-agency').on('click', function (e) {
		$('#load-agency').prop('disabled', true);
		$('#mAgency').modal('hide');
	    alert(listClk);
	})

	// Event Handler to Select Agency on Click
	$('#select-agency').on('click', function (e) {

		//your awesome code here
	    //alert("The paragraph was clicked.");
	    $("#mAgency").modal('show');
	})



}


function clearAgency() {
	listClk = null;
	$('#load-agency').prop('disabled', true);
	$('#mAgency').modal('hide');
	
}

// Function to Handle List Clicks
function listClick(listID) {
	listClk = listID
	$('#load-agency').prop('disabled', false);

	// Need to add detail to change selection color
}

/*
function myPopup() {
	alert( "xyz" );
}

for(var i = 0; i < listitem.length; i++) listitem[i].onclick = myPopup;
*/


google.maps.event.addDomListener(window, 'load', initialize);


/*
var $lba= document.getElementsByClassName('login-button-arrow');

function myPopup(){
  alert( "xyz" );
}

for(var i=0; i<$lba.length; i++) $lba[i].onclick = myPopup;*/