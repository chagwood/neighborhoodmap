import './styles.scss';
/* ------------------------------------------------------------------ */
var map;
var infowindow;
var placesService;
var mapCenter = {lat: 38.958292, lng: -77.360039}; //initial map center and central point which the radius is measued from when finding places
var mapZoom = 13;
var currentPlaceMarkers = []; //array of map markers that are displayed at any given time
var uniquePlaceMarkerIDs = {};
var placeMarkersData = {}; //object to cache info for a selected place
var placeNameData = [];
var selectedPlaceName = ""; //currently selected place name
var infoWindowMaxWidth = "200";
var infoWindowImageHeight = "125";
var defaultMarkerIcon = "//maps.google.com/mapfiles/ms/icons/red-pushpin.png";
var selectedMarkerIcon = "//maps.google.com/mapfiles/ms/icons/ylw-pushpin.png";
var warningText = "";
var viewModel;
var errorQueue = [];
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
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        zoom: mapZoom,
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

    google.maps.event.addListener(map, "click", function(event) {
        infowindow.close();
        resetMapMarkers();
    });
    google.maps.event.addListener(infowindow,'closeclick',function(){
        this.setMap(null); //removes the marker
        resetMapMarkers();
     });
} //end of initMap
/* ------------------------------------------------------------------ */
function AppViewModel() {
    var self = this;
    self.selectedCategoryName = ko.observable("");
    self.categoriesLoaded = ko.observable(0);
    self.pinsDisplayed = ko.observable(0);
    self.notificationText = ko.observable("");
    self.relatedImgSrc = ko.observable("");
    self.totalCategories = placesList.length;
    self.categories = ko.observableArray(placesList);
    self.places = ko.observableArray(placeNameData);
    self.categoryCount = ko.observable(placesList.length);
    self.setSelectedPlaceCategory
    self.filterNames = ko.computed(function() {
        var filter = this.selectedCategoryName().toLowerCase();
        if (!filter) {
            return this.places();
        } else {
            return ko.utils.arrayFilter(this.places(), function(theplace) {
                if(theplace.place.place.types.indexOf(filter) >= 0) {
                    return true;
                }
                return false;
            });
        }
    }, this);
    self.setCategoryFilter = function(categoryName) {
        this.selectedCategoryName(categoryName);
    }
    self.incrementLoadCounter = function() {
        this.categoriesLoaded(this.categoriesLoaded() + 1);
    };
    self.incrementPinCounter = function() {
        this.pinsDisplayed(this.pinsDisplayed() + 1);
    };
    self.resetPinCounter = function() {
        this.pinsDisplayed(0);
    };
    self.displayNotice = function(noticeText) {
        this.notificationText(noticeText);
        UIkit.modal("#notice-overlay").show();
    };
    self.displayRelatedImage = function(imageUrl) {
        this.relatedImgSrc(imageUrl);
    };
    self.displayPlace = function() {
        displayPlaceMarker(this.place);
    };
    self.displayCategory = function() {
        clearMapMarkers();
        viewModel.setCategoryFilter(this.name);
        //selectedPlaceName = this.name;
        if(placeMarkersData[viewModel.selectedCategoryName()] === undefined) {
            placesService.nearbySearch({
                location: mapCenter,
                radius: 5000,
                type: this.name
            }, placesServiceCallback);
        } else {
            displayCategoryMarkers(this.name);
        }
        //console.log("Display places for [" + this.name + "]");
    };
    self.resetMap = function() {
        clearMapMarkers();
        this.selectedCategoryName("");
        displayAllMakers();
    };
    self.reloadData = function() {
        this.selectedCategoryName("");
        reloadAllData();
    };
    self.recenterMap = function() {
        map.setCenter(mapCenter);
        map.setZoom(mapZoom);
    };
}
/* ------------------------------------------------------------------ */
function loadInitialPlaces() {
    //load the modal
    UIkit.modal("#wait-overlay").show();

    //delay is used so we don't get limit exceeded errors from google apis
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    var promiseChain = placesList.reduce(function(promise, place) {
      return promise.then(function(result) {
        return Promise.all([delay(500), getPlacesForType(place.name)]);
      });
    }, Promise.resolve());

    promiseChain.then(function(result){
        //close the modal
        UIkit.modal("#wait-overlay").hide();
        //drop all the pins...
    }).catch(function(result){
        if(result == "OVER_QUERY_LIMIT") {
            viewModel.displayNotice("Async calls were throttled. Try refreshing data again.");
        } else {
            viewModel.displayNotice(result);
        }
    });
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
                        var placeObj = {};
                        currentPlaceType = results[i].types[x];
                        if(placeMarkersData[currentPlaceType] === undefined) {
                            placeMarkersData[currentPlaceType] = [];
                        }
                        placeObj.place = results[i];
                        placeObj.nearByImg = null;
                        placeObj.id = results[i].id;
                        getFlickrPhotoForLocation(placeObj.place.geometry.location.lat, placeObj.place.geometry.location.lng, placeObj);
                        placeMarkersData[currentPlaceType].push(placeObj);
                        if(uniquePlaceMarkerIDs[placeObj.id] === undefined) {
                            createMapMarker(placeObj);
                            uniquePlaceMarkerIDs[placeObj.id] = placeObj.id;
                            viewModel.places.push({label: placeObj.place.name, id: placeObj.id, place: placeObj});
                            viewModel.incrementPinCounter();
                        }
                        
                    }
                }
                localStorage.setItem('mapPlaces', JSON.stringify(placeMarkersData));
                localStorage.setItem('placeNames', JSON.stringify(placeNameData));
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
        if(viewModel.selectedCategoryName() !== "") {
            if(placeMarkersData[viewModel.selectedCategoryName()] === undefined) {
                placeMarkersData[viewModel.selectedCategoryName()] = [];
            }
        }

        for (var i = 0; i < results.length; i++) {
            if(viewModel.selectedCategoryName() !== "") {
                placeMarkersData[viewModel.selectedCategoryName()].push(results[i]);
            }
            createMapMarker(results[i]);
        }
    }
}
/* ------------------------------------------------------------------ */
function createMapMarker(placeObj) {
    var place = placeObj.place;
    var placeLoc = place.geometry.location;
    //console.log(placeLoc);
    var marker = new google.maps.Marker({
        map: map,
        //icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
        icon: defaultMarkerIcon,
        //animation: google.maps.Animation.DROP,
        position: place.geometry.location
    });
    marker.placeId = placeObj.id;

    currentPlaceMarkers.push(marker);

    //var flickrImgSrc = getFlickrPhotoForLocation(placeLoc.lat, placeLoc.lng);

    var infoWindowContent = `<div class="infowindow" style="max-width: ${infoWindowMaxWidth}px">
                                <div style="padding-bottom: 3px; font-weight: bold; color: black">${place.name}</div>
                                <div style="padding-bottom: 6px; color: black">${place.vicinity}</div>
                                <div class="nearby-link" style="padding-bottom: 6px; font-weight: bold;">
                                    <a href="#nearby-overlay" uk-toggle>View Nearby Photo</a>
                                </div>
                                <div style="overflow: hidden; max-height: ${infoWindowImageHeight}px; height: ${infoWindowImageHeight}px; width:${infoWindowMaxWidth}px;">
                                    <img style="width:100%" src="https://maps.googleapis.com/maps/api/streetview?size=${infoWindowMaxWidth}x${infoWindowImageHeight}&location=${place.vicinity}&fov=90&key=AIzaSyA-ukoWUS6t1TVxoXi3SP_VfFTj9IRLQ78"/>
                                </div>
                            </div>`;

    google.maps.event.addListener(marker, 'click', function() {
        resetMapMarkers();
        viewModel.displayRelatedImage(placeObj.nearByImg);
        infowindow.setContent(infoWindowContent);
        marker.setIcon(selectedMarkerIcon);
        map.panTo(marker.getPosition());
        infowindow.open(map, this);
        //console.log(this);
    });
}
function getFlickrPhotoForLocation(latcoord, lngcoord, currentItem) {
        var opts = {
            method: 'flickr.photos.search',
            api_key: '1f1c4d1df1b98a01781d4324b65ca59f',
            extras: 'url_z',
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
                    if(resp.photos.photo[randomSelection].url_z !== undefined) {
                        currentItem.nearByImg = resp.photos.photo[randomSelection].url_z;
                    } else {
                        do {
                            randomSelection = Math.floor(Math.random() * ((photoCount) - 0) + 0);
                        } while(resp.photos.photo[randomSelection].url_z !== undefined);
                        currentItem.nearByImg = resp.photos.photo[randomSelection].url_z;
                    }
                }
            }
            else {
                //show error
                viewModel.displayNotice(resp);
            }
        }).fail(function() {
            viewModel.displayNotice("An error occured while calling the Flickr API for a location's nearby photo. Some images may be unavailable.");
        });
}
/* ------------------------------------------------------------------ */
function loadingError() {
    UIkit.notification("There was an error loading the Google Maps API. App cannot continue.", {timeout: 10000});
}
window.loadingError = loadingError; //must set this to window or callback doesn't work
/* ------------------------------------------------------------------ */
/* If the markers from a place has been cached, display the markers stored in the item's array */
function displayCategoryMarkers(name) {
    viewModel.resetPinCounter();
    for(var i = 0; i < placeMarkersData[name].length; i++) {
        createMapMarker(placeMarkersData[name][i]);
        viewModel.incrementPinCounter();
    }
}

function displayPlaceMarker(place) {
    var isCurrentlyShown = false;
    var foundIndex = 0;
    for(var i =0; i < currentPlaceMarkers.length; i++) {
        if(currentPlaceMarkers[i].placeId == place.id) {
            isCurrentlyShown = true;
            foundIndex = i;
            break;
        }
    }

    if(isCurrentlyShown) {
        google.maps.event.trigger(currentPlaceMarkers[i], 'click');
    } else {
        viewModel.resetPinCounter();
        clearMapMarkers();
        createMapMarker(place);
        viewModel.incrementPinCounter();
        google.maps.event.trigger(currentPlaceMarkers[0], 'click');
    }
}
/* ------------------------------------------------------------------ */
function clearMapMarkers() {
    viewModel.resetPinCounter();
    for(var i =0; i < currentPlaceMarkers.length; i++) {
        currentPlaceMarkers[i].setMap(null);
    }
    currentPlaceMarkers = [];
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
            if(uniquePlaceMarkerIDs[placeMarkersData[placeCategory][placePin].id] === undefined) {
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
    if((localStorage.getItem('mapPlaces') !== null) && (localStorage.getItem('placeNames') !== null)) {
        placeMarkersData = JSON.parse(localStorage.getItem('mapPlaces'));
        placeNameData = JSON.parse(localStorage.getItem('placeNames'));
    }
}
/* ------------------------------------------------------------------ */
function startMapActions() {
    if((localStorage.getItem('mapPlaces') !== null) && (localStorage.getItem('placeNames') !== null)) {
        clearMapMarkers();
        displayAllMakers();
    } else {
        loadInitialPlaces();
    }
}
/* ------------------------------------------------------------------ */
function startApp() {
    initMap();
    loadLocalStorage();
    viewModel = new AppViewModel();
    ko.applyBindings(viewModel);
    startMapActions();

    document.getElementById("nearby-overlay").addEventListener("click",function(){
        UIkit.modal("#nearby-overlay").hide();
    });
    
    document.getElementById("about-overlay").addEventListener("click",function(){
        UIkit.modal("#about-overlay").hide();
    });
}
window.startApp = startApp; //must set this to window or callback doesn't work
/* ------------------------------------------------------------------ */