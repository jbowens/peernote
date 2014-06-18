var peernoteNS = peernoteNS || {};
peernoteNS.profile = peernoteNS.profile || {};

$.extend(peernoteNS.profile, {
    init: function() {
        this.tabFunctionality();
        this.subscribeNotifications();
        this.lightboxInit();
    },

    // resets lightbox for adding a course to step 1
    lightboxReset: function() {
            peernoteNS.profile.lightboxStep = 1;
            $(".add-course-steps").css({"right": "0"});
            $(".add-course-back-button").hide();
            $(".add-course-next-button").show();
            $(".add-course-finish-button").hide();
    },

    // the lightbox for adding a course has three steps
    // this denotes which step is currently taking place
    lightboxStep: 1,

    // initializes lightbox for adding a course
    lightboxInit: function() {
        var shift;
        $(".add-course-next-button").click(function() {
            if (peernoteNS.profile.lightboxStep === 1) {
                shift = $(".add-course-step-1").width()
                + parseInt($(".add-course-step-1").css("margin-right"));
                peernoteNS.profile.lightboxStep = 2;
                $(".add-course-back-button").fadeIn(200);
            } else {
                shift = $(".add-course-step-2").width()
                + parseInt($(".add-course-step-2").css("margin-right"));
                peernoteNS.profile.lightboxStep = 3;
                $(".add-course-back-button").fadeOut(200);
                $(".add-course-next-button").fadeOut({
                    complete: function() {
                                  $(".add-course-finish-button").fadeIn(100);
                              }
                }, 100);
            }
            $(".add-course-steps").animate({"right":"+="+shift+"px" }, 200);
        });

        $(".add-course-back-button").click(function() {
            $(".add-course-steps").animate({"right":"-="+shift+"px" }, 200);
            peernoteNS.profile.lightboxStep = 1;
        });

        $(".add-course-finish-button").click(function() {
            peernoteNS.profile.lightbox.close(peernoteNS.profile.lightboxReset);
        });

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

    // Initialize lightbox for finding and adding courses
    peernoteNS.profile.lightbox = peernoteNS.widgets.initLightbox($(".add-course-pane"), {
        closeIcon: true,
        onClose: peernoteNS.profile.lightboxReset
    });

    $(".add-course-link").click(function() {
        peernoteNS.profile.lightbox.open();
    });

    peernoteNS.profile.init();
});
