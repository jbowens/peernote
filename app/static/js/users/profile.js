var peernoteNS = peernoteNS || {};
peernoteNS.profile = peernoteNS.profile || {};

$.extend(peernoteNS.profile, {
    init: function() {
        this.tabFunctionality();
        this.subscribeNotifications();
    },

    /* Make tabs work */
    tabFunctionality: function() {
        $assignmentsPanel = $(".assignments-tab");
        $notificationsPanel = $(".week-calendar");
        $coursesPanel = $(".courses-tab");
        $assignmentsTab = $("#assignments");
        $notificationsTab = $("#notifications");
        $coursesTab = $("#courses");

        $assignmentsTab.click(function() {
                $notificationsPanel.hide();
                $coursesPanel.hide();
                $assignmentsPanel.show();
                $assignmentsTab.addClass("tab-selected");
                $assignmentsTab.removeClass("tab-unselected");
                $notificationsTab.addClass("tab-unselected");
                $notificationsTab.removeClass("tab-selected");
                $coursesTab.addClass("tab-unselected");
                $coursesTab.removeClass("tab-selected");
        });

        $coursesTab.click(function() {
            $notificationsPanel.hide();
            $coursesPanel.show();
            $assignmentsPanel.hide();
            $assignmentsTab.addClass("tab-unselected");
            $assignmentsTab.removeClass("tab-selected");
            $notificationsTab.addClass("tab-unselected");
            $notificationsTab.removeClass("tab-selected");
            $coursesTab.removeClass("tab-unselected");
            $coursesTab.addClass("tab-selected");
        });

        $notificationsTab.click(function() {
                $notificationsPanel.show();
                $coursesPanel.hide();
                $assignmentsPanel.hide();
                $notificationsTab.addClass("tab-selected");
                $notificationsTab.removeClass("tab-unselected");
                $assignmentsTab.addClass("tab-unselected");
                $assignmentsTab.removeClass("tab-selected");
                $coursesTab.addClass("tab-unselected");
                $coursesTab.removeClass("tab-selected");
        });
    },

    /* listen for new notifications */
    subscribeNotifications: function() {
        peernoteNS.notifications.subscribe(function(notifications) {
            for (var i = 0; i < notifications.length; i++) {
                // TODO: if sender_gravatar_hash is empty, should have a generic peernote picture
                var gravatar = 'http://www.gravatar.com/avatar/' + notifications[i].sender_gravatar_hash + '?s=40';

                new_notification = "" +
                    '<li class="notification">' +
                        '<img src="' + gravatar +'" class="notification-thumbnail">' +
                        '<div class="notification-content">' +
                            '<div class="author-date">' +
                                '<div class="notification-author">' +
                                    notifications[i].sender +
                                '</div>' +
                                '<div class="notification-date">' +
                                    notifications[i].created_date +
                                '</div>' +
                            '</div>' +
                            '<div class="notification-text">' +
                                notifications[i].long_text +
                            '</div>' +
                        '</div>' +
                    '</li>';

                $('ul.notifications').prepend(new_notification);
            }
        })
    }
});

peernoteNS.init(function() {
    peernoteNS.profile.init();
});
