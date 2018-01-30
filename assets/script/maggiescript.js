$(document).on("click", "#submit", function() {
	event.preventDefault();
	$("#alerts").text("");
	$("#news").text("");
	$("#attractions").text("");
	$("#events").text("");

	//finding events with Eventbrite API
	var eventBriteApiKey = "FPKFWK7MH5W6AEHFNYXN";
	var eventBriteRestUrl = "https://www.eventbriteapi.com/v3/events/search/?token=" + eventBriteApiKey;
	var city = $("#city").val().trim();
	var searchUrl = eventBriteRestUrl + "&location.address=" + city;

	$.ajax({
		url: searchUrl,
		method: "GET"
	}).done(function(response) {
		// console.log(response);
		//creates events div header
		var eventsHeader = $("<h1>");
		eventsHeader.text("Upcoming Events:");
		$("#events").append(eventsHeader);
		//for loop to format important data on first 10 events into divs and print to the events div
		for (i = 0; i < 10; i++) {
			var thisEvent = response.events[i];
			var eventDiv = $("<div>");
			var eventHeader = $("<h4>");
			var eventDates = $("<p>");
			var eventLink = $("<p>");
			var eventUrl = $("<a>");
			var prettyStart = moment(thisEvent.start.local).format("L LT");
			var prettyEnd = moment(thisEvent.end.local).format("L LT");
			eventHeader.text(thisEvent.name.text);
			eventDates.text(prettyStart + " - " + prettyEnd);
			eventUrl.attr("href", thisEvent.url);
			eventUrl.text("More information on this event");
			eventLink.html(eventUrl);
			eventDiv.append(eventHeader);
			eventDiv.append(eventDates);
			eventDiv.append(eventLink);
			$("#events").append(eventDiv);
		}
	})

	//finding related news articles
	var newsApiKey = "37341660916741f38faa605269e8554f"
	var newsUrl = 'https://newsapi.org/v2/everything?' + 'q=' + city + '&sortBy=relevancy&apiKey=' + newsApiKey;

	$.ajax({
		url:newsUrl,
		method: "GET"
	}).done(function(response) {
		// console.log(response);
		//creates heading for news section
		var newsHeader = $("<h1>");
		newsHeader.text("Related News Articles:");
		$("#news").append(newsHeader);

		//creates divs for first 10 articles with relevant info
		for (i = 0; i < 10; i++) {
			var thisArticle = response.articles[i];
			var articleDiv = $("<div>");
			var articleHeader = $("<h4>");
			var articleSource = $("<p>");
			var articleDate = $("<p>");
			var articleLink = $("<p>");
			var articleUrl = $("<a>");
			articleHeader.text(thisArticle.title);
			articleSource.text(thisArticle.source.name);
			articleDate.text(moment(thisArticle.publishedAt).format("L"));
			articleUrl.attr("href", thisArticle.url);
			articleUrl.text("Find the full article here");
			articleLink.html(articleUrl);
			articleDiv.append(articleHeader);
			articleDiv.append(articleDate);
			articleDiv.append(articleSource);
			articleDiv.append(articleLink);
			$("#news").append(articleDiv);
		}
	})

	//finding travel warnings/advisories
	var country = $("#country").val().trim();
	var restcountries_queryURL = "https://restcountries.eu/rest/v2/name/" + country;
	var alpha2code;

    $.ajax({
        url: restcountries_queryURL,
        method: "GET"
    }).done(function(response) {
        // console.log(response);
        alpha2code = response[0].alpha2Code;
        // console.log(alpha2code);

        var tugoApiKey = "pxzuppxje7r2hsu2w3mpnaza";
		var tugoRequestUrl = "https://api.tugo.com/v1/travelsafe/countries/" + alpha2code;

		$.ajax({
			url: tugoRequestUrl,
			method: "GET",
			beforeSend: function(xhr){xhr.setRequestHeader('X-Auth-Api-Key', tugoApiKey);},
		}).done(function(response) {
			// console.log(response);
			var alertsHeader = $("<h1>");
			alertsHeader.text("Traveling in " + country + ":");
			$("#alerts").append(alertsHeader);
			var alertsDiv = $("<div>");
			var alertsInfo = $("<h3>");
			var alertsDetails = $("<p>");
			alertsInfo.text(response.advisoryText);
			alertsDetails.text(response.advisories.description);
			alertsDiv.append(alertsInfo);
			alertsDiv.append(alertsDetails);
			$("#alerts").append(alertsDiv);
		});
    });

    var shutterstockSecret = "077ed-f33ea-911d0-6c4b6-6a3fd-2728b";
	var shutterstockApiKey = "33dca-36dcd-b5a54-7196a-f2c34-f6ffd";
	var shutterstockUrl = "https://$" + shutterstockApiKey + ":$" + shutterstockSecret + "@api.shutterstock.com/v2/images/search?query=" + city;

	$.ajax({
		url: shutterstockUrl,
		method: "GET",
		// beforeSend: function(xhr){xhr.setRequestHeader('Access-Control-Allow-Origin', true);}
	}).done(function(response) {
		console.log(response);
	})

    // CORS
	jQuery.ajaxPrefilter(function(options) {
   		if (options.crossDomain && jQuery.support.cors) {
    		options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
		}
	});

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

        	console.log(latitude);
			console.log(longitude);

    		var googlePlaces_key = "AIzaSyCDcpIf0iLXO9lC6dAQUWAuMyIJNpgFV7w";
    		var googlePlaces_queryURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=" + googlePlaces_key + "&location=" + latitude + "," + longitude + "&radius=8047&rankby=prominence&type=point_of_interest";

    		// attractions
    		$.ajax({
        		url: googlePlaces_queryURL,
        		method: "GET"
    		}).done(function(response) {
      		  	console.log(response); // for debugging
      		  	var placesHeader = $("<h1>");
      		  	placesHeader.text("Popular Attractions:");
      		  	$("#attractions").append(placesHeader);
      		  	for (i = 0; i < 10; i++) {
      		  		var thisPlace = response.results[i];
      		  		var placeDiv = $("<div>");
      		  		var placeName = $("<h3>");
      		  		var placeImgDiv = $("<div>");
      		  		// var placeImg;
      		  		// var photoreference = thisPlace.photos[0].photo_reference;
      		  		// var getPhotoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + photoreference + "&key=AIzaSyAi8QzCfvgLn-uD09gfLyruxkYQmQRgwRs"
      		  		// $.ajax({
      		  		// 	url: getPhotoUrl,
      		  		// 	method: "GET"
      		  		// }).done(function(response) {
      		  		// 	placeImg = response;
      		  		// })
      		  		// placeImgDiv.html(placeImg);
      		  		var itemNumber = i + 1;
      		  		placeName.text(itemNumber + ": " + thisPlace.name);
      		  		// placeDiv.append(placeImgDiv);
      		  		placeDiv.append(placeName);
      		  		$("#attractions").append(placeDiv);
      		  	}
  		  });

	});

	//updating background image with flickr api
	// var flickrApiKey = "f555b1104a9e5c75a95381117926837d";
	// var flickrUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + flickrApiKey + "&text=" + city + "&format=json&nojsoncallback=1&sort=relevance&accuracy=~11&content_type=1&is_getty=true";

	// $.ajax({
	// 	url: flickrUrl,
	// 	method: "GET",
	// }).done(function(response) {
	// 	// console.log(response);
	// 	var thisPhoto = response.photos.photo[0];
	// 	var photoId = thisPhoto.id;
	// 	var photoServerId = thisPhoto.server;
	// 	var photoFarmId = thisPhoto.farm;
	// 	var photoSecret = thisPhoto.secret;
	// 	var photoUrl = "https://farm" + photoFarmId +".staticflickr.com/" + photoServerId + "/" + photoId + "_" + photoSecret + ".jpg"
	// 	$("#city_image").attr("src", photoUrl);
	// })

});
