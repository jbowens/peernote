var peernoteNS = peernoteNS || {};
peernoteNS.splash = peernoteNS.splash || {};

peernoteNS.splash.signupEmail = function (email, isPopup) {
  if (! email)
    return;

  $.post('/email-signup', {email: email}, function (res) {
    $(".sign-up-pane form input").css("display", "none");
    $(".email-confirmation-popup").fadeIn();
    $('#navbar form.email-signup').html(
      '<span class="email-confirmation">Thank you! We\'ll' +
      ' notify you when the beta begins.</span>');
  });
};

peernoteNS.splash.initEmailSignup = function () {
  var $navForm = $("#navbar form.email-signup");
  var $popupForm = $(".sign-up-pane form");
  peernoteNS.splash.formSend($navForm, false);
  peernoteNS.splash.formSend($popupForm, true);
};

peernoteNS.splash.formSend = function ($form,isPopup) {
  $form.submit(function (e) {
    e.preventDefault();
    var email = $form.find('input[name="email"]').val();
    if (isPopup) {
      peernoteNS.splash.signupEmail(email, true); // submit is from nav
    } else {
      peernoteNS.splash.signupEmail(email, false); // submit is from popup
    }
  });
};

$(document).ready(function() {
  peernoteNS.splash.initEmailSignup();
});
