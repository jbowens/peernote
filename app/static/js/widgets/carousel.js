
/**
 * This widget creates a javascript carousel. (You have several panes, only one visible at a
 * time and you can cycle through them).
 *
 * init expects at least 3 arguments:
 *
 * container: the div where the visible panel will appear. the height and width should be set
 *      to that of each panel that will be shown. (All panels should be the same size)
 *
 * panesList: a ul where each li contains a panel that will appear. The first li in the list
 *      will be the first one displayed. Each li should optionally have the following
 *      attributes:  a "next" attribute which specifies the id/class of the next pane, a "prev"
 *      attribute which specifies the previous pane if any, a "next-button" attribute which
 *      specifies a next button, and a "prev-button" attribute which specifies a previous button
 *      ex: <li next=".step-2" back-button=".step-1-back" next-button=".step-1-next"></li>
 *
 * options: a dictionary of various options.
 *     margin - this option sets the margin between the panes when there's a transition from
 *          one pane to the next (px). margin-right on each li should equal the value of this
 *          margin option
 *     stepFunction - a plain object that matches class names of li panes to callback functions
 *          that should be called when the pane with the corresponding class name becomes
 *          visible. ex: {"step-1": function() {alert(1);}, "step-2": function() {}};
 *
 * Author: Bryce
 */
var peernoteNS = peernoteNS || {};
peernoteNS.widgets = peernoteNS.widgets || {};

peernoteNS.widgets.initCarousel = function($container,$panesList, options) {
  // Clone lightbox object and return new one
  var newCarousel = $.extend({}, peernoteNS.widgets.carousel);
  return newCarousel.init($container, $panesList, options);
  //return newCarousel;
};

peernoteNS.widgets.carousel = {
  container: null,
  margin: "50px",
  currentLi: null,
  paneWidth: null,
  stepFunction: {},
  firstPane: null,
  panesList: null,

  init: function($container, $panesList, options) {
      var _this = this;
      _this.panesList = $panesList;

      if (options) {
          if (options.margin) {
              _this.margin = options.margin;
          }

          if (options.stepFunction) {
              _this.stepFunction = options.stepFunction;
          }
      }

      var _margin = _this.margin;

      var paneWidth = $container.width();
      _this.paneWidth = paneWidth;

      var paneHeight = $container.height();

      // ul needs to contain room for the visible li (in the middle), the next li (on the
      // right), and room for the visible li to disappear to (on the left)
      $panesList.width(3 * ((2 * parseInt(_margin)) + paneWidth));
      $panesList.height(paneHeight);

      if ($container.css("position") === "static") {
          $container.css("position", "relative");
      }

      $panesList.css(
              {
                  "position":"absolute",
                  "top":"0px",
                  "left": (0 - (3 * parseInt(_margin)) - paneWidth) + "px"
              });

      $panesList.find("li")
          .css({"float":"left","margin-right":parseInt(_margin) + "px",
              "margin-left":parseInt(_margin) + "px"
          })
          .hide();

      var $firstli = $panesList.find(">:first-child");
      _this.firstPane = $firstli;
      $firstli.css({"display": "block",
          "margin-left": ((3 * parseInt(_margin)) + paneWidth) + "px"});
      _this.currentLi = $firstli;
      _this.initCurrentPanel();

      return _this;
  },

  // reset to first step
  reset: function() {
      var _this = this;
      var _margin = _this.margin;
      var _paneWidth = _this.paneWidth;
      var _firstPane = _this.firstPane;

      _this.panesList.find("li")
          .css({"float":"left","margin-right":parseInt(_margin) + "px",
              "margin-left":parseInt(_margin) + "px"
          })
          .hide();

      _firstPane.css({"display": "block",
          "margin-left": ((3 * parseInt(_margin)) + _paneWidth) + "px"});

      var stepFunctions = _this.stepFunction;
      $(_firstPane.attr('class').split(' ')).each(function() {
        if (stepFunctions["." + this]) {
            stepFunctions["." + this]();
        }
      });

      _this.currentLi = _firstPane;
      _this.initCurrentPanel();
  },

  // set up the next and previous buttons on the visible panel
  initCurrentPanel: function() {
    var _this = this;
    var $current = _this.currentLi;

    if ($current.attr("next-button")) {
        $($current.attr("next-button"))
            .click(function() {
                $($current.attr("next-button")).off();

                if ($($current.attr("prev-button"))) {
                    $($current.attr("prev-button")).off();
                }
                _this.nextPanel();
            });
    }

    if ($current.attr("prev-button")) {
        $($current.attr("prev-button"))
            .click( function() {
                $($current.attr("prev-button")).off();

                if ($($current.attr("next-button"))) {
                    $($current.attr("next-button")).off();
                }
                _this.prevPanel();
            });
    }
  },

  // animate one panel disappearing to the left and another panel appearing
  // from the right
  nextPanel: function() {
    var _this = this;
    var _margin = _this.margin;
    var _paneWidth = _this.paneWidth;
    var $current = _this.currentLi;

    // make sure current pane is set up to go in correct direction
    $current.css({"margin-left": ((3 * parseInt(_margin)) + _paneWidth) + "px",
        "margin-right": parseInt(_margin),
        "float": "left"});

    // place next pane to the right of the visible pane
    $next = $($current.attr("next"));
    $current.insertBefore($next);
    $next.css("float","left");
    $next.show();

    var stepFunctions = _this.stepFunction;
    if (stepFunctions[$current.attr("next")]) {
        stepFunctions[$current.attr("next")]();
    }

    // perform the animation between panes
    $current.animate({"margin-left": parseInt(_margin) + "px"},
            {
                duration: 500,
                complete: function() {
                    $next.css("margin-left", ((3 * parseInt(_margin)) + _paneWidth) + "px");
                    $current.hide();
                    _this.currentLi = $next;
                    _this.initCurrentPanel();
                }
            });
  },

  // animate one panel disappearing to the right and another panel appearing from
  // the left
  prevPanel: function() {
    var _this = this;
    var _margin = _this.margin;
    var _paneWidth = _this.paneWidth;
    var $current = _this.currentLi;

    // make sure current pane is set up to go in correct direction
    $current.css({"margin-right": ((3 * parseInt(_margin)) + _paneWidth) + "px",
        "margin-left": parseInt(_margin) + "px",
        "float": "right"});

    // place previous pane to the left of the visible pane
    $prev = $($current.attr("prev"));
    $current.insertBefore($current.attr("prev"));
    $prev.css("float","right");
    $prev.show();

    var stepFunctions = _this.stepFunction;
    if (stepFunctions[$current.attr("prev")]) {
        stepFunctions[$current.attr("prev")]();
    }

    // perform the animation between panes
    $current.animate({"margin-right": parseInt(_margin) + "px"},
            {
                duration: 500,
                complete: function() {
                    $prev.css("margin-right", ((3 * parseInt(_margin)) + _paneWidth) + "px");
                    $current.hide();
                    _this.currentLi = $prev;
                    _this.initCurrentPanel();
                }
            });
    }
}
