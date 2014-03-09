/*
 * Global Peernote utility functions.
 */
var peernoteNS = peernoteNS || {};

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
