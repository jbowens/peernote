/**
 * Lightbox widget. Given a jquery object, wraps it to turn it into
 * the content for a lightbox.
 */
var peernoteNS = peernoteNS || {};
peernoteNS.widgets = peernoteNS.widgets || {};

peernoteNS.widgets.initLightbox = function(container, options) {
  return peernoteNS.widgets.lightbox.init(container, options)
};

peernoteNS.widgets.lightbox = {
  container: null,

  _outerHtml: function() {
    return '' +
      '<div class="lightbox-shadow">' +
        '<div class="lightbox-center-align">' +
          '<div class="lightbox-horiz-center">' +
            '<div class="lightbox-inner-wrapper"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
  },

  open: function() {
    var _this = this;
    _this.container.css("display", "table");
    $("html, body").css({"overflow": "hidden"}); // stop scrolling
  },

  /**
   * Constructs a lightbox. Returns back lightbox widget having an
   * openLightbox function to open it up.
   *
   * options = {
   *   closeIcon: boolean for adding close icon in corner, default false)
   * }
   */
  init: function(innerHtml, options) {
    var _this = this;
    var $wrapped = innerHtml.wrap(_this._outerHtml);
    _this.container = $wrapped.parents('.lightbox-shadow');

    if (options.closeIcon) {
      _this.container.find('.lightbox-horiz-center').prepend('<i class="fa fa-times"/>');
    }

    _this.container.click(function(event) {
      var targetClass = $(event.target).attr('class');
      // check for fa-times as well if the inner html has a close button
      if (targetClass === "lightbox-center-align" || targetClass === "fa fa-times") {
        _this.container.fadeOut(100, "linear");
        $("html, body").css({"overflow": "visible"}); // enable scrolling
      }
    });

    return _this;
  }
}
