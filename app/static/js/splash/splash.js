$(document).ready(function() {

    /*******************************/
    /* Signup Overlay Display Code */
    /*******************************/

    $("#beta-signup, #faq-a-1 a").click(function() {
        $("#sign-up-shadow").css("display","table");
        $("html, body").css({"overflow": "hidden"}); // stop scrolling
    });

    $("#sign-up-shadow").click(function(event) {
        var targetClass = $(event.target).attr('class');
        if (targetClass === "sign-up-center-align" || targetClass === "fa fa-times") {
            $("#sign-up-shadow").fadeOut(100, "linear"); 
            $("html, body").css({"overflow": "visible"}); // enable scrolling
        }
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
