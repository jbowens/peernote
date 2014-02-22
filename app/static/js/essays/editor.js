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

$(document).ready(function(e) {
  if (peernoteNS.essays.uid == null || peernoteNS.essays.did == null) {
      return;
  }

  peernoteNS.essays.initEditor();
});
