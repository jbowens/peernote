$(document).ready(function() {

    /*******************************/
    /* Signup Overlay Display Code */
    /*******************************/

    $("#beta-signup, #faq-a-1 a").click(function() {
        $("#sign-up-shadow").css("display","table");
    });

    $("#sign-up-shadow").click(function(event) {
        var targetClass = $(event.target).attr('class');
        if (targetClass === "sign-up-center-align" || targetClass === "fa fa-times") {
            $("#sign-up-shadow").fadeOut(100, "linear"); 
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
    });

    /* Turn on parallax scrolling for the window */
    //$(window).stellar({horizontalScrolling: false});

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
