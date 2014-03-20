peernoteNS.init(function() {

    /*******************************/
    /* Signup Overlay Display Code */
    /*******************************/

    var lightbox = peernoteNS.widgets.initLightbox($('.sign-up-pane'), {
      closeIcon: true
    });

    $(".signup, #faq-a-1 a").click(function() {
      lightbox.open();
    });


    /*******************************/
    /*   AUTOMATED SCROLL CODE     */
    /*******************************/

    /* Automatically scroll to certain locations on the page */
    $("#faq-id").click(function() {
        $.scrollTo('#faq', 800, {});
    });

    $("#learn-more").click(function() {
        $.scrollTo('#explanation-content', 400); //, {offset: -60});
    });

    $("#about-id").click(function() {
        $.scrollTo('#explanation-content', 400); //, {offset: -60});
    });

    $("#instructors-id").click(function() {
        $.scrollTo('#splash-2', 600); //, {offset: -40});
    });

    $(".contact-button a").click(function() {
        $.scrollTo('#footer', 600);
        $('.contact-form-name').focus();
    });

    $('#faq-a-8 a').click(function() {
       $.scrollTo('#footer', 200);
       $('.contact-form-name').focus();
    });

    /* Hide the learn more button when scrolling from top */
    $(window).scroll(function() {
        var scrollTop = $(window).scrollTop();
        if (scrollTop <= 0) {
            $('#learn-more').fadeIn();
        } else {
            $('#learn-more').fadeOut();
        }
    });
    
});


peernoteNS.setGAOptions({
    pagename: '/splash'
});
