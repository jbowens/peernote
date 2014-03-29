// This code makes the footer stick to the bottom of
// the page on every page

var peernoteNS = peernoteNS || {};
peernoteNS.footer = {
    position: function() {          
        var $pageWrapper = $(".wrapper");
        var $footerPush = $(".footer-push");
        var $window = $(window);
        var $nav = $("nav");
        var $navSection = $(".nav-section");
        var $footer = $(".footer");

        function reposition() {          
            var wrapperHeight = $pageWrapper.height();
            var footerPushHeight = $footerPush.height();
            var windowHeight = $window.height();
            var navbarHeight = $nav.height() + $navSection.height();
            var footerHeight = $footer.height();
            var contentSpace = windowHeight - navbarHeight - footerHeight;
            if ($(".nav-section").is(":visible")) {
                contentSpace = contentSpace + $navSection.height();
            }
            if (footerPushHeight < contentSpace) {
                $footerPush.height(contentSpace + "px");
            } else if ( footerPushHeight > contentSpace 
                    && footerPushHeight >= wrapperHeight
                    && wrapperHeight <= contentSpace) {
                $footerPush.height(contentSpace);
            }
        }

        $footerPush.height($pageWrapper.height());
        reposition();
        $(window).resize(reposition);
    }
}

$(document).ready(peernoteNS.footer.position);
