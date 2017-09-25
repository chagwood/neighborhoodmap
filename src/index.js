import 'bootstrap';
import './styles.scss';

$(document).ready(function () {
    $('[data-toggle="offcanvas"]').click(function () {
      $('.row-offcanvas').toggleClass('active');
      console.log("yesss");
        //test
    });
  });