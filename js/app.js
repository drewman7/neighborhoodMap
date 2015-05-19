var modelData = {
  title: "Neighborhood MAP!",
  markerListTitle: ko.observable("Enter an address to apply markers..."),
  markerListTitleText: "Markers On The Map ... Click marker in list to highlight on map above and find Wikipedia articles:",
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


var viewModel = function() {

  var self = this;

  this.pageTitle = ko.observable(modelData.title);
  this.markerListArray2 = ko.observableArray();
  this.filter = ko.observable();
  this.wikiHeader = ko.observable("<h3>Relavent Wikipedia Articles:</h3>");
  this.wikiLinksHtml = ko.observable('Enter a neighborhood above to find relevant Wikipedia articles!');
  
  this.mapInitialize = function() {
    modelData.geocoder = new google.maps.Geocoder();
    console.log(modelData.geocoder);
    var mapOptions = {
      center: { lat: 36.26, lng: -95.147},
      zoom: 3
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    console.log(map);
  };
  
  google.maps.event.addDomListener(window, 'load', self.mapInitialize);

  this.codeAddress = function() {
    address = document.getElementById("address").value;
    modelData.address = address;
    modelData.geocoder.geocode( { 'address': address}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        addressGeo = results[0].geometry.location;
        console.log(addressGeo);
        var mapOptions = {
          center: results[0].geometry.location,
          zoom: 15
        };
        map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);  

        modelData.map = map;

      } else {
        alert("Geocode was not successful for the following reason: " + status);
      };
    });
    self.locMarkerClear();
    self.articles(address);
  };

  this.locMarker = function() {
    if (modelData.address !== "") {
      markerType = document.getElementById("markerType").value;
      var request = {
        location: addressGeo,
        radius: 300,
        query: markerType
      };
      infowindow = new google.maps.InfoWindow();
      var service = new google.maps.places.PlacesService(map);
      service.textSearch(request, self.callback);
    } else {
      modelData.markerListTitle('Cannot find markers without a neighborhood!');
    };
  };

  this.callback = function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      modelData.markerList.info = results;
      for (var i = 0; i < results.length; i++) {
        
        self.createMarker(results[i], i);
        self.markerListArray2.push(results[i]);
        var markerIndex = self.markerListArray2().length - 1;
        self.markerListArray2()[markerIndex].marker = modelData.markerList.marker[i];
        if (self.markerListArray2().length > 0) {
          modelData.markerListTitle(modelData.markerListTitleText);
        } else {
          modelData.markerListTitle('No markers to display...');
        };
      };
    } else {
        alert("Places Service was not successful for the following reason: " + status);
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

          if (temp.length > 0) {
            modelData.markerListTitle(modelData.markerListTitleText);
          } else {
            modelData.markerListTitle('');
          };

          return temp;
        };
      };
  }, this);

  this.infoWindowAppear = function(listIndex, data) {
    infowindow.setContent(data.name);
    infowindow.open(map, data.marker);
    self.articles(data.name);
  };


  this.locMarkerClear = function() {
    for (var i = 0; i < self.markerListArray2().length; i++) {
      self.markerListArray2()[i].marker.setMap(null);
    };
    self.markerListArray2.removeAll();
    modelData.markerListTitle('No markers to display...');
  };

  this.articles = function(searchData) {
    //Wikipedia API
    var searchDataArray = searchData.split('&');
    if (searchDataArray.length > 1) {
      searchData = "";
      for (var i = 0; i < searchDataArray.length; i++) {
        searchData = searchData + searchDataArray[i];
      };
    };

    var wikiArticles = "http://en.wikipedia.org/w/api.php?format=json&action=opensearch&search=" + searchData + "&callback=wikiCallback";
    console.log(wikiArticles);
    $.ajax({
      url: wikiArticles, 
      dataType: "jsonp",
      success: function( data ) {
        //var wikiItems = [];
        var wikiItems = "";
        var webLinkWiki = "";
        var firstParagraph = "";
        var wikiArray = {
          link: [],
          paragraph: []
        };

        if (data[1].length !== 0) {
          self.wikiHeader('<h4>Wikipedia Articles About ' + searchData + ':</h4>');
        } else{ 
          self.wikiHeader('<h4>Sorry, there are no Wikipedia Articles About ' + searchData + '...</h4>');
        };
        self.wikiLinksHtml('<ul id="wikipedia-links"></ul>');

        $.each( data[1], function( key, val ) {
          wikiArray.link.push( "<a href='http://en.wikipedia.org/wiki/" + val + "'>" + val + "</a>" );
        });

        $.each( data[2], function( key, val ) {
          if (val === "") {
            wikiArray.paragraph.push("<p>No description available...</p>");
          } else {
            wikiArray.paragraph.push("<p>" + val + "</p>");
          };
        });

        var tempString = "";
        var tempWikiItems = "";
        for (var i = 0; i < wikiArray.link.length; i++) {
          //wikiItems.push( '<li>' + wikiArray.link[i] + wikiArray.paragraph[i] + '</li>' );
          tempString = '<li>' + wikiArray.link[i] + wikiArray.paragraph[i] + '</li>';
          tempWikiItems = wikiItems;
          console.log(tempString);
          wikiItems.concat(tempWikiItems, tempString );
          console.log(wikiItems);
        };
        
        self.wikiLinksHtml('<ul id="wikipedia-links">' + wikiItems + '</ul>');
        console.log(wikiItems);
      }
    })
      .error(function() {
        self.wikiHeader('<h3>Wikipedia Articles About:</h3>');
        self.wikiLinksHtml('<ul id="wikipedia-links"></ul>');
    });

  };
};



$(function() {
    ko.applyBindings(new viewModel());
});

