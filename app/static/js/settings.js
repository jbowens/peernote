peernoteNS.init(function() {
    var lightbox = peernoteNS.widgets.initLightbox($('#delete-form'), {
      closeIcon: true
    });

    $("#delete-button").click(function() {
      lightbox.open();
    });
});
