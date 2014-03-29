
var peernoteNS = peernoteNS || {};
peernoteNS.forgotPassword = peernoteNS.forgotPassword || {};

// error checking utility for each textfield
$.extend(peernoteNS.forgotPassword, {
    TEXTFIELDS: {
        "user_to_recover": {
            validator: function(string) {
                string = string.toLowerCase();
                var emailRegex = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
                return emailRegex.test(string);
            },
            autosaveTimer: null,
            isValid: false
        }
    }
});

// initialize js for the page
$.extend(peernoteNS.forgotPassword, {

    init: function() {
      // attach listeners to each textfield for validation
      $( "#user_to_recover").keydown(function(e) {
          peernoteNS.clientsideFormCheck.errorChecker(e, peernoteNS.forgotPassword.TEXTFIELDS);
        });

      // add transition before redirect
      $(".nav-sign-in").click(function(e) {
          e.preventDefault();
          $(".forms-wrapper").fadeOut(200);
          window.location = "/log-in";
      });
    }
});

peernoteNS.init(peernoteNS.forgotPassword.init);
