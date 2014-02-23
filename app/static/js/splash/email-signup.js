var peernoteNS = peernoteNS || {};
peernoteNS.splash = peernoteNS.splash || {};

peernoteNS.splash.signupEmail = function (email, isPopup) {
  if (! email)
    return;

  $.post('/email-signup', {email: email}, function (res) {
    if (isPopup) { // submit came from popup form
      $(".sign-up-pane form input").css("display", "none");
        $(".email-confirmation-popup").fadeIn();
    } else {       // submit came from navbar form
      $('#navbar form.email-signup').html(
        '<span class="email-confirmation">Thank you! We\'ll' +
        ' notify you when the beta begins.</span>');
    }
  });
};

peernoteNS.splash.initEmailSignup = function () {
  var $form = $('#navbar form.email-signup, .sign-up-pane form');

  $form.submit(function (e) {
    e.preventDefault();
    var email = $form.find('input[name="email"]').val();
    if ($(e.target).attr('class') === "email-signup") {
      peernoteNS.splash.signupEmail(email, false); // submit is from nav
    } else {
      peernoteNS.splash.signupEmail(email, true); // submit is from popup
    }
  });

};

$(document).ready(function() {
  peernoteNS.splash.initEmailSignup();
});
