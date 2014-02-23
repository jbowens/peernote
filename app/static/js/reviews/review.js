/**************** DOCUMENT CODE ***********************/
/******************************************************/
var range;
var id = 0;
var textBody = '';  // the essay text as a string
var undo = [];      // list of undo actions
var redo = [];      // list of redo actions

// make toolbar stick to top of browser window
var buttonsFixed = false;
$(window).scroll(function() {
	if ($(window).scrollTop() > 60 && !buttonsFixed) {
		$('.buttons').toggleClass("buttons-position-fixed");
		$('.buttons').toggleClass("buttons-position-absolute");
		buttonsFixed = true;
	}
	if ($(window).scrollTop() < 60 && buttonsFixed) {
		$('.buttons').toggleClass("buttons-position-fixed");
		$('.buttons').toggleClass("buttons-position-absolute");
		buttonsFixed = false;
	}
});

// setup function that binds click listeners to buttons
function bindListeners() {
    // toggle zoom dropdown
    $('.curr-zoom').click(function(e) {
        $('.zoom').toggle();
    });

    // toggle line height dropdown
    $('.line-height-btn').click(function(e) {
        $('.spacing').toggle();
        $(this).toggleClass('button-border');
    });

    // hide line height/zoom dropdown when anything else is clicked
    $(document).click(function(e) {
        var $target = $(e.target);
        if (!$target.hasClass('line-height-click')) {
            $('.line-height-btn').removeClass('border');
            $('.spacing').hide();
        }
        if (!$target.hasClass('zoom-click')) $('.zoom').hide();
    });

    // update zoom
    $('.zoom-size').click(function(e) {
        $('.zoom').hide();
        var percent = $(this).html();
        $('.page-container').css('zoom', percent); 
        console.log(e.srcElement.innerHTML);
        $('.curr-zoom').html(e.srcElement.innerHTML);

        var scale = $(this).attr('scale');
        $('.content').css('line-height', (scale * 24) + 'px')
    });

    // update line height
    $('.line-height').click(function(e) {
        $('.spacing').hide();

        var scale = $(this).attr('scale');
        $('.content').css('line-height', (scale * 24) + 'px');
    });
}

// main
$(document).ready(function () {

	$('#strikethrough-button, #comment-button, #help-button, #undo, #redo').qtip({
		style: {
			name: 'cream',
			tip: {
				size: {
					x: 6,
					y: 8
				},	  
				corner:'topLeft'
			}
		},
		position: {
			corner: {
				target: 'bottomMiddle',
				tooltip: 'topLeft'
			},
			adjust: {
				y: 10,
				scroll: true
			}
		},
		show: {
			delay: 700
		}
	});


    // initialize rangy object and CSS class appliers
    rangy.init();
    range = rangy.createRange();
    highlightApplier = rangy.createCssClassApplier('highlight', {
        applyToEditableOnly: true,
    });
    strikeApplier = rangy.createCssClassApplier('strike', {
        normalize: true,
    });

    bindListeners();

	textBody = $('#text-container').html();

    // key listener for custom text editor behavior
    //$('.content').keypress(function(e) {
	$('.content').on("keypress", function(e) {
		//console.log("caught keypress");
        
        if (!$('*:focus').hasClass('comment') && !$('*:focus').hasClass('content')) {
            // prevent user from changing essay content directly
            e.preventDefault();

			// UNDO AND REDO SHIT   
			/*
            if (e.ctrlKey || e.metaKey) {
                if (e.keyCode == 90) { // CTRL/CMD + Z
                    console.log('undo');
                } else if (e.keyCode == 89) { // CTRL/CMD + Y
                    console.log('redo');
                }
            }*/
    
            if (e.keyCode == 8 || e.keyCode == 46) { // backspace or delete
                strike(strikeApplier);
            }
        }

		// if the user typed on top of the essay, add an inline edit
		if ($('*:focus').hasClass('content')) {
			writeInlineText(e)
		}
    });

	// catch delete key. (keypress event doesn't catch this)
	$('.content').on("keydown",function(e) {
		deleteInlineText(e);
	});

    // click listeners for editor buttons
    $('.buttons .btn-editor').each(function() {
        var button = $(this);

        button.click(function(e) {
            var tag = button.data('tag');
            switch(tag) {
                case 'annotate':
                    annotate(highlightApplier);
                    break;
                case 'strike':
                    strike(strikeApplier);
                    break;
                case 'line-height':
                    break;
                case 'undo':
                    break;
                case 'redo':
                    break;
                default:
                    break;
            }

            e.preventDefault();
        });
    });


    // click listener for the buttons on notes. attached to document
    // so that listener is bound to the buttons of each newly created
    // note
    $(document).on('click', '.saveButton', function() {
        var note = $(this).closest('.note');
        note.find('.comment').attr('contentEditable', 'false').fadeOut();
        note.find('button').hide();

        note.animate({width: 0});
        if (note.hasClass('shrink')) {
            note.animate({height: note.data('spanHeight')});
        }

        var editRange = note.data('range-id');
        $('#range-' + editRange).removeClass('highlight').addClass('edited');
    });

    $(document).on('click', '.deleteButton', function() {
        var note = $(this).closest('.note');

        var editRange = note.data('range-id');
        note.remove();

        var $range = $('#range-' + editRange);
        $range.replaceWith($range.text());

    });
});


/***************** INLINE TEXT CODE *********************/
/********************************************************/

// This function provides the functionality to delete inline edit
// text with the backspace key. It will not delete text that
// is not inline edit text.
function deleteInlineText(e) {
	var selection = window.getSelection();
	var parentHTML = selection.anchorNode.parentNode;
	if (e.keyCode === 46 || e.keyCode === 8) {
		console.log("inside before");
		if ($(parentHTML).hasClass('inline-edit')) {
			console.log(parentHTML.innerHTML);
			if (parentHTML.innerHTML.length === 1) {
				$(parentHTML).remove();
			} else {
				console.log("in span");
				var startPos = selection.baseOffset;
				var selectionRange = document.createRange();
				var currText = selection.anchorNode.nodeValue;
				var replacement = currText.substring(0,startPos-1)+currText.substring(startPos);
				var node = document.createTextNode(replacement); 
				selectionRange.setStart(selection.anchorNode,0);
				selectionRange.setEnd(selection.anchorNode,selection.anchorNode.nodeValue.length);
				parentHTML.innerHTML =  '';
				selectionRange.insertNode(node);
				selectionRange.collapse(false);
				selection.removeAllRanges();
				selection.addRange(selectionRange);

				// reset caret
				selectionRange.setStart(selection.anchorNode,startPos-1);
				selectionRange.collapse(true);
				selection.removeAllRanges();
				selection.addRange(selectionRange);
			}
		}
		e.preventDefault();
	}
}

// This code enables user to type inline edits
// in the essay
function writeInlineText(keyEvent) {
	var selection = window.getSelection();
	var parentHTML = selection.anchorNode.parentNode;

	// edgecase fix, if user is typing from location
	// where span just got removed.
	if ($(parentHTML).hasClass("content")) {
		parentHTML = document.getElementById('text-container');
	}

	// generates an inline edit span
	if (parentHTML.id === 'text-container') {
		var keyPressed = String.fromCharCode(keyEvent.which);
		var startPos = selection.baseOffset;
		var selectionRange = document.createRange();
		var node = document.createElement('span');
		node.id = (new Date()).getTime() / 1000; // get epoch time
		node.className = "inline-edit";
		node.appendChild(document.createTextNode(keyPressed));
		selectionRange.setStart(selection.anchorNode,startPos);
		selectionRange.insertNode(node);
		selectionRange.collapse(false);
		selection.removeAllRanges();
		selection.addRange(selectionRange);
		keyEvent.preventDefault();
	} 
}


/***************** STRIKETHROUGH CODE *******************/
/********************************************************/

function strike(strikeApplier) {
	var selection = rangy.getSelection();
	var aRange = rangy.createRange(); 

	if (selection.isBackwards()){
		aRange.setStart(selection.focusNode,selection.focusOffset);
		aRange.setEnd(selection.anchorNode,selection.anchorOffset);
	} else {
		aRange.setStart(selection.anchorNode,selection.anchorOffset);
		aRange.setEnd(selection.focusNode,selection.focusOffset);
	}

	var nodes = aRange.getNodes();

	// the list of nodes includes text nodes and span nodes. each span node has 
	// a text node within it and this appears in the nodes list after each span node.
	// since this text node  is inside of a span node, we do not strike it through. 
	// that's why we're keeping track of the last node--to see if it was a span node. 
	var lastNode = null;
	for (var nodeNum in nodes) {
		var startOffset, endOffset;
		if (selection.isBackwards()){			
			endOffset = selection.anchorOffset;
			startOffset = selection.focusOffset;
		} else {
			startOffset = selection.anchorOffset;
			endOffset = selection.focusOffset;
		}

		if (lastNode === null && nodes[nodeNum].nodeName === '#text') {
			aRange.setStart(nodes[nodeNum],startOffset);
			if (nodeNum == nodes.length-1) {
				aRange.setEnd(nodes[nodeNum],endOffset);
			} else {
				aRange.setEnd(nodes[nodeNum],nodes[nodeNum].length);
			}
			strikeApplier.applyToRange(aRange);
			addDelete(aRange); // Add the js to allow user to delete this span
		} else if (nodes[nodeNum].nodeName === '#text' 
				&& nodes[nodeNum].parentNode.nodeName === "P") { 
			aRange.setStart(nodes[nodeNum],0);
			if (nodeNum == nodes.length-1) {
				aRange.setEnd(nodes[nodeNum],endOffset);
			} else {
				aRange.setEnd(nodes[nodeNum],nodes[nodeNum].length);
			}
			strikeApplier.applyToRange(aRange);
			addDelete(aRange); // add js to allow user to delete this span
		}

		lastNode = nodes[nodeNum];
	}
	//selection.collapse(false);
	selection.removeAllRanges();
}


// This code adds the js that lets a user delete
// a strikethrough
function addDelete(aRange) {

    // create delete button to remove strikethrough
    var $close = $(document.createElement('span')).addClass('removeStrike');
    $close.html('<a><i class="fa fa-times-circle"></i></a>');
	
    // when delete button clicked, remove strikethrough span
    $close.click(function() {
        var $parent = $(this).parent('.strike');
        $(this).remove();
        $parent.replaceWith($parent.text());
		$('.content').get(0).normalize(); // merge adjacent text nodes	
    });

    // select strike-through span containing the current selection
    var $strikeSpan = $(aRange.getNodes()[0].parentNode);
    $strikeSpan.append($close);
    $close.hide();
    // ensure new span is not editable
    $strikeSpan.attr('contentEditable', 'false');

    // on hover, show delete button
    $strikeSpan.hover(function() {
        $(this).find('.removeStrike').show();
    }, function() {
        $(this).find('.removeStrike').hide();
    });
}


/***************** ANNOTATIONS CODE ********************/
/*******************************************************/

// annotate current selection
function annotate(highlightApplier) {
    // highlight selection
    highlightApplier.applyToSelection();
    // ensure new highlight span is not editable
    $(rangy.getSelection().getRangeAt(0).getNodes()[0].parentNode)
		.attr('contentEditable', 'false');

    // select the highlight span containing current selection
    var selectionRange = rangy.getSelection().getRangeAt(0);
    var $span = $(selectionRange.getNodes()[0].parentNode);
    // save value of curren edit ID before incrementing
    var getId = (function(x) {
        return x;
    })(id);
    $span.attr('id', 'range-' + id++);
    
    insertNote(selectionRange, getId);
}

// calls createNote() and then inserts the resulting DOM element into the
// appropriate position in the margins
function insertNote(editRange, rangeId) {
    // insert empty span into highlighted text to get the y-offset
    var noteContainer = $(document.createElement('span')).addClass('note-container');
    editRange.insertNode(noteContainer.get(0));

    // create the DOM element for the note
    var newNote = createNote(rangeId);

    // add click listener to highlighted text so that the note
    // appears when the corresponding annotation is clicked
    var $span = $(editRange.getNodes()[0].parentNode);
    $span.click(function() {
        if ($span.hasClass('edited')) {
            var note = $('#note-' + rangeId);
            note.animate({width: 175}, function() {
                if (note.hasClass('shrink')) {
                    note.animate({height: 70});
                }
                note.find('.comment').attr('contentEditable', 'true').fadeIn();
                note.find('button').show();
            });
            var editRange = note.data('range-id');
            $('#range-' + editRange).removeClass('edited').addClass('highlight');
        }
    });

    // insert newly created note into the margins at the y-offset of
    // the empty span
    $('.notes').append(newNote);
    var yOffset = noteContainer.position().top;
    newNote.css({top: yOffset});
    newNote.find('.comment').focus();
}

// creates the DOM element for the note that goes in the margins
function createNote(rangeId) {
    var newNote = $(document.createElement('div')).addClass('note');
    newNote.attr('contentEditable', 'false');
    newNote.attr('id', 'note-' + rangeId);

    // if highlight height is less than min note height, remember
    // highlight height for when note is hidden 
    var tabHeight = $('#range-' + rangeId).height();
    if (tabHeight < 70) {
        newNote.data('spanHeight', tabHeight);
        tabHeight = 70;
        newNote.addClass('shrink');
    }
    newNote.height(tabHeight);

    // create the comment box in the note
    var comment = $(document.createElement('div')).addClass('comment');
    comment.attr('contentEditable', 'true');
    comment.height(tabHeight - 48);
    newNote.append(comment);

    // comment button is only shown when note is being created
    var commentButton = $(document.createElement('button'));
    commentButton.append('Comment');
    commentButton.addClass('removable');
    commentButton.click(function() {
        $('#range-' + rangeId).removeClass('highlight').addClass('edited');

        var note = $(this).closest('.note');
        note.find('.comment').attr('contentEditable', 'false').fadeOut();
        note.find('.removable').remove();
        note.animate({width : 0});

        if (note.hasClass('shrink')) {
            note.animate({height: note.data('spanHeight')});
        }
    });
    newNote.append(commentButton);

    // cancel button removes note from DOM on click
    var cancelButton = $(document.createElement('button'));
    cancelButton.append('Cancel');
    cancelButton.addClass('removable');
    cancelButton.click(function() {
        $(this).closest('.note').remove();

        var $range = $('#range-' + rangeId);
        $range.replaceWith($range.text());
    });
    newNote.append(cancelButton);

    // save button is initially hidden but is shown when
    // the corresponding highlight is selected
    var saveButton = $(document.createElement('button'));
    saveButton.append('Save');
    saveButton.addClass('saveButton');
    saveButton.hide();
    newNote.append(saveButton);

    // delete button is also initially hidden
    var deleteButton = $(document.createElement('button'));
    deleteButton.append('Delete');
    deleteButton.addClass('deleteButton');
    deleteButton.hide();
    newNote.append(deleteButton);

    // save edit id
    newNote.data('range-id', rangeId);

    return newNote;
}
