/*
 * Client side JS for essay editor
 */
var peernoteNS = peernoteNS || {};
peernoteNS.essays = peernoteNS.essays || {}

// need this extra extend to define
// enums used in subsequent extend
$.extend(peernoteNS.essays, {
  // document modes enum
  MODES: {
    EDIT:     0,
    REVIEW:   1,
    READONLY: 2
  },
});

$.extend(peernoteNS.essays, {
  /**
   * Creates a new draft
   */
  createNextDraft: function() {
    var _this = this;
    var params = {
      uid: _this.uid,
      did: _this.did
    };

    $.post('/api/next_draft', params, function(data) {
      if (data.status == "success") {
        _this.addNewDraftAndOpen(data.did, data.version, data.timestamp);
      } else {
        console.log("Error creating new draft: " + data['error']);
        peernoteNS.displayErrorFlash('Error creating new draft');
      }
    });
  },

  /*
   * Given a draft id and a version number, prepends a draft to the timeline
   * and emulates a click on the new draft to open it.
   */
  addNewDraftAndOpen: function(did, version, ts) {
    this.drafts.unshift({
        did: did,
        ts: ts
    });
    var $newLi = $('' +
      '<li>' +
        '<a>' +
          '<i class="fa fa-check"></i>' +
          '<span class="draft-number">' +
            'Draft ' +  version +
          '</span>' +
          '<i class="fa fa-trash-o"> </i>' +
          '<span class="draft-date">' + ts + '</span>' +
        '</a>' +
      '</li>'
    );

    $newLi.hide();
    $('.timeline ul').prepend($newLi);
    $newLi.slideDown();
    $newLi.click({clicked: $newLi}, this.selectDraft);

    $newLi.click();
  },

  initToolkit: function() {
    var _this = this
    $toolkit = $('.toolkit');
    $toolkit.find('.next-draft').click(function(e) {
      e.preventDefault();
      if (peernoteNS.essays.drafts[0].did != peernoteNS.essays.did) {
        // Currently on older draft, just open the draft following it
        $('.timeline ul li.active-draft').prev().click();
      } else {
        _this.createNextDraft();
      }
    });
  },

  initEmailPopup: function() {
    var _this = this;

    var lb = peernoteNS.widgets.initLightbox($('.send-review-pane'), {
      closeIcon: true
    });

    $('#review-request').click(function() {
      lb.open();
    });

    var $popupForm = $(".send-review-pane form");
    var formSubmitting = false;
    $popupForm.submit(function (e) {
      e.preventDefault();
      if (formSubmitting) {
        return;
      }
      formSubmitting = true;

      var email = $popupForm.find('input[name="email"]').val();
      params = {
        uid: _this.uid,
        did: _this.did,
        email: email
      };

      $.post('/api/email_a_review', params, function(data) {
        formSubmitting = false;
        if (data.status == "success") {
          if (data.new_did != null && data.new_version != null) {
            // If emailing the review finalized a draft, add to draft timeline
            _this.addNewDraftAndOpen(data.new_did, data.new_version, data.new_timestamp);
          }
          peernoteNS.displayFlash('Review sent');
        }
      }).fail(function() {
        formSubmitting = false;
        peernoteNS.displayErrorFlash('Error sending review');
      });

      lb.close();
    });
  },

  /*
   * For each draft in the timeline, setup a click handler so when pressed,
   * we query the api for that draft's title and text. We then go into
   * content and replace pre-existing titles and text with this.
   *
   * Note that we also disable autosaving if we go to an old draft. We do
   * not want to save old drafts.
   */
  initTimeline: function() {
    var _this = this;
    var $draftList = $('.timeline ul li');

    $draftList.first().addClass('active-draft');

    $draftList.each(function(i) {
      // TODO: probably should debounce...
      $(this).click({clicked: $(this)}, _this.selectDraft);
    });

  },

  /*
   * Click handler for when a draft is selected. Fetches
   * the draft and replaces draft on screen with it.
   */
  selectDraft: function(event) {
    var clicked = event.data.clicked;
    var i = clicked.index();
    var cur_did = peernoteNS.essays.drafts[i].did;

    if ($(event.target).attr('class') == 'fa fa-trash-o') {
      // User actually clicked to remove this draft.

      $.post('/api/drafts/delete', {did: cur_did, csrf: peernoteNS.csrf}, function(data) {
        if (data.status =="success") {
          clicked.slideUp();
          if (peernoteNS.essays.did == cur_did) {
            // deleting currently selected draft, switch to current draft
            $('.timeline ul li').first().click();
          }
        } else {
          peernoteNS.displayErrorFlash('Error archiving draft');
        }
      });

      return;
    }

    $('li.active-draft').removeClass('active-draft');
    clicked.addClass('active-draft');

    if (peernoteNS.essays.did == cur_did) {
      return;
    }

    // Load the given draft.
    peernoteNS.essays.loadDraft(cur_did);
  },


  /* Loads the given draft. If the callback is provided, it will be
   * called once the draft is loaded.
   *
   * @param did the draft id of the draft to load
   * @param timestamp (optional) timestamp to use for fetch_draft
   * @param cb (optional) a callback to call upon completion
   */
  loadDraft: function(did, timestamp, cb) {
    var params = {
      did: did,
      uid: peernoteNS.essays.uid
    };

    if (timestamp) {
      params.timestamp = timestamp;
      // also dont bother setting status-line's text to loading since
      // the chance is quite high that the server returns a 204
    } else {
      $('.status-line').text('Loading…');
    }

    $.get('/api/fetch_draft', params, peernoteNS.errors.wrap(function(data) {
      if (!data) {
        // server 204, probably because provided timestamp is most recent
        return;
      }

      if (data.status == "success") {
        peernoteNS.essays.did = did;

        if (peernoteNS.essays.drafts[0].did == peernoteNS.essays.did) {
          // update last modified date if this is newest draft
          peernoteNS.essays.updateLastModifiedDate(data.timestamp, data.pretty_timestamp);
        }

        // We need to deserialize the modifiers.
        var modifiers = [];
        if (data.modifiers) {
          modifiers = JSON.parse(data.modifiers);
        }

        // Inform the editor to load this draft
        var draftBody = JSON.parse(data.body)
        peernoteNS.editor.loadDraftState(data.title, draftBody);
        $('.status-line').text('Saved');

        if (peernoteNS.essays.review_only) {
          peernoteNS.essays.toReviewer();
          $('.status-line').text('');
        } else {
          if (!data.finalized) {
            // This is the current draft. Enable autosaving
            peernoteNS.editor.enableAutosaving();

            // Move to editor mode
            peernoteNS.essays.toEditor();
          } else {
            // This is an old draft. We need to disable autosaving on the editor.
            peernoteNS.editor.disableAutosaving();

            // Move to readonly mode
            peernoteNS.essays.toReadonly();
          }

          $('.status-line').text('Saved');
        }

        if (cb) {
          cb();
        }
      } else {
        // TODO:
      }
    }));
  },

  // constant widths of left and right panels
  TOOLKIT_PANE_WIDTH: 250,
  COMMENTS_PANE_WIDTH: 350,

  // open/close status of left and right panels
  TOOLKIT_PANE_OPEN:  true,
  COMMENTS_PANE_OPEN: false,

  // mode the document is currently in
  currentMode: peernoteNS.essays.MODES.EDIT,

  // initialize mode-switching buttons
  initModeSwap: function() {
    var $editModeButton = $("#edit-mode-button");
    var $reviewModeButton = $("#review-mode-button");

    $editModeButton.click(function() {
        if ($editModeButton.hasClass("editor-mode-button-selectable")) {
            peernoteNS.essays.toEditor();
        }
    });

    $reviewModeButton.click(function() {
        if ($reviewModeButton.hasClass("editor-mode-button-selectable")) {
            peernoteNS.essays.toReviewer();
        }
    });
  },

  // change appearance of mode buttons upon mode change
  modeButtonsSelect: function($button) {
    var $readonlyButton = $("#readonly-mode-button");
    var $buttons = $(".editor-mode-button");
    $buttons.removeClass("editor-mode-button-active editor-mode-button-disabled");
    $button.addClass("editor-mode-button-active editor-mode-button-selectable");

    if ($button.selector === $readonlyButton.selector) {
        $buttons.addClass("editor-mode-button-disabled");
        $buttons.removeClass("editor-mode-button-selectable");
        $button.removeClass("editor-mode-button-disabled");
    } else {
        $readonlyButton.addClass("editor-mode-button-disabled");
        $buttons.addClass("editor-mode-button-selectable");
        $readonlyButton.removeClass("editor-mode-button-selectable");
    }
  },

  // convert mode to editor
  toEditor: function() {
    peernoteNS.essays.modeButtonsSelect($("#edit-mode-button"));
    $("#reviewer-tools").slideUp();
    $("#editor-tools").slideDown();
    peernoteNS.essays.currentMode = peernoteNS.essays.MODES.EDIT;
    if (peernoteNS.essays.COMMENTS_PANE_OPEN) {
        peernoteNS.essays.COMMENTS_PANE_OPEN = peernoteNS.essays.togglePane(
            $('.comment-panel-push'),
            peernoteNS.essays.COMMENTS_PANE_OPEN,
            peernoteNS.essays.COMMENTS_PANE_WIDTH);
    }

    // hide readonly stripe
    $(".readonly-stripe").fadeOut();

    // Enable content editability
    $(".page").attr("contenteditable","true");

    $(".edit-mode").show();
    $(".readonly-mode").hide();
    $(".review-mode").hide();
  },

  // convert mode to reviewer
  toReviewer: function() {
    if (!peernoteNS.essays.review_only) {
      // If review only context, let initReviewOnly handle mode buttons
      peernoteNS.essays.modeButtonsSelect($("#review-mode-button"));
    }
    $("#editor-tools").slideUp();
    $("#reviewer-tools").slideDown();

    // hide readonly stripe
    $(".readonly-stripe").fadeOut();

    $(".edit-mode").hide();
    $(".readonly-mode").hide();
    $(".review-mode").show();

    if (!peernoteNS.essays.COMMENTS_PANE_OPEN) {
      peernoteNS.essays.COMMENTS_PANE_OPEN = peernoteNS.essays.togglePane(
        $('.comment-panel-push'),
        peernoteNS.essays.COMMENTS_PANE_OPEN,
        peernoteNS.essays.COMMENTS_PANE_WIDTH);
    }

    // For now, disable autosaving/editing in review mode until reviewing
    // even has things to be saved.
    peernoteNS.editor.disableAutosaving();
    $(".page").attr("contenteditable","false");

    peernoteNS.essays.currentMode = peernoteNS.essays.MODES.REVIEW;
  },

  // convert mode to readonly
  toReadonly: function($triggerButton) {
    // Disable content editability
    $(".page").attr("contenteditable","false");

    // hide tools-kits for other modes
    $("#editor-tools").slideUp();
    $("#reviewer-tools").slideUp();

    // show readonly stripe
    $(".readonly-stripe").fadeIn();

    $(".edit-mode").hide();
    $(".readonly-mode").show();
    $(".review-mode").hide();

    peernoteNS.essays.modeButtonsSelect($("#readonly-mode-button"));
    peernoteNS.essays.currentMode = peernoteNS.essays.MODES.READONLY;
  },


  /* Javascript to handle the showing and hiding of the toolkit and comment columns.
   * Also javascript to keep the top toolbar centered when showing and hiding the
   * toolkit and comment columns
   */
  toolDisplayer: function() {
      var toolkitOpen = true; // is toolkit open or closed
      var commentsOpen = false;
      var toolkitWidth = peernoteNS.essays.TOOLKIT_PANE_WIDTH;
      var commentsWidth = peernoteNS.essays.COMMENTS_PANE_WIDTH;

      // Set the width of the button panel dynamically so that it can stay centered
      var width = $(document).width();
      $(".buttons").css("width",(width-250) +"px");
      $(".toolkit-open-button").click(function() {
          peernoteNS.essays.TOOLKIT_PANE_OPEN = peernoteNS.essays.togglePane(
              $(".main-panel-push"), peernoteNS.essays.TOOLKIT_PANE_OPEN, toolkitWidth);
      });

      $(".toolkit-comment-button").click(function() {
          peernoteNS.essays.COMMENTS_PANE_OPEN = peernoteNS.essays.togglePane(
              $(".comment-panel-push"), peernoteNS.essays.COMMENTS_PANE_OPEN, commentsWidth);
      });

      // Make sure that top toolbar is always centered and wrapper is the right size
      $(window).resize(function () {
          var width = $(document).width();
          if (peernoteNS.essays.TOOLKIT_PANE_OPEN && peernoteNS.essays.COMMENTS_PANE_OPEN) {
              $(".buttons").css("width", (width - toolkitWidth - commentsWidth) +"px");
          } else if (peernoteNS.essays.TOOLKIT_PANE_OPEN) {
              $(".buttons").css("width", (width-toolkitWidth) +"px");
          } else if (peernoteNS.essays.COMMENTS_PANE_OPEN) {
              $(".buttons").css("width", (width-commentsWidth) +"px");
          } else {
              $(".buttons").css("width", width +"px");
          }

          setHeight();
      });

      // JS sets the height of the body and content wrapper
      function setHeight() {
          var height = $(window).height();
          var navBarHeight = $("nav").height();
          var toolbarHeight = $(".toolbar").height();
          $('body, .wrapper, .toolkit').css("height", (height -  navBarHeight) + "px");
          $('.page-container').css("height", (height - navBarHeight - toolbarHeight) + "px");
      }

      setHeight(); // set initial height

      var draftsOpen = false;
      $(".timeline h2").click(function() {
          if (draftsOpen) {
              $(".drafts-list").slideUp();
          } else {
              $(".drafts-list").slideDown();
          }
          draftsOpen = !draftsOpen;
      });
  },

  // JS to open and close pannels
  // $pannel is the target panel (left or right)
  // isOpen is the status of the target panel
  // width is the desired width of the target pannel
  togglePane: function($panel, isOpen, width) {
      var buttonPanelWidthSetting = $(".buttons").css("width");
      var buttonPanelWidth = parseInt(buttonPanelWidthSetting
          .substring(0,buttonPanelWidthSetting.length-2));

      if (isOpen) {
          $panel.animate({width: "0px"}, {duration: 300 });
          $(".buttons").animate(
                  {width: (buttonPanelWidth+width) + "px"},
                  {duration: 300, queue: true});
      } else {
          $panel.animate({width: width + "px"}, {duration: 300 });
          $(".buttons").animate(
                  {width: (buttonPanelWidth-width) + "px"},
                  {duration: 300, queue: false});
      }
      return !isOpen;
  },

  /* JS to initialize comment tab functionality */
  initCommentTabs: function () {
      /* JS to switch between tabs on the comments panel */
      var currentTabIsComments = true;
      $noteTab = $(".tab-top-notes");
      $commentTab = $(".tab-top-comments");
      $commentTabContainer = $(".comment-tab-line-comments");
      $noteTabContainer = $(".comment-tab-notes");

      $noteTab.click(function() {
          if (currentTabIsComments) {
              $noteTab.addClass("tab-selected");
              $noteTab.removeClass("tab-unselected");
              $commentTab.removeClass("tab-selected");
              $commentTab.addClass("tab-unselected");
              $commentTabContainer.addClass("tab-container-unselected");
              $commentTabContainer.removeClass("tab-container-selected");
              $noteTabContainer.addClass("tab-container-selected");
              $noteTabContainer.removeClass("tab-container-unselected");
          }
          currentTabIsComments = !currentTabIsComments;
      });

      $(".tab-top-comments").click(function() {
          if (!currentTabIsComments) {
              $noteTab.addClass("tab-unselected");
              $noteTab.removeClass("tab-selected");
              $commentTab.removeClass("tab-unselected");
              $commentTab.addClass("tab-selected");
              $commentTabContainer.addClass("tab-container-selected");
              $commentTabContainer.removeClass("tab-container-unselected");
              $noteTabContainer.addClass("tab-container-unselected");
              $noteTabContainer.removeClass("tab-container-selected");
          }
          currentTabIsComments = !currentTabIsComments;
      });

      /* Init height of comment-tab */
      $window = $(window);
      var setTabHeight = function () {
        var height = $window.height();
        var navHeight = $("nav").height();
        var tabHeight = $(".tab-top").height();
        $(".tab-content").css("height",height - navHeight - tabHeight +"px");
      }
      setTabHeight();
      $window.resize(setTabHeight);

      // TODO: CLEAN THIS UP WHEN YOU FIGURE OUT THE UI
      var mode = "allComments";
      $(".all-comments-button").click(function() {
        $(".cancel-comment").hide();
        $(".comments-nav .comments-button").hide();
        $(".new-comment").show();
        $(".comment-post").hide();
        $(".comments-index-title").show();
        $(".comments-index").show();
        $(".comments-new-title").hide();
        $(".comment-thread").hide();
        $(".comment-post-v2-closed").hide();
      });

      $(".new-comment").click(function() {
        $(".cancel-comment").show();
        $(".comments-new-title").show();
        //$(".comments-nav .comments-button").show();
        $(".new-comment").hide();
        $(".comment-post").show();
        $(".comments-index-title").hide();
        $(".comments-index").hide();
        $(".comment-thread").hide();
        $(".comment-post-v2-closed").hide();
      });

      $(".cancel-comment").click(function() {
        $(".cancel-comment").hide();
        $(".comments-new-title").hide();
        $(".comments-nav .comments-button").hide();
        $(".new-comment").show();
        $(".comment-post").hide();
        $(".comments-index-title").show();
        $(".comments-index").show();
      });

      $(".comment-submit").click(function() {
        $(".comments-nav .comments-button").show();
        $(".comments-new-title").hide();
        $(".comment-post").hide();
        $(".comment-thread").show();
        $(".cancel-comment").hide();
        $(".new-comment").show();
        $(".comment-post-v2-closed").show();
      });
  },

  // Make all the toolbar buttons work
  initToolbar: function () {
      // toggle zoom dropdown
      $('.curr-zoom').click(function(e) {
          $('.zoom').toggle();
      });

      // toggle line height dropdown
      $('.line-height-btn').click(function(e) {
          $('.spacing').toggle();
          $(this).toggleClass('button-border');
      });

      // hide line height/zoom dropdown when anything else is clicked
      $(document).click(function(e) {
          var $target = $(e.target);
          if (!$target.hasClass('line-height-click')) {
              $('.line-height-btn').removeClass('button-border');
              $('.spacing').hide();
          }

          if (!$target.hasClass('zoom-click')) $('.zoom').hide();
      });

      // update zoom
      $('.zoom-size').click(function() {
          $('.zoom').hide();
          var percent = $(this).html();
          $('.page-wrapper').css('zoom', percent);
          $('.curr-zoom').html(percent + " <i class='fa fa-caret-down zoom-click'></i>");
      });

      // update line height
      $('.line-height').click(function(e) {
          $('.spacing').hide();
          var scale = $(this).attr('scale');
          $('.content').css('line-height', scale);
      });

      // set max length on title of essay
      var $title = $(".essay-title");
      var titleMaxLength = 60;
      $title.keydown(function(e) {
        var title = $title.text();
        if ((title.trim().length > titleMaxLength
            && e.keyCode !== 46  // del
            && e.keyCode !== 8   // backspace
            && e.keyCode !== 37  // left arrow
            && e.keyCode !== 39) // right arrow
            || e.keyCode === 13  // enter
        ) { return false; }
      });
  },

  initOpenButton: function() {

    var lightbox = peernoteNS.widgets.initLightbox($('.essays-list-container'), {
      closeIcon: true
    });

    peernoteNS.widgets.essaysList.init($('.essays-selector'), { newTab: true,
      deletable: false
    });

    $("li.open").click(function() {
      lightbox.open();
    });
  },

  /* On DOM ready, loads the actual contents of the essay.
   */
  initDraft: function() {
    this.loadDraft(peernoteNS.essays.did);
  },

  /*
   * Setup review only mode. Hide functionality that should only be present
   * to the original writer.
   */
  initReviewOnly: function() {
    var $modeButtons = $(".editor-mode-button");
    $modeButtons.removeClass("editor-mode-button-active editor-mode-button-selectable");
    $modeButtons.addClass("editor-mode-button-disabled");
    $('#review-mode-button').addClass('editor-mode-button-active editor-mode-button-selectable');

    $('#doc-manager').hide();
    $('.timeline').hide();
    $('#editor-tools').hide();
    $('#reviewer-tools').show();
  },

  // Date of when essay was last modified as string
  lastModifiedDate: "",

  /**
   * Setup timer to periodically check if the essay has been updated
   * outside of this instance of the editor
   */
  initAutoloadTimer: function() {
    var _this = this;
    setInterval(function() {
      if (_this.lastModifiedDate && peernoteNS.essays.drafts[0].did == peernoteNS.essays.did) {
        _this.loadDraft(peernoteNS.essays.did, peernoteNS.essays.lastModifiedDate);
      }
    }, 3000);
  },

  updateLastModifiedDate: function(timestamp, pretty_timestamp) {
      peernoteNS.essays.lastModifiedDate = timestamp;
      $('.timeline ul li a .draft-date').first().text(pretty_timestamp);
  }

});

peernoteNS.init(function() {
  if (peernoteNS.essays.uid == null || peernoteNS.essays.did == null) {
    return;
  }

  peernoteNS.essays.initCommentTabs();
  peernoteNS.essays.initEmailPopup();
  peernoteNS.essays.toolDisplayer();
  peernoteNS.essays.initTimeline();
  peernoteNS.essays.initToolkit();
  peernoteNS.essays.initToolbar();
  peernoteNS.essays.initOpenButton();
  peernoteNS.essays.initModeSwap();
  peernoteNS.essays.initDraft();

  if (peernoteNS.essays.review_only) {
    peernoteNS.essays.initReviewOnly();
  } else {
    peernoteNS.essays.initAutoloadTimer();
  }

});

peernoteNS.setGAOptions({
  pagename: '/essays/edit'
});
