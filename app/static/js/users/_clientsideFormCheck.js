/* This script is shared between forms for clientside
 * error checking. Note that all of these forms should
 * have appropriate serverside error checking as well. 
 * This code is purely for aesthetics
 */

var peernoteNS = peernoteNS || {};
peernoteNS.clientsideFormCheck = peernoteNS.clientsideFormCheck || {};

$.extend(peernoteNS.clientsideFormCheck, {
    
    // checks the validity of a textfield
    errorChecker: function(e, textfields) {
      var $textfield = $(e.currentTarget);
      peernoteNS.clientsideFormCheck.errorCheckerHelper($textfield, textfields);
      
      // js for signup page only (yeah this isn't great)
      if ($textfield.attr("id") === "signup_password") {
        peernoteNS.clientsideFormCheck.errorCheckerHelper(
            $("#signup_password_confirm"), textfields);
      }
    },

    INPUT_CHECK_PAUSE_MILLIS: 600, // pause this long before validating

    // checks the validity of a textfield
    errorCheckerHelper: function($textfield, textfields) {
      var textfieldTimeUtil = textfields[$textfield.attr("id")];
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

      }, peernoteNS.clientsideFormCheck.INPUT_CHECK_PAUSE_MILLIS);
    },

    // check that all fields are valid before submitting
    submit: function(textfields) {
      var doSubmit = true;
      for (var textfield in textfields) {
        var $textfield = $("#"+textfield);
        peernoteNS.clientsideFormCheck.errorCheckerHelper($textfield);

        if (!textfields[textfield].isValid) {
            doSubmit = false;
        }
      }

      return doSubmit;
    },

});
