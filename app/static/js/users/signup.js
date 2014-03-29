var peernoteNS = peernoteNS || {};
peernoteNS.signup = peernoteNS.signup || {};

$.extend(peernoteNS.signup, {

    // utilities for each textfield
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

        "you-human-textfield": {
            validator: function(string) { return string.length > 0; },
            autosaveTimer: null,
            isValid: false
        }
    }
});

$.extend(peernoteNS.signup, {

    INPUT_CHECK_PAUSE_MILLIS: 600, // pause this long before validating

    // checks the validity of a textfield
    errorCheckerHelper: function($textfield) {

      var textfieldTimeUtil = peernoteNS.signup.TEXTFIELDS[$textfield.attr("id")];
      clearTimeout(textfieldTimeUtil.autosaveTimer);
      textfieldTimeUtil.autosaveTimer = setTimeout(function() {

        if (!textfieldTimeUtil.validator($textfield.val())) { // if invalid
            $textfield.siblings().slideDown(300);
            $textfield.addClass("textfield-error");
            textfieldTimeUtil.isValid = false;
        } else {                                              // if valid
            $textfield.siblings().slideUp(300);
            $textfield.removeClass("textfield-error");
            textfieldTimeUtil.isValid = true;
        }

      }, peernoteNS.signup.INPUT_CHECK_PAUSE_MILLIS);
    },

    // Set up listeners
    init: function() {

      // attach listeners to each textfield for validation
      $("#signup_first_name, " +
        "#signup_last_name, " +
        "#signup_email, " +
        "#signup_password, " +
        "#signup_password_confirm, " +
        "#you-human-textfield").keydown(peernoteNS.signup.errorChecker);

      // attach validator to form submit
      $("#signup-form").submit(peernoteNS.signup.submit);

      // special case
      if ($(".error")[0]) {
        peernoteNS.signup.errorCheckerHelper($("#you-human-textfield"));
      }
    },

    // checks the validity of a textfield
    errorChecker: function(e) {
      var $textfield = $(e.currentTarget);
      peernoteNS.signup.errorCheckerHelper($textfield);
      
      console.log($textfield.attr("id"));
      if ($textfield.attr("id") === "signup_password") {
        peernoteNS.signup.errorCheckerHelper($("#signup_password_confirm"));
      }
    },

    // check that all fields are valid before submitting
    submit: function() {
      var doSubmit = true;
      for (var textfield in peernoteNS.signup.TEXTFIELDS) {
        var $textfield = $("#"+textfield);
        peernoteNS.signup.errorCheckerHelper($textfield);

        if (!peernoteNS.signup.TEXTFIELDS[textfield].isValid) {
            doSubmit = false;
        }
      }

      return doSubmit;
    }

});

peernoteNS.init(peernoteNS.signup.init);
