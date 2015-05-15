var modelData = {
  title: "Neighborhood MAP!",
  markerListTitle: ko.observable(""),
  markerListTitleText: "Markers On The Map:",
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
  this.markerListArray2 = ko.observableArray();
  this.filter = ko.observable();
  this.wikiHeader = ko.observable("<h3>Relavent Wikipedia Articles:</h3>");
  this.wikiLinksHtml = ko.observable();
  
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
    self.locMarkerClear();
    self.articles(address);
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
          modelData.markerListTitle(modelData.markerListTitleText);
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
    modelData.markerListTitle("");
  };

  this.articles = function(searchData) {
    //Wikipedia API
    var wikiArticles = "http://en.wikipedia.org/w/api.php?format=json&action=opensearch&search=" + searchData + "&callback=wikiCallback";
    //var $wikiElem = $('#wikipedia-links');
    //var $wikiHeaderElem = $('#wikipedia-header');
    console.log(wikiArticles);
    $.ajax({
      url: wikiArticles, 
      dataType: "jsonp",
      success: function( data ) {
        console.log(data);
        console.log(data[1]);
        console.log(data[2]);
        var wikiItems = [];
        var paritems = [];
        var webLinkWiki = "";
        var wikiPageId = [];
        var firstParagraph = "";
        var wikiArray = {
          link: [],
          paragraph: []
        };

        console.log(data[1].length);
        if (data[1].length !== 0) {
          self.wikiHeader('<h3>Wikipedia Articles About ' + searchData + ':</h3>');
          //$wikiHeaderElem.text('Wikipedia Articles About ' + searchData + ':');
        } else{ 
          self.wikiHeader('<h3>Sorry, there are no Wikipedia Articles About ' + searchData + '...</h3>');
          //$wikiHeaderElem.text('Sorry, there are no Wikipedia Articles About ' + searchData + '...');
        };
        //$wikiElem.replaceWith('<ul id="wikipedia-links"></ul>');
        //$('<ul id="wikipedia-links"></ul>').replaceAll($wikiElem);
        //$wikiElem = $('#wikipedia-links');
        self.wikiLinksHtml('<ul id="wikipedia-links"></ul>');

        $.each( data[1], function( key, val ) {
          console.log(val);
          console.log(key);
          wikiArray.link.push( "<a href='http://en.wikipedia.org/wiki/" + val + "'>" + val + "</a>" );
        });

        $.each( data[2], function( key, val ) {
          console.log(val);
          console.log(key);
          if (val === "") {
            wikiArray.paragraph.push("<p>No description available...</p>");
          } else {
            wikiArray.paragraph.push("<p>" + val + "</p>");
          };
        });

        for (var i = 0; i < wikiArray.link.length; i++) {
          wikiItems.push( "<li>" + wikiArray.link[i] + wikiArray.paragraph[i] + "</li>" );
        };
        
        self.wikiLinksHtml('<ul id="wikipedia-links"><br>' + wikiItems + '</ul>');
        //$wikiElem.append();
        //$wikiElem.append(wikiItems);
      }
    })
      .error(function() {
        self.wikiHeader('<h3>Wikipedia Articles About:</h3>');
        //$wikiHeaderElem.text('***Error Loading Wikipedia Articles***');
        //$('<ul id="wikipedia-links"></ul>').replaceAll($wikiElem);
        //$wikiElem = $('#wikipedia-links');
        self.wikiLinksHtml('<ul id="wikipedia-links"></ul>');
    });

  };
};



$(function() {
    ko.applyBindings(new viewModel());

});

