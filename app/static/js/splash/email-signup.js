var peernoteNS = peernoteNS || {};
peernoteNS.splash = peernoteNS.splash || {};

peernoteNS.splash.signupEmail = function (email) {
  if (! email)
    return;

  $.post('/email-signup', {email: email}, function (res) {
    $('#navbar form.email-signup').html('<span class="email-confirmation">Thank you! We\'ll notify you when the beta begins.</span>');
  });
};

peernoteNS.splash.initEmailSignup = function () {
  var $form = $('#navbar form.email-signup');
  $form.submit(function (e) {
    e.preventDefault();
    var email = $form.find('input[name="email"]').val();
    peernoteNS.splash.signupEmail(email);
  });
};

$(document).ready(function() {
  peernoteNS.splash.initEmailSignup();
});
