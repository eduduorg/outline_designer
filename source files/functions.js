//kick these off at the start so that we can have a tree object to make changes to
$(document).ready(function(){
  treeObj = new JSDragDropTree();
  treeObj.setTreeId("node0");
  treeObj.setMaximumDepth(100);
  treeObj.initTree();
  get_book_roots();
  load_outline(document.getElementById("selected_outline").value);
});

//This gets called once a structure is duplicated or a new one is added, it loads up everything visually with permissions taken into account
function load_outline(nid){
  document.getElementById("node0").getElementsByTagName("UL")[0].innerHTML="";
  if(nid !=0){
  $.ajax({
     type: "POST",
     url: AJAX_URL,
     data: "action=load_tree&nid=" + nid,
     success: function(msg){
      var ary = Array();
      ary = PHP_Unserialize(msg);
      for(var i=0; i<ary.length; i++){
        ary_nid = ary[i][0];
        ary_pid = ary[i][1];
        ary_title = ary[i][2];
        ary_edit = ary[i][4];
        nodename = "node" + ary_nid;
        var li = document.createElement("LI");
        li.id = nodename;
        var span = document.createElement("SPAN");
        span.id = "nodeLevel" + ary_nid;
        span.innerHTML = "&nbsp;";
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
        document.getElementById("node0").getElementsByTagName("UL")[0].appendChild(li);
        if(OUTLINE_POSTS == 1){
          document.getElementById(nodename).setAttribute("noadd","false");
        }else{
          document.getElementById(nodename).setAttribute("noadd","true");
        }
        if(ary_edit == 1){
          document.getElementById(nodename).setAttribute("norename","false");
          document.getElementById(nodename).setAttribute("nodelete","false");
        }else{
          document.getElementById(nodename).setAttribute("norename","true");
          document.getElementById(nodename).setAttribute("nodelete","true");
        }
        if(parentid == "node0"){              
          document.getElementById(nodename).setAttribute("nodelete","true");
          document.getElementById(nodename).setAttribute("noDrag","true");
          document.getElementById(nodename).setAttribute("noSiblings","true");
        }else{
          if(DRAG_AND_DROP_CONTENT == 0){
            document.getElementById(nodename).setAttribute("noDrag","true");
          }
        }
        //set the double click stuff
        document.getElementById(span.id).setAttribute("ondblclick","load_view_node(this.parentNode.id);");
        document.getElementById(li.id).getElementsByTagName("A")[0].setAttribute("ondblclick","load_view_node(this.parentNode.id);");
      }
      treeObj.initTree();
      //folders have been setup, now replace them
      //also move everything where it belongs if the weights are weird
      for(var i=0; i<ary.length; i++){      
        ary_nid = ary[i][0];
        ary_pid = ary[i][1];
        ary_type = ary[i][3];
        nodeid = "node" + ary_nid;
        parentid = "node" + ary_pid;
        li = document.getElementById(nodeid);
        document.getElementById(parentid).getElementsByTagName("UL")[0].appendChild(li);
        document.getElementById("iconIMG" + nodeid).src = DRUPAL_PATH + '/' + ary_type;
      }
      
      //...now that it is all in order...FINALLY get rid of the stupid plus/minus boxes
      for(var i=0; i<ary.length; i++){
        ary_nid = ary[i][0];
        nodeid = "tree_ul_" + ary_nid;
        if(document.getElementById(nodeid).getElementsByTagName("LI").length == 0){
          document.getElementById(nodeid).parentNode.getElementsByTagName("IMG")[0].style.visibility="hidden";
        }else{
          document.getElementById(nodeid).parentNode.getElementsByTagName("IMG")[0].style.visibility="visible";
        }
      }
      treeObj.expandAll();
      //try to force a setting of the tree in the select box
      var options = document.getElementById("selected_outline").options;
      document.getElementById("selected_outline").value = nid;
      for(i=0;i<options.length;i++){
        if(options[i].value == nid){
          options[i].selected = true;
        }
      }
     }
   });
  }
}
//duplicate a book / tree structure from the root.  It will automatically rename the first entry as DUPLICATE * so that you can tell which is the new one
function duplicate_structure(){
  var root = document.getElementById("selected_outline").value;
  if(root != 0 && confirm("Duplicate this outline? (this may take awhile)")){
    $.ajax({
     type: "POST",
     url: AJAX_URL,
     data: "action=duplicate_nodes&root=" + root,
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
  if(title != ""){
    $.ajax({
     type: "POST",
     url: AJAX_URL,
     data: "action=add_node&parent=0&title=" + title,
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
   mywindow = window.open(DRUPAL_PATH + "/node/" + nid + "/edit","mywindow","status=1,resizable=1,scrollbars=1,width=700,height=500");
   mywindow.moveTo(300,200);
 }
 
 //goes through and saves everything about the current node structure. this is costly so it isn't used anymore but I left the code around for future potential use
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
   url: AJAX_URL,
   data: "action=save_tree&tree=" + serialize(savelist),
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
 }
 
//delete a book of content. starts at the root node and works it's way down recursively to get them all.
 function delete_structure(){
  if(document.getElementById("selected_outline").value != 0){
    var obj = document.getElementById("node" + document.getElementById("selected_outline").value);
    document.getElementById("tree_container").className="tree_saving";
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
         url: AJAX_URL,
         data: "action=delete&ids=" + serialize(del),
         success: function(msg){
           var parentRef = obj.parentNode.parentNode;
           obj.parentNode.removeChild(obj);
           document.getElementById("tree_container").className="tree_normal";
           get_book_roots();
           document.getElementById("selected_outline").childNodes[0].selected = true;
        }
      });
    }else{
      document.getElementById("tree_container").className="tree_normal";  
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
  mywindow = window.open(DRUPAL_PATH + "/node/" + nid,"mywindow","status=1,resizable=1,scrollbars=1,width=700,height=500");
    mywindow.moveTo(300,200);
}

//This gets the book roots and dispalys them in the select box
//roots are calculated based on things that have a parent of 0
function get_book_roots(){
  $.ajax({
     type: "POST",
     url: AJAX_URL,
     data: "action=get_book_roots",
     success: function(msg){
      var ary = Array();
      ary = PHP_Unserialize(msg);
      values = "<option value='0' SELECTED></option>";
      for(var i=0; i<ary.length; i++){
        ary_nid = ary[i][0]; 
        ary_title = ary[i][1];
        values+= "<option value='" + ary_nid + "'>" + ary_title + "</option>";
      }
    //need to do this to clear out potential old values and add them all back in, IE work around
      $("#selected_outline").empty();
      $("#selected_outline").append(values);
      $("#selected_outline").val(0);
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
  var tree = document.getElementById("node0").getElementsByTagName("LI");
  var root = document.getElementById("selected_outline").value;
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
  document.getElementById("tree_container").className="tree_saving";
  //send off these values
  $.ajax({
  type: "POST",
  url: AJAX_URL,
  data: "action=update_weights&weight=" + serialize(weight),
  success: function(msg){
    document.getElementById("tree_container").className="tree_normal";
  }
  });
}