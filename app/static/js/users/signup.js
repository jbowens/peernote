var peernoteNS = peernoteNS || {};
peernoteNS.signup = peernoteNS.signup || {};

$.extend(peernoteNS.signup, {

    // error check utilities for each textfield
    TEXTFIELDS: {
        "signup_first_name": {
            validator: function(string) { return string.length > 0 && string.length < 31 },
            autosaveTimer: null,
            isValid: false
        },

        "signup_last_name": {
            validator: function(string) { return string.length > 0 && string.length < 31; },
            autosaveTimer: null,
            isValid: false
        },

        "signup_email": {
            validator: function(string) {
                string = string.toLowerCase();
                var emailRegex = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
                return emailRegex.test(string) && string.length < 81;
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
      $("#signup-form").submit(function(e) {
        // It's possible that a browser autocompleter will fill our honeypot.
        // This allows spam bots that execute all the javascript on the page
        // to get pass the honeypot, but I think it's more important that we
        // don't fuck over our users. This will set the value back to the
        // empty string.
        $('.winnie-the-pooh input').val('');

        // Perform client-side validation checks.
        return peernoteNS.clientsideFormCheck.submit(peernoteNS.signup.TEXTFIELDS,
              $(e.target));
      });

      $( "#signup_password" ).keydown(function() {
        $passwordAgain = $("#signup_password_confirm");
        $passwordAgain.val("");
        $passwordAgain.siblings().slideUp(300);
        $passwordAgain.removeClass("textfield-error");
        peernoteNS.signup.TEXTFIELDS["signup_password_confirm"].isValid = true;
      });

      $(".log-in-link, .nav-sign-in").click(function (e) {
            e.preventDefault();
            $(".forms-wrapper").fadeOut(200);
            window.location = "/log-in";
      });

    }

});

peernoteNS.init(peernoteNS.signup.init);
