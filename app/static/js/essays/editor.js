/*
 * Client side JS for essay editor
 */
var peernoteNS = peernoteNS || {};
peernoteNS.essays = peernoteNS.essays || {uid: null, did: null};

// Assumption being made that first opened draft will be the newest.
peernoteNS.essays.enable_autosave = true;

peernoteNS.essays.AUTOSAVE_PAUSE_MILLIS = 1000;

/* setTimeout() timer handle used for implementing
 * autosaving after a pause in writing.
 */
peernoteNS.autosave_timer = null;

/**
 * Extracts the text of the essay from the editor. This is necessary in order
 * to properly handle the different ways content-editable input can appear.
 * Most content will be in a <div> or <p> but some will be floating just as
 * a text node.
 */
peernoteNS.essays.extractText = function() {
  var children = $('.editor-background .content')[0].childNodes;
  var lines = [];
  for (var i = 0; i < children.length; i++) {
    if (children[i].nodeType == 3) {
      lines.push(children[i].textContent);
    }
    else if (children[i].nodeType == 1 && children[i].tagName != 'H1') {
      lines.push($(children[i]).text());
    }
  }

  var text = lines.join('\n');
  return text; 
};

/**
 * Saves the draft to the db via ajax.
 */
peernoteNS.essays.save = function() {
  var $title = $('#essay-title');
  var title = $title.text();
  var text = peernoteNS.essays.extractText();

  var params = {
    title: title,
    text: text,
    uid: peernoteNS.essays.uid,
    did: peernoteNS.essays.did
  };

  if (title.length > 0 && title.length <= 80) {
    $status_line = $('.status-line');
    $status_line.text('Saving…');
    $status_line.css('opacity', '1.0');
    $.post('/api/save_draft', params, function(data) {
      if (data.status == "success") {
        $status_line.text('Saved');
      }
    });
  }
};

peernoteNS.essays.keydown = function(e) {
  // We want tabs to be treated as a literal tab characters,
  // not for navigation.
  if (e.keyCode == 9) {
    e.preventDefault();
  }
};

peernoteNS.essays.keystroke = function(e) {
  if (!peernoteNS.essays.enable_autosave) {
      return;
  }

  if (peernoteNS.autosave_timer) {
    clearTimeout(peernoteNS.autosave_timer);
    peernoteNS.autosave_timer = null;
  }

  // Remove the saved text, the state has probs changed.
  $('.status-line').text('');

  peernoteNS.autosave_timer = setTimeout(function() {
    peernoteNS.essays.save();
    peernoteNS.autosave_timer = null;
  }, peernoteNS.essays.AUTOSAVE_PAUSE_MILLIS);
};

peernoteNS.essays.initEditor = function() {
  $('.page-container').keyup(peernoteNS.essays.keystroke);
  $('.page-container .content').keydown(peernoteNS.essays.keydown);
};

peernoteNS.essays.initReviewButton = function() {
  $('#review').click(function() {
    // pop up dialog for sending an email
    $("#send-review-shadow").css("display","table");
    $("html, body").css({"overflow": "hidden"}); // stop scrolling
  })
};

peernoteNS.essays.initEmailPopup = function() {

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
      uid: peernoteNS.essays.uid,
      did: peernoteNS.essays.did,
      email: email
    };

    debugger;
    $.post('/api/email_a_review', params, function(data) {
      formSubmitting = false;
      if (data.status == "success") {
        // TODO: for now, just kick out to /essays. In the future
        // will be better to just fux with essay timeline
        window.location = "/essays";
      }
    });

  });
}

/*
 * For each draft in the timeline, setup a click handler so when pressed,
 * we query the api for that draft's title and text. We then go into
 * content and replace pre-existing titles and text with this.
 *
 * Note that we also disable autosaving if we go to an old draft. We do
 * not want to save old drafts.
 */
peernoteNS.essays.initTimeline = function() {
  var $draftList = $('.timeline ul li');
  $draftList.each(function(i) {

    // TODO: probably should debounce...
    $(this).click(function() {
      var cur_did = peernoteNS.essays.drafts[i];
      if (peernoteNS.essays.did == cur_did) {
        return;
      }

      params = {
        did: cur_did,
        uid: peernoteNS.essays.uid
      }

      $.post('/api/fetch_draft', params, function(data) {
        if (data.status == "success") {
          peernoteNS.essays.did = cur_did;

          // because content editables are weird, start from scratch
          $('.content').empty();
          $('.content').append($("<h1 id='essay-title' class='essay-title'>"));
          $('.content').append($("<p class='text-container'>"));
          $('#essay-title').text(data.title);
          $('.text-container').text(data.text);

          // disable autosaving if this is an old draft
          if (peernoteNS.essays.drafts.length == i + 1) {
            peernoteNS.essays.enable_autosave = true;
            $('.status-line').text('');
            $('#review.btn').css('visibility', 'visible');
          } else {
            peernoteNS.essays.enable_autosave = false;
            $('.status-line').text('Saving disabled for old drafts');
            $('#review.btn').css('visibility', 'hidden');
          }
        }
      });
    });
  });
}


peernoteNS.essays.toolDisplayer = function() {
    var open = true; // is toolkit open or closed

    // Set the width of the button panel dynamically so that it can stay centered
    var width = $(document).width();
    $(".buttons").css("width",(width-250) +"px");
    $(".toolkit-open-button").click(toggleToolKit);

    $(window).resize(function () {
        var width = $(document).width();
        if (open) {
            $(".buttons").css("width",(width-250) +"px");
        } else {
            $(".buttons").css("width", width +"px");
        }
    });

    // JS to open left column toolkit
    function toggleToolKit() {
        var buttonPanelWidthSetting = $(".buttons").css("width");
        var buttonPanelWidth = parseInt(buttonPanelWidthSetting
            .substring(0,buttonPanelWidthSetting.length-2));

        if (open) {
            $(".main-panel-push").animate({width: "0px"}, {duration: 250, queue: true});
            $(".buttons").animate(
                    {width: (buttonPanelWidth+250) + "px"}, 
                    {duration: 250, queue: true});
        } else {
            $(".main-panel-push").animate({width: "250px"}, {duration: 250, queue: false});
            $(".buttons").animate(
                    {width: (buttonPanelWidth-250) + "px"}, 
                    {duration: 250, queue: false});
        }
        open = !open;
    }

}

$(document).ready(function(e) {
  if (peernoteNS.essays.uid == null || peernoteNS.essays.did == null) {
    return;
  }

  peernoteNS.essays.initEditor();
  peernoteNS.essays.initReviewButton();
  peernoteNS.essays.initEmailPopup();
  peernoteNS.essays.toolDisplayer();
  peernoteNS.essays.initTimeline();
});
