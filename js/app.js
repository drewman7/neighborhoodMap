var geocoder;


var mapView = function() {

  var self = this;

  this.mapInitialize = function() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
      center: { lat: -34.397, lng: 150.644},
      zoom: 6
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
  };
  
  google.maps.event.addDomListener(window, 'load', self.mapInitialize);

  this.codeAddress = function() {
    var address = document.getElementById("address").value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        //map.setCenter(results[0].geometry.location);
        var mapOptions = {
          center: results[0].geometry.location,
          zoom: 8
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);           
        //var marker = new google.maps.Marker({
        //    map: map,
        //    position: results[0].geometry.location
        //});
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  };
};

var ViewModel = function() {
  mapView();
};

ko.applyBindings(new ViewModel());