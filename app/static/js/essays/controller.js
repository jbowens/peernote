/*
 * Client side JS for essay editor
 */
var peernoteNS = peernoteNS || {};
peernoteNS.essays = peernoteNS.essays || {}
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
        _this.addNewDraftAndOpen(data.did, data.version);
      } else {
        console.log("Error creating new draft: " + data['error']);
        peernoteNS.displayErrorFlash('Error creating new draft');
      }
    });
  },

  /*
   * Given a dreft id and a version number, appends a draft to the timeline
   * and emulates a click on the new draft to open it.
   */
  addNewDraftAndOpen: function(did, version) {
    this.drafts.push(did);
    var $newLi = $('<li> <a> Draft ' + version + '</a> </li>');
    $newLi.hide();
    $('.timeline ul').append($newLi);
    $newLi.slideDown();
    $newLi.click({i: this.drafts.length - 1, clicked: $newLi}, this.selectDraft);

    $newLi.click();
  },

  initReviewButton: function() {
    $('#review').click(function() {
      // pop up dialog for sending an email
      $("#send-review-shadow").css("display","table");
      $("html, body").css({"overflow": "hidden"}); // stop scrolling
    });
  },

  initToolkit: function() {
    var _this = this
    $toolkit = $('.toolkit');
    $toolkit.find('.next-draft').click(function(e) {
      e.preventDefault();
      _this.createNextDraft();
    });
  },

  initEmailPopup: function() {
    var _this = this;

    $("#send-review-shadow").click(function(event) {
      var targetClass = $(event.target).attr('class');
      if (targetClass === "send-review-center-align" || targetClass === "fa fa-times") {
        $("#send-review-shadow").fadeOut(100, "linear");
        $("html, body").css({"overflow": "visible"}); // enable scrolling
      }
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
            _this.addNewDraftAndOpen(data.new_did, data.new_version);
          }
          peernoteNS.displayFlash('Review sent');
        }
      }).fail(function() {
        formSubmitting = false;
        peernoteNS.displayErrorFlash('Error sending review');
      });

      // hide the send review popup
      $("#send-review-shadow").fadeOut(100, "linear");
      $("html, body").css({"overflow": "visible"});
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

    $draftList.last().addClass('active-draft');

    $draftList.each(function(i) {
      // TODO: probably should debounce...
      $(this).click({i: i, clicked: $(this)}, _this.selectDraft);
    });
  },

  /*
   * Click handler for when a draft is selected. Fetches
   * the draft and replaces draft on screen with it.
   */
  selectDraft: function(event) {

    var i = event.data.i;
    var clicked = event.data.clicked;
    $('li.active-draft').removeClass('active-draft');
    clicked.addClass('active-draft');

    var cur_did = peernoteNS.essays.drafts[i];
    if (peernoteNS.essays.did == cur_did) {
      return;
    }

    params = {
      did: cur_did,
      uid: peernoteNS.essays.uid
    }

    $.get('/api/fetch_draft', params, function(data) {
      if (data.status == "success") {
        peernoteNS.essays.did = cur_did;

        // because content editables are weird, start from scratch
        $('.content').empty();
        $('.content').append($("<h1 id='essay-title' class='essay-title'>"));
        $('.content').append($("<p class='text-container'>"));
        $('#essay-title').text(data.title);
        $('.text-container').text(data.text);

        // disable autosaving / hide next draft button if this is an old draft
        if (peernoteNS.essays.drafts.length == i + 1) {
          // current draft
          peernoteNS.essays.enable_autosave = true;
          $('.status-line').text('');
          $('li.next-draft').slideDown();
        } else {
          // old draft
          peernoteNS.essays.enable_autosave = false;
          $('.status-line').text('');
          $('li.next-draft').slideUp();
        }
      }
    });
  },

  /* Javascript to handle the showing and hiding of the toolkit and comment columns.
   * Also javascript to keep the top toolbar centered when showing and hiding the 
   * toolkit and comment columns 
   */
  toolDisplayer: function() {
      var toolkitOpen = true; // is toolkit open or closed
      var commentsOpen = false;
      var toolkitWidth = 250;
      var commentsWidth = 350;

      // Set the width of the button panel dynamically so that it can stay centered
      var width = $(document).width();
      $(".buttons").css("width",(width-250) +"px");
      $(".toolkit-open-button").click(function() {
          toolkitOpen = togglePane($(".main-panel-push"), toolkitOpen, toolkitWidth);
      });

      $(".toolkit-comment-button").click(function() {
          commentsOpen = togglePane($(".comment-panel-push"), commentsOpen, commentsWidth);
      });

      // Make sure that top toolbar is always centered
      $(window).resize(function () {
          var width = $(document).width();
          if (toolkitOpen && commentsOpen) {
              $(".buttons").css("width", (width - toolkitWidth - commentsWidth) +"px");
          } else if (toolkitOpen) {
              $(".buttons").css("width", (width-toolkitWidth) +"px");
          } else if (commentsOpen) {
              $(".buttons").css("width", (width-commentsWidth) +"px");
          } else {
              $(".buttons").css("width", width +"px");
          }
      });

      // JS to open and close panels
      function togglePane($panel,isOpen, width) {
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
      }
  },

  /* JS to initialte comment tab functionality */
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
              $('.line-height-btn').removeClass('border');
              $('.spacing').hide();
          }
          if (!$target.hasClass('zoom-click')) $('.zoom').hide();
      });

      // update zoom
      $('.zoom-size').click(function() {
          $('.zoom').hide();
          var percent = $(this).html();
          $('.page-container').css('zoom', percent);
          $('.curr-zoom').html(percent + " <i class='fa fa-caret-down zoom-click'></i>");
      });

      // update line height
      $('.line-height').click(function(e) {
          $('.spacing').hide();
          var scale = $(this).attr('scale');
          $('.content').css('line-height', scale);
      });
  },


  initOpenButton: function() {
    peernoteNS.widgets.essaysList.init($('.essays-selector'), {
      newTab: true,
      deletable: false
    });

    $(".essays-list-shadow").click(function(event) {
      var targetClass = $(event.target).attr('class');
      if (targetClass === "essays-list-center-align") {
        $(".essays-list-shadow").fadeOut(100, "linear");
      }
    });

    $("ul.essays-list").click(function() {
      $(".essays-list-shadow").fadeOut(100, "linear");
    });

    $("li.open").click(function() {
      $(".essays-list-shadow").css("display","table");
    });
  }

});

peernoteNS.init(function() {
  if (peernoteNS.essays.uid == null || peernoteNS.essays.did == null) {
    return;
  }

  peernoteNS.essays.initReviewButton();
  peernoteNS.essays.initCommentTabs();
  peernoteNS.essays.initEmailPopup();
  peernoteNS.essays.toolDisplayer();
  peernoteNS.essays.initTimeline();
  peernoteNS.essays.initToolkit();
  peernoteNS.essays.initToolbar();
  peernoteNS.essays.initOpenButton();
});

peernoteNS.setGAOptions({
  pagename: '/essays/edit'
});
