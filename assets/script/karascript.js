// ------------------------------------ DATABASE

// initializing firebase
var config = {
    apiKey: "AIzaSyChlr_DL3tTGVq2VXN2E15TnaK6Yh2TzkU",
    authDomain: "project1-480ca.firebaseapp.com",
    databaseURL: "https://project1-480ca.firebaseio.com",
    projectId: "project1-480ca",
    storageBucket: "project1-480ca.appspot.com",
    messagingSenderId: "791645920378"
  };

firebase.initializeApp(config);
var database = firebase.database();

// displays all saved searches as buttons
database.ref().on("value", function(snapshot) {
    // clears contents of savedsearches div to avoid creating duplicate buttons
    $("#savedsearches").empty();

    // pulls saved searches array from database
    savedsearches = snapshot.val().savedsearches;

    for (var i = 0; i < savedsearches.length; i++) {
        // creates a button and adds its class and text
        var a = $("<button>").addClass("searchbutton").text(savedsearches[i]);
        // appends button to list
        $("#savedsearches").append(a);
    }
});

// ------------------------------------ DECLARATIONS, DEFAULTS, AND MISCELLANEOUS

// declare global variables
var usersearch = [];
var city = "";
var country = "";
var currencies = [];
var languages = [];
var latitude = 41.8781;     // Chicago, IL
var longitude = -87.6298;   // Chicago, IL
var search = "";
var savedsearches = [];

// initially hide option to save search
$("#save").hide();

// CORS
jQuery.ajaxPrefilter(function(options) {
    if (options.crossDomain && jQuery.support.cors) {
        options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
    }
});

// ------------------------------------ ON-CLICK EVENTS (top to bottom)

// grabs user input from search bar
$("#search").on("click", function(event) {
    // grabs user input and trims excess spaces
    search = $("#search-input").val().trim();

    // run search function
    resetThenSearch();

    // show save button
    $("#save").show();
});

// saves search
$("#save").on("click", function(event) {
    // add search to array of saved searches
    savedsearches.push(search);

    // send saved searches to firebase
    database.ref().set({
        savedsearches: savedsearches
    });
});

// clears saved searches
$("#clear").on("click", function(event) {
    // add search to array of saved searches
    savedsearches = [];

    // send saved searches to firebase
    database.ref().set({
        savedsearches: savedsearches
    });
});

// reexecutes search when saved search button is clicked
$("#savedsearches").on("click", ".searchbutton", function() {
    // setting the search query
    search = $(this).text();

    // run search function
    resetThenSearch();
});

// ------------------------------------ MISCELLANEOUS FUNCTIONS

// resets variables then performs search
function resetThenSearch() {
    // reset variables
    usersearch = [];
    city = "";
    country = "";
    currencies = [];
    languages = [];

    // splitting the string
    usersearch = search.split(", ");
    city = usersearch[0];
    country = usersearch[usersearch.length - 1];

    // displays location on page
    $("#searchquery").html("<h1>" + city + "</h1>");

    // runs APIs
    googleMapsGeocoding();
    restCountries();
}

// ------------------------------------ API FUNCTIONS

// Algolia Places API
// autocomplete for search bar
// SOURCE: https://community.algolia.com/places/examples.html#disable-styling
(function() {
    var placesAutocomplete = places({
        container: document.querySelector('#input-styling-address input'),
        style: false,
        debug: true
    });
})();

// Dark Sky API
// obtain and display weather information
function darkSky() {
    // remove any previous weather information
    $("#weather").empty();

    var darkSky_key = "54db5805ebfe845b99818a813105725e";
    var darkSky_queryURL = "https://api.darksky.net/forecast/" + darkSky_key + "/" + latitude + "," + longitude;

    $.ajax({
        url: darkSky_queryURL,
        method: "GET"
    }).done(function(response) {
        console.log(response); // for debugging

        for (var i = 0; i < response.daily.data.length; i++) {
            // create a new div for each day of the week
            var div = $("<div>");
            div.addClass("weatherbox");
            
            // obtaining weather information
            var summary = response.daily.data[i].summary;
            var temphigh = response.daily.data[i].temperatureHigh;
            var templow = response.daily.data[i].temperatureLow;
            var iconname = response.daily.data[i].icon;
            var icon = $("<img alt='weathericon' class='weathericon'>");

            // selecting icon
            if (iconname == "clear-day") {
                icon.attr("src", "assets/images/clear.png")
            } else if (iconname == "clear-night") {
                icon.attr("src", "assets/images/clear-night.png")
            } else if (iconname == "rain") {
                icon.attr("src", "assets/images/rain.png")
            } else if (iconname == "snow") {
                icon.attr("src", "assets/images/snow.png")
            } else if (iconname == "sleet") {
                icon.attr("src", "assets/images/sleet.png")
            } else if (iconname == "wind") {
                icon.attr("src", "assets/images/wind.png")
            } else if (iconname == "fog") {
                icon.attr("src", "assets/images/fog.png")
            } else if (iconname == "cloudy") {
                icon.attr("src", "assets/images/cloudy.png")
            } else if (iconname == "partly-cloudy-day") {
                icon.attr("src", "assets/images/partly-cloudy-day.png")
            } else if (iconname == "partly-cloudy-night") {
                icon.attr("src", "assets/images/partly-cloudy-night.png")
            } else {
                icon.attr("src", "assets/images/unknown.png")
            }

            // display day heading
            if (i == 0) {
                div.append("<p><b>TODAY</b></p>");
            } else if (i == 1) {
                div.append("<p><b>TOMORROW</b></p>");
            } else {
                div.append("<p><b>" + i + " DAYS LATER</b></p>");
            }

            // display weather information
            div.append(icon).append("<p><b>Summary:</b> " + summary + "</p>").append("<p><b>High:</b> " + temphigh + "C</p>").append("<p><b>Low:</b> " + templow + "C</p>");
            $("#weather").append(div);    
        }
    });
}

// Google Maps Geocoding API
// obtain latitude and longitude of location
function googleMapsGeocoding() {
    var googleMapsGeocoding_key = "AIzaSyB7gKl-GUrq-aUv1mD5e0mZfEb8k349JS8";
    var googleMapsGeocoding_queryURL = "https://maps.googleapis.com/maps/api/geocode/json?key=" + googleMapsGeocoding_key + "&address=" + city + "," + country;

    $.ajax({
        url: googleMapsGeocoding_queryURL,
        method: "GET"
    }).done(function(response) {
        console.log(response); // for debugging

        // update coordinates and display map
        latitude = response.results[0].geometry.location.lat;
        longitude = response.results[0].geometry.location.lng;
        googleMapsJavascript();

        // obtain weather information
        darkSky();
    });
}

// Google Maps JavaScript API
// update, style, and display map
// REFERENCE: https://developers.google.com/maps/documentation/javascript/adding-a-google-map
// MAP STYLE BASED ON: https://snazzymaps.com/style/151/ultra-light-with-labels
function googleMapsJavascript() {
    var loc = {lat: latitude, lng: longitude};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        styles: [
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#cce6ff"}, {"lightness": 0}]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [{"color": "#f5f5f5"}, {"lightness": 0}]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#ffffff"}, {"lightness": 17}]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#ffffff"}, {"lightness": 29}, {"weight": 0.2}]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [{"color": "#ffffff"}, {"lightness": 18}]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [{"color": "#ffffff"}, {"lightness": 16}]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{"color": "#ffb3b3"}, {"lightness": 21}]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [{"color": "#ccffb3"}, {"lightness": 0}]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [{"visibility": "on"}, {"color": "#ffffff"}, {"lightness": 16}]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [{"saturation": 36}, {"color": "#333333"}, {"lightness": 40}]
            },
            {
                "elementType": "labels.icon",
                "stylers": [{"visibility": "on"}]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [{"color": "#f2f2f2"}, {"lightness": 19}]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#fefefe"}, {"lightness": 20}]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#fefefe"}, {"lightness": 17}, {"weight": 1.2}]
            }
        ]
    });

    var marker = new google.maps.Marker({
        position: loc,
        map: map,
        icon: "assets/images/location.png"
    });
}

// REST Countries API
// obtain and display language and currency information
function restCountries() {
    var restcountries_queryURL = "https://restcountries.eu/rest/v2/name/" + country;

    $.ajax({
        url: restcountries_queryURL,
        method: "GET"
    }).done(function(response) {
        console.log(response); // for debugging

        // add languages to array
        for (var i = 0; i < response[0].languages.length; i++) {
            languages.push(response[0].languages[i].name);
        }

        // convert language array to string and display it on page
        languages = languages.join(", ");
        $("#language").html("<b>Language(s):</b> " + languages);

        // add currencies to array
        for(var i = 0; i < response[0].currencies.length; i++) {
            currencies.push(response[0].currencies[i].name + " (" + response[0].currencies[i].symbol + ", " + response[0].currencies[i].code + ")");
        }

        // convert currency array to string and display it on page
        currencies = currencies.join(", ");
        $("#currency").html("<b>Forms of currency:</b> " + currencies);
    });
}