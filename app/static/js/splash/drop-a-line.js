var peernoteNS = peernoteNS || {};
peernoteNS.splash = peernoteNS.splash || {};

peernoteNS.splash.sendContactEmail = function (name, email, subject, msg) {
  $.post('/drop-a-line', {
    name: name,
    email: email,
    subject: subject,
    message: msg
  }, function (res) {
    $confirmation = $('.confirmation');
    $confirmation.css('opacity', 1);
    $confirmation.text('We got your message. Thanks!');
    $confirmation.animate({opacity: 0});
  });
};

peernoteNS.splash.initContactForm = function () {
  var $form = $('.contact-us form');
  $form.submit(function (e) {
    e.preventDefault();
    peernoteNS.splash.sendContactEmail(
      $form.find('input[name="name"]').val(),
      $form.find('input[name="email"]').val(),
      $form.find('input[name="subject"]').val(),
      $form.find('textarea[name="message"]').val());
      $form.find("input[type=text], textarea").val("");
  });
};

$(document).ready(function (e) {
  peernoteNS.splash.initContactForm();
});
