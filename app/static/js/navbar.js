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
        $('.new-notifications-symbol').hide();
        $('.options-dropdown').fadeOut(fadeOutTime);
        optionsVisible = false;
        if (notificationsVisible) {
            $('.notifications-dropdown').fadeOut(fadeOutTime);
        } else {
            $('.notifications-dropdown').fadeIn(fadeInTime);
        }
        notificationsVisible = !notificationsVisible;

        // mark all notifications as seen if any are not seen yet
        var ids = [];
        for (var i = 0; i < peernoteNS.notifications.notifications.length; i++) {
            if (!peernoteNS.notifications.notifications[i].seen) {
                ids.push(peernoteNS.notifications.notifications[i].nid);

                //remember clientside it is seen
                peernoteNS.notifications.notifications[i].seen = true;
            }
        }

        if (ids.length > 0) {
            $.post('/api/notifications/seen', {ids: ids, csrf: peernoteNS.csrf});
        }
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
            var notification = notifications[i];

            notification_html = "" +
                '<li class="notification">' +
                    '<div class="notification-thumbnail"></div>' +
                    '<div class="notification-content">' +
                        '<span class="notification-text">' +
                            '<span class="notification-author">' +
                                notification.sender +
                            '</span>' +
                            ' ' + notification.short_text +
                        '</span>' +
                        '<div class="notification-date">' +
                        notification.created_date +
                        '</div>' +
                    '</div>' +
                '</li>';

            var $notification = $(notification_html);
            if (!notification.seen) {
                $notification.addClass("unread-notification");
            }

            // L O L JAVASCRIPT SCOPING!
            (function(notification) {
                $notification.click(function() {
                    $.post('/api/notifications/seen', {
                        ids: [notification.nid],
                        csrf: peernoteNS.csrf
                    });
                    window.location = notification.url;
                });
            })(notification);


            $('#notifications-list').prepend($notification);
        }

        $('#notifications-list').slice(0,8);
    });
});

