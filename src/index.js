import './styles.scss';

var map;
var infowindow;
var placesService;
var mapCenter = {lat: 38.958292, lng: -77.360039};
var placeMarkers = [];

/* name attribute is used in Google Places; label for navigation */
var placesList = [{
    name: "airport",
    label: "Airports"
}, {
    name: "aquarium",
    label: "Aquariums"
}, {
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
    name: "book_store",
    label: "Book Stores"
}, {
    name: "bus_station",
    label: "Bus Stations"
}, {
    name: "cafe",
    label: "Cafes"
}, {
    name: "car_dealer",
    label: "Car Dealers"
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
    name: "department_store",
    label: "Department Stores"
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
    name: "home_goods_store",
    label: "Home Goods Stores"
}, {
    name: "hospital",
    label: "Hospitals"
}, {
    name: "jewelry_store",
    label: "Jewelry Stores"
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
    name: "meal_delivery",
    label: "Meal Delivery"
}, {
    name: "meal_takeaway",
    label: "Meal Take-out"
}, {
    name: "movie_rental",
    label: "Movie Rentals"
}, {
    name: "movie_theater",
    label: "Movie Theaters"
}, {
    name: "museum",
    label: "Museums"
}, {
    name: "night_club",
    label: "Night Clubs"
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
    name: "shoe_store",
    label: "Shoe Stores"
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
    name: "transit_station",
    label: "Transit Stations"
}, {
    name: "veterinary_care",
    label: "Veterinary Clinics"
}, {
    name: "zoo",
    label: "Zoos"
}];

function initMap() {
    map = new google.maps.Map(document.getElementById('map-container'), {
        center: mapCenter,
        zoom: 13,
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

    google.maps.event.trigger(map, 'resize');
    infowindow = new google.maps.InfoWindow();
    placesService = new google.maps.places.PlacesService(map);

} //end of initMap
window.initMap = initMap; //must set this to window or initial initMap callback doesn't work

function AppViewModel() {
    var self = this;
    self.places = ko.observableArray(placesList);
    self.displayPlaces = function() {
        //console.log("Display places for [" + this.name + "]");
        clearMapMarkers();
        placesService.nearbySearch({
            location: mapCenter,
            radius: 5000,
            type: this.name
        }, placesServiceCallback);
    };
}

function placesServiceCallback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMapMarker(results[i]);
        }
    }
}

function createMapMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });
    placeMarkers.push(marker);
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}

function clearMapMarkers() {
    for(var i =0; i < placeMarkers.length; i++) {
        placeMarkers[i].setMap(null);
    }
}

$(document).ready(function() {
    //alert("OK");
    ko.applyBindings(new AppViewModel());
});