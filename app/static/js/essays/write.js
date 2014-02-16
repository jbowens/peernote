$(document).ready(function() {

    var essay_id = null; // TODO: handle case with pre-existing essay id
    var $title = $('#essay-title');
    var $text = $('#essay-text');

    $('#submit-paper').click(function() {
        var title = $title.text();
        var text = $text.text();

        var params = { title: title, text: text};
        if (essay_id != null) {
            params.eid =  essay_id;
        }

        if (title.length > 0 && title.length <= 80) {
            $.post('/api/save_essay', params, function(data) {
                if (data.success) {
                    console.log(data);
                    essay_id = data.eid;
                    alert('YAY');
                }
            });
        } else {
            alert('UH OH!');
        }
    });
});

