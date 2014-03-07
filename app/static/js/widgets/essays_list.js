var peernoteNS = peernoteNS || {};
peernoteNS.widgets = peernoteNS.widgets || {};
peernoteNS.widgets.essaysList = {

  html: function() {
    return '' +
      '<div class="essays-header">' +
        '<div class="essay-name"> Name </div>' +
        '<div class="essay-created"> Name </div>' +
        '<div class="essay-modified"> Modified </div>' +
        '<div class="draft-number"> Draft </div>' +
      '</div>' +
      '<ul class="essays-list"> </ul>';
  },

  listElementHtml: function(essay, index, options) {
    var aHtml = '<a href="/essays/edit/' + essay.eid +'" '

    if (options.newTab) {
      aHtml += 'target="_blank"'
    }
    aHtml += '>' + essay.title + '</a>'

    var deletableHtml = '';
    if (options.deletable) {
      deletableHtml +=  '' +
        '<div class="trash-essay trash-essay-' + index + '">' +
          '<i class="fa fa-trash-o"></i>' +
        '</div>'
    }

    return '' +
      '<li>' +
        '<div class="essay-name">' +
        aHtml +
        '</div>' +
        '<div class="essay-created">' + essay.created_date + '</div>' +
        '<div class="essay-modified">' + essay.modified_date + '</div>' +
        '<div class="draft-number">' + essay.version + '</div>' +
        deletableHtml +
      '</li>';
  },

  noEssaysHtml: function() {
    return 'You have no essays. Would you like to <a href="/essays/create"> create </a> one?'
  },

  initTrashButtons: function(essays) {
    for (var i = 0; i < essays.length; i++) {

      (function (i) {
        $('.trash-essay-' + i).click(function() {
          $.post('/api/essays/delete', {eid:essays[i].eid, csrf:peernoteNS.csrf}, function(data) {
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
  },

  /*
   * options: {
   *   essays: optional jsonified essays. If null fetches.
   *   newTab: boolean specifying whether to open essays in a new tab
   *   deletable: boolean specifying whether you can delete essays
   * }
   */
  init : function(parent_container, options) {
    var _this = this;
    var $essaysList = $(_this.html())
    parent_container.append($essaysList);
    $essaysUl = parent_container.find('.essays-list');

    if (!("newTab" in options)) {
      options.newTab = false;
    }

    if (!("deletable" in options)) {
      options.deletable = true;
    }

    if (!options.essays) {
      $.get('/api/users/essays', function(data) {
        if (data.status == "success") {

          if (data.essays.length == 0) {
            parent_container.html(_this.noEssaysHtml());
            return;
          }

          for (var i = 0; i < data.essays.length; i++) {
            $essaysUl.append(_this.listElementHtml(data.essays[i], i, options));
          }

          _this.initTrashButtons(data.essays);
        }
      });
    } else {
      // NOT SUPPORTED YET LOL!
    }
  }
}
