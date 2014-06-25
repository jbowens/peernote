var peernoteNS = peernoteNS || {};
peernoteNS.courseDashboard = peernoteNS.courseDashboard || {};

$.extend(peernoteNS.courseDashboard, {
    init: function() {
        this.initWeekCalendar();
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

        var months = {
            0: "January",
            1: "February",
            2: "March",
            3: "April",
            4: "May",
            5: "June",
            6: "July",
            7: "August",
            8: "September",
            9: "October",
            10: "November",
            11: "December"
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
    }
});

peernoteNS.init(function() {
    peernoteNS.courseDashboard.init();
});
