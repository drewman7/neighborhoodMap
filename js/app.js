var geocoder;

var pageModel = function(){
    this.pageTitle = ko.observable("Neighborhood MAP!");
};

var viewModel = function() {

  var self = this;

  //new pageModel();
  ko.applyBindings(new pageModel());
  
  this.pageModel.pageTitle("Neighborhood MAP!");

  this.mapInitialize = function() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
      center: { lat: 36.26, lng: -95.147},
      zoom: 1
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


//ko.applyBindings(new ViewModel());
$(function() {

    ko.applyBindings(new viewModel());
});

