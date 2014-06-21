var peernoteNS = peernoteNS || {};
peernoteNS.profile = peernoteNS.profile || {};

$.extend(peernoteNS.profile, {
    init: function() {
        this.tabFunctionality();
        this.subscribeNotifications();
        this.lightboxInit();
        this.gradebooksInit();
    },

    // initializes the display code for each grade report
    gradebooksInit: function() {
        $(".gradebook-viewer").each(function() {
            var $detailsButton = $(this).find(".gradebook-details-button");
            var $container = $(this).find(".gradebook-assignments-container");
            var $containerPush = $(this).find(".gradebook-assignments-container-top-push");

            var closed = true;
            var complete = true; // hacky synchronization
            $detailsButton.click(function() {
                if (complete) {
                    complete = false;
                    if (closed) {
                        $containerPush.slideToggle(100,function() {
                            $container.slideToggle(function() {
                                closed = !closed;
                                var icon = $detailsButton.find("i");
                                icon.removeClass("fa-plus-square-o");
                                icon.addClass("fa-minus-square-o");
                                complete = true;
                            });
                        });
                    } else {
                        $container.slideToggle(500,function() {
                            $containerPush.slideToggle(
                                {
                                    duration: 100,
                                    easing: 'swing',
                                    complete: function() {
                                        closed = !closed;
                                        var icon = $detailsButton.find("i");
                                        icon.removeClass("fa-minus-square-o");
                                        icon.addClass("fa-plus-square-o");
                                        complete = true;
                                        complete=true;
                                    }
                                }
                            );
                        });
                    }
                }
            });
        });
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
            $(".add-course-back-button").fadeOut(200);
        });

        $(".add-course-finish-button").click(function() {
            peernoteNS.profile.lightbox.close(peernoteNS.profile.lightboxReset);
        });
    },

    /* Make tabs work */
    tabFunctionality: function() {
        $(".tab").click(function() {
            $(".tab").removeClass("tab-selected");
            $(".tab").addClass("tab-unselected");

            var tabClassToShow = $(this).attr("for");
            $(tabClassToShow).show();
            $(this).removeClass("tab-unselected");
            $(this).addClass("tab-selected");

            $(".tab-unselected").each(function () {
               var tabClassToHide = $(this).attr("for");
               $(tabClassToHide).hide();
            });
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
