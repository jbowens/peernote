
var peernoteNS = peernoteNS || {};
peernoteNS.resetPassword = peernoteNS.resetPassword || {};

// error checking utility for each textfield
$.extend(peernoteNS.resetPassword, {
    TEXTFIELDS: {
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
$.extend(peernoteNS.resetPassword, {

    init: function() {
      // attach listeners to each textfield for validation
      $( "#new_password, " +
         "#new_password_again").keydown(function(e) {
          peernoteNS.clientsideFormCheck.errorChecker(e, peernoteNS.resetPassword.TEXTFIELDS);
        });

      $( "#new_password" ).keydown(function() {
        $passwordAgain = $("#new_password_again");
        $passwordAgain.val("");
        $passwordAgain.siblings().slideUp(300);
        $passwordAgain.removeClass("textfield-error");
        peernoteNS.resetPassword.TEXTFIELDS["new_password_again"].isValid = true;
      });

      // attach validator to form submit
      $("form").submit(function(e) {
          return peernoteNS.clientsideFormCheck.submit(peernoteNS.resetPassword.TEXTFIELDS,
              $(e.target));
      });

      // add transition before redirect
      $(".nav-sign-in").click(function(e) {
          e.preventDefault();
          $(".forms-wrapper").fadeOut(200);
          window.location = "/log-in";
      });
    }
});

peernoteNS.init(peernoteNS.resetPassword.init);
