var peernoteNS = peernoteNS || {};
peernoteNS.profile = peernoteNS.profile || {};

$.extend(peernoteNS.profile, {
    init: function() {
        $assignmentsPanel = $(".assigned-reviews");
        $notificationsPanel = $(".notifications");
        $assignmentsTab = $("#assignments");
        $notificationsTab = $("#notifications");

        var notificationsVisible = true;
        $assignmentsTab.click(function() {
            if (notificationsVisible) {
                $notificationsPanel.hide();
                $assignmentsPanel.show();
                $assignmentsTab.addClass("tab-selected");
                $assignmentsTab.removeClass("tab-unselected");
                $notificationsTab.addClass("tab-unselected");
                $notificationsTab.removeClass("tab-selected");
                notificationsVisible = false;
            }
        });
        $notificationsTab.click(function() {
            if (!notificationsVisible) {
                $notificationsPanel.show();
                $assignmentsPanel.hide();
                $notificationsTab.addClass("tab-selected");
                $notificationsTab.removeClass("tab-unselected");
                $assignmentsTab.addClass("tab-unselected");
                $assignmentsTab.removeClass("tab-selected");
                notificationsVisible = true;
            }
        });
    }
});

peernoteNS.init(peernoteNS.profile.init);
