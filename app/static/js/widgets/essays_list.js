
/* for table sorting to work properly, please include in order:
 *
 * js/include/jquery.tablesorter.js
 * js/include/sugar.min.js
 * js/include/parser-date.js
 *
 */

var peernoteNS = peernoteNS || {};
peernoteNS.widgets = peernoteNS.widgets || {};

peernoteNS.widgets.initEssaysList = function(container, options) {
  return $.extend({}, peernoteNS.widgets.essaysList).init(container, options);
};

peernoteNS.widgets.essaysList = {

  parent_container: null,
  options: null,

  _html: function() {
    return '' +
      '<table class="essays-table">' +
      '<thead class="essays-header">' +
        '<tr>' +
        '<th class="essay-name">' +
        'Name' +
        '<i class="fa fa-caret-down"></i>' +
        '<i class="fa fa-caret-up"></i>' +
        '</th>' +
        '<th class="essay-created sorter-sugar">' +
        'Created At' +
        '<i class="fa fa-caret-down"></i>' +
        '<i class="fa fa-caret-up"></i>' +
        '</th>' +
        '<th class="essay-modified sorter-sugar">' +
        'Last Modified' +
        '<i class="fa fa-caret-down"></i>' +
        '<i class="fa fa-caret-up"></i>' +
        '</th>' +
        '<th class="draft-number">' +
        '# Drafts' +
        '<i class="fa fa-caret-down"></i>' +
        '<i class="fa fa-caret-up"></i>' +
        '</th>' +
        '</tr>'+
      '</thead>' +
      '</table>';
  },

  _listElementHtml: function(essay, index, options) {
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

    var essayTitle = essay.title;
    if (essayTitle === "**Untitled**") {
        essayTitle = "Untitled";
    }

    return '' +
      '<tr class="row-link">' +
        '<td class="essay-name">' +
        aHtmlStart + essayTitle + '</a>' +
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

  _noEssaysHtml: function() {
    return 'You have no essays. Would you like to <a href="/essays/create"> create </a> one?'
  },

  _initTrashButtons: function(essays) {
    for (var i = 0; i < essays.length; i++) {

      (function (i) {
        $('.trash-essay-' + i + ' .fa-trash-o').click(function() {
          $.post('/api/essays/delete', {eid:essays[i].eid, csrf:peernoteNS.csrf}, function(data) {
            if (data.status == "success") {
              // TODO: not very elegant
              $('.trash-essay-' + i).parent().hide();
            } else {
              console.log(data.error);
            }
          });
        });
      })(i); // L O L JAVASCRIPT SCOPING
    }
  },

  /*
   * reloads all essays
   */
  refresh: function() {
    var _this = this;

    $essaysList = $(_this._html())
    _this.parent_container.html($essaysList);
    $essaysTable = _this.parent_container.find('.essays-table');

    $.get('/api/users/essays', function(data) {
      if (data.status == "success") {

        if (data.essays.length == 0) {
          _this.parent_container.html(_this._noEssaysHtml());
          return;
        }

        for (var i = 0; i < data.essays.length; i++) {
          $essaysTable.append(_this._listElementHtml(data.essays[i], i, _this.options));
        }

        _this._initTrashButtons(data.essays);

        $(".essays-table").tablesorter({cssAsc: "show-up", cssDesc: "show-down",
            headers: { // sort these columns using the sugar.js date sorter lib
                1: { sorter:'sugar' },
                2: { sorter:'sugar' }
            }
        });

        $(".essay-name").trigger("click");
      }
    });
  },

  /*
   * options: {
   *   newTab: boolean specifying whether to open essays in a new tab
   *   deletable: boolean specifying whether you can delete essays
   * }
   */
  init : function(parent_container, options) {

    if (!("newTab" in options)) {
      options.newTab = false;
    }

    if (!("deletable" in options)) {
      options.deletable = true;
    }


    this.parent_container = parent_container;
    this.options = options;

    this.refresh();
    return this;
  }
}
