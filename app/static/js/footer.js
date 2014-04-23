// This code makes the footer stick to the bottom of
// the page on every page

var peernoteNS = peernoteNS || {};
peernoteNS.footer = {
    position: function() {
        peernoteNS.footer.reposition();
        $(window).resize(peernoteNS.footer.reposition);
    },

    reposition: function() {
        var $pageWrapper = $(".wrapper");
        var $footerPush = $(".footer-push");
        var $window = $(window);
        var $nav = $("nav");
        var $navSection = $(".nav-section");
        var $footer = $(".footer");

        var wrapperHeight = $pageWrapper.height();
        var footerPushHeight = $footerPush.height();
        var windowHeight = $window.height();
        var navbarHeight = $nav.height() + $navSection.height();
        var footerHeight = $footer.height();
        var contentSpace = windowHeight - navbarHeight - footerHeight;

        if ($navSection.length > 0 && $navSection.css("opacity").length > 0
                && $navSection.css("opacity") == 0) {
            contentSpace = contentSpace + $navSection.height();
        }

        if (footerPushHeight < contentSpace) {
            $footerPush.height(contentSpace + "px");
        } else if ( footerPushHeight > contentSpace
                && footerPushHeight >= wrapperHeight
                && wrapperHeight <= contentSpace) {
            $footerPush.height(contentSpace);
        }

        if ($navSection.length > 0 && $navSection.css("opacity").length > 0
                && $navSection.css("opacity") == 0) {
            $(".wrapper").height(($footerPush.height() + $footer.height() + 1) + "px");
        }
    }
}

peernoteNS.init(function() {
    window.load = peernoteNS.errors.wrap(function(e) {
        $(".footer-push").height($(".wrapper").height());
    });
    peernoteNS.footer.position();
});
