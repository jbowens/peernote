var peernoteNS = peernoteNS || {};
peernoteNS.profile = peernoteNS.profile || {};

$.extend(peernoteNS.profile, {
    init: function() {
        this.subscribeNotifications();
        this.addCourseInit();
        this.gradebooksInit();
        this.createCourseInit();
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
        peernoteNS.profile.addCoursePopup =
            peernoteNS.widgets.initLightbox($(".add-course-pane"), {
                closeIcon: true,
                onClose: function() { peernoteNS.profile.addCourseCarousel.reset(); }
        });
        $(".add-course-link").click(function() {
            peernoteNS.profile.addCoursePopup.open();
        });

        // Initialize lightbox for createing a new course
        peernoteNS.profile.createCoursePopup =
             peernoteNS.widgets.initLightbox($(".create-course-pane"), {
                closeIcon: true,
                onClose: function() { peernoteNS.profile.createCourseCarousel.reset(); }
            });
        $(".create-course-link").click(function() {
            peernoteNS.profile.createCoursePopup.open();
        });
    },

    // initializes lightbox for adding a course
    addCourseInit: function() {
        peernoteNS.profile.addCourseCarousel =
            peernoteNS.widgets.initCarousel($(".add-course-slider-window"),
            $(".add-course-steps"),
            {
                stepFunction: {
                    ".add-course-step-1": function () {
                        $(".add-course-back-button").fadeOut();
                        $(".add-course-finish-button").fadeOut();
                        $(".add-course-next-button").fadeIn();
                    },
                    ".add-course-step-2": function() {
                        $(".add-course-back-button").fadeIn();
                    },
                    ".add-course-step-3": function() {
                        $(".add-course-back-button").fadeOut();
                        $(".add-course-next-button").fadeOut({
                            complete: function() {
                                $(".add-course-finish-button").fadeIn();
                            }
                        });
                    }
                }
            }
        );

        $(".add-course-finish-button").click(function() {
            peernoteNS.profile.addCoursePopup.close(function () {
             peernoteNS.profile.addCourseCarousel.reset();
            });
        });
    },

    createCourseInit: function() {
        peernoteNS.profile.createCourseCarousel =
            peernoteNS.widgets.initCarousel($(".create-course-slider-window"),
                $(".create-course-steps"),
                { stepFunction: {
                              ".create-course-step-1": function () {
                                  $(".create-course-back-button").fadeOut();
                                  $(".create-course-next-button").fadeIn();
                                  $(".create-course-finish-button").fadeOut();
                              },
                              ".create-course-step-2": function() {
                                  $(".create-course-back-button").fadeIn();
                              },
                              ".create-course-step-4b": function() {
                                  $(".create-course-back-button").fadeIn();
                                  $(".create-course-finish-button").fadeOut({
                                      complete: function() {
                                                    $(".create-course-next-button").fadeIn();
                                                }
                                  });
                              },
                              ".create-course-step-5": function() {
                                  $(".create-course-back-button").fadeOut();
                                  $(".create-course-next-button").fadeOut({
                                      complete: function() {
                                                    $(".create-course-finish-button").fadeIn();
                                                }
                                  });
                              }
                          }
                }
        );

        $(".create-course-finish-button").click(function() {
            peernoteNS.profile.createCoursePopup.close(function () {
                peernoteNS.profile.createCourseCarousel.reset();
            });
        });

        // only prompt for a passcode if the teacher wants one
        $(".create-course-radio").click(function() {
            if ($("#require-passcode").is(':checked')){
                $(".create-course-step-4").attr("next",".create-course-step-4b");
            } else {
                $(".create-course-step-4").attr("next",".create-course-step-5");
            }
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
                                    }
                                }
                            );
                        });
                    }
                }
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
    peernoteNS.profile.init();
});
