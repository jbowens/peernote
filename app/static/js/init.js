/*
 * Global Peernote utility functions.
 */
var peernoteNS = peernoteNS || {};

/*
 * On document ready, run analytics tracking
 */
$(document).ready(function() {
  ga('create', 'UA-48821336-1', 'auto');

  if (peernoteNS.gaPagename) {
    ga('send', 'pageview', peernoteNS.gaPagename);
  } else {
    ga('send', 'pageview');
  }
});

/*
 * Custom options for google analytics tracking
 */
peernoteNS.setGAOptions = function(options) {
  if (options.pagename) {
    peernoteNS.gaPagename = options.pagename;
  }
};

/*
 * This function should be used in replace of $(document).ready() to
 * register functions be executed when the DOM is ready.
 */
peernoteNS.init = function(cb) {
  $(document).ready(function(e) {
    try {
      cb();
    } catch(err) {
      peernoteNS.error.record(err);
    }
  });
};

peernoteNS.displayFlash = function(text) {
  $('.js-flash').text(text);
  $('.js-flash').slideDown().delay(3000).slideUp();
};

peernoteNS.displayErrorFlash = function(text) {
  $('.js-flash').text(text);
  $('.js-flash').addClass('error-flash');
  $('.js-flash').slideDown().delay(3000).slideUp(function() {
    $('.js-flash').removeClass('error-flash');
  });
};
