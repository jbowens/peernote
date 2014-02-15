$(document).ready(function() {
    var timeout;

    $('.show-dropdown').hover(function() {
        window.clearTimeout(timeout);
        $('.dropdown').show();
    }, function() {
        timeout = window.setTimeout(function() {
            $('.dropdown').hide();
        }, 500);
    });

    $('.dropdown').hover(function() {
        window.clearTimeout(timeout);
    }, function() {
        timeout = window.setTimeout(function() {
            $('.dropdown').hide();
        }, 500);
    });
});

