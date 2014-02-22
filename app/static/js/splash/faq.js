$(document).ready(function() {

    /*** show and hide faq answers ***/
    $("#faq-1").click(function() { showHide($("#faq-a-1"), $("#faq-1 i"), $('#faq-1 h3')); });
    $("#faq-2").click(function() { showHide($("#faq-a-2"), $("#faq-2 i"), $('#faq-2 h3')); });
    $("#faq-3").click(function() { showHide($("#faq-a-3"), $("#faq-3 i"), $('#faq-3 h3')); });
    $("#faq-4").click(function() { showHide($("#faq-a-4"), $("#faq-4 i"), $('#faq-4 h3')); });
    $("#faq-5").click(function() { showHide($("#faq-a-5"), $("#faq-5 i"), $('#faq-5 h3')); });
    $("#faq-6").click(function() { showHide($("#faq-a-6"), $("#faq-6 i"), $('#faq-6 h3')); });
    $("#faq-7").click(function() { showHide($("#faq-a-7"), $("#faq-7 i"), $('#faq-7 h3')); });
    $("#faq-8").click(function() { showHide($("#faq-a-8"), $("#faq-8 i"), $('#faq-8 h3')); });

    function showHide($displayTarget, $i, $h3) {
        if ($displayTarget.is(":visible")){
            $displayTarget.hide("slide", {direction: "up"}, 200);
            $i.removeClass("fa-caret-down");
            $i.addClass("fa-caret-right");
            $i.css("margin-right","20px");
            $h3.css("color","#888");
        } else {
            $displayTarget.show("slide", {direction: "up"}, 200);
            $i.removeClass("fa-caret-right");
            $i.addClass("fa-caret-down");
            $i.css("margin-right","15px");
            $h3.css("color","#a6538e");
        }
    }

});
