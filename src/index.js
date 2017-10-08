import './styles.scss';

$(document).ready(function () {
    //alert("OK");
});


  var map;
  function initMap() {
    map = new google.maps.Map(document.getElementById('map-container'), {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8
    });

    google.maps.event.trigger(map, 'resize');
  }
  window.initMap = initMap;