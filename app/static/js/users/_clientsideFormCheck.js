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
      peernoteNS.clientsideFormCheck.errorCheckerHelper($textfield, 
          textfields,
          peernoteNS.clientsideFormCheck.INPUT_CHECK_PAUSE_MILLIS);
    },

    INPUT_CHECK_PAUSE_MILLIS: 800, // pause this long before validating

    // checks the validity of a textfield
    errorCheckerHelper: function($textfield, textfields, timeout) {
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

      }, timeout);
    },

    // check that all fields are valid before submitting
    submit: function(textfields, $form) {
      var doSubmit = true;
      for (var textfield in textfields) {
        var $textfield = $("#"+textfield);
        if ($form.has($textfield).length > 0) { // make sure the textfield is in the submitted form
            peernoteNS.clientsideFormCheck.errorCheckerHelper($textfield, textfields,0);
        
            if (!textfields[textfield].isValid) {
                doSubmit = false;
            }
        }
      }
      return doSubmit;
    },

});
