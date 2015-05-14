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
    modelData.address = address;
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
    self.articles();
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
      //self.infoWindowAppear(index, place, marker);
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  };

  //filter the items using the filter text
  this.filteredItems = ko.computed(function() {
      if (self.markerListArray2().length > 0) {
        if (!self.filter()) {
          for (var i = 0; i < self.markerListArray2().length; i++) {
            if (self.markerListArray2()[i].marker !== undefined) {
              self.markerListArray2()[i].marker.setMap(map);
            };
          };
          return self.markerListArray2();
        } else {
          var temp = [];
          
          for (var i = 0; i < self.markerListArray2().length; i++) {
            if (self.markerListArray2()[i].name.toLowerCase().search(self.filter().toLowerCase()) !== -1) {
              temp.push(self.markerListArray2()[i]);
              self.markerListArray2()[i].marker.setMap(map);
            } else {
              self.markerListArray2()[i].marker.setMap(null);
            };
          };

          return temp;
        };
      };
  }, this);

  this.infoWindowAppear = function(listIndex, data) {
   

    infowindow.setContent(data.name);
    infowindow.open(map, data.marker);
  };


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

  this.articles = function() {
    //NYT API
    var nytArticles = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q="'+ modelData.address + '"&fq=glocations:("' + modelData.address + '")&sort=newest&api-key=d07b5097c616edd54dcb346b315766fd:14:71646048';
    console.log(nytArticles);
    $.getJSON( nytArticles, function( data ) {

      var items = [];
      var webLinkTitle = "";
      var firstParagraph = "";
      var $nytHeaderElem = $('#nytimes-header');
      var $nytElem = $('#nytimes-articles');

      $nytHeaderElem.text('New York Times Articles About ' + modelData.address + ':');

      $.each( data.response.docs, function( key, val ) {
        webLinkTitle = "<a href='" + val.web_url + "'>" + val.headline.main + "</a>";
        if (val.snippet === null) {
          firstParagraph = "<p></p>";
        } else {
          firstParagraph = "<p>" + val.snippet + "</p>";
        };
        items.push( "<li class='article'>" + webLinkTitle + firstParagraph + "</li>" );
        //items.push( "<ul id='" + key + "'>" + val.headline.main + "</ul>" );
      });
      //console.log(data.response);
      $nytElem.append();
      $nytElem.append(items);
      //$( "<ul/>", {
      //  "class": "my-new-list",
      //  html: items.join( "" )
      //}).appendTo( "body" );
    })
      .error(function() {
        $nytHeaderElem.text('Error Loading New York Times Articles');
    });

  };
};


//ko.applyBindings(new ViewModel());
$(function() {
    ko.applyBindings(new viewModel());
});

