/*
 * Global Peernote utility functions.
 */
var peernoteNS = peernoteNS || {};

peernoteNS._initFunctions = [];

/*
 * This function should be used in replace of $(document).ready() to
 * register functions be executed when the DOM is ready.
 */
peernoteNS.init = function(cb) {
  peernoteNS._initFunctions.push(cb);
};

$(document).ready(function(e) {
  for (var i = 0; i < peernoteNS._initFunctions.length; ++i) {
    try {
      // Try to initialize the given subsystem
      peernoteNS._initFunctions[i]();
    } catch(err) {
      peernoteNS.error.record(err);
    }
  }
});
