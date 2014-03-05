var peernoteNS = peernoteNS || {};

peernoteNS.essays.initTrashButton = function() {
  for (var i = 0; i < peernoteNS.essays.essayIds.length; i++) {

    (function (i) {
      $('.trash-essay-' + i).click(function() {
        var eid = peernoteNS.essays.essayIds[i];
        $.post('/api/essays/delete', {eid:eid, csrf:peernoteNS.csrf}, function(data) {
          if (data.status == "success") {
            // TODO: not very elegant
            $('.trash-essay-' + i).parent().remove();
          } else {
            console.log(data.error);
          }
        });
      });
    })(i); // L O L JAVASCRIPT SCOPING

  }
};

$(document).ready(function() {
    peernoteNS.essays.initTrashButton();
});
