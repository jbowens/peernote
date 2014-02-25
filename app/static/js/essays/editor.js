/*
 * Client side JS for essay editor
 */
var peernoteNS = peernoteNS || {};
peernoteNS.essays = peernoteNS.essays || {uid: null, did: null};
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
      if (data.success) {
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

    /*
    params = {
      uid: peernoteNS.essays.uid,
      did: peernoteNS.essays.did
    };

    $.post('/api/create_review', params, function(data) {
      if (data.success) {
        $('.status-line').text('Draft has been finalized: /reviews/' + data.urlhash);

        // should have a new draft now, store the did
        peernoteNS.essays.did = data.did;
        console.log(data.urlhash)
      }
    });
    */
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
}

$(document).ready(function(e) {
  if (peernoteNS.essays.uid == null || peernoteNS.essays.did == null) {
    return;
  }

  peernoteNS.essays.initEditor();
  peernoteNS.essays.initReviewButton();
  peernoteNS.essays.initEmailPopup();
});
