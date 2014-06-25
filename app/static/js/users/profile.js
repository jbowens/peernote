var peernoteNS = peernoteNS || {};
peernoteNS.profile = peernoteNS.profile || {};

$.extend(peernoteNS.profile, {
    init: function() {
        this.subscribeNotifications();
        this.lightboxInit();
        this.gradebooksInit();
        this.initLightboxes();
        this.initWeekCalendar();
        this.initHeight();
    },

    // makes sure that the page is never too short
    initHeight: function() {
        $(window).resize(setMinHeight);
        $(".tab").click(setMinHeight);
        setMinHeight();

        function setMinHeight() {
            var windowHeight = $(window).height();
            var footerPushHeight = $(".footer-push").height();
            var footerHeight = $(".footer").height();
            var navHeight = $("nav").height();
            if (windowHeight > footerPushHeight) {
                var newHeight = windowHeight - footerHeight - navHeight;
                $(".footer-push").css("min-height",newHeight);
                $(".wrapper").css("min-height",newHeight);
                $(".dashboard").css("min-height",newHeight);
                var tabbedPanesHeight = $(".tabbed-panes").height()
                    + (4 * parseInt($(".tabbed-panes").css("padding")) + 4);
                $(".notifications-container").css("min-height",newHeight - tabbedPanesHeight);
            }
        }
    },

    initWeekCalendar: function() {
        var days = {
            0:"sunday",
            1:"monday",
            2:"tuesday",
            3:"wednesday",
            4:"thursday",
            5:"friday",
            6:"saturday"
        }

        // milliseconds in day
        var milliInDay = 1000 * 60 * 60 * 24;

        // today
        var currentDate = new Date();

        // get epochtime of today
        var currentEpochTime = currentDate.getTime();

        // get the 0-6 integer representing day of week
        var currentDayNum = currentDate.getDay();

        // get day of week by name
        var currentDay = days[currentDayNum];

        // keep track of which week the calendar is displaying
        var cachedEpochTime = currentEpochTime;

        // set the dates of the week
        populateWeek(currentEpochTime);
        $("."+currentDay+".weekday").addClass("current-weekday");

        // Given an epoch time. sets the correct dates for the other days of the week
        function populateWeek(anchorEpochTime) {
            var date = new Date(anchorEpochTime);
            var anchorDayNum = date.getDay();
            var mondayEpoch = anchorEpochTime - (anchorDayNum * milliInDay) + milliInDay;

            $(".weekday").each(function() {
                var $weekDate = $(this).find(".wd-date");
                $weekDate.html((new Date(mondayEpoch)).getDate());
                mondayEpoch += milliInDay;
            });
        }

        // initialize button to switch to current week
        $(".current-date-button").click(function() {
            populateWeek(currentEpochTime);
            $("."+currentDay+".weekday").addClass("current-weekday");
            cachedEpochTime = currentEpochTime;
        });

        // initialize button to switch to next week
        $(".next-week-button").click(function() {
            cachedEpochTime += (7 * 24 * 60 * 60 * 1000);
            switchWeek(cachedEpochTime);
        });

        // initialize button to switch to previous week
        $(".previous-week-button").click(function() {
            cachedEpochTime -= (7 * 24 * 60 * 60 * 1000);
            switchWeek(cachedEpochTime);
        });

        // given an epoch time, switches to the week containing
        // this time
        function switchWeek(epochTime) {
            populateWeek(epochTime);
            if (epochTime === currentEpochTime) {
                $("."+currentDay+".weekday").addClass("current-weekday");
            }else {
                $(".weekday").removeClass("current-weekday");
            }
        }
    },

    initLightboxes: function() {
        // Initialize lightbox containing full calendar
        var calendar = peernoteNS.widgets.initLightbox($(".calendar-popup"), {
            closeIcon: true,
        });
        $(".fa-arrows-alt").click(function() {
            calendar.open();
        });

        // Initialize lightbox for finding and adding courses
        peernoteNS.profile.lightbox = peernoteNS.widgets.initLightbox($(".add-course-pane"), {
            closeIcon: true,
            onClose: peernoteNS.profile.lightboxReset
        });
        $(".add-course-link").click(function() {
            peernoteNS.profile.lightbox.open();
        });
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
