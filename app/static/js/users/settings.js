
var peernoteNS = peernoteNS || {};
peernoteNS.settings = peernoteNS.settings || {};

// error checking utility for each textfield
$.extend(peernoteNS.settings, {
    TEXTFIELDS: {
        "first_name": { 
            validator: function(string) { return string.length > 0; },
            autosaveTimer: null,
            isValid: false
        },

        "last_name": { 
            validator: function(string) { return string.length > 0; },
            autosaveTimer: null,
            isValid: false
        },

        "new_email": {
            validator: function(string) {
                string = string.toLowerCase();
                var emailRegex = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
                return emailRegex.test(string);
            },
            autosaveTimer: null,
            isValid: false
        },

        "new_password": { 
            validator: function(string) { return string.length > 5; },
            autosaveTimer: null,
            isValid: false
        },

        "new_password_again": { 
            validator: function(string) { return string === $("#new_password").val(); },
            autosaveTimer: null,
            isValid: false
        },
    }
});

// initialize js for the page
$.extend(peernoteNS.settings, {

    init: function() {

      // setup delete account lightbox
      var lightbox = peernoteNS.widgets.initLightbox($('#delete-form'), {
        closeIcon: true
      });

      $("#delete-button").click(function() {
        lightbox.open();
      });

      // attach listeners to each textfield for validation
      $("#first_name, "+
        "#last_name, "+
        "#new_email, "+
        "#new_password, "+
        "#new_password_again").keydown(function(e) {
          peernoteNS.clientsideFormCheck.errorChecker(e, peernoteNS.settings.TEXTFIELDS);
        });

      // attach validator to form submits
      $("form").submit(function(e) {
          return peernoteNS.clientsideFormCheck.submit(peernoteNS.settings.TEXTFIELDS,
              $(e.target));
      });
    }
});

peernoteNS.init(peernoteNS.settings.init);
