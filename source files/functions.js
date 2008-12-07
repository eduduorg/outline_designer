/************************************************************************************************************
//ELMS: Outline Designer - Ajax book / general usability improvements for Drupal 5.x
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
//kick these off at the start so that we can have a tree object to make changes to
$(document).ready(function(){
  treeObj = new JSDragDropTree();
  treeObj.setTreeId("node0");
  treeObj.setMaximumDepth(100);
  treeObj.initTree();
  get_book_roots();
  treeObj.createDropIndicator();
  document.documentElement.onselectstart = treeObj.cancelSelectionEvent;
  document.documentElement.ondragstart = treeObj.cancelEvent;
  document.documentElement.onmousemove = treeObj.moveDragableNodes;  
  document.documentElement.onmouseup = treeObj.dropDragableNodes;
  treeObj.helpObj = document.createElement("DIV");
  treeObj.helpObj.style.display = "none";
  $("body").append(treeObj.helpObj);
});
//scale the interface via jquery
function scale_outline_designer(scale){
	if(scale == 'up' && factor != 2.5){
	factor = factor + .25;
	}else if(scale == 'down' && factor != .5){
		factor = factor - .25;
	}else if(scale == 'reset'){
		factor = 1;
	}
	if(factor == 1){
		$("#node0 img").css('width','').css('height','');
		$("#node0 a").css('font-size','');
		$("#dragDropIndicatorImage").css('width','').css('height','');
	}else{
		$("#node0 img").css('width',factor + 'em').css('height',factor + 'em');
		$("#node0 a").css('font-size',factor + 'em');
		$("#dragDropIndicatorImage").css('width',factor + 'em').css('height',factor + 'em');
	}
	$("#node0 span").css('margin','0px ' + factor * 5 + 'px 0px ' + factor * 5 + 'px').css('padding','0px ' + factor * 5 + 'px ' + factor * 10 + 'px ' + factor * 5 + 'px');
	$("#node0 span").css('background-image','url(' + DRUPAL_OD_PATH + '/images/settings' + (factor*100) + '.png)');
	//take care of drop indicator if we've scaled the interface
	$("#dragDropIndicatorImage").css('padding',factor * 9 + 'px 0px 0px 0px');
}

//This gets called once a structure is duplicated or a new one is added, it loads up everything visually with permissions taken into account
function load_outline(nid){
  $("#node0 ul:first").html("");
  if(nid !=''){
  $.ajax({
     type: "GET",
     url: AJAX_URL + "load_tree/" + nid,
     success: function(msg){
      var ary = Array();
      ary = PHP_Unserialize(msg);
      for(var i=0; i<ary.length; i++){
        ary_nid = ary[i][0];
        ary_pid = ary[i][1];
        ary_title = ary[i][2];
        ary_edit = ary[i][4];
        if(ary_nid != 0){
		nodename = "node" + ary_nid;
        var li = document.createElement("LI");
        li.id = nodename;
        var span = document.createElement("SPAN");
        span.id = "nodeLevel" + ary_nid;
        var a = document.createElement("A");
        a.href = "#";
        a.innerHTML = ary_title;
        var ul = document.createElement("UL");
		
        li.appendChild(span);
		li.appendChild(a);
        li.appendChild(ul);
        
        parentid = "node" + ary_pid;
        //get the UL that is in the parentID that we are looking to insert this new LI into
        //this helps to account for errors caused by JS not changing the name fast enough
        $("#node0 ul:first").append(li);
        if(OUTLINE_POSTS == 1){
         $("#" + nodename).attr("noadd","false");
        }else{
         $("#" + nodename).attr("noadd","true");
        }
        if(ary_edit == 1){
         $("#" + nodename).attr("norename","false");
         $("#" + nodename).attr("nodelete","false");
        }else{
         $("#" + nodename).attr("norename","true");
         $("#" + nodename).attr("nodelete","true");
        }
        if(parentid == "node0"){              
         $("#" + nodename).attr("nodelete","true");
         $("#" + nodename).attr("noDrag","true");
         $("#" + nodename).attr("noSiblings","true");
        }else{
          if(DRAG_AND_DROP_CONTENT == 0){
           $("#" + nodename).attr("noDrag","true");
          }
        }
        //set the double click stuff
        //$("#" + span.id).dblclick(load_view_node(this.parentNode.id));
        $("#" + li.id + " a:first").dblclick(function(){load_view_node(this.parentNode.id);});
	    }
      }
      treeObj.initTree();
      //folders have been setup, now replace them
      //also move everything where it belongs if the weights are weird
      for(var i=0; i<ary.length; i++){      
        ary_nid = ary[i][0];
        ary_pid = ary[i][1];
        ary_type = ary[i][3];
		if(ary_nid != 0){
        nodeid = "node" + ary_nid;
        parentid = "node" + ary_pid;
        li = $("#" + nodeid);
        $("#" + parentid + " ul:first").append(li);
        $("#iconIMG" + nodeid).attr('src',DRUPAL_PATH + '/' + ary_type);
		}
      }
      
      //...now that it is all in order...FINALLY get rid of the stupid plus/minus boxes
      for(var i=0; i<ary.length; i++){
        ary_nid = ary[i][0];
		if(ary_nid != 0){
			nodeid = "tree_ul_" + ary_nid;
			if(document.getElementById(nodeid).getElementsByTagName("LI").length == 0){
			  document.getElementById(nodeid).parentNode.getElementsByTagName("IMG")[0].style.visibility="hidden";
			}else{
			  document.getElementById(nodeid).parentNode.getElementsByTagName("IMG")[0].style.visibility="visible";
			}
		}
      }
      treeObj.expandAll();
      //try to force a setting of the tree in the select box
	  $(document).ready(function(){
        $("#selected_outline").attr('value',nid);
      });
     }
   });
  }
}
//duplicate a book / tree structure from the root.  It will automatically rename the first entry as DUPLICATE * so that you can tell which is the new one
function duplicate_structure(){
  var root = $("#selected_outline").val();
  if(root != 0 && confirm("Duplicate this outline? (this may take awhile)")){
    $.ajax({
     type: "POST",
     url: AJAX_URL + "duplicate_nodes/" + root,
     success: function(msg){
      //a new root has been made so we can just load it like any other
      //the return will be the node to load
      get_book_roots();
      load_outline(msg);
      $(document).ready(function(){
        $("#selected_outline").val(root);
      });
    }
    });
  }
 }
 
 //create a new book tree
 function new_structure(){
  var title = prompt("What is the name of this outline structure?");
  if(title != "" && title != null){
    $.ajax({
     type: "POST",
     url: AJAX_URL + "add_node/0/" + title,
     success: function(msg){
     //returned msg will be the nid of the new book so that we can start to render it out
      get_book_roots();
      var ary = PHP_Unserialize(msg);
      load_outline(ary[0]);
    }
    });
  }
 }
 //pop up helper for generating an edit form for a node
 function node_popup(nid){
   mywindow = window.open(DRUPAL_PATH + "/?q=node/" + nid + "/edit","mywindow","status=1,resizable=1,scrollbars=1,width=700,height=500");
   mywindow.moveTo(300,200);
 }
 
 /*goes through and saves everything about the current node structure. this is costly so it isn't used anymore but I left the code around for future potential use
 function save_tree(){
  update_weights();
  treeObj.initTree();
  var saveString = treeObj.getNodeOrders();
  var stringarray = saveString.split(",");
  savelist = Array();
  for(i=0; i<stringarray.length; i++){
    ids = stringarray[i].split("-");
    savelist.push(Array(ids[0],ids[1],document.getElementById("nodeATag" + ids[0]).innerHTML));
  }
  document.getElementById("tree_container").className="tree_saving";
  $.ajax({
   type: "POST",
   url: AJAX_URL + "save_tree/" + serialize(savelist),
   success: function(msg){
  document.getElementById("tree_container").className="tree_normal";
  if(msg){
    var ary = Array();
    ary = PHP_Unserialize(msg);
    nodename = "node" + ary[0];
    document.getElementById("iconIMGnode" + ary[0]).src = DRUPAL_PATH + '/' + ary[1];
    treeObj.initTree();
  }
   }
 });
 }*/
 
//delete a book of content. starts at the root node and works it's way down recursively to get them all.
 function delete_structure(){
  if($("#selected_outline").val() != 0){
    var obj = document.getElementById("node" + $("#selected_outline").val());
    $("#tree_container").addClass("tree_saving");
    $("#tree_container").removeClass("tree_normal");
    var del = Array();
    var answer = true;
    del.push(obj.id.substring(4));
    var lis = obj.getElementsByTagName("LI");
    for(var no=0;no<lis.length;no++){
      del.push(lis[no].id.substring(4));
    }
    answer = confirm("Delete this entire outline? (This can not be undone!)");
    if(answer){
      $.ajax({
         type: "POST",
         url: AJAX_URL + "delete/" + serialize(del),
         success: function(msg){
           var parentRef = obj.parentNode.parentNode;
           obj.parentNode.removeChild(obj);
           $("#tree_container").removeClass("tree_saving");
      	   $("#tree_container").addClass("tree_normal");
           get_book_roots();
           document.getElementById("selected_outline").childNodes[0].selected = true;
        }
      });
    }else{
	   $("#tree_container").removeClass("tree_saving");
      $("#tree_container").addClass("tree_normal");
    }
  }
 }
 
//loads up the node and passes it off to a popup call.  the popup is used for opening up to a node edit form when Edit Content is choosen from the context menu
function load_node(nid){
  nid = nid.substring(4);
  node_popup(nid);
}

//pop up window for viewing a node. this gets called when you double click on any node
function load_view_node(nid){
  nid = nid.substring(4);
  mywindow = window.open(DRUPAL_PATH + "/?q=node/" + nid,"mywindow","status=1,resizable=1,scrollbars=1,width=700,height=500");
    mywindow.moveTo(300,200);
}

//This gets the book roots and dispalys them in the select box
//roots are calculated based on things that have a parent of 0
function get_book_roots(){
  $.ajax({
     type: "POST",
     url: AJAX_URL + "get_book_roots",
     success: function(msg){
      var ary = Array();
      ary = PHP_Unserialize(msg);
      values = "<option value='' SELECTED></option>";
      for(var i=0; i<ary.length; i++){
        ary_nid = ary[i][0]; 
        ary_title = ary[i][1];
        values+= "<option value='" + ary_nid + "'>" + ary_title + "</option>";
      }
    //need to do this to clear out potential old values and add them all back in, IE work around
      $("#selected_outline").empty();
      $("#selected_outline").append(values);
      $("#selected_outline").val('');
     }
  });
}

//This will calculate what the weights are for all items on the screen
//Usually this gets called after items are added, deleted or moved to make sure that the weights in the book backend are always matched up correctly with what's on screen
function update_weights(){
  var weight = Array();
  var numbering = Array(0,0,0,0,0,0,0,0,0,0);
  var level = 0;
  var previouslevel = 0;
  var etext = false;
  var term = Array();
  var tree = $("#node0 li");
  var root = $("#selected_outline").val();
  //figure out the root url
  for(i=0; i<tree.length; i++){
  idlevel = tree[i].id;
  previouslevel = level;
  level = 0;
  while(document.getElementById(idlevel).parentNode.parentNode.id != "node0"){
    idlevel = document.getElementById(idlevel).parentNode.parentNode.id;
    level++;
  }
  //subtracting 16 from every numbering value should translate correctly to a weight
  //at the end of grabbing all these we'll kick off 1 ajax query using an array of weights
  if(level != 0){
    if(etext == false){
    if(previouslevel == level){
      numbering[level-1]++;
    }else if(previouslevel > level){
      numbering[level-1]++;
      numbering[previouslevel-1] = 1;
    }else{
      numbering[level-1]=1;
    }
    }else{
    numbering[level-1]++;
    }
    weight.push(Array(numbering[level-1]-16,tree[i].id.substring(4)));
  }else{
    weight.push(Array(-15,tree[i].id.substring(4)));
  }
  }
  treeObj.initTree();
  $("#tree_container").addClass("tree_saving");
  $("#tree_container").removeClass("tree_normal");
  //send off these values
  $.ajax({
  type: "POST",
  url: AJAX_URL + "update_weights/" + serialize(weight),
  success: function(msg){
    $("#tree_container").removeClass("tree_saving");
    $("#tree_container").addClass("tree_normal");
  }
  });
}