var peernoteNS = peernoteNS || {};
peernoteNS.splash = peernoteNS.splash || {};

peernoteNS.splash.sendContactEmail = function (name, email, subject, msg) {
  
  /* Client-Side validations for contact form...
   * Shut the fuck up I know it's bad style, but 
   * it really doesn't matter if they bypass these
   * validations.
   */
  var abort = false;
  if (msg.trim() === "") {
    $('#contact-message').css("border","1px solid red");
    abort = true;
  }
  if (name.trim() === "") {
    $('.contact-form-name').css("border","1px solid red");
    abort = true;
  }
  if (subject.trim() === "") {
    $('.contact-form-subject').css("border","1px solid red");
  }
  if (email.trim() === "") {
    $('.contact-form-email').css("border","1px solid red");
  }
  if (abort) {
    setTimeout( function () {
      $('#contact-message').val(msg);
      $('.contact-form-name').val(name);
      $('.contact-form-subject').val(subject);
      $('.cantact-form-email').val(email);
    }, 1); // jank as fuck. fuck you i'm drunk

    setTimeout( function(){
      $('#contact-message, #contact-fields input').css("border", "1px solid #ccc");
    }, 400); 
    return;
  }

  $.post('/drop-a-line', {
    name: name,
    email: email,
    subject: subject,
    message: msg
  }, function (res) {
    $('#contact-message, #contact-fields input').css("border", "1px solid #ccc");
    $confirmation = $('.confirmation');
    $confirmation.fadeIn();
    //$confirmation.animate({opacity: 0});
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
