var peernoteNS = peernoteNS || {};
peernoteNS.widgets = peernoteNS.widgets || {};

peernoteNS.widgets.initEssaysList = function(container, options) {
  // Clone lightbox object and return new one
  return $.extend({}, peernoteNS.widgets.essaysList).init(container, options);
};

peernoteNS.widgets.essaysList = {

  html: function() {
    return '' +
      '<table class="essays-table">' +
      '<thead class="essays-header">' + 
        '<tr>' + 
        '<th class="essay-name">' +  
        'Name' +
        '<i class="fa fa-caret-down"></i>' +
        '<i class="fa fa-caret-up"></i>' +
        '</th>' +
        '<th class="essay-created">' +
        'Created At' +
        '<i class="fa fa-caret-down"></i>' +
        '<i class="fa fa-caret-up"></i>' +
        '</th>' +
        '<th class="essay-modified">' +
        'Last Modified' +
        '<i class="fa fa-caret-down"></i>' +
        '<i class="fa fa-caret-up"></i>' +
        '</th>' +
        '<th class="draft-number">' +
        'Draft' +
        '<i class="fa fa-caret-down"></i>' +
        '<i class="fa fa-caret-up"></i>' +
        '</th>' +
        '</tr>'+
      '</thead>' + 
      '</table>';
  },

  listElementHtml: function(essay, index, options) {
    var aHtmlStart = '<a href="/essays/edit/' + essay.eid +'" '

    if (options.newTab) {
      aHtmlStart += 'target="_blank"'
    }
    aHtmlStart += '>';

    var deletableHtml = '';
    if (options.deletable) {
      deletableHtml +=  '' +
        '<td class="trash-essay trash-essay-' + index + '">' +
          '<i class="fa fa-trash-o"></i>' +
        '</td>'
    }

    return '' +
      '<tr class="row-link">' +
        '<td class="essay-name">' +
        aHtmlStart + essay.title + '</a>' +
        '</td>' +
        '<td class="essay-created">' + 
        aHtmlStart + essay.created_date + '</a></td>' +
        '<td class="essay-modified">' + 
        aHtmlStart + essay.modified_date + '</a></td>' +
        '<td class="draft-number">' + 
        aHtmlStart + essay.version + '</a></td>' +
        deletableHtml +
      '</tr>';
  },

  noEssaysHtml: function() {
    return 'You have no essays. Would you like to <a href="/essays/create"> create </a> one?'
  },

  initTrashButtons: function(essays) {
    for (var i = 0; i < essays.length; i++) {

      (function (i) {
        $('.trash-essay-' + i + ' .fa-trash-o').click(function() {
          $.post('/api/essays/delete', {eid:essays[i].eid, csrf:peernoteNS.csrf}, function(data) {
            if (data.status == "success") {
              // TODO: not very elegant
              $('.trash-essay-' + i).parent().remove();
              var table =  $(".essays-table");
              
              // This is needed or the table keeps the deleted row in a cache
              table.trigger("update")
                .trigger("sorton", table.get(0).config.sortList)
                .trigger("appendCache")
                .trigger("applyWidgets");
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
    $essaysTable = parent_container.find('.essays-table');

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
            $essaysTable.append(_this.listElementHtml(data.essays[i], i, options));
          }

          _this.initTrashButtons(data.essays);
          $(".essays-table").tablesorter({cssAsc: "show-up", cssDesc: "show-down" });
          $(".essay-name").trigger("click");
        }
      });
    } else {
      // NOT SUPPORTED YET LOL!
    }

    return _this;
  }
}
