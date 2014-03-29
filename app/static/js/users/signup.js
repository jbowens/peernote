var peernoteNS = peernoteNS || {};
peernoteNS.signup = peernoteNS.signup || {};

$.extend(peernoteNS.signup, {

    // error check utilities for each textfield
    TEXTFIELDS: {
        "signup_first_name": { 
            validator: function(string) { return string.length > 0; },
            autosaveTimer: null,
            isValid: false
        },

        "signup_last_name": { 
            validator: function(string) { return string.length > 0; },
            autosaveTimer: null,
            isValid: false
        },

        "signup_email": {
            validator: function(string) {
                string = string.toLowerCase();
                var emailRegex = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
                return emailRegex.test(string);
            },
            autosaveTimer: null,
            isValid: false
        },

        "signup_password": { 
            validator: function(string) { return string.length > 5; },
            autosaveTimer: null,
            isValid: false
        },

        "signup_password_confirm": { 
            validator: function(string) { return string === $("#signup_password").val(); },
            autosaveTimer: null,
            isValid: false
        },
    }
});

$.extend(peernoteNS.signup, {

    // Set up listeners
    init: function() {

      // attach listeners to each textfield for validation
      $("#signup_first_name, " +
        "#signup_last_name, " +
        "#signup_email, " +
        "#signup_password, " +
        "#signup_password_confirm").keydown(function(e) {
          peernoteNS.clientsideFormCheck.errorChecker(e, peernoteNS.signup.TEXTFIELDS);
        });

      // attach validator to form submit
      $("#signup-form").submit(function() {
          peernoteNS.clientsideFormCheck.submit(peernoteNS.signup.TEXTFIELDS);
      });

      $(".log-in-link, .nav-sign-in").click(function (e) {
            e.preventDefault();
            $(".forms-wrapper").fadeOut(200);
            window.location = "/log-in";
      });

    }

});

peernoteNS.init(peernoteNS.signup.init);
