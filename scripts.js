/************************************************************************************************************
//ELMS: Outline Designer - Usability improvements for speedy outline creation in Drupal 6.x
//Copyright (C) 2008  The Pennsylvania State University
//
//Bryan Ollendyke
//bto108@psu.edu
//
//Keith D. Bailey
//kdb163@psu.edu
//
//12 Borland
//University Park, PA 16802
//
//This program is free software; you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation; either version 2 of the License, or
//(at your option) any later version.
//
//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU General Public License for more details.
//
//You should have received a copy of the GNU General Public License along
//with this program; if not, write to the Free Software Foundation, Inc.,
//51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

************************************************************************************************************/  
//This script will only be applied tothe admin/content/book page

/**
 * Get rid of irritating tabledrag messages
 */ 
Drupal.theme.tableDragChangedWarning = function () { 
  return ' '; 
};

/**
 * Set up the document by appending some additional elements to the page
 */
 $(document).ready(function(){
	//add area for status messages to float
	//add the hidden modal for adding a child
	//add area for type change modal
	$("body").append('<div id="od_duplicate_node"><input type="checkbox" id="od_duplicate_multiple" />Duplicate all children<br /><br />How should the new title be formed?<input type="textfield" id="od_duplicate_title" value="Duplicate of %title" /><br /><br /><input type="button" name="Submit" value="Submit" onclick="od_duplicate_submit();" /><input type="button" name="Cancel" value="Cancel" onclick="tb_remove();' + "$('#od_duplicate_node').css('display','none').appendTo('body');" + '" /></div><div id="od_delete_node"><input type="checkbox" id="od_delete_multiple" />Delete all children<br /><br /><input type="button" name="Submit" value="Submit" onclick="od_delete_submit();" /><input type="button" name="Cancel" value="Cancel" onclick="tb_remove();' + "$('#od_delete_node').css('display','none').appendTo('body');" + '" /></div> <div id="od_status_msg" align="center"></div><div id="tb_ajax"></div><div id="od_change_type"><input type="button" value="Submit" id="od_change_type_submit"/> <input type="button" value="Cancel" id="od_change_type_cancel" /></div><div id="od_add_child"><div><strong>Title: </strong><input size="30" type="text" id="od_add_child_title" name="od_add_child_title"></div><div id="od_wrapper"><div id="od_content_types">'+ od_content_types() +'</div><div><input type="button" value="Submit" id="od_add_child_submit"/> <input type="button" value="Cancel" id="od_add_child_cancel" /></div></div></div>');
	$("#od_content_types input").val([BOOK_DEFAULT_TYPE]);	
	//ADD CHILD EVENTS
	$("#od_add_child_title").bind('keyup',function(e){
		$("#TB_ajaxWindowTitle span").empty().append($("#od_add_child_title").val());
	});
	$("#od_content_types input").bind("click",function(e){
		active_type = $(this).val();
		$("#TB_ajaxWindowTitle img").attr('src',DRUPAL_PATH + OD_TYPES[$(this).val()][1]);
	});
	//if you hit enter, submit the title; if you hit esc then reset the field
	$('#od_add_child_title').bind('keydown',function(e){
		if(document.all)e = event;
		  if(e.keyCode==13){  // Enter pressed
			od_add_child_submit();
			return false;
		  }  
		  if(e.keyCode==27){  // ESC pressed
			od_add_child_tb_close();
		  }
    });
	$("#od_add_child_submit").bind("click",function(e){
		od_add_child_submit();
	});
	$("#od_add_child_cancel").bind("click",function(e){
		od_add_child_tb_close();
	});
	//change type events
	$("#od_change_type_submit").bind("click",function(e){
		od_change_type_submit();
	});
	$("#od_change_type_cancel").bind("click",function(e){
		od_change_type_tb_close();
	});
	//add ability to scale interface
	$("#book-admin-edit").parent().prepend('<div style="width:120px;" class="context-menu context-menu-theme-human"><div title="" class="context-menu-item"><div style="background-image: url('+ OD_PATH +'images/add.png);" class="context-menu-item-inner" onclick="active_nid='+ ROOT_NID +';od_add_child();">Add Child</div></div></div>Interface Size: <a href="#" onclick="scale_outline_designer(-1);">Smaller</a>&nbsp;&nbsp;<a href="#" onclick="scale_outline_designer(1);">Bigger</a>&nbsp;&nbsp;<a href="#" onclick="scale_outline_designer(0);">Reset</a>&nbsp;&nbsp;');
 });
/**
 * behaviors specific to the outline designer for overloading functions
 */
Drupal.behaviors.outline_designer = function (context) {
	$("#book-outline th:last").css('display','none');
	$("tr.draggable td").each(function(i){
	  if((i+1) % 6 == 0 || (i+1) % 6 == 4 || (i+1) % 6 == 5) {
		this.style.display = 'none';
	  }
	});	
	//replace text fields with span's w/ their same content
  if (context != "#TB_ajaxContent") {
	$("#book-outline .form-text").each(function(){
		$(this).css('display','none');
		$(this).parent().append('<span id="'+ $(this).attr('id') +'-span">' + $(this).val() + '</span>');
	});
	//whenever you doubleclick on a title, switch it to the rename state
	$("#book-outline span").bind('dblclick',function(e){
		active_nid = $(this).attr('id').replace("edit-table-book-admin-","").replace("-title-span","");
		od_rename();
	});
	//whenever you aren't active on a field, remove it
	$('#book-outline input').blur(function(){
		od_rename_reset();
	});
	//if you hit enter, submit the title; if you hit esc then reset the field
	$('#book-outline input').bind('keydown',function(e){
		if(document.all)e = event;
		  if(e.keyCode==13){  // Enter pressed
			od_rename_submit();
			return false;
		  }  
		  if(e.keyCode==27){  // ESC pressed
			od_rename_reset();
		  }
    });
	//set the active node id everytime an edit icon is clicked on
	$('.outline_designer_edit_button').bind('click',function(e){
		active_nid = $(this).attr('id').replace("-"," ").substring(5);
	});
	//bind the context menu and set it's properties
	//binding isn't working in Opera / IE correctly or at all
		$('.outline_designer_edit_button').contextMenu(menu1,{theme:'human',
			beforeShow: function() {
				$(this.menu).find('.context-menu-item-inner:first').css('backgroundImage','url(' + $("#node-" + active_nid +"-icon").attr('src') +')').empty().append("node " + active_nid);
			},
			showSpeed:250, 
			hideSpeed:250, 
			showTransition:'fadeIn',
			hideTransition:'slideUp',
			useIframe:false,
			direction:'down',
			offsetX:-5, 
			offsetY:-10,
			shadowOffsetX:8,
			shadowOffsetY:18,
			shadowOpacity:.1,
		});
	/**
	 * Overload tabledrag onDrop event so that it ajax saves the new parent for the node
	 */
	Drupal.tableDrag.prototype.onDrop = function() {
	  //row object so we don't have to call it all the time
	  var row_obj = this.rowObject.element;
	  //get the id of what was dragged
	  var drag_nid = $(row_obj).find('img').attr('id').replace('node-','').replace('-icon','');
	  //get the parent id based on the indentations, this equation is a bit evil...
	  var p_nid;
	  var weight = $("#edit-table-book-admin-"+ drag_nid +"-weight").val();
	  var active_indent = Math.max($('.indentation', row_obj).size());
	  //if we're at level 0 then the node is at the book root
	  if(active_indent != 0){
		var tmp_indent = -1;
		var tmp_obj = row_obj;
		//keep walking backwards until we find the node we need
		while (tmp_indent != (active_indent-1) ) {
			tmp_obj = $(tmp_obj).prev();
			tmp_indent = Math.max($('.indentation', tmp_obj).size());
		}
		p_nid = $(tmp_obj).find('img').attr('id').replace('node-','').replace('-icon','');
	  } else {
		p_nid = ROOT_NID;
	  }
	  $.ajax({
	  type: "POST",
	  url: AJAX_PATH + "drag_drop/" + drag_nid + "/" + p_nid + "/" + weight,
	  success: function(msg){
	  		//could implement some kind of history / undo list here if we want to
			od_response_msg(msg);
		}
	  });
	  return null;
	};
	/**
	 * Annoying but we need to override this entire function to attach the ajax event for submitting weights behind the sceens
	 */
	Drupal.tableDrag.prototype.updateField = function(changedRow, group) {
	  var rowSettings = this.rowSettings(group, changedRow);
	
	  // Set the row as it's own target.
	  if (rowSettings.relationship == 'self' || rowSettings.relationship == 'group') {
		var sourceRow = changedRow;
	  }
	  // Siblings are easy, check previous and next rows.
	  else if (rowSettings.relationship == 'sibling') {
		var previousRow = $(changedRow).prev('tr').get(0);
		var nextRow = $(changedRow).next('tr').get(0);
		var sourceRow = changedRow;
		if ($(previousRow).is('.draggable') && $('.' + group, previousRow).length) {
		  if (this.indentEnabled) {
			if ($('.indentations', previousRow).size() == $('.indentations', changedRow)) {
			  sourceRow = previousRow;
			}
		  }
		  else {
			sourceRow = previousRow;
		  }
		}
		else if ($(nextRow).is('.draggable') && $('.' + group, nextRow).length) {
		  if (this.indentEnabled) {
			if ($('.indentations', nextRow).size() == $('.indentations', changedRow)) {
			  sourceRow = nextRow;
			}
		  }
		  else {
			sourceRow = nextRow;
		  }
		}
	  }
	  // Parents, look up the tree until we find a field not in this group.
	  // Go up as many parents as indentations in the changed row.
	  else if (rowSettings.relationship == 'parent') {
		var previousRow = $(changedRow).prev('tr');
		while (previousRow.length && $('.indentation', previousRow).length >= this.rowObject.indents) {
		  previousRow = previousRow.prev('tr');
		}
		// If we found a row.
		if (previousRow.length) {
		  sourceRow = previousRow[0];
		}
		// Otherwise we went all the way to the left of the table without finding
		// a parent, meaning this item has been placed at the root level.
		else {
		  // Use the first row in the table as source, because it's garanteed to
		  // be at the root level. Find the first item, then compare this row
		  // against it as a sibling.
		  sourceRow = $('tr.draggable:first').get(0);
		  if (sourceRow == this.rowObject.element) {
			sourceRow = $(this.rowObject.group[this.rowObject.group.length - 1]).next('tr.draggable').get(0);
		  }
		  var useSibling = true;
		}
	  }
	
	  // Because we may have moved the row from one category to another,
	  // take a look at our sibling and borrow its sources and targets.
	  this.copyDragClasses(sourceRow, changedRow, group);
	  rowSettings = this.rowSettings(group, changedRow);
	
	  // In the case that we're looking for a parent, but the row is at the top
	  // of the tree, copy our sibling's values.
	  if (useSibling) {
		rowSettings.relationship = 'sibling';
		rowSettings.source = rowSettings.target;
	  }
	
	  var targetClass = '.' + rowSettings.target;
	  var targetElement = $(targetClass, changedRow).get(0);
	
	  // Check if a target element exists in this row.
	  if (targetElement) {
		var sourceClass = '.' + rowSettings.source;
		var sourceElement = $(sourceClass, sourceRow).get(0);
		switch (rowSettings.action) {
		  case 'depth':
			// Get the depth of the target row.
			targetElement.value = $('.indentation', $(sourceElement).parents('tr:first')).size();
			break;
		  case 'match':
			// Update the value.
			targetElement.value = sourceElement.value;
			break;
		  case 'order':
			var siblings = this.rowObject.findSiblings(rowSettings);
			if ($(targetElement).is('select')) {
			  // Get a list of acceptable values.
			  var values = new Array();
			  $('option', targetElement).each(function() {
				values.push(this.value);
			  });
			  var maxVal = values[values.length - 1];
			  // Populate the values in the siblings.
			  var tmpVal;
			  var reweight_nid;
			  $(targetClass, siblings).each(function() {
				// If there are more items than possible values, assign the maximum value to the row. 
				tmpVal = this.value
				if (values.length > 0) {
				  this.value = values.shift();
				}
				else {
				  this.value = maxVal;
				}
				if(tmpVal != this.value) {
				  reweight_nid = this.id.replace('edit-table-book-admin-','').replace('-weight','');
				  $.ajax({
				  type: "POST",
				  url: AJAX_PATH + "reweight/" + reweight_nid + "/" + this.value,
				  success: function(msg){
						//could implement some kind of history / undo list here if we want to
						//enable this to get reweighting message support but it's annoying
						//od_response_msg(msg);
					}
				  });
				}
			  });
			}
			else {
			  // Assume a numeric input field.
			  var weight = parseInt($(targetClass, siblings[0]).val()) || 0;
			  $(targetClass, siblings).each(function() {
				this.value = weight;
				weight++;
			  });
			}
			break;
		}
	  }
	};
  }
};

//this adds scaling functionality to the interface, just a lil usability thing
function scale_outline_designer(scale){
	if(scale == 1 && factor != 2.5){
	factor = factor + .25;
	}else if(scale == -1 && factor != 1){
		factor = factor - .25;
	}else if(scale == 0){
		factor = 1;
	}
	if(factor == 1){
		$("#book-outline img").css('width','').css('height','');
		$("#book-outline").css('font-size','');
		$("#book-outline .form-item").css('margin-top','');
	}else{
		$("#book-outline img").css('width',factor + 'em').css('height',factor + 'em');
		$("#book-outline").css('font-size',factor + 'em');
		$("#book-outline .form-item").css('margin-top',(factor/4) + 'em');
	}
}

function od_response_msg(msg) {
	$("#od_status_msg").prepend('<div class="od_msg messages status">' + msg + '</div>');	
	setTimeout('$(".od_msg:last").remove();',4000);
}

//geneate a table of values from the OD_TYPES Array
function od_content_types() {
	var output = '<table><tr>';
	var i=0;
	for ( var type in OD_TYPES ) {
		i++;
		output+= '<td><input type="radio" name="content_type[]" value="'+ type +'"/> <img src="' + DRUPAL_PATH + OD_TYPES[type][1] + '" /> ' + OD_TYPES[type][0] + '</td>'
		if(i % 3 == 0) {
			output+= '</tr><tr>';
		}
	}
	return output + '</table>';
}

function od_add_child() {
  $("#od_content_types").prependTo($("#od_wrapper"));
  $("#od_content_types input").val([BOOK_DEFAULT_TYPE]);
  active_type = BOOK_DEFAULT_TYPE;
  tb_show("Add Child Node -- <img style='vertical-align:middle;' src='"+ DRUPAL_PATH + OD_TYPES[BOOK_DEFAULT_TYPE][1] +"'/> <span></span>","#TB_inline?height=300&width=500&inlineId=od_add_child", false);
  $(".node-form").append("<input type='button' name='Cancel' onclick=''/>");
  $("#od_add_child_title").focus();
}

function od_add_child_submit() {
	var ser = $("#od_add_child_title").serialize();
	var pattern = new RegExp("od_add_child_title=");
	pattern.test(ser);
	var title = RegExp.rightContext;
	title = title.replace(/%2F/g,"@2@F@");
	if (title == "") {
		alert("You must enter a title in order to submit a new node!");
		return false;
	}
	else {
	  $.ajax({
	    type: "POST",
	    url: AJAX_PATH + "add_child/" + title + "/" + active_type + "/" + active_nid,
	    success: function(msg){
	  	  var msg_split = new RegExp(";msg:");
		  msg_split.test(msg);
		  msg = RegExp.rightContext;
		  $("#reload_table").trigger('change');
		  od_response_msg(msg);
		  od_add_child_tb_close();
	    }
	  });
	}
}

function od_add_child_tb_close(){
    tb_remove();
	$("#od_add_child_title").val('');	
}

function od_edit() {
  $.ajax({
	  type: "POST",
	  url: AJAX_PATH + "edit/" + active_nid,
	  success: function(msg){
		//show an error message if edit node returned 0 cause failed permissions
		if(msg == 0) {
		   od_response_msg("You don't have sufficient permissions to edit this node");
		}
		else {
		  tb_show("","#TB_inline?height=480&width=640&modal=true", false);
		  $("#TB_ajaxContent").append(msg);
		  Drupal.attachBehaviors("#TB_ajaxContent");
		  //add tiny field if it exists
		  if (window.tinyMCE && window.tinyMCE.triggerSave && $('#edit-body').length != 0) {
			tinyMCE.execCommand('mceAddControl', false, 'edit-body');
	      }
		  //append the cancel button to the form
		  $(".node-form").append("<input type='button' name='Cancel' value='Cancel' onclick='od_edit_cancel();'/>");
		}
	  }
  });
}
function od_edit_cancel(){
  if (window.tinyMCE && window.tinyMCE.triggerSave && $('#edit-body').length != 0) {
	  tinyMCE.execCommand('mceFocus', false, 'edit-body');              
	  tinyMCE.execCommand('mceRemoveControl', false, 'edit-body');
  }
  tb_remove();
}

//starts the rename process
function od_rename() {
	$('#edit-table-book-admin-' + active_nid + '-title-span').css('display','none');
	$('#edit-table-book-admin-' + active_nid + '-title').css('display','');
	$('#edit-table-book-admin-' + active_nid + '-title').focus();
}
//resets the rename field should we need to cancel it
function od_rename_reset() {
	$('#edit-table-book-admin-' + active_nid + '-title-span').css('display','');
	$('#edit-table-book-admin-' + active_nid + '-title').val($('#edit-table-book-admin-' + active_nid + '-title-span').html());
	$('#edit-table-book-admin-' + active_nid + '-title').css('display','none');
}
//sends data back to server IF there were changes
function od_rename_submit() {
	//check if there was a change made.  If not, then don't do anything :)
	$('#edit-table-book-admin-' + active_nid + '-title-span').css('display','');
	$('#edit-table-book-admin-' + active_nid + '-title').css('display','none');
	if ($('#edit-table-book-admin-' + active_nid + '-title-span').html() != $('#edit-table-book-admin-' + active_nid + '-title').val()) {
		var ser = $('#edit-table-book-admin-' + active_nid + '-title').serialize();
		var pattern = new RegExp("%5Btitle%5D=");
		pattern.test(ser);
		var title = RegExp.rightContext;
		title = title.replace(/%2F/g,"@2@F@");
		$('#edit-table-book-admin-' + active_nid + '-title-span').html($('#edit-table-book-admin-' + active_nid + '-title').val());
		$.ajax({
		  type: "POST",
		  url: AJAX_PATH + "rename/" + active_nid + "/" + title,
		  success: function(msg){
			od_response_msg(msg);
		  }
		});
	}
}
//duplicate part (or all) of a structure
function od_duplicate(){
  $("#od_duplicate_multiple").remove();
  $("#od_duplicate_node").prepend('<input type="checkbox" id="od_duplicate_multiple"/>');
  tb_show("Duplicate Node(s) -- <img style='vertical-align:middle;' src='"+ OD_PATH + "/images/duplicate.png'/> <span></span>","#TB_inline?height=200&width=300", false);
  $("#od_duplicate_node").css('display','block').appendTo("#TB_ajaxContent");
}
function od_duplicate_submit(){
  var multiple = $('#od_duplicate_multiple:checked').length;
  var dup_title = $("#od_duplicate_title").val();
  dup_title = dup_title.replace(/%2F/g,"@2@F@");
  $.ajax({
    type: "POST",
    url: AJAX_PATH + "duplicate/" + active_nid + "/" + multiple + "/" + dup_title,
    success: function(msg){
      $("#reload_table").trigger('change');
      od_response_msg(msg);
	  $("#od_duplicate_node").css('display','none').appendTo("body");
	  $("#od_duplicate_title").val('Duplicate of %title');
	  tb_remove();
    }
  });	
}

function od_delete(){
  $("#od_delete_multiple").remove();
  $("#od_delete_node").prepend('<input type="checkbox" id="od_delete_multiple"/>');
  tb_show("Delete Node(s) -- <img style='vertical-align:middle;' src='"+ OD_PATH + "/images/delete.png'/> <span></span>","#TB_inline?height=200&width=300", false);
  $("#od_delete_node").css('display','block').appendTo("#TB_ajaxContent");
}
function od_delete_submit(){
  var multiple = $('#od_delete_multiple:checked').length;
  $.ajax({
    type: "POST",
    url: AJAX_PATH + "delete/" + active_nid + "/" + multiple,
    success: function(msg){
	  $("#reload_table").trigger('change');
      od_response_msg(msg);
	  $("#od_delete_node").css('display','none').appendTo("body");
	  tb_remove();
    }
  });	
}
function od_change_type() {
	var type_src = $("#node-" + active_nid +"-icon").attr('src').replace(DRUPAL_PATH,'');
	var i=0;
	for ( var type in OD_TYPES ) {
		i++;
		if ( OD_TYPES[type][1] == type_src) {
			$("#od_content_types input").val([type]);
  			active_type = type;	
		}
	}
	$("#od_content_types").prependTo($("#od_change_type"));
	$("#od_change_type_cancel").appendTo("#TB_ajaxContent");
	tb_show("Change Node Type -- <img style='vertical-align:middle;' src='"+ $("#node-" + active_nid +"-icon").attr('src') +"'/> <span>"+ $('#edit-table-book-admin-' + active_nid + '-title').val() +"</span>","#TB_inline?height=200&width=500&inlineId=od_change_type", false);
}

function od_change_type_submit() {
	$.ajax({
         type: "POST",
         url: AJAX_PATH + "change_type/" + active_nid + '/' + active_type,
         success: function(msg){
		   $("#node-" + active_nid +"-icon").attr('src',DRUPAL_PATH + OD_TYPES[active_type][1]);
           od_change_type_tb_close();
		   od_response_msg(msg);
        }
      });
}
function od_change_type_tb_close() {
	tb_remove();	
}

//permissions setting if the node privacy by role module exists
function od_permissions() {
  alert('Future Functionality...');
  //snag the possible permissions / currently selected ones for this node
  //give the ability to cascade these permissions down this branch
}
/**
 * Overload ajax functionality of the ajax module. onsuccess != redirect page
 */
Drupal.Ajax.response = function(submitter, formObj, data){
  var newSubmitter;
  /**
   * Failure
   */
  if (data.status === false) {
    Drupal.Ajax.message(data.messages_error, 'error', formObj, submitter);
  }
  /**
   * Success
   */
  else {
    // Display preview
    if (data.preview !== null) {
      Drupal.Ajax.message(decodeURIComponent(data.preview), 'preview',
        formObj, submitter);
      // Sometimes the submit button needs to show up afterwards
      //if ($('#edit-submit').length === 0) {
      //  newSubmitter = submitter.clone(true);
      //  newSubmitter.attr('id', 'edit-submit').val('Submit');
      //  submitter.before(newSubmitter);
      //}
    }
    // If no redirect, then simply show messages
    else if (data.redirect === null) {
      if (data.messages_status.length > 0) {
        Drupal.Ajax.message(data.messages_status, 'status', formObj, submitter);
      }
      if (data.messages_warning.length > 0) {
        Drupal.Ajax.message(data.messages_warning, 'warning', formObj, submitter);
      }
      if (data.messages_status.length === 0 &&
          data.messages_warning.length === 0) {
        Drupal.Ajax.message([{
          id : 0,
          value : 'Submission Complete.'
        }], 'status', formObj, submitter);
      }
    }
    // Redirect
    else {
      //console.log(data.redirect);
      //window.location.href = data.redirect; //This is what we need to overload
	  //If there were changes to the title push them back to the outline designer
	  var saved_title = $("#edit-title").val();
	  $('#edit-table-book-admin-' + active_nid + '-title').val(saved_title);
	  $('#edit-table-book-admin-' + active_nid + '-title-span').html(saved_title);
	  //get rid of tinymce instance if it exists
	  if (window.tinyMCE && window.tinyMCE.triggerSave && $('#edit-body').length != 0) {
		  tinyMCE.execCommand('mceFocus', false, 'edit-body');              
		  tinyMCE.execCommand('mceRemoveControl', false, 'edit-body');
	  }
	  //saving is complete, remove the thick box window
	  tb_remove();
	  //display updated message
	  od_response_msg("Node "+ active_nid +" updated");
    }
  }
}

//this was glitching out the outline designer so I had to overload it if was activated
Drupal.Ajax.plugins.thickbox = function(hook, args) {
  var tb_init_original;
  if (hook === 'scrollFind') {
    if (args.container.id === 'TB_window') {
      return false;
    }
    else {
      return true;
    }
  }
  else if (hook === 'init') {
    tb_init_original = window.tb_init;
    window.tb_init = function(domChunk){
      tb_init_original(domChunk);
      //Drupal.attachBehaviors($('#TB_window'));
    }
  }
  return true;
}

