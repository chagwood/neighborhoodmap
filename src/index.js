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
  }
  window.initMap = initMap;