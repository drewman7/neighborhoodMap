var modelData = {
  title: "Neighborhood MAP!",
  markerListTitle: ko.observable("No Markers Shown!"),
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
  //this.markerListTitle = modelData.markerListTitle;
  //this.markerListArray = ko.observableArray();
  this.markerListArray2 = ko.observableArray();
  this.filter = ko.observable();
  
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
        console.log(addressGeo);
        var mapOptions = {
          center: results[0].geometry.location,
          zoom: 15
        };
        map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);  

        modelData.map = map;

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
        //self.markerListArray.push(results[i].name);
        self.markerListArray2.push(results[i]);
        self.markerListArray2()[i].marker = modelData.markerList.marker[i];
        console.log(self.markerListArray2()[i].name);
        console.log(self.markerListArray2()[i].marker);
        if (self.markerListArray2().length > 0) {
          modelData.markerListTitle('Marker List:');
        } else {
          modelData.markerListTitle('');
        };
        //console.log(self.markerListArray().length + self.markerListArray()[i]);
        //console.log(self.markerListArray().length);
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
    //self.markerListArray2()[index].marker = marker;

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  };

  //filter the items using the filter text
  this.filteredItems = ko.computed(function() {
      if (self.markerListArray2().length > 0) {
        if (!self.filter()) {
          for (var i = 0; i < self.markerListArray2().length; i++) {
            //console.log(self.markerListArray2()[i].marker);
            console.log(i);
            console.log(self.markerListArray2().length);
            if (self.markerListArray2()[i].marker !== undefined) {
              self.markerListArray2()[i].marker.setMap(map);
            };
            //self.createMarker(self.markerListArray2()[i], i);
            //self.markerListArray2()[i].marker = modelData.markerList.marker[i];
          };
          return self.markerListArray2();
        } else {
          var temp = [];
          
          for (var i = 0; i < self.markerListArray2().length; i++) {
            if (self.markerListArray2()[i].name.toLowerCase().search(self.filter().toLowerCase()) !== -1) {
              temp.push(self.markerListArray2()[i]);
              //console.log(temp[i].marker);
              self.markerListArray2()[i].marker.setMap(map);
              //self.createMarker(self.markerListArray2()[i], i);
              //self.markerListArray2()[i].marker = modelData.markerList.marker[i];
            } else {
              self.markerListArray2()[i].marker.setMap(null);
            };
          };

          return temp;
        };
      };
      //var filter = this.filter().toLowerCase();
      //console.log(self.filter);
      //console.log(!self.filter);
      //if (!self.filter) {
      //    return self.markerListArray2().name;
      //} else {
      //    return ko.utils.arrayFilter(self.markerListArray2().name, function(item) {
      //        return ko.utils.stringStartsWith(item.name().toLowerCase(), self.filter);
      //    });
      //}
  }, this);


  //this.locMarkerClear = function() {
  //  for (var i = 0; i < modelData.markerList.marker.length; i++) {
  //    modelData.markerList.marker[i].setMap(null);
  //    self.markerListArray2.removeAll();
  //    modelData.markerListTitle("No Markers Shown!");
  //  };
  //};
  this.locMarkerClear = function() {
    for (var i = 0; i < self.markerListArray2().length; i++) {
      self.markerListArray2()[i].marker.setMap(null);
    };
    self.markerListArray2.removeAll();
    modelData.markerListTitle("No Markers Shown!");
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

