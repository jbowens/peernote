var peernoteNS = peernoteNS || {};
peernoteNS.login = peernoteNS.login || {};

// error checking utility for each textfield
$.extend(peernoteNS.login, {
    TEXTFIELDS: {
        "login_email": {
            validator: function(string) {
                string = string.toLowerCase();
                var emailRegex = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
                return emailRegex.test(string);
            },
            autosaveTimer: null,
            isValid: false
        },

        "login_password": { 
            validator: function(string) { return string.length > 0; },
            autosaveTimer: null,
            isValid: false
        }
    }
});

// initialize js for the page
$.extend(peernoteNS.login, {

    init: function() {
      // attach listeners to each textfield for validation
      $("#login_email, " +
        "#login_password").keydown(function(e) {
          peernoteNS.clientsideFormCheck.errorChecker(e, peernoteNS.login.TEXTFIELDS);
        });

      $("#login_email").blur( function(e) {
        peernoteNS.clientsideFormCheck.errorChecker(e, peernoteNS.login.TEXTFIELDS);
      });

      // add transition before redirect
      $(".sign-up-link").click(function(e) {
          e.preventDefault();
          $(".forms-wrapper").fadeOut(200);
          window.location = "/sign-up";
      });

      $(".password-forgot-link").click(function(e) {
          e.preventDefault();
          $(".forms-wrapper").fadeOut(200);
          window.location = "/forgot-password";
      });
    }
});

peernoteNS.init(peernoteNS.login.init);
