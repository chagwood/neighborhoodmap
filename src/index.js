import 'bootstrap';
import './styles.scss';

$(document).ready(function () {
    $('[data-toggle="offcanvas"]').click(function () {
      $('.row-offcanvas').toggleClass('active');
      console.log("yesss");
        //test
    });
  });

  var map;
  function initMap() {
    map = new google.maps.Map(document.getElementById('map-container'), {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8
    });
  }
  window.initMap = initMap;