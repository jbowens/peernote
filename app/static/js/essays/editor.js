/*
 * Client side JS for essay editor
 */
var peernoteNS = peernoteNS || {};
peernoteNS.essays = peernoteNS.essays || {eid: null};

peernoteNS.essays.initEditor = function() {
    var $title = $('#essay-title');
    var $text = $('#essay-text');

    $('#save-paper').click(function() {
        var title = $title.text();
        var text = $text.text();

        var params = { title: title, text: text};
        if (peernoteNS.essays.eid != null) {
            params.eid = peernoteNS.essays.eid;
        }

        if (title.length > 0 && title.length <= 80) {
            $.post('/api/save_essay', params, function(data) {
                if (data.success) {
                    console.log(data);
                    peernoteNS.essays.eid = data.eid;
                    alert('YAY');
                }
            });
        } else {
            alert('UH OH!');
        }
    });
}

$(document).ready(function(e) {
    peernoteNS.essays.initEditor();
});
