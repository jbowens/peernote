peernoteNS.init(function() {
    var optionsVisible = false;
    var notificationsVisible = false;
    var fadeInTime = 60;
    var fadeOutTime = 100;

    $('.show-dropdown').click(function(e) {
        e.preventDefault();
        $('.notifications-dropdown').fadeOut(fadeOutTime);
        notificationsVisible = false;
        if (optionsVisible) {
            $('.options-dropdown').fadeOut(fadeOutTime);
        } else {
            $('.options-dropdown').fadeIn(fadeInTime);
        }
        optionsVisible = !optionsVisible;
    });

    $('.show-notifications').click(function(e) {
        e.preventDefault();
        $('.options-dropdown').fadeOut(fadeOutTime);
        optionsVisible = false;
        if (notificationsVisible) {
            $('.notifications-dropdown').fadeOut(fadeOutTime);
        } else {
            $('.notifications-dropdown').fadeIn(fadeInTime);
        }
        notificationsVisible = !notificationsVisible;
    });

    $(document).click(function(e) {
        var $target = $(e.target);
        if (   !($target.parents(".options-dropdown").length > 0)
            && !($target.parents(".notifications-dropdown").length > 0)
            && !($target.parents(".show-dropdown").length > 0)
            && !$target.hasClass("options-dropdown")
            && !$target.hasClass("notifications-dropdown")
            && !$target.hasClass("show-dropdown")
            && !$target.hasClass("show-notifications")) {
            console.log("here");
            optionsVisible = false;
            notificationsVisible = false;
            $('.options-dropdown').fadeOut(fadeOutTime);
            $('.notifications-dropdown').fadeOut(fadeOutTime);
        }
    });
});

