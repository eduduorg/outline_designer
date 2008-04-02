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

Built off the Drag and drop folder tree Library Copyright (C) 2006  DTHMLGoodies.com, Alf Magne Kalleland
************************************************************************************************************/  
  
  var JSTreeObj;
    
  /* Constructor */
  function JSDragDropTree()
  {
    var idOfTree;
    var imageFolder;
    var folderImage;
    var plusImage;
    var minusImage;
    var maximumDepth;
    var dragNode_source;
    var dragNode_parent;
    var dragNode_sourceNextSib;
    var dragNode_noSiblings;
    
    var dragNode_destination;
    var floatingContainer;
    var dragDropTimer;
    var dropTargetIndicator;
    var insertAsSub;
    var indicator_offsetX;
    var indicator_offsetX_sub;
    var indicator_offsetY;
    
    this.imageFolder = DRUPAL_OD_PATH + '/images/';
    this.folderImage = 'node.png';
    this.plusImage = 'plus.gif';
    this.minusImage = 'minus.gif';
    this.maximumDepth = 6;
    var messageMaximumDepthReached;
    
    var renameAllowed;
    var deleteAllowed;
    var addAllowed;
    var iconsAllowed;
    var currentlyActiveItem;
    var contextMenu;
    var currentItemToEdit;    // Reference to item currently being edited(example: renamed)
    var helpObj;
    
    this.contextMenu = false;
    this.floatingContainer = document.createElement('UL');
    this.floatingContainer.style.position = 'absolute';
    this.floatingContainer.style.display='none';
    this.floatingContainer.id = 'floatingContainer';
    this.insertAsSub = false;
    document.body.appendChild(this.floatingContainer);
    this.dragDropTimer = -1;
    this.dragNode_noSiblings = false;
    this.currentItemToEdit = false;
    
    this.indicator_offsetX = 0;  // Offset position of small black lines indicating where nodes would be dropped.
    this.indicator_offsetX_sub = 0;
    this.indicator_offsetY = 0;

    this.messageMaximumDepthReached = ''; // Use '' if you don't want to display a message 
    
    this.renameAllowed = true;
    this.deleteAllowed = true;
    this.addAllowed = true;
    this.iconsAllowed = true;
    this.currentlyActiveItem = false;
    this.helpObj = false;
    
  }
  
  /* JSDragDropTree class */
  JSDragDropTree.prototype = {
      /**
       *
       *  This function adds an event listener to an element on the page.
       *
       *  @param Object whichObject = Reference to HTML element(Which object to assigne the event)
       *  @param String eventType = Which type of event, example "mousemove" or "mouseup"
       *  @param functionName = Name of function to execute. 
       * 
       * @public
       */  
    addEvent : function(whichObject,eventType,functionName)
    { 
      if(whichObject.attachEvent){ 
        whichObject['e'+eventType+functionName] = functionName; 
        whichObject[eventType+functionName] = function(){whichObject['e'+eventType+functionName]( window.event );} 
        whichObject.attachEvent( 'on'+eventType, whichObject[eventType+functionName] ); 
      } else 
        whichObject.addEventListener(eventType,functionName,false);       
    } 
    // }}}  
    ,  
      /**
       *
       *  This function removes an event listener from an element on the page.
       *
       *  @param Object whichObject = Reference to HTML element(Which object to assigne the event)
       *  @param String eventType = Which type of event, example "mousemove" or "mouseup"
       *  @param functionName = Name of function to execute. 
       * 
       * @public
       */    
    removeEvent : function(whichObject,eventType,functionName)
    { 
      if(whichObject.detachEvent){ 
        whichObject.detachEvent('on'+eventType, whichObject[eventType+functionName]); 
        whichObject[eventType+functionName] = null; 
      } else 
        whichObject.removeEventListener(eventType,functionName,false); 
    } 
    ,  
    Get_Cookie : function(name) { 
       var start = document.cookie.indexOf(name+"="); 
       var len = start+name.length+1; 
       if ((!start) && (name != document.cookie.substring(0,name.length))) return null; 
       if (start == -1) return null; 
       var end = document.cookie.indexOf(";",len); 
       if (end == -1) end = document.cookie.length; 
       return unescape(document.cookie.substring(len,end)); 
    } 
    ,
    // This function has been slightly modified
    Set_Cookie : function(name,value,expires,path,domain,secure) { 
      expires = expires * 60*60*24*1000;
      var today = new Date();
      var expires_date = new Date( today.getTime() + (expires) );
        var cookieString = name + "=" +escape(value) + 
           ( (expires) ? ";expires=" + expires_date.toGMTString() : "") + 
           ( (path) ? ";path=" + path : "") + 
           ( (domain) ? ";domain=" + domain : "") + 
           ( (secure) ? ";secure" : ""); 
        document.cookie = cookieString; 
    } 
    ,
    setRenameAllowed : function(renameAllowed)
    {
      this.renameAllowed = renameAllowed;      
    }
    ,
    setDeleteAllowed : function(deleteAllowed)
    {
      this.deleteAllowed = deleteAllowed;  
    }
    ,setAddAllowed : function(addAllowed)
    {
      this.addAllowed = addAllowed;
    }
    ,setIconsAllowed : function(iconsAllowed)
    {
      this.iconsAllowed = iconsAllowed;
    }
    ,setMaximumDepth : function(maxDepth)
    {
      this.maximumDepth = maxDepth;  
    }
    ,setMessageMaximumDepthReached : function(newMessage)
    {
      this.messageMaximumDepthReached = newMessage;
    }
    ,  
    setImageFolder : function(path)
    {
      this.imageFolder = path;  
    }
    ,
    setFolderImage : function(imagePath)
    {
      this.folderImage = imagePath;      
    }
    ,
    setPlusImage : function(imagePath)
    {
      this.plusImage = imagePath;        
    }
    ,
    setMinusImage : function(imagePath)
    {
      this.minusImage = imagePath;      
    }
    ,    
    setTreeId : function(idOfTree)
    {
      this.idOfTree = idOfTree;      
    }  
    ,
    expandAll : function()
    {
      var menuItems = document.getElementById(this.idOfTree).getElementsByTagName('LI');
      for(var no=0;no<menuItems.length;no++){
        var subItems = menuItems[no].getElementsByTagName('UL');
        if(subItems.length>0 && subItems[0].style.display!='block'){
          JSTreeObj.showHideNode(false,menuItems[no].id);
        }      
      }
    }  
    ,
    collapseAll : function()
    {
      var menuItems = document.getElementById(this.idOfTree).getElementsByTagName('LI');
      for(var no=0;no<menuItems.length;no++){
        var subItems = menuItems[no].getElementsByTagName('UL');
        if(subItems.length>0 && subItems[0].style.display=='block'){
          JSTreeObj.showHideNode(false,menuItems[no].id);
        }      
      }    
    }  
    ,
    /*
    Find top pos of a tree node
    */
    getTopPos : function(obj){
      var top = obj.offsetTop/1;
      while((obj = obj.offsetParent) != null){
        if(obj.tagName!='HTML')top += obj.offsetTop;
      }      
      if(document.all)top = top/1 + 13; else top = top/1 + 4;    
      return top;
    }
    ,  
    /*
    Find left pos of a tree node
    */
    getLeftPos : function(obj){
      var left = obj.offsetLeft/1 + 1;
      while((obj = obj.offsetParent) != null){
        if(obj.tagName!='HTML')left += obj.offsetLeft;
      }
          
      if(document.all)left = left/1 - 2;
      return left;
    }  
      
    ,
    showHideNode : function(e,inputId)
    {
      if(inputId){
        if(!document.getElementById(inputId))return;
        thisNode = document.getElementById(inputId).getElementsByTagName('IMG')[0]; 
      }else {
        thisNode = this;
        if(this.tagName=='A')thisNode = this.parentNode.getElementsByTagName('IMG')[0];  
        
      }
      if(thisNode.style.visibility=='hidden')return;    
      var parentNode = thisNode.parentNode;
      inputId = parentNode.id.replace(/[^0-9]/g,'');
      if(thisNode.src.indexOf(JSTreeObj.plusImage)>=0){
        thisNode.src = thisNode.src.replace(JSTreeObj.plusImage,JSTreeObj.minusImage);
        var ul = parentNode.getElementsByTagName('UL')[0];
        ul.style.display='block';
        if(!initExpandedNodes)initExpandedNodes = ',';
        if(initExpandedNodes.indexOf(',' + inputId + ',')<0) initExpandedNodes = initExpandedNodes + inputId + ',';
      }else{
        thisNode.src = thisNode.src.replace(JSTreeObj.minusImage,JSTreeObj.plusImage);
        parentNode.getElementsByTagName('UL')[0].style.display='none';
        initExpandedNodes = initExpandedNodes.replace(',' + inputId,'');
      }  
      JSTreeObj.Set_Cookie('dhtmlgoodies_expandedNodes',initExpandedNodes,500);      
      return false;            
    }
    ,
    /* Initialize drag */
    initDrag : function(e)
    {
      if(document.all)e = event;  
      if (e.which == null){
          // IE
          button= (e.button < 2) ? "LEFT" :
            ((e.button == 4) ? "MIDDLE" : "RIGHT");
        if(button == "LEFT"){
          var subs = JSTreeObj.floatingContainer.getElementsByTagName('LI');
          if(subs.length>0){
            if(JSTreeObj.dragNode_sourceNextSib){
              JSTreeObj.dragNode_parent.insertBefore(JSTreeObj.dragNode_source,JSTreeObj.dragNode_sourceNextSib);
            }else{
              JSTreeObj.dragNode_parent.appendChild(JSTreeObj.dragNode_source);
            }          
          }
          
          JSTreeObj.dragNode_source = this.parentNode;
          JSTreeObj.dragNode_parent = this.parentNode.parentNode;
          JSTreeObj.dragNode_sourceNextSib = false;
          
          if(JSTreeObj.dragNode_source.nextSibling)JSTreeObj.dragNode_sourceNextSib = JSTreeObj.dragNode_source.nextSibling;
          JSTreeObj.dragNode_destination = false;
          JSTreeObj.dragDropTimer = 0;
          JSTreeObj.timerDrag();
        }else if(button == "RIGHT"){
          window.refToThisContextMenu.__setReference(window.refToThisContextMenu);
        }
      }else{
          // All others
           button= (e.which < 2) ? "LEFT" :
             ((e.which == 2) ? "MIDDLE" : "RIGHT");  
        if(button == "LEFT"){
          var subs = JSTreeObj.floatingContainer.getElementsByTagName('LI');
          if(subs.length>0){
            if(JSTreeObj.dragNode_sourceNextSib){
              JSTreeObj.dragNode_parent.insertBefore(JSTreeObj.dragNode_source,JSTreeObj.dragNode_sourceNextSib);
            }else{
              JSTreeObj.dragNode_parent.appendChild(JSTreeObj.dragNode_source);
            }          
          }
          
          JSTreeObj.dragNode_source = this.parentNode;
          JSTreeObj.dragNode_parent = this.parentNode.parentNode;
          JSTreeObj.dragNode_sourceNextSib = false;
          
          if(JSTreeObj.dragNode_source.nextSibling)JSTreeObj.dragNode_sourceNextSib = JSTreeObj.dragNode_source.nextSibling;
          JSTreeObj.dragNode_destination = false;
          JSTreeObj.dragDropTimer = 0;
          JSTreeObj.timerDrag();
        }else if(button == "RIGHT"){
          window.refToThisContextMenu.__setReference(window.refToThisContextMenu);
        }
      }
      return false;
    }
    ,
    timerDrag : function()
    {  
      if(this.dragDropTimer>=0 && this.dragDropTimer<10){
        this.dragDropTimer = this.dragDropTimer + 1;
        setTimeout('JSTreeObj.timerDrag()',20);
        return;
      }
      if(this.dragDropTimer==10)
      {
        JSTreeObj.floatingContainer.style.display='block';
        JSTreeObj.floatingContainer.appendChild(JSTreeObj.dragNode_source);  
      }
    }
    ,
    moveDragableNodes : function(e)
    {
      if(JSTreeObj.dragDropTimer<10)return;
      if(document.all)e = event;
      dragDrop_x = e.clientX/1 + 5 + document.body.scrollLeft;
      dragDrop_y = e.clientY/1 + 5 + document.documentElement.scrollTop;  
      
      JSTreeObj.floatingContainer.style.left = dragDrop_x + 'px';
      JSTreeObj.floatingContainer.style.top = dragDrop_y + 'px';
      
      var thisObj = this;
      if(thisObj.tagName=='A' || thisObj.tagName=='IMG' || thisObj.tagName=='SPAN')thisObj = thisObj.parentNode;

      JSTreeObj.dragNode_noSiblings = false;
      var tmpVar = thisObj.getAttribute('noSiblings');
      if(!tmpVar)tmpVar = thisObj.noSiblings;
      if(tmpVar=='true')JSTreeObj.dragNode_noSiblings=true;
      if(thisObj && thisObj.id)
      {
        //styling to make the levels move correctly according to where you're dropping
        JSTreeObj.dragNode_destination = thisObj;
        var img = thisObj.getElementsByTagName('IMG')[1];
        var tmpObj= JSTreeObj.dropTargetIndicator;
        tmpObj.style.display='block';
        
        var eventSourceObj = this;
        if(JSTreeObj.dragNode_noSiblings && eventSourceObj.tagName=='IMG')eventSourceObj = eventSourceObj.nextSibling;
        
        var tmpImg = tmpObj.getElementsByTagName('IMG')[0];
        if(this.tagName=='SPAN' || JSTreeObj.dragNode_noSiblings){
          tmpImg.src = tmpImg.src.replace('ind1','ind2');  
          JSTreeObj.insertAsSub = true;
          tmpObj.style.left = (JSTreeObj.getLeftPos(eventSourceObj) + JSTreeObj.indicator_offsetX_sub) + 'px';
        }else{
          tmpImg.src = tmpImg.src.replace('ind2','ind1');
          JSTreeObj.insertAsSub = false;
          tmpObj.style.left = (JSTreeObj.getLeftPos(eventSourceObj) + JSTreeObj.indicator_offsetX) + 'px';
        }

        tmpObj.style.top = (JSTreeObj.getTopPos(thisObj) + JSTreeObj.indicator_offsetY) + 'px';
      }
      
      return false;
    }
    ,
    dropDragableNodes:function()
    {
      var parent = '';
      if(JSTreeObj.dragDropTimer<10){        
        JSTreeObj.dragDropTimer = -1;
        return;
      }
      var showMessage = false;
      if(JSTreeObj.dragNode_destination){  // Check depth
        var countUp = JSTreeObj.dragDropCountLevels(JSTreeObj.dragNode_destination,'up');
        var countDown = JSTreeObj.dragDropCountLevels(JSTreeObj.dragNode_source,'down');
        var countLevels = countUp/1 + countDown/1 + (JSTreeObj.insertAsSub?1:0);    
        if(countLevels>JSTreeObj.maximumDepth){
          JSTreeObj.dragNode_destination = false;
          showMessage = true;   // Used later down in this function
        }
      }    
      if(JSTreeObj.dragNode_destination){
        if(JSTreeObj.insertAsSub){
          var uls = JSTreeObj.dragNode_destination.getElementsByTagName('UL');
          if(uls.length>0){
            ul = uls[0];
            ul.style.display='block';
            
            var lis = ul.getElementsByTagName('LI');

            if(lis.length>0){  // Sub elements exists - drop dragable node before the first one
              ul.insertBefore(JSTreeObj.dragNode_source,lis[0]);  
            }else {  // No sub exists - use the appendChild method - This line should not be executed unless there's something wrong in the HTML, i.e empty <ul>
              ul.appendChild(JSTreeObj.dragNode_source);  
            }
          }else{
            var ul = document.createElement('UL');
            ul.style.display='block';
            JSTreeObj.dragNode_destination.appendChild(ul);
            ul.appendChild(JSTreeObj.dragNode_source);
          }
          var img = JSTreeObj.dragNode_destination.getElementsByTagName('IMG')[0];          
          img.style.visibility='visible';
          img.src = img.src.replace(JSTreeObj.plusImage,JSTreeObj.minusImage);
        }else{
          if(JSTreeObj.dragNode_destination.nextSibling){
            var nextSib = JSTreeObj.dragNode_destination.nextSibling;
            nextSib.parentNode.insertBefore(JSTreeObj.dragNode_source,nextSib);
            
          }else{
            JSTreeObj.dragNode_destination.parentNode.appendChild(JSTreeObj.dragNode_source);
          }
        }  
        /* Clear parent object */
        var tmpObj = JSTreeObj.dragNode_parent;
        var lis = tmpObj.getElementsByTagName('LI');
        if(lis.length==0){
          var img = tmpObj.parentNode.getElementsByTagName('IMG')[0];
          img.style.visibility='hidden';  // Hide [+],[-] icon
          tmpObj.parentNode.removeChild(tmpObj);            
        }
        
      }else{
        // Putting the item back to it's original location
        if(JSTreeObj.dragNode_sourceNextSib){
          JSTreeObj.dragNode_parent.insertBefore(JSTreeObj.dragNode_source,JSTreeObj.dragNode_sourceNextSib);
        }else{
          JSTreeObj.dragNode_parent.appendChild(JSTreeObj.dragNode_source);
        }
      }
      JSTreeObj.dropTargetIndicator.style.display='none';    
      JSTreeObj.dragDropTimer = -1;  
      if(showMessage && JSTreeObj.messageMaximumDepthReached)alert(JSTreeObj.messageMaximumDepthReached);
    //need to change this so that it only updates the weights of all of them AND this node's parent attribute
    update_weights();
    parent = document.getElementById(JSTreeObj.dragNode_source.id).parentNode.parentNode.id.substring(4);
    document.getElementById("tree_container").className="tree_saving";
    //ajax here
    $.ajax({
       type: "POST",
       url: AJAX_URL + "drag_drop_update/" + parent + "/" + JSTreeObj.dragNode_source.id.substring(4),
       success: function(msg){
         document.getElementById("tree_container").className="tree_normal";
         }
    });
    }
    ,
    createDropIndicator : function()
    {
      this.dropTargetIndicator = document.createElement('DIV');
      this.dropTargetIndicator.style.position = 'absolute';
      this.dropTargetIndicator.style.display='none';      
      var img = document.createElement('IMG');
      img.src = this.imageFolder + 'dragDrop_ind1.gif';
      img.id = 'dragDropIndicatorImage';
      this.dropTargetIndicator.appendChild(img);
      document.body.appendChild(this.dropTargetIndicator);
    }
    ,
    dragDropCountLevels : function(obj,direction,stopAtObject){
      var countLevels = 0;
      if(direction=='up'){
        while(obj.parentNode && obj.parentNode!=stopAtObject){
          obj = obj.parentNode;
          if(obj.tagName=='UL')countLevels = countLevels/1 +1;
        }    
        return countLevels;
      }  
      
      if(direction=='down'){ 
        var subObjects = obj.getElementsByTagName('LI');
        for(var no=0;no<subObjects.length;no++){
          countLevels = Math.max(countLevels,JSTreeObj.dragDropCountLevels(subObjects[no],"up",obj));
        }
        return countLevels;
      }  
    }    
    ,
    cancelEvent : function()
    {
      return false;  
    }
    ,
    cancelSelectionEvent : function()
    {
      
      if(JSTreeObj.dragDropTimer<10)return true;
      return false;  
    }
    ,getNodeOrders : function(initObj,saveString)
    {
      
      if(!saveString)var saveString = '';
      if(!initObj){
        initObj = document.getElementById(this.idOfTree);

      }
      var lis = initObj.getElementsByTagName('LI');

      if(lis.length>0){
        var li = lis[0];
        while(li){
          if(li.id){
            if(saveString.length>0)saveString = saveString + ',';
            var numericID = li.id.replace(/[^0-9]/gi,'');
            if(numericID.length==0)numericID='A';
            var numericParentID = li.parentNode.parentNode.id.replace(/[^0-9]/gi,'');
            if(numericID!='0'){
              saveString = saveString + numericID;
              saveString = saveString + '-';
              
              
              if(li.parentNode.id!=this.idOfTree)saveString = saveString + numericParentID; else saveString = saveString + '0';
            }
            var ul = li.getElementsByTagName('UL');
            if(ul.length>0){
              saveString = this.getNodeOrders(ul[0],saveString);  
            }  
          }      
          li = li.nextSibling;
        }
      }

      if(initObj.id == this.idOfTree){
        return saveString;
              
      }
      return saveString;
    }
    ,highlightItem : function(inputObj,e)
    {
      if(JSTreeObj.currentlyActiveItem)JSTreeObj.currentlyActiveItem.className = '';
      this.className = 'highlightedNodeItem';
      JSTreeObj.currentlyActiveItem = this;
    }
    ,
    removeHighlight : function()
    {
      if(JSTreeObj.currentlyActiveItem)JSTreeObj.currentlyActiveItem.className = '';
      JSTreeObj.currentlyActiveItem = false;
    }
    ,
    hasSubNodes : function(obj)
    {
      var subs = obj.getElementsByTagName('LI');
      if(subs.length>0)return true;
      return false;  
    }
    ,
    deleteItem : function(obj1,obj2)
    {
      if(obj2.nodeName == 'SPAN' || obj2.nodeName == 'IMG'){
        obj2 = obj2.parentNode.getElementsByTagName("A")[0];
      }else if(obj2 == false){
        obj1.parentNode.parentNode.style.visibility='hidden';
      }
      
      var message = 'Delete "' + obj2.innerHTML + '" ?';
      if(this.hasSubNodes(obj2.parentNode)) message = message + ' and it\'s sub nodes';
      if(confirm(message)){
        this.__deleteItem_step2(obj2.parentNode);  // Sending <LI> tag to the __deleteItem_step2 method  
      }
      
    }
    ,
    nodeContent : function(obj1,obj2){
      load_node(obj2.parentNode.id);
    }
    ,
    changeItemType: function(obj1,obj2){
      if(obj2.nodeName == 'SPAN' || obj2.nodeName == 'IMG'){
        obj2 = obj2.parentNode.getElementsByTagName("A")[0];
      }else if(obj2 == false){
        obj1.parentNode.parentNode.style.visibility='hidden';
      }
      var nodenum = obj2.id.substring(8);
      var new_type = obj1.getElementsByTagName("A")[0].innerHTML;
      //need to come up with some way of figuring out which new_type they clicked on
      $.ajax({
          type: "POST",
          url: AJAX_URL + "change_type/" + nodenum + "/" + new_type,
          success: function(msg){
            document.getElementById("iconIMGnode" + nodenum).src = DRUPAL_PATH + '/' + msg;
          }
      });
    }
    ,
    duplicateTree : function (obj1,obj2){
      if(obj2.nodeName == 'A' || obj2.nodeName == 'SPAN' || obj2.nodeName == 'IMG'){
        obj2 = obj2.parentNode;
      }
      var root = obj2.id.substring("4");
      if(root != 0 && confirm("Duplicate this entire node structure?")){
        $.ajax({
         type: "POST",
         url: AJAX_URL + "duplicate_nodes/" + root,
         success: function(msg){
             //a new root has been made so we can just load it like any other
          //the return will be the node to load
          load_outline(document.getElementById("selected_outline").value);
        }
        });
      }
    }
    ,
    addItem : function(obj1,obj2)
    {
      var next_id = '';
      var ary = Array();
      if(obj2.nodeName == 'SPAN' || obj2.nodeName == 'IMG'){
        obj2 = obj2.parentNode.getElementsByTagName("A")[0];
      }else if(obj2 == false){
        obj1.parentNode.parentNode.style.visibility='hidden';
      }
      var nodenum = obj2.id.substring(8);
      document.getElementById("tree_container").className="tree_saving";
      var title = prompt("Node Title:");
      if(title == null){
        document.getElementById("tree_container").className="tree_normal";
      }else{  
        $.ajax({
          type: "POST",
          url: AJAX_URL + "add_node/" + nodenum + "/" + title,
          success: function(msg){
            ary = PHP_Unserialize(msg);
            next_id = ary[0];
            nodename = 'node' + next_id;
            var li = document.createElement('LI');
            li.id = nodename;
            var span = document.createElement('SPAN');
            span.id = 'nodeLevel' + next_id;
            span.innerHTML = '&nbsp;&nbsp;';
            var a = document.createElement('A');
            a.href = '#';
            a.innerHTML = title;
            var ul = document.createElement('UL');
            li.appendChild(span);
            li.appendChild(a);
            li.appendChild(ul);
            parentid = 'node' + nodenum;
            //get the UL that is in the parentID that we are looking to insert this new LI into
            //this helps to account for errors caused by JS not changing the name fast enough
            document.getElementById(parentid).getElementsByTagName("UL")[0].appendChild(li);
            if(OUTLINE_POSTS == 1){
              document.getElementById(nodename).setAttribute("noadd","false");
            }else{
              document.getElementById(nodename).setAttribute("noadd","true");
            }
            if(ary[3] == 1){
              document.getElementById(nodename).setAttribute("norename","false");
              document.getElementById(nodename).setAttribute("nodelete","false");
            }else{
              document.getElementById(nodename).setAttribute("norename","true");
              document.getElementById(nodename).setAttribute("nodelete","true");
            }
            if(DRAG_AND_DROP_CONTENT == 0){
              document.getElementById(nodename).setAttribute("noDrag","true");
            }
            
            //set the double click stuff
            document.getElementById(span.id).setAttribute('ondblclick','load_view_node(this.parentNode.id);');
            document.getElementById(li.id).getElementsByTagName("A")[0].setAttribute('ondblclick','load_view_node(this.parentNode.id);');
            
            obj1.parentNode.parentNode.style.visibility = 'hidden';
            //must display the +/- icon and show things below it since we added a child to that level
            var pimg = document.getElementById(parentid).getElementsByTagName("IMG")[0];
            pimg.style.visibility="visible";
            pimg.src = pimg.src.replace(JSTreeObj.plusImage,JSTreeObj.minusImage);
            document.getElementById(parentid).getElementsByTagName("UL")[0].style.display="block";
            treeObj.initTree();
          },
          complete: function(ar1,ar2){
            document.getElementById("iconIMGnode" + next_id).src = DRUPAL_PATH + '/' + ary[2];
            //run the weights update
            update_weights();
          }
        });
      }
    }
    ,
    __refreshDisplay : function(obj)
    {
      if(this.hasSubNodes(obj))return;

      var img = obj.getElementsByTagName('IMG')[0];
      img.style.visibility = 'hidden';
    }
    ,
    __deleteItem_step2 : function(obj)
    {
      var del = Array();
      var answer = true;
      del.push(obj.id.substring(4));
      var lis = obj.getElementsByTagName('LI');
      for(var no=0;no<lis.length;no++){
        del.push(lis[no].id.substring(4));
      }
      //if there are subnodes, doublecheck the delete
      if(del.length > 1){
        answer = confirm("This will Delete all subnodes, are you sure?");
      }
      if(answer){
        document.getElementById("tree_container").className="tree_saving";
        $.ajax({
           type: "POST",
           url: AJAX_URL + "delete/" + serialize(del),
           success: function(msg){
             var parentRef = obj.parentNode.parentNode;
             obj.parentNode.removeChild(obj);
             //JSTreeObj.__refreshDisplay(parentRef);
             document.getElementById("tree_container").className="tree_normal";
             update_weights();
          }
        });
      }
    }
    ,
    __saveTextBoxChanges : function(e,inputObj)
    {
      if(!inputObj && this)inputObj = this;
      if(document.all)e = event;
      if(e.keyCode && e.keyCode==27){
        JSTreeObj.__cancelRename(e,inputObj);
        return;
      }else{
        inputObj.style.display='none';
        inputObj.nextSibling.style.visibility='visible';
        if(inputObj.value.length>0){
          if(inputObj.nextSibling.innerHTML != inputObj.value){
            inputObj.nextSibling.innerHTML = inputObj.value;
            //need an ajax call to just rename this one
            nid = inputObj.parentNode.id.substring(4);
            document.getElementById("tree_container").className="tree_saving";
            $.ajax({
              type: "POST",
              url: AJAX_URL + "rename/" + nid + "/" + inputObj.value,
              success: function(msg){
                if(inputObj.parentNode.parentNode.parentNode.id == "node0"){
                  //try to force switching back to the same option even tho the title changed
                  var options = document.getElementById("selected_outline").options;
                  for(i=0;i<options.length;i++){
                    if(options[i].value == document.getElementById("selected_outline").value){
                      options[i].text = inputObj.value;
                    }
                  }
                }
                document.getElementById("tree_container").className="tree_normal";  
              }
            });
          }
        }
      }
    }
    ,
    __cancelRename : function(e,inputObj)
    {
      if(!inputObj && this)inputObj = this;
      inputObj.value = JSTreeObj.helpObj.innerHTML;
      inputObj.nextSibling.innerHTML = JSTreeObj.helpObj.innerHTML;
      inputObj.style.display = 'none';
      inputObj.nextSibling.style.visibility = 'visible';
    }
    ,
    __renameCheckKeyCode : function(e)
    {
      if(document.all)e = event;
      if(e.keyCode==13){  // Enter pressed
        JSTreeObj.__saveTextBoxChanges(false,this);  
      }  
      if(e.keyCode==27){  // ESC pressed
        JSTreeObj.__cancelRename(false,this);
      }
    }
    ,
    __createTextBox : function(obj)
    {
      var textBox = document.createElement('INPUT');
      textBox.className = 'folderTreeTextBox';
      textBox.value = obj.innerHTML;
      obj.parentNode.insertBefore(textBox,obj);  
      textBox.id = 'textBox' + obj.parentNode.id.replace(/[^0-9]/gi,'');
      textBox.onblur = this.__saveTextBoxChanges;  
      textBox.onkeydown = this.__renameCheckKeyCode;
      this.__renameEnableTextBox(obj);
    }
    ,
    __renameEnableTextBox : function(obj)
    {
      obj.style.visibility = 'hidden';
      obj.previousSibling.value = obj.innerHTML;
      obj.previousSibling.style.display = 'inline';  
      obj.previousSibling.select();
    }
    ,
    renameItem : function(obj1,obj2)
    {
      if(obj2.nodeName == 'SPAN' || obj2.nodeName == 'IMG'){
        obj2 = obj2.parentNode.getElementsByTagName("A")[0];
      }else if(obj2 == false){
        obj1.parentNode.parentNode.style.visibility='hidden';
      }
      currentItemToEdit = obj2.parentNode;  // Reference to the <li> tag.
      if(!obj2.previousSibling || obj2.previousSibling.tagName.toLowerCase()!='input'){
        this.__createTextBox(obj2);
      }else{
        this.__renameEnableTextBox(obj2);
      }
      this.helpObj.innerHTML = obj2.innerHTML;
    }
    ,
    initTree : function()
    {
      JSTreeObj = this;
      JSTreeObj.createDropIndicator();
      document.documentElement.onselectstart = JSTreeObj.cancelSelectionEvent;
      document.documentElement.ondragstart = JSTreeObj.cancelEvent;
      //document.documentElement.onmousedown = JSTreeObj.removeHighlight;
      
      /* Creating help object for storage of values */
      this.helpObj = document.createElement("DIV");
      this.helpObj.style.display = "none";
      document.body.appendChild(this.helpObj);
      /* Create context menu */
      if(this.iconsAllowed || this.addAllowed || this.deleteAllowed || this.renameAllowed){
        try{
          /* Creating menu model for the context menu, i.e. the datasource */
          var menuModel = new DHTMLGoodies_menuModel();
          
          if(this.addAllowed)menuModel.addItem(1,"Add Child",DRUPAL_OD_PATH + "/images/add.png","",false,"JSTreeObj.addItem");
          menuModel.addItem(2,"Edit",DRUPAL_OD_PATH + "/images/edit.png","",false,"JSTreeObj.nodeContent");
          if(this.renameAllowed)menuModel.addItem(3,"Rename",DRUPAL_OD_PATH + "/images/rename.png","",false,"JSTreeObj.renameItem");          
          if(ALLOW_DUPLICATE == 1){
            menuModel.addItem(4,"Duplicate",DRUPAL_OD_PATH + "/images/duplicate.png","",false,"JSTreeObj.duplicateTree");
          }
          if(this.deleteAllowed)menuModel.addItem(5,"Delete",DRUPAL_OD_PATH + "/images/delete.png","",false,"JSTreeObj.deleteItem");
          menuModel.init();
          var menuModelNotAddOnly = new DHTMLGoodies_menuModel();
          menuModelNotAddOnly.addItem(6,"Edit",DRUPAL_OD_PATH + "/images/edit.png","",false,"JSTreeObj.nodeContent");
          if(this.deleteAllowed)menuModelNotAddOnly.addItem(7,"Delete",DRUPAL_OD_PATH + "/images/delete.png","",false,"JSTreeObj.deleteItem");
          if(this.renameAllowed)menuModelNotAddOnly.addItem(8,"Rename",DRUPAL_OD_PATH + "/images/rename.png","",false,"JSTreeObj.renameItem");
          menuModelNotAddOnly.init();
          
          var menuModelRenameOnly = new DHTMLGoodies_menuModel();
          if(this.renameAllowed)menuModelRenameOnly.addItem(9,"Rename",DRUPAL_OD_PATH + "/images/rename.png","",false,"JSTreeObj.renameItem");
          menuModelRenameOnly.init();  
          
          var menuModelDeleteOnly = new DHTMLGoodies_menuModel();
          if(this.deleteAllowed)menuModelDeleteOnly.addItem(10,"Delete",DRUPAL_OD_PATH + "/images/delete.png","",false,"JSTreeObj.deleteItem");
          menuModelDeleteOnly.init();
          
          var menuModelAddOnly = new DHTMLGoodies_menuModel();
          if(this.addAllowed)menuModelAddOnly.addItem(11,"Add Child",DRUPAL_OD_PATH + "/images/add.png","",false,"JSTreeObj.addItem");
          if(ALLOW_DUPLICATE == 1){
            menuModelAddOnly.addItem(4,"Duplicate",DRUPAL_OD_PATH + "/images/duplicate.png","",false,"JSTreeObj.duplicateTree");
          }
          menuModelAddOnly.init();
          
          var menuModelRoot = new DHTMLGoodies_menuModel();
          if(this.addAllowed)menuModelRoot.addItem(12,"Add Child",DRUPAL_OD_PATH + "/images/add.png","",false,"JSTreeObj.addItem");
          if(this.renameAllowed)menuModelRoot.addItem(13,"Rename",DRUPAL_OD_PATH + "/images/rename.png","",false,"JSTreeObj.renameItem");          
          menuModelRoot.init();
          
          var menuModelIcons = new DHTMLGoodies_menuModel();
          $.ajax({
            type: "POST",
            url: AJAX_URL + "get_icons",
            success: function(msg){
              var ary = Array();
              if(msg != ''){
                ary = PHP_Unserialize(msg);
                for(var i=0; i<ary.length; i++){
                  menuModelIcons.addItem(14+i,ary[i][0],DRUPAL_PATH + '/' + ary[i][1],"",false,"JSTreeObj.changeItemType");
                }
                menuModelIcons.init();
              }
            }
          });
          
          window.refToDragDropTree = this;
          
          this.contextMenu = new DHTMLGoodies_contextMenu();
          this.contextMenu.setWidth(140);
          referenceToDHTMLSuiteContextMenu = this.contextMenu;
        }catch(e){
        }
      }
      var dhtmlgoodies_tree = document.getElementById("node0");
      var menuItems = dhtmlgoodies_tree.getElementsByTagName("LI");  // Get an array of all menu items
      for(var no=0;no<menuItems.length;no++){
        // No children var set ?
        var noChildren = false;
        var tmpVar = menuItems[no].getAttribute("noChildren");
        if(!tmpVar)tmpVar = menuItems[no].noChildren;
        if(tmpVar=="true")noChildren=true;
        // No drag var set ?
        var noDrag = false;
        var tmpVar = menuItems[no].getAttribute("noDrag");
        if(!tmpVar)tmpVar = menuItems[no].noDrag;
        if(tmpVar=="true")noDrag=true;

        var subItems = menuItems[no].getElementsByTagName("UL");
        var img = document.createElement("IMG");
        img.src = this.imageFolder + this.plusImage;
        img.onclick = JSTreeObj.showHideNode;
        //var LIs = subItems.getElementsByTagName("LI");
        if(subItems.length==0)img.style.visibility="hidden";else{
          subItems[0].id = 'tree_ul_' + menuItems[no].id.substring(4);
        }
        var aTag = menuItems[no].getElementsByTagName('A')[0];
        var tagA = aTag.id;
        aTag.id = 'nodeATag' + menuItems[no].id.substring(4);
        if(!noDrag)aTag.onmousedown = JSTreeObj.initDrag;
        //if(!noChildren)aTag.onmousemove = JSTreeObj.moveDragableNodes;
        var spanTag = menuItems[no].getElementsByTagName('SPAN')[0];
        if(tagA == ''){
          menuItems[no].insertBefore(img,spanTag);
          if(!noDrag)spanTag.onmousedown = JSTreeObj.initDrag;
          if(!noChildren)spanTag.onmousemove = JSTreeObj.moveDragableNodes;
          spanTag.onmouseover = function(){
            this.style.cursor="pointer";
          };
        }
        var iconIMG = document.createElement('IMG');
        if(!noDrag)iconIMG.onmousedown = JSTreeObj.initDrag;
        iconIMG.onmousemove = JSTreeObj.moveDragableNodes;
        //this is where the img gets set based on class being used or not (do it regaurdless)
        if(iconIMG.src == ''){
          //ajax call to get blank folders from the db since they are probably new
          if(menuItems[no].className){
            iconIMG.src = this.imageFolder + menuItems[no].className;
          }else{
            iconIMG.src = this.imageFolder + this.folderImage;
          }
        }
        iconIMG.id = 'iconIMG' + menuItems[no].id;
        
        if(tagA == ''){
          menuItems[no].insertBefore(iconIMG,spanTag);
          document.getElementById(iconIMG.id).setAttribute('ondblclick','load_view_node(this.parentNode.id)'); //trying to set the doubleclick correctly
        }
        if(this.contextMenu){
          var noDelete = menuItems[no].getAttribute('noDelete');
          if(!noDelete)noDelete = menuItems[no].noDelete;
          
          var noRename = menuItems[no].getAttribute('noRename');
          if(!noRename)noRename = menuItems[no].noRename;
          var noAdd = menuItems[no].getAttribute('noAdd');
          if(!noAdd)noAdd = menuItems[no].noAdd;
          
          if(noRename=='true' && noDelete=='true' && noAdd=='true'){}else{
            if(noDelete == 'false' && noRename=='false' && noAdd=='true'){
              this.contextMenu.attachToElement(aTag,false,menuModelNotAddOnly);
              this.contextMenu.attachToElement(spanTag,false,menuModelNotAddOnly);
              //this.contextMenu.attachToElement(iconIMG,false,menuModelNotAddOnly);
            }else if(noRename == 'false' && noAdd=='false' && noDelete == 'true'){
              this.contextMenu.attachToElement(aTag,false,menuModelRoot);
              this.contextMenu.attachToElement(spanTag,false,menuModelRoot);
            }else if(noDelete == 'true' && noAdd=='true'){
              this.contextMenu.attachToElement(aTag,false,menuModelRenameOnly);
              this.contextMenu.attachToElement(spanTag,false,menuModelRenameOnly);
              //this.contextMenu.attachToElement(iconIMG,false,menuModelRenameOnly);
            }else if(noRename == 'true' && noAdd=='true'){
              this.contextMenu.attachToElement(aTag,false,menuModelDeleteOnly);
              this.contextMenu.attachToElement(spanTag,false,menuModelDeleteOnly);
              //this.contextMenu.attachToElement(iconIMG,false,menuModelDeleteOnly);
            }else if(noRename == 'true' && noDelete=='true'){
              this.contextMenu.attachToElement(aTag,false,menuModelAddOnly);
              this.contextMenu.attachToElement(spanTag,false,menuModelAddOnly);
              //this.contextMenu.attachToElement(iconIMG,false,menuModelAddOnly);
            }else{ 
              this.contextMenu.attachToElement(aTag,false,menuModel);
              this.contextMenu.attachToElement(spanTag,false,menuModel);
              //this.contextMenu.attachToElement(iconIMG,false,menuModelAddOnly);
            }
          }
          //add the icon menu to all nodes
          this.contextMenu.attachToElement(iconIMG,false,menuModelIcons);
          this.addEvent(aTag,'contextmenu',this.highlightItem);
          this.addEvent(spanTag,'contextmenu',this.highlightItem);
          this.addEvent(iconIMG,'contextmenu',this.highlightItem);
        }
        if(document.getElementById(menuItems[no].id).getElementsByTagName("LI").length==0){
          document.getElementById(menuItems[no].id).getElementsByTagName("IMG")[0].style.visibility="hidden";
        }
      }
      initExpandedNodes = this.Get_Cookie('dhtmlgoodies_expandedNodes');
      if(initExpandedNodes){
        var nodes = initExpandedNodes.split(',');
        for(var no=0;no<nodes.length;no++){
          if(nodes[no])this.showHideNode(false,nodes[no]);  
        }      
      }
      document.documentElement.onmousemove = JSTreeObj.moveDragableNodes;  
      document.documentElement.onmouseup = JSTreeObj.dropDragableNodes;
    }    
  }
//helper function to try and glue code together the drag and drop and context menu functionality because of right and left click registering as the same onmousedown event
/*function(){
  //if(document.all)e = event;
  JSTreeObj.initDrag;
  if (e.which == null){
     // IE
     button= (e.button < 2) ? "LEFT" :
           ((e.button == 4) ? "MIDDLE" : "RIGHT");
    if(button == "LEFT"){
      JSTreeObj.initDrag;
    }else if(button == "RIGHT"){
      window.refToThisContextMenu.__setReference(window.refToThisContextMenu);
    }
  }else{
     // All others
     button= (e.which < 2) ? "LEFT" :
         ((e.which == 2) ? "MIDDLE" : "RIGHT");  
    if(button == "LEFT"){
      JSTreeObj.initDrag;
    }else if(button == "RIGHT"){
      window.refToThisContextMenu.__setReference(window.refToThisContextMenu);
    }
  }
}*/