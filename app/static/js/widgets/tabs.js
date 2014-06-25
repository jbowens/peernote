/*
 * This enables tab functionality to a given page with ONE set of tabs.
 * I'll extend this function later to accomodate multiple sets of tabs if
 * necessary.
 *
 * To use, label each tab with the classes "tab", "tab-selected", and "tab-unselected."
 * For each tab, add a "for" attribute that is set equal to the class that that tab is
 * meant to unhide.
 *
 * <!-- tabs -->
 * <li class="tab tab-unselected" for=".white-pane"></li>
 * <li class="tab tab-selected" for=".black-pane"></li>
 *
 * <!-- panes to show/hide -->
 * <div class="white-pane"></div>
 * <div class="black-pane"></div>
 *
 * Author: Bryce
 */

var peernoteNS = peernoteNS || {};
peernoteNS.widgets = peernoteNS.widgets || {};

$.extend(peernoteNS.widgets, {
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
});

peernoteNS.init(function() {
    peernoteNS.widgets.tabFunctionality();
});
