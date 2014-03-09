var peernoteNS = peernoteNS || {};
peernoteNS.splash = peernoteNS.splash || {};
$.extend(peernoteNS.splash, {

  signupEmail: function (email, isPopup) {
    if (! email)
      return;

    $.post('/email-signup', {email: email}, function (res) {
      $(".sign-up-pane form input").css("display", "none");
      $(".email-confirmation-popup").fadeIn();
      $('#navbar form.email-signup').html(
        '<span class="email-confirmation">Thank you! We\'ll' +
        ' notify you when the beta begins.</span>');
    });
  },

  initEmailSignup: function () {
    var _this = this;
    var $navForm = $("#navbar form.email-signup");
    var $popupForm = $(".sign-up-pane form");
    _this.formSend($navForm, false);
    _this.formSend($popupForm, true);
  },

  formSend: function ($form,isPopup) {
    var _this = this;
    $form.submit(function (e) {
      e.preventDefault();
      var email = $form.find('input[name="email"]').val();
      if (isPopup) {
        _this.signupEmail(email, true); // submit is from nav
      } else {
        _this.signupEmail(email, false); // submit is from popup
      }
    });
  }
});

peernoteNS.init(function() {
  peernoteNS.splash.initEmailSignup();
});
