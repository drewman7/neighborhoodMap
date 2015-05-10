var modelData = {
  title: "Neighborhood MAP!",
  geocoder: {},
  map: {},
  infowindow: {},
  address: "",
  addressGeo: "",
  markerType: "",
  markerList: {
      marker: [],
      info: []
    }
};

//var geocoder;
//var map;

var viewModel = function() {

  var self = this;

  this.pageTitle = ko.observable(modelData.title);
  this.markerListArray = ko.observableArray();
  this.mapInitialize = function() {
    modelData.geocoder = new google.maps.Geocoder();
    var mapOptions = {
      center: { lat: 36.26, lng: -95.147},
      zoom: 3
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
  };
  
  google.maps.event.addDomListener(window, 'load', self.mapInitialize);

  this.codeAddress = function() {
    address = document.getElementById("address").value;
    modelData.geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        //map.setCenter(results[0].geometry.location);
        addressGeo = results[0].geometry.location;
        var mapOptions = {
          center: results[0].geometry.location,
          zoom: 15
        };
        map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);  

        //var marker = new google.maps.Marker({
        //    map: map,
        //    position: results[0].geometry.location,
        //    title: address
        //});
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      };
    });
  };

  this.locMarker = function() {
    markerType = document.getElementById("markerType").value;
    var request = {
      location: addressGeo,
      radius: 300,
      query: markerType
    };
    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, self.callback);
  };

  this.callback = function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      modelData.markerList.info = results;
      //self.markerListArray.push(results);
      for (var i = 0; i < results.length; i++) {
        self.createMarker(results[i], i);
        self.markerListArray.push(results[i].name);
        console.log(self.markerListArray()[i]);
        console.log(self.markerListArray().length);
      };
    };
  };

  this.createMarker = function(place, index) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });

    modelData.markerList.marker[index] = marker;

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  };

  this.locMarkerClear = function() {
    for (var i = 0; i < modelData.markerList.marker.length; i++) {
      modelData.markerList.marker[i].setMap(null);
    };
  };


  this.codeMarker = function() {
    var markerAddress = document.getElementById("markerAddress").value;
    modelData.geocoder.geocode( { 'address': markerAddress}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
            title: markerAddress
        });
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      };
    });
  };
};


//ko.applyBindings(new ViewModel());
$(function() {
    ko.applyBindings(new viewModel());
});

