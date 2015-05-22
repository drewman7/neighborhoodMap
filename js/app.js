// Javascript file for the Neighborhood Map App
//
// The overall concept of this app is to allow the user to specify an address
// (i.e. a neighborhood).  This will cause a google map lookup and a wikipedia
// article lookup.  The user can then indicate locations/markers to be shown
// on the map (ex. pizza).  This will cause a google map marker lookup and
// create a list of the markers.  The user can filter the list by typing in
// the filter input box.  The app will remove items that do not match the filter
// on the fly.  Finally, the user can click on one of the markers in the list
// to highlight it on the map and initiate a wikipedia article lookup.
//
// The following Javascript is built using the knockout.js methodology
// The app consists of a model (modelData) and a ViewModel (viewModel).
// The 'view' of the methdology is the html DOM.

// modelData contains the global base variables for the web application
var modelData = {
  title: "Neighborhood MAP!",         // Title variable for the entire app; placed in the header 
  markerListTitle: ko.observable("Enter an address to apply markers..."),   // Title knockoutjs 
                                      // variable for the marker list section
  markerListTitleText: "Markers On The Map ... Click marker in list to highlight on map above and find Wikipedia articles:",     //Title text container
  geocoder: {},                       // geocoder global variable used for gooble map geolocation data
  map: {},                            // map global variable used for the google map
  infowindow: {},                     // infowindow global variable object used for the marker info windows
  address: "",                        // contains the address
  addressGeo: "",                     // contains the geolocation of the address
  markerType: "",                     // contains the marker type value
  markerList: {                       // contains the marker list and the info for the marker types
      marker: [],
      info: []
    }
};

// The viewModel contains the various functions for the web app
// There are 8 functions within the viewModel:
//     mapInitialize - Initializes the google map when the page first loads
//     codeAddress - Updates the google map when the user enters an address (neighborhood)
//     locMarker - Initiates google places services lookup of the desired marker
//     callback - Takes the results of the google places services and places in the list
//     createMarker - Creates markers on the map (called by callback)
//     infoWindowAppear - Shows the infowindow for marker and initiates wikipedia lookup
//     locMarkerClear- Removes and clears all the markers
//     filteredItems - Filters through the marker list based on the filter input box
//     articles - Does a wikipedia lookup on the neighborhood or marker
var viewModel = function() {

  var self = this;    // Sets up 'self' variable to be used for proper scope in functions

  // The following are the initialization of oberservables for the knockoutjs methodology
  this.pageTitle = ko.observable(modelData.title);  // observable for the title in the header
  this.markerListArray2 = ko.observableArray();     // observable array for the marker list
  this.filter = ko.observable();                    // observable for the filter criteria
  this.wikiHeader = ko.observable("<h3>Relavent Wikipedia Articles:</h3>");
                                                    // observable (above) for the wikipedia
                                                    // header section
  this.wikiLinksHtml = ko.observable('Enter a neighborhood above to find relevant Wikipedia articles!');
                                                    // observable(above) for the html containing
                                                    // the wikipedia articles
  
  // mapInitialize function - Initializes the google map when the page first loads
  // When the page initialize loads, this function will run setting up the map.
  // No address (neighborhood) has been entered at this point.
  // The initial location is a zoomed out view of North America
  // This code was provided as part of the google map api and adapted for knockout js
  this.mapInitialize = function() {
    // initiates the geocoder for google maps
    modelData.geocoder = new google.maps.Geocoder();
    // options for the map api
    var mapOptions = {
      center: { lat: 36.26, lng: -95.147},    // Lat/Long centered on United States
      zoom: 3
    };
    // calls the google map API and sets the map variable
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
  };
  
  // Calls the mapInitialize function to initialize the map on the DOM
  google.maps.event.addDomListener(window, 'load', self.mapInitialize);


  // codeAddress function - Updates the google map when the user enters an address (neighborhood)
  // This is called when the user clicks on the button for the 'address' DOM element
  // The function takes the address entered in the input field and does a geocode lookup to
  // obtain the proper lat/log for the google map api.  It then updates the map with the new
  // lat/long in the map options.  The function does displays an error alert if the geocode
  // lookup is unsuccessful.  Next, the function to clear any markers is called.  Finally,
  // the wikipedia lookup function is called
  // This code was provided as part of the google map api and adapted for knockout js
  this.codeAddress = function() {
    address = document.getElementById("address").value;   // address is pulled from the input box
    modelData.address = address;                          // address is stored in the modelData
    // calls the google map geocoder lookup for the address to obtain the lat/long of the address
    modelData.geocoder.geocode( { 'address': address}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        addressGeo = results[0].geometry.location;        // lat/long stored in the modelData
        // options for the map api
        var mapOptions = {
          center: results[0].geometry.location,           // Lat/long of the address
          zoom: 15
        };
        // updates the google map API and sets the map variable
        map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);  

        // sets the modelData map variable for future reference
        modelData.map = map;

      } else {
        // alert the user if the geocode lookup was not successful
        alert("Geocode was not successful for the following reason: " + status);
      };
    });
    self.locMarkerClear();       // calls the function to clear any markers
    self.articles(address);      // calls the function to show wikipedia articles for the address
  };


  // locMarker function - Initiates google places services lookup of the desired marker
  // Purpose of this function is start the lookup and placement of markers.  This function
  // is called by the Add Markers button on the DOM.  It takes in the markerType value
  // from the input box.  It initializes the request object which is passed into the 
  // textSearch function in the google map api.The textSearch is a part of the Places
  // Service component of the google map api.  The resuts of the textSearch function are
  // sent into the callback function.
  // This code was provided as part of the google map api and adapted for knockout js
  this.locMarker = function() {
    // if statement checks if an address has been entered.  If not, it displays an error message
    if (modelData.address !== "") {
      markerType = document.getElementById("markerType").value;   // text pulled from markerType
      // request object sets up the parameters for the textSearch
      // incluces the current lat/long of the address/neighborhood
      var request = {                                             
        location: addressGeo,
        radius: 300,
        query: markerType
      };
      infowindow = new google.maps.InfoWindow();                  // initiates the infowindow
      var service = new google.maps.places.PlacesService(map);    // sets up place service
      service.textSearch(request, self.callback);                 // calls textSearch and
                                                                  // and calls callback 
                                                                  // with results
    } else {
      // if no address, error message provided to user that an address is needed
      modelData.markerListTitle('Cannot find markers without a neighborhood!');
    };
  };


  // callback function - Takes the results of the google places services and places in the list
  // Purpose is to take the resuts of the textSearch and create the marker list.  This function
  // takes in the results from the textSearch query and the error status from the google map api
  // Places Servcie.  It creates an array of the data which is used to populate the marker
  // list.  Through this process, it also calls the createMarker function to actually create the
  // marker and place it on the map.
  // This code was provided as part of the google map api and adapted for knockout js
  this.callback = function(results, status) {
    // If statement checks if the status returned from Places Service is ok.
    // If not, alert the user with an error message
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      modelData.markerList.info = results;                // sets up the marker list info
      // for loop runs through the results to create the markers and the list array
      for (var i = 0; i < results.length; i++) {
        // calls the createMarker function to create the markers and place them on the map
        self.createMarker(results[i], i);
        // the items are added to the marker list array which automatically updates the DOM/view
        // thanks to knockoutjs
        self.markerListArray2.push(results[i]);                     
        var markerIndex = self.markerListArray2().length - 1;       // captures array length
        // captures the marker array from the createMarker function into the full maker list
        // This adds markers to the list that may already have items in it from a previous 
        // marker look up
        self.markerListArray2()[markerIndex].marker = modelData.markerList.marker[i];
                                                                    // captures marker object into array
        // if statement sets the marker list title text based on the array having items or not
        if (self.markerListArray2().length > 0) {
          modelData.markerListTitle(modelData.markerListTitleText);
        } else {
          modelData.markerListTitle('No markers to display...');
        };
      };
    } else {
        // alerts the user if the status from the google map api places service status is not ok
        alert("Places Service was not successful for the following reason: " + status);
    };
  };


  // createMarker function - Creates markers on the map (called by callback)
  // This function takes the results from callback and the index value to create the markers on
  // the map.  It calls the marker capability in the google map api.  It also creates the 
  // infowindow text for each marker.  
  // This code was provided as part of the google map api and adapted for knockout js
  this.createMarker = function(place, index) {
    // marker object variable is set up by calling the google map api marker capaibility
    // The current map and marker location is passed into the api
    var marker = new google.maps.Marker({             
      map: map,
      position: place.geometry.location
    });
    // marker object is captured to pass into the marke array
    modelData.markerList.marker[index] = marker;                  
    // addListener function is called to create the infowindow content for the marker                                                            
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  };


  // infoWindowAppear function - Shows the infowindow for marker and initiates wikipedia lookup
  // This function is called when a user clicks on an item in the marker list.  It opens up
  // the info window an initiates a wikipedia article lookup on the item.
  // This code was provided as part of the google map api and adapted for knockout js
  this.infoWindowAppear = function(listIndex, data) {
    infowindow.setContent(data.name);
    infowindow.open(map, data.marker);
    // calls the wikipedia articles lookup function
    self.articles(data.name);
  };


  // locMarkerClear function - Removes and clears all the markers
  // This function goes throuigh the marker list array, removes the items, and removes the 
  // the markers on the map.  By updating the array, the DOM/view is updated.
  this.locMarkerClear = function() {
    // for statement interates through the array hiding the markers on the map
    for (var i = 0; i < self.markerListArray2().length; i++) {
      self.markerListArray2()[i].marker.setMap(null);
    };
    // This removes all the markers in the list which updates the DOM/view automatically
    self.markerListArray2.removeAll();
    modelData.markerListTitle('No markers to display...');  // tells the user the list is empty
  };


  // filteredItems function - Filters through the marker list based on the filter input box
  // This function is called by the filter input box as data is entered (after key down)
  // With each letter entered by the user, the list and associated markers are updated to show
  // only those that meet the filter criteria.  This occurs automatically on the DOM/view due
  // to knockoutjs
  this.filteredItems = ko.computed(function() {
      // if statement cheks to make sure there are items in the list befor filtering it
      if (self.markerListArray2().length > 0) {
        // if statement checks if there is any text in filter input box.  If not, restore all
        // markers in the list array to the list and the map
        // if so, filter the markers in the list and the map
        if (!self.filter()) {
          // for loop iterates through the list array restoring the markers to the map
          for (var i = 0; i < self.markerListArray2().length; i++) {
            if (self.markerListArray2()[i].marker !== undefined) {
              self.markerListArray2()[i].marker.setMap(map);
            };
          };
          // the list array is returned to update the list on the DOM/view
          return self.markerListArray2();       
        } else {
          var temp = [];    // temporary array to contain the items in the marker list that
                            // match the filter
          // for loop iterates through the marker list array to determine which items match
          // the filter.  If there is a match, the temp array is updates with the item
          // object.  The item marker is shown on the map.  If there is not a match, the
          // item is not placed into the temp array and the corresponding marker is hidden 
          // from the map.
          for (var i = 0; i < self.markerListArray2().length; i++) {
            if (self.markerListArray2()[i].name.toLowerCase().search(self.filter().toLowerCase()) !== -1) {
              temp.push(self.markerListArray2()[i]);
              self.markerListArray2()[i].marker.setMap(map);
            } else {
              self.markerListArray2()[i].marker.setMap(null);
            };
          };

          // if statement updates the marker list title based on  if there are any items in
          // the temp array.  If not, the title is set to blank
          if (temp.length > 0) {
            modelData.markerListTitle(modelData.markerListTitleText);
          } else {
            modelData.markerListTitle('');
          };

          // the temp array is returned to update the list on the DOM/view
          return temp;
        };
      };
  }, this);


  // articles function - Does a wikipedia lookup on the neighborhood or marker
  // The purpose of this function is to initiate an api to look up articles on wikipedia.
  // It is called by the codeAddress function and the infoWindowAppear function.
  // The codeAddress function calls it to look up the address (neighborhood) in wikipedia.
  // the infoWindowAppear function calls it to look up the marker the user clicked on.
  // Base on the search results returned by the wikipedia api, the DOM/View is updated for
  // the wikipedia article list.  The lookup is performed using the serachData variable
  // that is passed in by the functions calling this function.
  this.articles = function(searchData) {
    // var searchDataArray and the following if statement are used to remove the '&'
    // character since this causes issues in the wikipedia search api.  The searchData
    // variable is split into a corresponding array when the & character is present.
    // The if statement checks if the split occured (i.e. there is more than 1 item
    // in the corresponding array).  If so, it then recreates searchData using a for
    // loop to iterate through the searchData array.  This leaves serachData without
    // the & character.
    var searchDataArray = searchData.split('&');            
    if (searchDataArray.length > 1) {
      searchData = "";
      for (var i = 0; i < searchDataArray.length; i++) {
        searchData = searchData + searchDataArray[i];
      };
    };

    // Call the wikipedia api using searchData using an ajax request
    var wikiArticles = "http://en.wikipedia.org/w/api.php?format=json&action=opensearch&search=" + searchData + "&callback=wikiCallback";
    $.ajax({
      url: wikiArticles, 
      dataType: "jsonp",
      success: function( data ) {
        var wikiItems = "";             // string used to create the DOM elements for each article
                                        // This is passed to the DOM using knockoutjs html binding
        var wikiArray = {               // Array to build the DOM elements
          link: [],
          paragraph: []
        };

        // if statement determines if any data returned.  Sets up title accordingly
        if (data[1].length !== 0) {
          self.wikiHeader('<h4>Wikipedia Articles About ' + searchData + ':</h4>');
        } else{ 
          self.wikiHeader('<h4>Sorry, there are no Wikipedia Articles About ' + searchData + '...</h4>');
        };

        // Clears the wikipedia article list DOM/view section
        self.clearWikiSection();

        // Creates a hyperlink DOM element for each data item
        // Places it in the wikiArray link array
        $.each( data[1], function( key, val ) {
          wikiArray.link.push( "<a href='http://en.wikipedia.org/wiki/" + val + "'>" + val + "</a>" );
        });

        // Creates a paragraph DOM element for each data item (i.e. a description)
        // Places it in the wikiArray paragraph array
        $.each( data[2], function( key, val ) {
          // if statement etermins if any paragraph returned and adds the appropriate text
          if (val === "") {
            wikiArray.paragraph.push("<p>No description available...</p>");
          } else {
            wikiArray.paragraph.push("<p>" + val + "</p>");
          };
        });

        // Creates the wikiItems string which contains the DOM elements for each article
        for (var i = 0; i < wikiArray.link.length; i++) {
          wikiItems = wikiItems + '<li>' + wikiArray.link[i] + wikiArray.paragraph[i] + '</li>';
        };
        
        // Updates the DOM using knockoutjs with the wikiItems array of DOM elements (articles)
        self.wikiLinksHtml('<ul id="wikipedia-links">' + wikiItems + '</ul>');
      }
    })
      // Places an error message if there was an error with the api execution
      .error(function() {
        self.wikiHeader('<h3>Wikipedia Articles About:</h3>');
        self.wikiLinksHtml('<ul id="wikipedia-links"></ul>');
    });
  };
};

this.clearWikiSection = function() {
        // Clears the wikipedia article list DOM/view section
        self.wikiLinksHtml('<ul id="wikipedia-links"></ul>');
};


// This function call initiates the knockoutjs viewModel function and binds it to the web page
$(function() {
    ko.applyBindings(new viewModel());
});

