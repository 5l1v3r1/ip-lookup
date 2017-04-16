var map;

var errorInterval;
var errorShown = false;

$(document).ready(function() {

	// Enter was pressed on input
	$('#ip').keydown(function(event) {
		if (event.keyCode == 13) {
			lookUp();
			return false;
		}
	});

	// Enter own IP at start
	checkSelf();

});

// Check their own IP
function checkSelf() {
	var apiUrl = 'http://ipinfo.io/json';
	$.getJSON(apiUrl,
	function(json) {
		console.log(json['ip']);
		$('#ip').val(json['ip']);
		lookUp();
	});
}

// Look up IP
function lookUp() {
	var ip = $('#ip').val();

	if(isValidIp(ip)) {
		var apiUrl = 'https://ipinfo.io/'+ ip +'/json';

		$.getJSON(apiUrl,
		function(json) {
			var coords = json['loc'].split(',');
			createMarker(parseFloat(coords[0]), parseFloat(coords[1]), json['ip'], json['hostname'], json['city'], json['region'], json['country'], json['org']);
		});
	}
	else showError('Enter a valid IP address.');
}

// Display an error
function showError(error) {
	if(!errorShown)
	{
		$('#error').html(error);
		$('#error').slideDown(200);
		errorShown = true;

		errorInterval = setInterval(function(){
			$('#error').slideUp(200);
			errorShown = false;
			clearInterval(errorInterval);
		}, 1000);
	}
}

// Is valid IP
function isValidIp(ipaddress)   
{  
	if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) return (true)  
	else return (false)  
}  

// Initialize map
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 0,
			lng: 0
		},
		zoom: 3,
		zoomControl: true,
		mapTypeControl: true,
		scaleControl: false,
		streetViewControl: false,
		rotateControl: false,
		fullscreenControl: false,
		mapTypeId: 'satellite'
	});

	// Remove all bus stops, businesses, POI etc
	var removeDefaults = [
	{
		featureType: "transit.station.bus",
		stylers: [
			{ visibility: "off" }
		]  
	},
	{
		featureType: "poi",
		stylers: [
			{ visibility: "off" }
		]  
	}
	];
	map.setOptions({styles: removeDefaults});
}

// Create marker
function createMarker(lat, long, markerip, hostname, city, region, country, org) {
	var newMarker = new google.maps.Marker({
		position: {lat: lat, lng: long},
		map: map,
		title: hostname
	});

	var infowindow = new google.maps.InfoWindow({
		content: '<h1>' + hostname + '</h1>' + '<br>' +
		'<b>IP:</b> ' + markerip + '<br>' +
		'<b>Hostname:</b> ' + hostname + '<br>' +
		'<b>City:</b> ' + city + '<br>' +
		'<b>Region:</b> ' + region + '<br>' +
		'<b>Country:</b> ' + country + '<br>' +
		'<b>ORG:</b> ' + org + '<br>' +
		'<a target="_blank" href="https://ipinfo.io/" style="font-size: 10px">Provided by IPInfo</a>'
	});

	// Add the click event listener
	newMarker.addListener('click', function(){
		infowindow.open(map, newMarker);
	});
	infowindow.open(map, newMarker);

	// Pan to marker
	var laLatLng = new google.maps.LatLng(lat, long);
	map.panTo(laLatLng);
	map.setZoom(17);
}