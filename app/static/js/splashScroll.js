$(document).ready(function() {

    /* Automatically scroll to certain locations on the page */
    $("#faq-id").click(function() {
        $.scrollTo('#faq', 800, {});
    });

    $("#learn-more").click(function() {
        $.scrollTo('#explanation-content',600, {offset:-60});
    });

    $("#about-id").click(function() {
        $.scrollTo('#explanation-content',600, {});
    });

    /* Turn on parallax scrolling for the window */
    $(window).stellar({horizontalScrolling: false});

    /* Hide the learn more button when scrolling from top */
    $(window).scroll(function() {
        console.log($(window).scrollTop()); 
        var scrollTop = $(window).scrollTop();
        if (scrollTop <= 0) {
            $('#learn-more').fadeIn();
        } else {
            $('#learn-more').fadeOut();
        }
    });
});

