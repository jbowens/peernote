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
            optionsVisible = false;
            notificationsVisible = false;
            $('.options-dropdown').fadeOut(fadeOutTime);
            $('.notifications-dropdown').fadeOut(fadeOutTime);
        }
    });


    // subscribe for notifications
    peernoteNS.notifications.subscribe(function(notifications) {
        for (var i = 0; i < notifications.length; i++) {
            // TODO: not every notification will be unread
            new_notification = "" +
                '<li class="notification unread-notification">' +
                    '<div class="notification-thumbnail"></div>' +
                    '<div class="notification-content">' +
                        '<span class="notification-text">' +
                            '<span class="notification-author">' +
                                notifications[i].sender +
                            '</span>' +
                            ' ' + notifications[i].short_text +
                        '</span>' +
                        '<div class="notification-date">' +
                        notifications[i].created_date +
                        '</div>' +
                    '</div>' +
                '</li>';

            $('#notifications-list').prepend(new_notification);
        }

        $('#notifications-list').slice(0,10);
    });
});

