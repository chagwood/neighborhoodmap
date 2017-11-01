import './styles.scss';
/* ------------------------------------------------------------------ */
var map;
var infowindow;
var placesService;
var mapCenter = {lat: 38.958292, lng: -77.360039}; //initial map center and central point which the radius is measued from when finding places
var currentPlaceMarkers = []; //array of map markers that are displayed at any given time
var uniquePlaceMarkerIDs = {};
var placeMarkersData = {}; //object to cache info for a selected place
var selectedPlaceName = ""; //currently selected place name
var infoWindowMaxWidth = "200";
var infoWindowImageHeight = "125";
var defaultMarkerIcon = "//maps.google.com/mapfiles/ms/icons/red-pushpin.png";
var selectedMarkerIcon = "//maps.google.com/mapfiles/ms/icons/ylw-pushpin.png";
var warningText = "";
var viewModel;
/* ------------------------------------------------------------------ */
/* name attribute is used in Google Places; label for navigation */
var placesList = [{
    name: "art_gallery",
    label: "Art Galleries"
}, {
    name: "atm",
    label: "ATMs"
}, {
    name: "bakery",
    label: "Bakeries"
}, {
    name: "bank",
    label: "Banks"
}, {
    name: "bar",
    label: "Bars"
}, {
    name: "beauty_salon",
    label: "Beauty Salons"
}, {
    name: "cafe",
    label: "Cafes"
}, {
    name: "car_rental",
    label: "Car Rentals"
}, {
    name: "car_repair",
    label: "Car Repair"
}, {
    name: "car_wash",
    label: "Car Washes"
}, {
    name: "church",
    label: "Churches"
}, {
    name: "clothing_store",
    label: "Clothing Stores"
}, {
    name: "convenience_store",
    label: "Convenience Stores"
}, {
    name: "dentist",
    label: "Dentists"
}, {
    name: "doctor",
    label: "Doctors"
}, {
    name: "electronics_store",
    label: "Electronics Stores"
}, {
    name: "fire_station",
    label: "Fire Stations"
}, {
    name: "florist",
    label: "Florists"
}, {
    name: "furniture_store",
    label: "Furniture Stores"
}, {
    name: "gas_station",
    label: "Gas Stations"
}, {
    name: "gym",
    label: "Gyms"
}, {
    name: "hair_care",
    label: "Hair Care"
}, {
    name: "hardware_store",
    label: "Hardware Stores"
}, {
    name: "hospital",
    label: "Hospitals"
}, {
    name: "laundry",
    label: "Laundromats"
}, {
    name: "library",
    label: "Libaries"
}, {
    name: "liquor_store",
    label: "Liquor Stores"
}, {
    name: "lodging",
    label: "Lodging"
}, {
    name: "meal_takeaway",
    label: "Meal Take-out"
}, {
    name: "movie_theater",
    label: "Movie Theaters"
}, {
    name: "museum",
    label: "Museums"
}, {
    name: "park",
    label: "Parks"
}, {
    name: "parking",
    label: "Parking"
}, {
    name: "pet_store",
    label: "Pet Stores"
}, {
    name: "pharmacy",
    label: "Pharmacies"
}, {
    name: "police",
    label: "Police Stations"
}, {
    name: "post_office",
    label: "Post Offices"
}, {
    name: "restaurant",
    label: "Restaurants"
}, {
    name: "school",
    label: "Schools"
}, {
    name: "shopping_mall",
    label: "Shopping Malls"
}, {
    name: "spa",
    label: "Spas"
}, {
    name: "storage",
    label: "Storage"
}, {
    name: "veterinary_care",
    label: "Veterinary Clinics"
}, {
    name: "zoo",
    label: "Zoos"
}];
/* ------------------------------------------------------------------ */
function initMap() {
    map = new google.maps.Map(document.getElementById('map-container'), {
        center: mapCenter,
        zoom: 13,
        clickableIcons: false,
        styles: [{
            "featureType": "all",
            "elementType": "all",
            "stylers": [{
                "hue": "#ff0000"
            }, {
                "saturation": -100
            }, {
                "lightness": -30
            }]
        }, {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#ffffff"
            }]
        }, {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [{
                "color": "#353535"
            }]
        }, {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{
                "color": "#656565"
            }]
        }, {
            "featureType": "poi",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#505050"
            }]
        }, {
            "featureType": "poi",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#808080"
            }]
        }, {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{
                "color": "#454545"
            }]
        }, {
            "featureType": "transit",
            "elementType": "labels",
            "stylers": [{
                "hue": "#000000"
            }, {
                "saturation": 100
            }, {
                "lightness": -40
            }, {
                "invert_lightness": true
            }, {
                "gamma": 1.5
            }]
        }] //end of styles array
    });
    infowindow = new google.maps.InfoWindow();
    placesService = new google.maps.places.PlacesService(map);
    google.maps.event.trigger(map, 'resize');
    
    /* adjust the height of the map container */
    /*
    var topNav = document.getElementById("top-navbar");
    var mapContainer = document.getElementById('map-container');
    var tapNavHeight = topNav.clientHeight;
    var mapContainerHeight = mapContainer.clientHeight;
    var adjustedHeight = mapContainerHeight-tapNavHeight;    
    //mapContainer.style.height = adjustedHeight + "px";
    */

    google.maps.event.addListener(map, "click", function(event) {
        infowindow.close();
        resetMapMarkers();
    });
    google.maps.event.addListener(infowindow,'closeclick',function(){
        this.setMap(null); //removes the marker
        resetMapMarkers();
     });
} //end of initMap
window.initMap = initMap; //must set this to window or initial initMap callback doesn't work
/* ------------------------------------------------------------------ */
function AppViewModel() {
    var self = this;
    self.categoriesLoaded = ko.observable(0);
    self.pinsDisplayed = ko.observable(0);
    self.notificationText = ko.observable("");
    self.totalCategories = placesList.length;
    self.places = ko.observableArray(placesList);
    self.incrementLoadCounter = function() {
        this.categoriesLoaded(this.categoriesLoaded() + 1);
    };
    self.incrementPinCounter = function() {
        this.pinsDisplayed(this.pinsDisplayed() + 1);
    };
    self.resetPinCounter = function() {
        this.pinsDisplayed(0);
    };
    self.changeNoticeMessage = function(noticeText) {
        this.notificationText(noticeText);
    };

    self.displayPlaces = function() {
        clearMapMarkers();
        selectedPlaceName = this.name;
        if(placeMarkersData[selectedPlaceName] == undefined) {
            placesService.nearbySearch({
                location: mapCenter,
                radius: 5000,
                type: this.name
            }, placesServiceCallback);
        } else {
            displayMapMarkers(this.name);
        }
        //console.log("Display places for [" + this.name + "]");
    };
    self.resetMap = function() {
        clearMapMarkers();
        displayAllMakers();
    };
    self.reloadData = function() {
        reloadAllData();
    }
}
/* ------------------------------------------------------------------ */
function loadInitialPlaces() {
    //load the modal
    UIkit.modal("#wait-overlay").show()

    //delay is used so we don't get limit exceeded errors from google apis
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    var promiseChain = placesList.reduce(function(promise, place) {
      return promise.then(function(result) {
        return Promise.all([delay(500), getPlacesForType(place.name)]);
      })
    }, Promise.resolve())

    promiseChain.then(function(result){
        //close the modal
        UIkit.modal("#wait-overlay").hide();
        //drop all the pins...
    }).catch(function(result){
        if(result == "OVER_QUERY_LIMIT") {
            viewModel.changeNoticeMessage("Async calls were throttled. Try refreshing data again.");
            UIkit.modal("#notice-overlay").show();
        } else {
            viewModel.changeNoticeMessage(result);
            UIkit.modal("#notice-overlay").show();
        }
    });

    /*
    var promiseArray = [];
    for(var p = 0; p < placesList.length; p++) {
        promiseArray.push(getPlacesForType(placesList[p].name))
        //
        placesService.nearbySearch({
            location: mapCenter,
            radius: 5000,
            type: placesList[p].name
        }, function(results, status){
            var currentPlaceType = "";
            console.log("RESULTS: " + results.length);
            for(var i = 0; i < results.length; i++) {
                for(var x = 0; x < results[i].types.length; x++){
                    currentPlaceType = results[i].types[x];
                    if(placeMarkersData[currentPlaceType] == undefined) {
                        placeMarkersData[currentPlaceType] = new Array();
                    }
                    placeMarkersData[currentPlaceType].push(results[i]);
                    createMapMarker(results[i]);
                }
            }
        });
        //
    }
    */
}
/* ------------------------------------------------------------------ */
function getPlacesForType(type) {
    return new Promise(function(resolve, reject) {
        placesService.nearbySearch({
            location: mapCenter,
            radius: 5000,
            type: type
        }, function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var currentPlaceType = "";
                // resolve results upon a successful status
                for(var i = 0; i < results.length; i++) {
                    //console.log(results);
                    for(var x = 0; x < results[i].types.length; x++){
                        currentPlaceType = results[i].types[x];
                        if(placeMarkersData[currentPlaceType] == undefined) {
                            placeMarkersData[currentPlaceType] = new Array();
                        }
                        placeMarkersData[currentPlaceType].push(results[i]);
                        if(uniquePlaceMarkerIDs[results[i].id] == undefined) {
                            createMapMarker(results[i]);
                            uniquePlaceMarkerIDs[results[i].id] = results[i].id;
                            viewModel.incrementPinCounter();
                        }
                        
                    }
                }
                localStorage.setItem('mapPlaces', JSON.stringify(placeMarkersData));
                //increment counter in modal
                viewModel.incrementLoadCounter();
                resolve(results);
            } else {
                // reject status upon un-successful status
                //console.log("[" + type + "] " + "STATUS: " + status);
                reject(status);
            }
        });
    });
}
/* ------------------------------------------------------------------ */
function placesServiceCallback(results, status) {
    //console.log(results);
    //console.log(status);
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        if(selectedPlaceName != "") {
            if(placeMarkersData[selectedPlaceName] == undefined) {
                placeMarkersData[selectedPlaceName] = new Array();
            }
        }

        for (var i = 0; i < results.length; i++) {
            if(selectedPlaceName != "") {
                placeMarkersData[selectedPlaceName].push(results[i]);
            }
            createMapMarker(results[i]);
        }
    }
}
/* ------------------------------------------------------------------ */
function createMapMarker(place) {
    var placeLoc = place.geometry.location;
    //console.log(placeLoc);
    var marker = new google.maps.Marker({
        map: map,
        //icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
        icon: defaultMarkerIcon,
        //animation: google.maps.Animation.DROP,
        position: place.geometry.location
    });

    currentPlaceMarkers.push(marker);
    var infoWindowContent = document.createElement("div");
    infoWindowContent.style.maxWidth = infoWindowMaxWidth + 'px';
    var infoWindowTitle = document.createElement("div");
    var infoWindowAddress = document.createElement("div");
    var nearByPhotoLink = document.createElement("div");
    nearByPhotoLink.className = "nearby-link";
    nearByPhotoLink.innerHTML = '<a href="#nearby-overlay" uk-toggle>View Nearby Photo</a>';
    nearByPhotoLink.style.paddingBottom = "6px";
    nearByPhotoLink.style.fontWeight = "bold";
    nearByPhotoLink.style.display = "hidden";
    infoWindowAddress.appendChild(document.createTextNode(place.vicinity));
    infoWindowAddress.style.paddingBottom = "6px";
    infoWindowAddress.style.color = "black";
    infoWindowTitle.appendChild(document.createTextNode(place.name));
    infoWindowTitle.style.display = "block";
    infoWindowTitle.style.fontWeight = "bold";
    infoWindowTitle.style.paddingBottom = "3px";
    infoWindowTitle.style.color = "black";
    infoWindowContent.appendChild(infoWindowTitle);
    infoWindowContent.appendChild(infoWindowAddress);
    infoWindowContent.appendChild(nearByPhotoLink);
    /*
    if(place.photos != undefined) {
        var infoWindowImageContainer = document.createElement("div");
        infoWindowImageContainer.style.overflow = "hidden";
        infoWindowImageContainer.style.width = "100%";
        infoWindowImageContainer.style.maxHeight = "100px";
        var infoWindowImage = new Image();
        infoWindowImage.src = place.photos[0].getUrl({'maxWidth': 150, 'maxHeight': 150});
        infoWindowImage.style.width = "100%";
        infoWindowImageContainer.appendChild(infoWindowImage)
        infoWindowContent.appendChild(infoWindowImageContainer);
    }*/


    var infoWindowImageContainer = document.createElement("div");
    infoWindowImageContainer.style.overflow = "hidden";
    infoWindowImageContainer.style.width = "100%";
    infoWindowImageContainer.style.maxHeight = infoWindowImageHeight + "px";
    var infoWindowImage = new Image();
    infoWindowImage.src = 'https://maps.googleapis.com/maps/api/streetview?size=' + infoWindowMaxWidth + 'x' + infoWindowImageHeight + '&location=' + place.vicinity + '&fov=90&key=AIzaSyA-ukoWUS6t1TVxoXi3SP_VfFTj9IRLQ78';
    infoWindowImage.style.width = "100%";
    infoWindowImageContainer.appendChild(infoWindowImage)
    infoWindowContent.appendChild(infoWindowImageContainer);

    google.maps.event.addListener(marker, 'click', function() {
        resetMapMarkers();
        getFlickrPhotoForLocation(placeLoc.lat, placeLoc.lng, nearByPhotoLink)
        infowindow.setContent(infoWindowContent);
        marker.setIcon(selectedMarkerIcon);
        infowindow.open(map, this);
    });
}
function getFlickrPhotoForLocation(latcoord, lngcoord, linkDomElement) {
        var imageContainer = document.getElementById("nearby-photo");
        var opts = {
            method: 'flickr.photos.search',
            api_key: '1f1c4d1df1b98a01781d4324b65ca59f',
            extras: 'url_c',
            accuracy: 16,
            content_type: 1,
            lat: latcoord,
            lon: lngcoord,
            per_page: 10,
            radius: 1,
            format: 'json',
            nojsoncallback: 1
        };
        $.get('https://api.flickr.com/services/rest/', opts, function(resp){
            if (resp.stat === "ok") {
                var photoCount = resp.photos.photo.length;
                if(photoCount >= 1) {
                    var randomSelection = Math.floor(Math.random() * ((photoCount) - 0) + 0);
                    //console.log("NUM SELECTED: " + randomSelection);
                    var imageHTML = "";
                    if(resp.photos.photo[randomSelection].url_c != undefined) {
                        imageHTML = '<img src="' + resp.photos.photo[randomSelection].url_c + '"/>';
                    } else {
                        do {
                            console.log("GOTTA FIND ANOTHER PHOTO!");
                            randomSelection = Math.floor(Math.random() * ((photoCount) - 0) + 0)
                        } while(resp.photos.photo[randomSelection].url_c != undefined)
                        imageHTML = '<img src="' + resp.photos.photo[randomSelection].url_c + '"/>';
                    }
                    
                    imageContainer.innerHTML = imageHTML;
                    linkDomElement.style.display = "visible";
                }
            }
            else {
                //console.log('ERROR', resp);

            }
        });
}
/* ------------------------------------------------------------------ */
/* If the markers from a place has been cached, display the markers stored in the item's array */
function displayMapMarkers(name) {
    viewModel.resetPinCounter();
    for(var i = 0; i < placeMarkersData[name].length; i++) {
        createMapMarker(placeMarkersData[name][i]);
        viewModel.incrementPinCounter();
    }
}
/* ------------------------------------------------------------------ */
function clearMapMarkers() {
    viewModel.resetPinCounter();
    for(var i =0; i < currentPlaceMarkers.length; i++) {
        currentPlaceMarkers[i].setMap(null);
    }
}
/* ------------------------------------------------------------------ */
function resetMapMarkers() {
    for(var i =0; i < currentPlaceMarkers.length; i++) {
        currentPlaceMarkers[i].setIcon(defaultMarkerIcon);
    }
}
/* ------------------------------------------------------------------ */
function displayAllMakers() {
    uniquePlaceMarkerIDs = {};
    viewModel.resetPinCounter();
    for(var placeCategory in placeMarkersData) {
        for(var placePin in placeMarkersData[placeCategory]) {
            if(uniquePlaceMarkerIDs[placeMarkersData[placeCategory][placePin].id] == undefined) {
                createMapMarker(placeMarkersData[placeCategory][placePin]);
                uniquePlaceMarkerIDs[placeMarkersData[placeCategory][placePin].id] = placeMarkersData[placeCategory][placePin].id;
                viewModel.incrementPinCounter();
            }
        }
    }
}
/* ------------------------------------------------------------------ */
function reloadAllData() {
    UIkit.offcanvas("#ch-offcanvas").hide();
    clearMapMarkers();
    placeMarkersData = {};
    uniquePlaceMarkerIDs = {};
    localStorage.clear();
    loadInitialPlaces();
}
/* ------------------------------------------------------------------ */
function loadLocalStorage() {
    if(localStorage.getItem('mapPlaces') === null) {
        loadInitialPlaces();
    } else {
        placeMarkersData = JSON.parse(localStorage.getItem('mapPlaces'));
        clearMapMarkers();
        displayAllMakers();
    }
}
/* ------------------------------------------------------------------ */
$(document).ready(function() {
    viewModel = new AppViewModel();
    ko.applyBindings(viewModel);
    loadLocalStorage();
    document.getElementById("nearby-overlay").addEventListener("click",function(){
        UIkit.modal("#nearby-overlay").hide();
    })
    //getFlickrPhotoForLocation("38.967510", "-77.317677")
});
/* ------------------------------------------------------------------ */