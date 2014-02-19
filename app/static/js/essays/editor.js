/*
 * Client side JS for essay editor
 */
var peernoteNS = peernoteNS || {};
peernoteNS.essays = peernoteNS.essays || {uid: null, did: null};
peernoteNS.essays.AUTOSAVE_PAUSE_MILLIS = 2500;

/* setTimeout() timer handle used for implementing
 * autosaving after a pause in writing.
 */
peernoteNS.autosave_timer = null;

peernoteNS.essays.save = function() {
  var $title = $('#essay-title');
  var $text = $('.editor-background .content p, .editor-background .content div, .essay-text');
  var title = $title.text();

  var lines = [];
  $text.each(function() {
    lines.push($(this).text());
  });
  var text = lines.join('\n');

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
        $status_line.animate({opacity: 0}, 1000);
      }
    });
  }
};

peernoteNS.essays.keystroke = function(e) {
  if (peernoteNS.autosave_timer) {
    clearTimeout(peernoteNS.autosave_timer);
    peernoteNS.autosave_timer = null;
  }

  peernoteNS.autosave_timer = setTimeout(function() {
    peernoteNS.essays.save();
    peernoteNS.autosave_timer = null;
  }, peernoteNS.essays.AUTOSAVE_PAUSE_MILLIS);
};

peernoteNS.essays.initEditor = function() {
  $('.page-container').keypress(peernoteNS.essays.keystroke);
};

$(document).ready(function(e) {
  if (peernoteNS.essays.uid == null || peernoteNS.essays.did == null) {
      return;
  }

  peernoteNS.essays.initEditor();
});
