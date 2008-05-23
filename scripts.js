DHTMLGoodies_menuModel = function()
{ var menuItems; this.menuItems = new Array();}
DHTMLGoodies_menuModel.prototype = { addItem : function(id,itemText,itemIcon,url,parentId,jsFunction)
{ this.menuItems[id] = new Array(); this.menuItems[id]['id'] = id; this.menuItems[id]['itemText'] = itemText; this.menuItems[id]['itemIcon'] = itemIcon; this.menuItems[id]['url'] = url; this.menuItems[id]['parentId'] = parentId; this.menuItems[id]['separator'] = false; this.menuItems[id]['jsFunction'] = jsFunction;}
, addSeparator : function(id,parentId)
{ this.menuItems[id] = new Array(); this.menuItems[id]['parentId'] = parentId; this.menuItems[id]['separator'] = true;}
, init : function()
{ this.__getDepths();}
, getItems : function()
{ return this.menuItems;}
, __getDepths : function()
{ for(var no in this.menuItems){ this.menuItems[no]['depth'] = 1; if(this.menuItems[no]['parentId']){ this.menuItems[no]['depth'] = this.menuItems[this.menuItems[no]['parentId']]['depth']+1;}
}
}
, __hasSubs : function(id)
{ for(var no in this.menuItems){ if(this.menuItems[no]['parentId']==id)return true;}
return false;}
}
var referenceToDHTMLSuiteContextMenu; DHTMLGoodies_contextMenu = function()
{ var menuModels; var menuItems; var menuObject; var layoutCSS; var menuUls; var width; var srcElement; var indexCurrentlyDisplayedMenuModel; var imagePath; this.menuModels = new Array(); this.menuObject = false; this.menuUls = new Array(); this.width = 100; this.srcElement = false; this.indexCurrentlyDisplayedMenuModel = false; this.imagePath = DRUPAL_OD_PATH + '/images/';}
DHTMLGoodies_contextMenu.prototype = { setWidth : function(newWidth)
{ this.width = newWidth;}
, setLayoutCss : function(cssFileName)
{ this.layoutCSS = cssFileName;}
, attachToElement : function(element,elementId,menuModel)
{ window.refToThisContextMenu = this; if(!element && elementId)element = document.getElementById(elementId); if(!element.id){ element.id = 'context_menu' + Math.random(); element.id = element.id.replace('.','');}
this.menuModels[element.id] = menuModel; element.oncontextmenu = this.__displayContextMenu; document.documentElement.onclick = this.__hideContextMenu;}
, __setReference : function(obj)
{ referenceToDHTMLSuiteContextMenu = obj;}
, __displayContextMenu : function(e)
{ if(document.all)e = event; var ref = referenceToDHTMLSuiteContextMenu; ref.srcElement = ref.getSrcElement(e); if(!ref.indexCurrentlyDisplayedMenuModel || ref.indexCurrentlyDisplayedMenuModel!=this.id){ if(ref.indexCurrentlyDisplayedMenuModel){ ref.menuObject.innerHTML = '';}else{ ref.__createDivs();}
ref.menuItems = ref.menuModels[this.id].getItems(); ref.__createMenuItems();}
ref.indexCurrentlyDisplayedMenuModel=this.id; ref.menuObject.style.left = (e.clientX + Math.max(document.body.scrollLeft,document.documentElement.scrollLeft)) + 'px'; ref.menuObject.style.top = (e.clientY + Math.max(document.body.scrollTop,document.documentElement.scrollTop)) + 'px'; ref.menuObject.style.display='block'; return false;}
, __hideContextMenu : function()
{ var ref = referenceToDHTMLSuiteContextMenu; if(ref.menuObject)ref.menuObject.style.display = 'none';}
, __createDivs : function()
{ this.menuObject = document.createElement('DIV'); this.menuObject.className = 'DHTMLSuite_contextMenu'; this.menuObject.style.backgroundImage = 'url(\'' + this.imagePath + 'context-menu-gradient.gif' + '\')'; this.menuObject.style.backgroundRepeat = 'repeat-y'; if(this.width)this.menuObject.style.width = this.width + 'px'; document.body.appendChild(this.menuObject);}
, __mouseOver : function()
{ this.className = 'DHTMLSuite_item_mouseover'; if(!document.all){ this.style.backgroundPosition = 'left center';}
}
, __mouseOut : function()
{ this.className = ''; if(!document.all){ this.style.backgroundPosition = '1px center';}
}
, __evalUrl : function()
{ var js = this.getAttribute('jsFunction'); if(!js)js = this.jsFunction; if(js)eval(js);}
, __createMenuItems : function()
{ window.refToContextMenu = this; this.menuUls = new Array(); for(var no in this.menuItems){ if(!this.menuUls[0]){ this.menuUls[0] = document.createElement('UL'); this.menuObject.appendChild(this.menuUls[0]);}
if(this.menuItems[no]['depth']==1){ if(this.menuItems[no]['separator']){ var li = document.createElement('DIV'); li.className = 'DHTMLSuite_contextMenu_separator';}else{ var li = document.createElement('LI'); if(this.menuItems[no]['jsFunction']){ this.menuItems[no]['url'] = this.menuItems[no]['jsFunction'] + '(this,referenceToDHTMLSuiteContextMenu.srcElement)';}
if(this.menuItems[no]['itemIcon']){ li.style.backgroundImage = 'url(\'' + this.menuItems[no]['itemIcon'] + '\')'; if(!document.all)li.style.backgroundPosition = '1px center';}
if(this.menuItems[no]['url']){ var url = this.menuItems[no]['url'] + ''; var tmpUrl = url + ''; li.setAttribute('jsFunction',url); li.jsFunction = url; li.onclick = this.__evalUrl;}
li.style.margin = '0px'; li.innerHTML = '<a href="#" onclick="return false">' + this.menuItems[no]['itemText'] + '</a>'; li.onmouseover = this.__mouseOver; li.onmouseout = this.__mouseOut;}
this.menuUls[0].appendChild(li);}
}
}
, getSrcElement : function(e)
{ var el; if (e.target) el = e.target; else if (e.srcElement) el = e.srcElement; if (el.nodeType == 3)
el = el.parentNode; return el;}
}
var JSTreeObj; function JSDragDropTree()
{ var idOfTree; var imageFolder; var folderImage; var plusImage; var minusImage; var maximumDepth; var dragNode_source; var dragNode_parent; var dragNode_sourceNextSib; var dragNode_noSiblings; var dragNode_destination; var floatingContainer; var dragDropTimer; var dropTargetIndicator; var insertAsSub; var indicator_offsetX; var indicator_offsetX_sub; var indicator_offsetY; this.imageFolder = DRUPAL_OD_PATH + '/images/'; this.folderImage = 'node.png'; this.plusImage = 'plus.gif'; this.minusImage = 'minus.gif'; this.maximumDepth = 100; var messageMaximumDepthReached; var renameAllowed; var deleteAllowed; var addAllowed; var iconsAllowed; var currentlyActiveItem; var contextMenu; var currentItemToEdit; var helpObj; this.contextMenu = false; this.floatingContainer = document.createElement('UL'); this.floatingContainer.style.position = 'absolute'; this.floatingContainer.style.display='none'; this.floatingContainer.id = 'floatingContainer'; this.insertAsSub = false; document.body.appendChild(this.floatingContainer); this.dragDropTimer = -1; this.dragNode_noSiblings = false; this.currentItemToEdit = false; this.indicator_offsetX = 0; this.indicator_offsetX_sub = 0; this.indicator_offsetY = 0; this.messageMaximumDepthReached = ''; this.renameAllowed = true; this.deleteAllowed = true; this.addAllowed = true; this.iconsAllowed = true; this.currentlyActiveItem = false; this.helpObj = false;}
JSDragDropTree.prototype = { addEvent : function(whichObject,eventType,functionName)
{ if(whichObject.attachEvent){ whichObject['e'+eventType+functionName] = functionName; whichObject[eventType+functionName] = function(){whichObject['e'+eventType+functionName]( window.event );}
whichObject.attachEvent( 'on'+eventType, whichObject[eventType+functionName] );} else
whichObject.addEventListener(eventType,functionName,false);}
, removeEvent : function(whichObject,eventType,functionName)
{ if(whichObject.detachEvent){ whichObject.detachEvent('on'+eventType, whichObject[eventType+functionName]); whichObject[eventType+functionName] = null;} else
whichObject.removeEventListener(eventType,functionName,false);}
, Get_Cookie : function(name) { var start = document.cookie.indexOf(name+"="); var len = start+name.length+1; if ((!start) && (name != document.cookie.substring(0,name.length))) return null; if (start == -1) return null; var end = document.cookie.indexOf(";",len); if (end == -1) end = document.cookie.length; return unescape(document.cookie.substring(len,end));}
, Set_Cookie : function(name,value,expires,path,domain,secure) { expires = expires * 60*60*24*1000; var today = new Date(); var expires_date = new Date( today.getTime() + (expires) ); var cookieString = name + "=" +escape(value) + ( (expires) ? ";expires=" + expires_date.toGMTString() : "") + ( (path) ? ";path=" + path : "") + ( (domain) ? ";domain=" + domain : "") + ( (secure) ? ";secure" : ""); document.cookie = cookieString;}
, setRenameAllowed : function(renameAllowed)
{ this.renameAllowed = renameAllowed;}
, setDeleteAllowed : function(deleteAllowed)
{ this.deleteAllowed = deleteAllowed;} ,setAddAllowed : function(addAllowed)
{ this.addAllowed = addAllowed;} ,setIconsAllowed : function(iconsAllowed)
{ this.iconsAllowed = iconsAllowed;} ,setMaximumDepth : function(maxDepth)
{ this.maximumDepth = maxDepth;} ,setMessageMaximumDepthReached : function(newMessage)
{ this.messageMaximumDepthReached = newMessage;}
, setImageFolder : function(path)
{ this.imageFolder = path;}
, setFolderImage : function(imagePath)
{ this.folderImage = imagePath;}
, setPlusImage : function(imagePath)
{ this.plusImage = imagePath;}
, setMinusImage : function(imagePath)
{ this.minusImage = imagePath;}
, setTreeId : function(idOfTree)
{ this.idOfTree = idOfTree;}
, expandAll : function()
{ var menuItems = document.getElementById(this.idOfTree).getElementsByTagName('LI'); for(var no=0;no<menuItems.length;no++){ var subItems = menuItems[no].getElementsByTagName('UL'); if(subItems.length>0 && subItems[0].style.display!='block'){ JSTreeObj.showHideNode(false,menuItems[no].id);}
}
}
, collapseAll : function()
{ var menuItems = document.getElementById(this.idOfTree).getElementsByTagName('LI'); for(var no=0;no<menuItems.length;no++){ var subItems = menuItems[no].getElementsByTagName('UL'); if(subItems.length>0 && subItems[0].style.display=='block'){ JSTreeObj.showHideNode(false,menuItems[no].id);}
}
}
, getTopPos : function(obj){ var top = obj.offsetTop/1; while((obj = obj.offsetParent) != null){ if(obj.tagName!='HTML')top += obj.offsetTop;}
if(document.all)top = top/1 + 13; else top = top/1 + 4; return top;}
, getLeftPos : function(obj){ var left = obj.offsetLeft/1 + 1; while((obj = obj.offsetParent) != null){ if(obj.tagName!='HTML')left += obj.offsetLeft;}
if(document.all)left = left/1 - 2; return left;}
, showHideNode : function(e,inputId)
{ if(inputId){ if(!document.getElementById(inputId))return; thisNode = document.getElementById(inputId).getElementsByTagName('IMG')[0];}else { thisNode = this; if(this.tagName=='A')thisNode = this.parentNode.getElementsByTagName('IMG')[0];}
if(thisNode.style.visibility=='hidden')return; var parentNode = thisNode.parentNode; inputId = parentNode.id.replace(/[^0-9]/g,''); if(thisNode.src.indexOf(JSTreeObj.plusImage)>=0){ thisNode.src = thisNode.src.replace(JSTreeObj.plusImage,JSTreeObj.minusImage); var ul = parentNode.getElementsByTagName('UL')[0]; ul.style.display='block'; if(!initExpandedNodes)initExpandedNodes = ','; if(initExpandedNodes.indexOf(',' + inputId + ',')<0) initExpandedNodes = initExpandedNodes + inputId + ',';}else{ thisNode.src = thisNode.src.replace(JSTreeObj.minusImage,JSTreeObj.plusImage); parentNode.getElementsByTagName('UL')[0].style.display='none'; initExpandedNodes = initExpandedNodes.replace(',' + inputId,'');}
JSTreeObj.Set_Cookie('dhtmlgoodies_expandedNodes',initExpandedNodes,500); return false;}
, initDrag : function(e)
{ if(document.all)e = event; if (e.which == null){ button= (e.button < 2) ? "LEFT" :
((e.button == 4) ? "MIDDLE" : "RIGHT"); if(button == "LEFT"){ var subs = JSTreeObj.floatingContainer.getElementsByTagName('LI'); if(subs.length>0){ if(JSTreeObj.dragNode_sourceNextSib){ JSTreeObj.dragNode_parent.insertBefore(JSTreeObj.dragNode_source,JSTreeObj.dragNode_sourceNextSib);}else{ JSTreeObj.dragNode_parent.appendChild(JSTreeObj.dragNode_source);}
}
JSTreeObj.dragNode_source = this.parentNode; JSTreeObj.dragNode_parent = this.parentNode.parentNode; JSTreeObj.dragNode_sourceNextSib = false; if(JSTreeObj.dragNode_source.nextSibling)JSTreeObj.dragNode_sourceNextSib = JSTreeObj.dragNode_source.nextSibling; JSTreeObj.dragNode_destination = false; JSTreeObj.dragDropTimer = 0; JSTreeObj.timerDrag();}else if(button == "RIGHT"){ window.refToThisContextMenu.__setReference(window.refToThisContextMenu);}
}else{ button= (e.which < 2) ? "LEFT" :
((e.which == 2) ? "MIDDLE" : "RIGHT"); if(button == "LEFT"){ var subs = JSTreeObj.floatingContainer.getElementsByTagName('LI'); if(subs.length>0){ if(JSTreeObj.dragNode_sourceNextSib){ JSTreeObj.dragNode_parent.insertBefore(JSTreeObj.dragNode_source,JSTreeObj.dragNode_sourceNextSib);}else{ JSTreeObj.dragNode_parent.appendChild(JSTreeObj.dragNode_source);}
}
JSTreeObj.dragNode_source = this.parentNode; JSTreeObj.dragNode_parent = this.parentNode.parentNode; JSTreeObj.dragNode_sourceNextSib = false; if(JSTreeObj.dragNode_source.nextSibling)JSTreeObj.dragNode_sourceNextSib = JSTreeObj.dragNode_source.nextSibling; JSTreeObj.dragNode_destination = false; JSTreeObj.dragDropTimer = 0; JSTreeObj.timerDrag();}else if(button == "RIGHT"){ window.refToThisContextMenu.__setReference(window.refToThisContextMenu);}
}
return false;}
, timerDrag : function()
{ if(this.dragDropTimer>=0 && this.dragDropTimer<10){ this.dragDropTimer = this.dragDropTimer + 1; setTimeout('JSTreeObj.timerDrag()',20); return;}
if(this.dragDropTimer==10)
{ JSTreeObj.floatingContainer.style.display='block'; JSTreeObj.floatingContainer.appendChild(JSTreeObj.dragNode_source);}
}
, moveDragableNodes : function(e)
{ if(JSTreeObj.dragDropTimer<10)return; if(document.all)e = event; dragDrop_x = e.clientX/1 + 5 + document.body.scrollLeft; dragDrop_y = e.clientY/1 + 5 + document.documentElement.scrollTop; JSTreeObj.floatingContainer.style.left = dragDrop_x + 'px'; JSTreeObj.floatingContainer.style.top = dragDrop_y + 'px'; var thisObj = this; if(thisObj.tagName=='A' || thisObj.tagName=='IMG' || thisObj.tagName=='SPAN')thisObj = thisObj.parentNode; JSTreeObj.dragNode_noSiblings = false; var tmpVar = thisObj.getAttribute('noSiblings'); if(!tmpVar)tmpVar = thisObj.noSiblings; if(tmpVar=='true')JSTreeObj.dragNode_noSiblings=true; if(thisObj && thisObj.id)
{ JSTreeObj.dragNode_destination = thisObj; var img = thisObj.getElementsByTagName('IMG')[1]; var tmpObj= JSTreeObj.dropTargetIndicator; tmpObj.style.display='block'; var eventSourceObj = this; if(JSTreeObj.dragNode_noSiblings && eventSourceObj.tagName=='IMG')eventSourceObj = eventSourceObj.nextSibling; var tmpImg = tmpObj.getElementsByTagName('IMG')[0]; if(this.tagName=='SPAN' || JSTreeObj.dragNode_noSiblings){ tmpImg.src = tmpImg.src.replace('ind1','ind2'); JSTreeObj.insertAsSub = true; tmpObj.style.left = (JSTreeObj.getLeftPos(eventSourceObj) + JSTreeObj.indicator_offsetX_sub) + 'px';}else{ tmpImg.src = tmpImg.src.replace('ind2','ind1'); JSTreeObj.insertAsSub = false; tmpObj.style.left = (JSTreeObj.getLeftPos(eventSourceObj) + JSTreeObj.indicator_offsetX) + 'px';}
tmpObj.style.top = (JSTreeObj.getTopPos(thisObj) + JSTreeObj.indicator_offsetY) + 'px';}
return false;}
, dropDragableNodes:function()
{ var parent = ''; if(JSTreeObj.dragDropTimer<10){ JSTreeObj.dragDropTimer = -1; return;}
var showMessage = false; if(JSTreeObj.dragNode_destination){ var countUp = JSTreeObj.dragDropCountLevels(JSTreeObj.dragNode_destination,'up'); var countDown = JSTreeObj.dragDropCountLevels(JSTreeObj.dragNode_source,'down'); var countLevels = countUp/1 + countDown/1 + (JSTreeObj.insertAsSub?1:0); if(countLevels>JSTreeObj.maximumDepth){ JSTreeObj.dragNode_destination = false; showMessage = true;}
}
if(JSTreeObj.dragNode_destination){ if(JSTreeObj.insertAsSub){ var uls = JSTreeObj.dragNode_destination.getElementsByTagName('UL'); if(uls.length>0){ ul = uls[0]; ul.style.display='block'; var lis = ul.getElementsByTagName('LI'); if(lis.length>0){ ul.insertBefore(JSTreeObj.dragNode_source,lis[0]);}else { ul.appendChild(JSTreeObj.dragNode_source);}
}else{ var ul = document.createElement('UL'); ul.style.display='block'; JSTreeObj.dragNode_destination.appendChild(ul); ul.appendChild(JSTreeObj.dragNode_source);}
var img = JSTreeObj.dragNode_destination.getElementsByTagName('IMG')[0]; img.style.visibility='visible'; img.src = img.src.replace(JSTreeObj.plusImage,JSTreeObj.minusImage);}else{ if(JSTreeObj.dragNode_destination.nextSibling){ var nextSib = JSTreeObj.dragNode_destination.nextSibling; nextSib.parentNode.insertBefore(JSTreeObj.dragNode_source,nextSib);}else{ JSTreeObj.dragNode_destination.parentNode.appendChild(JSTreeObj.dragNode_source);}
}
var tmpObj = JSTreeObj.dragNode_parent; var lis = tmpObj.getElementsByTagName('LI'); if(lis.length==0){ var img = tmpObj.parentNode.getElementsByTagName('IMG')[0]; img.style.visibility='hidden'; tmpObj.parentNode.removeChild(tmpObj);}
}else{ if(JSTreeObj.dragNode_sourceNextSib){ JSTreeObj.dragNode_parent.insertBefore(JSTreeObj.dragNode_source,JSTreeObj.dragNode_sourceNextSib);}else{ JSTreeObj.dragNode_parent.appendChild(JSTreeObj.dragNode_source);}
}
JSTreeObj.dropTargetIndicator.style.display='none'; JSTreeObj.dragDropTimer = -1; if(showMessage && JSTreeObj.messageMaximumDepthReached)alert(JSTreeObj.messageMaximumDepthReached); update_weights(); parent = document.getElementById(JSTreeObj.dragNode_source.id).parentNode.parentNode.id.substring(4); document.getElementById("tree_container").className="tree_saving"; $.ajax({ type: "POST", url: AJAX_URL + "drag_drop_update/" + parent + "/" + JSTreeObj.dragNode_source.id.substring(4), success: function(msg){ document.getElementById("tree_container").className="tree_normal";}
});}
, createDropIndicator : function()
{ this.dropTargetIndicator = document.createElement('DIV'); this.dropTargetIndicator.style.position = 'absolute'; this.dropTargetIndicator.style.display='none'; var img = document.createElement('IMG'); img.src = this.imageFolder + 'dragDrop_ind1.gif'; img.id = 'dragDropIndicatorImage'; this.dropTargetIndicator.appendChild(img); document.body.appendChild(this.dropTargetIndicator);}
, dragDropCountLevels : function(obj,direction,stopAtObject){ var countLevels = 0; if(direction=='up'){ while(obj.parentNode && obj.parentNode!=stopAtObject){ obj = obj.parentNode; if(obj.tagName=='UL')countLevels = countLevels/1 +1;}
return countLevels;}
if(direction=='down'){ var subObjects = obj.getElementsByTagName('LI'); for(var no=0;no<subObjects.length;no++){ countLevels = Math.max(countLevels,JSTreeObj.dragDropCountLevels(subObjects[no],"up",obj));}
return countLevels;}
}
, cancelEvent : function()
{ return false;}
, cancelSelectionEvent : function()
{ if(JSTreeObj.dragDropTimer<10)return true; return false;} ,getNodeOrders : function(initObj,saveString)
{ if(!saveString)var saveString = ''; if(!initObj){ initObj = document.getElementById(this.idOfTree);}
var lis = initObj.getElementsByTagName('LI'); if(lis.length>0){ var li = lis[0]; while(li){ if(li.id){ if(saveString.length>0)saveString = saveString + ','; var numericID = li.id.replace(/[^0-9]/gi,''); if(numericID.length==0)numericID='A'; var numericParentID = li.parentNode.parentNode.id.replace(/[^0-9]/gi,''); if(numericID!='0'){ saveString = saveString + numericID; saveString = saveString + '-'; if(li.parentNode.id!=this.idOfTree)saveString = saveString + numericParentID; else saveString = saveString + '0';}
var ul = li.getElementsByTagName('UL'); if(ul.length>0){ saveString = this.getNodeOrders(ul[0],saveString);}
}
li = li.nextSibling;}
}
if(initObj.id == this.idOfTree){ return saveString;}
return saveString;} ,highlightItem : function(inputObj,e)
{ if(JSTreeObj.currentlyActiveItem)JSTreeObj.currentlyActiveItem.className = ''; this.className = 'highlightedNodeItem'; JSTreeObj.currentlyActiveItem = this;}
, removeHighlight : function()
{ if(JSTreeObj.currentlyActiveItem)JSTreeObj.currentlyActiveItem.className = ''; JSTreeObj.currentlyActiveItem = false;}
, hasSubNodes : function(obj)
{ var subs = obj.getElementsByTagName('LI'); if(subs.length>0)return true; return false;}
, deleteItem : function(obj1,obj2)
{ if(obj2.nodeName == 'SPAN' || obj2.nodeName == 'IMG'){ obj2 = obj2.parentNode.getElementsByTagName("A")[0];}else if(obj2 == false){ obj1.parentNode.parentNode.style.visibility='hidden';}
var message = 'Delete "' + obj2.innerHTML + '" ?'; if(this.hasSubNodes(obj2.parentNode)) message = message + ' and it\'s sub nodes'; if(confirm(message)){ this.__deleteItem_step2(obj2.parentNode);}
}
, nodeContent : function(obj1,obj2){ load_node(obj2.parentNode.id);}
, changeItemType: function(obj1,obj2){ if(obj2.nodeName == 'SPAN' || obj2.nodeName == 'IMG'){ obj2 = obj2.parentNode.getElementsByTagName("A")[0];}else if(obj2 == false){ obj1.parentNode.parentNode.style.visibility='hidden';}
var nodenum = obj2.id.substring(8); var new_type = obj1.getElementsByTagName("A")[0].innerHTML; $.ajax({ type: "POST", url: AJAX_URL + "change_type/" + nodenum + "/" + new_type, success: function(msg){ document.getElementById("iconIMGnode" + nodenum).src = DRUPAL_PATH + '/' + msg;}
});}
, duplicateTree : function (obj1,obj2){ if(obj2.nodeName == 'A' || obj2.nodeName == 'SPAN' || obj2.nodeName == 'IMG'){ obj2 = obj2.parentNode;}
var root = obj2.id.substring("4"); if(root != 0 && confirm("Duplicate this entire node structure?")){ $.ajax({ type: "POST", url: AJAX_URL + "duplicate_nodes/" + root, success: function(msg){ load_outline(document.getElementById("selected_outline").value);}
});}
}
, addItem : function(obj1,obj2)
{ var next_id = ''; var ary = Array(); if(obj2.nodeName == 'SPAN' || obj2.nodeName == 'IMG'){ obj2 = obj2.parentNode.getElementsByTagName("A")[0];}else if(obj2 == false){ obj1.parentNode.parentNode.style.visibility='hidden';}
var nodenum = obj2.id.substring(8); document.getElementById("tree_container").className="tree_saving"; var title = prompt("Node Title:"); if(title == null){ document.getElementById("tree_container").className="tree_normal";}else{ $.ajax({ type: "POST", url: AJAX_URL + "add_node/" + nodenum + "/" + title, success: function(msg){ ary = PHP_Unserialize(msg); next_id = ary[0]; nodename = 'node' + next_id; var li = document.createElement('LI'); li.id = nodename; var span = document.createElement('SPAN'); span.id = 'nodeLevel' + next_id; span.innerHTML = '&nbsp;&nbsp;'; var a = document.createElement('A'); a.href = '#'; a.innerHTML = title; var ul = document.createElement('UL'); li.appendChild(span); li.appendChild(a); li.appendChild(ul); parentid = 'node' + nodenum; document.getElementById(parentid).getElementsByTagName("UL")[0].appendChild(li); if(OUTLINE_POSTS == 1){ document.getElementById(nodename).setAttribute("noadd","false");}else{ document.getElementById(nodename).setAttribute("noadd","true");}
if(ary[3] == 1){ document.getElementById(nodename).setAttribute("norename","false"); document.getElementById(nodename).setAttribute("nodelete","false");}else{ document.getElementById(nodename).setAttribute("norename","true"); document.getElementById(nodename).setAttribute("nodelete","true");}
if(DRAG_AND_DROP_CONTENT == 0){ document.getElementById(nodename).setAttribute("noDrag","true");}
document.getElementById(span.id).setAttribute('ondblclick','load_view_node(this.parentNode.id);'); document.getElementById(li.id).getElementsByTagName("A")[0].setAttribute('ondblclick','load_view_node(this.parentNode.id);'); obj1.parentNode.parentNode.style.visibility = 'hidden'; var pimg = document.getElementById(parentid).getElementsByTagName("IMG")[0]; pimg.style.visibility="visible"; pimg.src = pimg.src.replace(JSTreeObj.plusImage,JSTreeObj.minusImage); document.getElementById(parentid).getElementsByTagName("UL")[0].style.display="block"; treeObj.initTree();}, complete: function(ar1,ar2){ document.getElementById("iconIMGnode" + next_id).src = DRUPAL_PATH + '/' + ary[2]; update_weights();}
});}
}
, __refreshDisplay : function(obj)
{ if(this.hasSubNodes(obj))return; var img = obj.getElementsByTagName('IMG')[0]; img.style.visibility = 'hidden';}
, __deleteItem_step2 : function(obj)
{ var del = Array(); var answer = true; del.push(obj.id.substring(4)); var lis = obj.getElementsByTagName('LI'); for(var no=0;no<lis.length;no++){ del.push(lis[no].id.substring(4));}
if(del.length > 1){ answer = confirm("This will Delete all subnodes, are you sure?");}
if(answer){ document.getElementById("tree_container").className="tree_saving"; $.ajax({ type: "POST", url: AJAX_URL + "delete/" + serialize(del), success: function(msg){ var parentRef = obj.parentNode.parentNode; obj.parentNode.removeChild(obj); document.getElementById("tree_container").className="tree_normal"; update_weights();}
});}
}
, __saveTextBoxChanges : function(e,inputObj)
{ if(!inputObj && this)inputObj = this; if(document.all)e = event; if(e.keyCode && e.keyCode==27){ JSTreeObj.__cancelRename(e,inputObj); return;}else{ inputObj.style.display='none'; inputObj.nextSibling.style.visibility='visible'; if(inputObj.value.length>0){ if(inputObj.nextSibling.innerHTML != inputObj.value){ inputObj.nextSibling.innerHTML = inputObj.value; nid = inputObj.parentNode.id.substring(4); document.getElementById("tree_container").className="tree_saving"; $.ajax({ type: "POST", url: AJAX_URL + "rename/" + nid + "/" + inputObj.value, success: function(msg){ if(inputObj.parentNode.parentNode.parentNode.id == "node0"){ var options = document.getElementById("selected_outline").options; for(i=0;i<options.length;i++){ if(options[i].value == document.getElementById("selected_outline").value){ options[i].text = inputObj.value;}
}
}
document.getElementById("tree_container").className="tree_normal";}
});}
}
}
}
, __cancelRename : function(e,inputObj)
{ if(!inputObj && this)inputObj = this; inputObj.value = JSTreeObj.helpObj.innerHTML; inputObj.nextSibling.innerHTML = JSTreeObj.helpObj.innerHTML; inputObj.style.display = 'none'; inputObj.nextSibling.style.visibility = 'visible';}
, __renameCheckKeyCode : function(e)
{ if(document.all)e = event; if(e.keyCode==13){ JSTreeObj.__saveTextBoxChanges(false,this);}
if(e.keyCode==27){ JSTreeObj.__cancelRename(false,this);}
}
, __createTextBox : function(obj)
{ var textBox = document.createElement('INPUT'); textBox.className = 'folderTreeTextBox'; textBox.value = obj.innerHTML; obj.parentNode.insertBefore(textBox,obj); textBox.id = 'textBox' + obj.parentNode.id.replace(/[^0-9]/gi,''); textBox.onblur = this.__saveTextBoxChanges; textBox.onkeydown = this.__renameCheckKeyCode; this.__renameEnableTextBox(obj);}
, __renameEnableTextBox : function(obj)
{ obj.style.visibility = 'hidden'; obj.previousSibling.value = obj.innerHTML; obj.previousSibling.style.display = 'inline'; obj.previousSibling.select();}
, renameItem : function(obj1,obj2)
{ if(obj2.nodeName == 'SPAN' || obj2.nodeName == 'IMG'){ obj2 = obj2.parentNode.getElementsByTagName("A")[0];}else if(obj2 == false){ obj1.parentNode.parentNode.style.visibility='hidden';}
currentItemToEdit = obj2.parentNode; if(!obj2.previousSibling || obj2.previousSibling.tagName.toLowerCase()!='input'){ this.__createTextBox(obj2);}else{ this.__renameEnableTextBox(obj2);}
this.helpObj.innerHTML = obj2.innerHTML;}
, initTree : function()
{ JSTreeObj = this; JSTreeObj.createDropIndicator(); document.documentElement.onselectstart = JSTreeObj.cancelSelectionEvent; document.documentElement.ondragstart = JSTreeObj.cancelEvent; this.helpObj = document.createElement("DIV"); this.helpObj.style.display = "none"; document.body.appendChild(this.helpObj); if(this.iconsAllowed || this.addAllowed || this.deleteAllowed || this.renameAllowed){ try{ var menuModel = new DHTMLGoodies_menuModel(); if(this.addAllowed)menuModel.addItem(1,"Add Child",DRUPAL_OD_PATH + "/images/add.png","",false,"JSTreeObj.addItem"); menuModel.addItem(2,"Edit",DRUPAL_OD_PATH + "/images/edit.png","",false,"JSTreeObj.nodeContent"); if(this.renameAllowed)menuModel.addItem(3,"Rename",DRUPAL_OD_PATH + "/images/rename.png","",false,"JSTreeObj.renameItem"); if(ALLOW_DUPLICATE == 1){ menuModel.addItem(4,"Duplicate",DRUPAL_OD_PATH + "/images/duplicate.png","",false,"JSTreeObj.duplicateTree");}
if(this.deleteAllowed)menuModel.addItem(5,"Delete",DRUPAL_OD_PATH + "/images/delete.png","",false,"JSTreeObj.deleteItem"); menuModel.init(); var menuModelNotAddOnly = new DHTMLGoodies_menuModel(); menuModelNotAddOnly.addItem(6,"Edit",DRUPAL_OD_PATH + "/images/edit.png","",false,"JSTreeObj.nodeContent"); if(this.deleteAllowed)menuModelNotAddOnly.addItem(7,"Delete",DRUPAL_OD_PATH + "/images/delete.png","",false,"JSTreeObj.deleteItem"); if(this.renameAllowed)menuModelNotAddOnly.addItem(8,"Rename",DRUPAL_OD_PATH + "/images/rename.png","",false,"JSTreeObj.renameItem"); menuModelNotAddOnly.init(); var menuModelRenameOnly = new DHTMLGoodies_menuModel(); if(this.renameAllowed)menuModelRenameOnly.addItem(9,"Rename",DRUPAL_OD_PATH + "/images/rename.png","",false,"JSTreeObj.renameItem"); menuModelRenameOnly.init(); var menuModelDeleteOnly = new DHTMLGoodies_menuModel(); if(this.deleteAllowed)menuModelDeleteOnly.addItem(10,"Delete",DRUPAL_OD_PATH + "/images/delete.png","",false,"JSTreeObj.deleteItem"); menuModelDeleteOnly.init(); var menuModelAddOnly = new DHTMLGoodies_menuModel(); if(this.addAllowed)menuModelAddOnly.addItem(11,"Add Child",DRUPAL_OD_PATH + "/images/add.png","",false,"JSTreeObj.addItem"); if(ALLOW_DUPLICATE == 1){ menuModelAddOnly.addItem(4,"Duplicate",DRUPAL_OD_PATH + "/images/duplicate.png","",false,"JSTreeObj.duplicateTree");}
menuModelAddOnly.init(); var menuModelRoot = new DHTMLGoodies_menuModel(); if(this.addAllowed)menuModelRoot.addItem(12,"Add Child",DRUPAL_OD_PATH + "/images/add.png","",false,"JSTreeObj.addItem"); if(this.renameAllowed)menuModelRoot.addItem(13,"Rename",DRUPAL_OD_PATH + "/images/rename.png","",false,"JSTreeObj.renameItem"); menuModelRoot.init(); var menuModelIcons = new DHTMLGoodies_menuModel(); $.ajax({ type: "POST", url: AJAX_URL + "get_icons", success: function(msg){ var ary = Array(); if(msg != ''){ ary = PHP_Unserialize(msg); for(var i=0; i<ary.length; i++){ menuModelIcons.addItem(14+i,ary[i][0],DRUPAL_PATH + '/' + ary[i][1],"",false,"JSTreeObj.changeItemType");}
menuModelIcons.init();}
}
}); window.refToDragDropTree = this; this.contextMenu = new DHTMLGoodies_contextMenu(); this.contextMenu.setWidth(140); referenceToDHTMLSuiteContextMenu = this.contextMenu;}catch(e){ }
}
var dhtmlgoodies_tree = document.getElementById("node0"); var menuItems = dhtmlgoodies_tree.getElementsByTagName("LI"); for(var no=0;no<menuItems.length;no++){ var noChildren = false; var tmpVar = menuItems[no].getAttribute("noChildren"); if(!tmpVar)tmpVar = menuItems[no].noChildren; if(tmpVar=="true")noChildren=true; var noDrag = false; var tmpVar = menuItems[no].getAttribute("noDrag"); if(!tmpVar)tmpVar = menuItems[no].noDrag; if(tmpVar=="true")noDrag=true; var subItems = menuItems[no].getElementsByTagName("UL"); var img = document.createElement("IMG"); img.src = this.imageFolder + this.plusImage; img.onclick = JSTreeObj.showHideNode; if(subItems.length==0)img.style.visibility="hidden";else{ subItems[0].id = 'tree_ul_' + menuItems[no].id.substring(4);}
var aTag = menuItems[no].getElementsByTagName('A')[0]; var tagA = aTag.id; aTag.id = 'nodeATag' + menuItems[no].id.substring(4); if(!noDrag)aTag.onmousedown = JSTreeObj.initDrag; var spanTag = menuItems[no].getElementsByTagName('SPAN')[0]; if(tagA == ''){ menuItems[no].insertBefore(img,spanTag); if(!noDrag)spanTag.onmousedown = JSTreeObj.initDrag; if(!noChildren)spanTag.onmousemove = JSTreeObj.moveDragableNodes; spanTag.onmouseover = function(){ this.style.cursor="pointer";};}
var iconIMG = document.createElement('IMG'); if(!noDrag)iconIMG.onmousedown = JSTreeObj.initDrag; iconIMG.onmousemove = JSTreeObj.moveDragableNodes; if(iconIMG.src == ''){ if(menuItems[no].className){ iconIMG.src = this.imageFolder + menuItems[no].className;}else{ iconIMG.src = this.imageFolder + this.folderImage;}
}
iconIMG.id = 'iconIMG' + menuItems[no].id; if(tagA == ''){ menuItems[no].insertBefore(iconIMG,spanTag); document.getElementById(iconIMG.id).setAttribute('ondblclick','load_view_node(this.parentNode.id)');}
if(this.contextMenu){ var noDelete = menuItems[no].getAttribute('noDelete'); if(!noDelete)noDelete = menuItems[no].noDelete; var noRename = menuItems[no].getAttribute('noRename'); if(!noRename)noRename = menuItems[no].noRename; var noAdd = menuItems[no].getAttribute('noAdd'); if(!noAdd)noAdd = menuItems[no].noAdd; if(noRename=='true' && noDelete=='true' && noAdd=='true'){}else{ if(noDelete == 'false' && noRename=='false' && noAdd=='true'){ this.contextMenu.attachToElement(aTag,false,menuModelNotAddOnly); this.contextMenu.attachToElement(spanTag,false,menuModelNotAddOnly);}else if(noRename == 'false' && noAdd=='false' && noDelete == 'true'){ this.contextMenu.attachToElement(aTag,false,menuModelRoot); this.contextMenu.attachToElement(spanTag,false,menuModelRoot);}else if(noDelete == 'true' && noAdd=='true'){ this.contextMenu.attachToElement(aTag,false,menuModelRenameOnly); this.contextMenu.attachToElement(spanTag,false,menuModelRenameOnly);}else if(noRename == 'true' && noAdd=='true'){ this.contextMenu.attachToElement(aTag,false,menuModelDeleteOnly); this.contextMenu.attachToElement(spanTag,false,menuModelDeleteOnly);}else if(noRename == 'true' && noDelete=='true'){ this.contextMenu.attachToElement(aTag,false,menuModelAddOnly); this.contextMenu.attachToElement(spanTag,false,menuModelAddOnly);}else{ this.contextMenu.attachToElement(aTag,false,menuModel); this.contextMenu.attachToElement(spanTag,false,menuModel);}
}
this.contextMenu.attachToElement(iconIMG,false,menuModelIcons); this.addEvent(aTag,'contextmenu',this.highlightItem); this.addEvent(spanTag,'contextmenu',this.highlightItem); this.addEvent(iconIMG,'contextmenu',this.highlightItem);}
if(document.getElementById(menuItems[no].id).getElementsByTagName("LI").length==0){ document.getElementById(menuItems[no].id).getElementsByTagName("IMG")[0].style.visibility="hidden";}
}
initExpandedNodes = this.Get_Cookie('dhtmlgoodies_expandedNodes'); if(initExpandedNodes){ var nodes = initExpandedNodes.split(','); for(var no=0;no<nodes.length;no++){ if(nodes[no])this.showHideNode(false,nodes[no]);}
}
document.documentElement.onmousemove = JSTreeObj.moveDragableNodes; document.documentElement.onmouseup = JSTreeObj.dropDragableNodes;}
}
function JPSpan_Encode_PHP() { this.Serialize = new JPSpan_Serialize(this);}; JPSpan_Encode_PHP.prototype = { contentType: 'text/plain; charset=US-ASCII', encode: function(data) { return this.Serialize.serialize(data);}, encodeInteger: function(v) { return 'i:'+v+';';}, encodeDouble: function(v) { return 'd:'+v+';';}, encodeString: function(v) { var s = ''
for(var n=0; n<v.length; n++) { var c=v.charCodeAt(n); if (c<128) { s += String.fromCharCode(c);}
}
return 's:'+s.length+':"'+s+'";';}, encodeNull: function() { return 'N;';}, encodeTrue: function() { return 'b:1;';}, encodeFalse: function() { return 'b:0;';}, encodeArray: function(v, Serializer) { var indexed = new Array(); var count = v.length; var s = ''; for (var i=0; i<v.length; i++) { indexed[i] = true; s += 'i:'+i+';'+Serializer.serialize(v[i]);}; for ( var prop in v ) { if ( indexed[prop] ) { continue;}; s += Serializer.serialize(prop)+Serializer.serialize(v[prop]); count++;}; s = 'a:'+count+':{'+s; s += '}'; return s;}, encodeObject: function(v, Serializer, cname) { var s=''; var count=0; for (var prop in v) { s += 's:'+prop.length+':"'+prop+'";'; if (v[prop]!=null) { s += Serializer.serialize(v[prop]);} else { s +='N;';}; count++;}; s = 'O:'+cname.length+':"'+cname.toLowerCase()+'":'+count+':{'+s+'}'; return s;}, encodeError: function(v, Serializer, cname) { var e = new Object(); if ( !v.name ) { e.name = cname; e.message = v.description;} else { e.name = v.name; e.message = v.message;}; return this.encodeObject(e,Serializer,cname);}
}
function JPSpan_Serialize(Encoder) { this.Encoder = Encoder; this.typeMap = new Object();}; JPSpan_Serialize.prototype = { typeMap: null, addType: function(cname, callback) { this.typeMap[cname] = callback;}, serialize: function(v) { switch(typeof v) { case 'object':
if ( v === null ) { return this.Encoder.encodeNull();}
var c = v.constructor; if (c != null ) { if ( c == Array ) { return this.Encoder.encodeArray(v,this);} else { var match = c.toString().match( /\s*function (.*)\(/ ); if ( match == null ) { return this.Encoder.encodeObject(v,this,'JPSpan_Object');}
var cname = match[1].replace(/\s/,''); if ( this.typeMap[cname] ) { return this.typeMap[cname](v, this, cname);} else { var match = cname.match(/Error/); if ( match == null ) { return this.Encoder.encodeObject(v,this,'JPSpan_Object');} else { return this.Encoder.encodeError(v,this,'JPSpan_Error');}
}
}
} else { return this.Encoder.encodeNull();}
break; case 'string':
return this.Encoder.encodeString(v); break; case 'number':
if (Math.round(v) == v) { return this.Encoder.encodeInteger(v);} else { return this.Encoder.encodeDouble(v);}; break; case 'boolean':
if (v == true) { return this.Encoder.encodeTrue();} else { return this.Encoder.encodeFalse();}; break; default:
return this.Encoder.encodeNull(); break;}
}
}
function JPSpan_Util_Data() { this.Serialize = new JPSpan_Serialize(this); this.indent = '';}; JPSpan_Util_Data.prototype = { dump: function(data) { return this.Serialize.serialize(data);}, encodeInteger: function(v) { return 'Integer: '+v+"\n";}, encodeDouble: function(v) { return 'Double: '+v+"\n";}, encodeString: function(v) { return "String("+v.length+"): "+v+"\n";}, encodeNull: function() { return "Null\n";}, encodeTrue: function() { return "Boolean(true)\n"
}, encodeFalse: function() { return "Boolean(false)\n"
}, encodeArray: function(v, Serializer) { var a=v; var indexed = new Array(); var out="Array("+a.length+")\n"; this.indent += "  "; if ( a.length>0 ) { for (var i=0; i < a.length; i++) { indexed[i] = true; out+=this.indent+"["+i+"]"; if ( (a[i]+'') == 'undefined') { out+= " = undefined\n"; continue;}; out+= " = "+Serializer.serialize(a[i])+"\n";};}; var assoc=''; for ( var prop in a ) { if ( indexed[prop] ) { continue;}; assoc+=this.indent+"[\""+prop+"\"]"; if ( (a[prop]+'') == 'undefined') { assoc+= " = undefined\n"; continue;}; assoc+= " = "+Serializer.serialize(a[prop])+"\n";}; if ( assoc.length > 0 ) { out += assoc;}; this.indent = this.indent.substr(0,this.indent.length-2); return out;}, encodeObject: function(v, Serializer, cname) { var o=v; if (o==null) return "Null\n"; var out="Object("+cname+")\n"; this.indent += "  "; for (var prop in o) { out+=this.indent+"."+prop+" = "; if (o[prop]==null) { out+="null\n"; continue;}; out+=Serializer.serialize(o[prop])+"\n";}; this.indent = this.indent.substr(0,this.indent.length-2); return out;}, encodeError: function(v, Serializer, cname) { var e = new Object(); if ( !v.name ) { e.name = cname; e.message = v.description;} else { e.name = v.name; e.message = v.message;}; return this.encodeObject(e,Serializer,cname);}
}; function var_dump(data) { var Data = new JPSpan_Util_Data(); return Data.dump(data);}
function serialize(data) { var Encoder = new JPSpan_Encode_PHP(); return Encoder.encode(data);}
function PHP_Unserialize(input)
{ var result = PHP_Unserialize_(input); return result[0];}
function PHP_Unserialize_(input)
{ var length = 0; switch (input.charAt(0)) { case 'a':
length = PHP_Unserialize_GetLength(input); input = input.substr(String(length).length + 4); var arr = new Array(); var key = null; var value = null; for (var i=0; i<length; ++i) { key = PHP_Unserialize_(input); input = key[1]; value = PHP_Unserialize_(input); input = value[1]; arr[key[0]] = value[0];}
input = input.substr(1); return [arr, input]; break; case 'O':
length = PHP_Unserialize_GetLength(input); var classname = String(input.substr(String(length).length + 4, length)); input = input.substr(String(length).length + 6 + length); var numProperties = Number(input.substring(0, input.indexOf(':')))
input = input.substr(String(numProperties).length + 2); var obj = new Object(); var property = null; var value = null; for (var i=0; i<numProperties; ++i) { key = PHP_Unserialize_(input); input = key[1]; key[0] = key[0].replace(new RegExp('^\x00' + classname + '\x00'), ''); key[0] = key[0].replace(new RegExp('^\x00\\*\x00'), ''); value = PHP_Unserialize_(input); input = value[1]; obj[key[0]] = value[0];}
input = input.substr(1); return [obj, input]; break; case 's':
length = PHP_Unserialize_GetLength(input); return [String(input.substr(String(length).length + 4, length)), input.substr(String(length).length + 6 + length)]; break; case 'i':
case 'd':
var num = Number(input.substring(2, input.indexOf(';'))); return [num, input.substr(String(num).length + 3)]; break; case 'b':
var bool = (input.substr(2, 1) == 1); return [bool, input.substr(4)]; break; case 'N':
return [null, input.substr(2)]; break; case 'o':
case 'r':
case 'C':
case 'R':
case 'U':
alert('Error: Unsupported PHP data type found!'); default:
return [null, null]; break;}
}
function PHP_Unserialize_GetLength(input)
{ input = input.substring(2); var length = Number(input.substr(0, input.indexOf(':'))); return length;}
$(document).ready(function(){ treeObj = new JSDragDropTree(); treeObj.setTreeId("node0"); treeObj.setMaximumDepth(100); treeObj.initTree(); get_book_roots(); load_outline(document.getElementById("selected_outline").value);}); function load_outline(nid){ document.getElementById("node0").getElementsByTagName("UL")[0].innerHTML=""; if(nid !=0){ $.ajax({ type: "GET", url: AJAX_URL + "load_tree/" + nid, success: function(msg){ var ary = Array(); ary = PHP_Unserialize(msg); for(var i=0; i<ary.length; i++){ ary_nid = ary[i][0]; ary_pid = ary[i][1]; ary_title = ary[i][2]; ary_edit = ary[i][4]; nodename = "node" + ary_nid; var li = document.createElement("LI"); li.id = nodename; var span = document.createElement("SPAN"); span.id = "nodeLevel" + ary_nid; span.innerHTML = "&nbsp;"; var a = document.createElement("A"); a.href = "#"; a.innerHTML = ary_title; var ul = document.createElement("UL"); li.appendChild(span); li.appendChild(a); li.appendChild(ul); parentid = "node" + ary_pid; document.getElementById("node0").getElementsByTagName("UL")[0].appendChild(li); if(OUTLINE_POSTS == 1){ document.getElementById(nodename).setAttribute("noadd","false");}else{ document.getElementById(nodename).setAttribute("noadd","true");}
if(ary_edit == 1){ document.getElementById(nodename).setAttribute("norename","false"); document.getElementById(nodename).setAttribute("nodelete","false");}else{ document.getElementById(nodename).setAttribute("norename","true"); document.getElementById(nodename).setAttribute("nodelete","true");}
if(parentid == "node0"){ document.getElementById(nodename).setAttribute("nodelete","true"); document.getElementById(nodename).setAttribute("noDrag","true"); document.getElementById(nodename).setAttribute("noSiblings","true");}else{ if(DRAG_AND_DROP_CONTENT == 0){ document.getElementById(nodename).setAttribute("noDrag","true");}
}
document.getElementById(span.id).setAttribute("ondblclick","load_view_node(this.parentNode.id);"); document.getElementById(li.id).getElementsByTagName("A")[0].setAttribute("ondblclick","load_view_node(this.parentNode.id);");}
treeObj.initTree(); for(var i=0; i<ary.length; i++){ ary_nid = ary[i][0]; ary_pid = ary[i][1]; ary_type = ary[i][3]; nodeid = "node" + ary_nid; parentid = "node" + ary_pid; li = document.getElementById(nodeid); document.getElementById(parentid).getElementsByTagName("UL")[0].appendChild(li); document.getElementById("iconIMG" + nodeid).src = DRUPAL_PATH + '/' + ary_type;}
for(var i=0; i<ary.length; i++){ ary_nid = ary[i][0]; nodeid = "tree_ul_" + ary_nid; if(document.getElementById(nodeid).getElementsByTagName("LI").length == 0){ document.getElementById(nodeid).parentNode.getElementsByTagName("IMG")[0].style.visibility="hidden";}else{ document.getElementById(nodeid).parentNode.getElementsByTagName("IMG")[0].style.visibility="visible";}
}
treeObj.expandAll(); var options = document.getElementById("selected_outline").options; document.getElementById("selected_outline").value = nid; for(i=0;i<options.length;i++){ if(options[i].value == nid){ options[i].selected = true;}
}
}
});}
}
function duplicate_structure(){ var root = document.getElementById("selected_outline").value; if(root != 0 && confirm("Duplicate this outline? (this may take awhile)")){ $.ajax({ type: "POST", url: AJAX_URL + "duplicate_nodes/" + root, success: function(msg){ get_book_roots(); load_outline(msg); $(document).ready(function(){ $("#selected_outline").val(root);});}
});}
}
function new_structure(){ var title = prompt("What is the name of this outline structure?"); if(title != "" && title != null){ $.ajax({ type: "POST", url: AJAX_URL + "add_node/0/" + title, success: function(msg){ get_book_roots(); var ary = PHP_Unserialize(msg); load_outline(ary[0]);}
});}
}
function node_popup(nid){ mywindow = window.open(DRUPAL_PATH + "/?q=node/" + nid + "/edit","mywindow","status=1,resizable=1,scrollbars=1,width=700,height=500"); mywindow.moveTo(300,200);}
function save_tree(){ update_weights(); treeObj.initTree(); var saveString = treeObj.getNodeOrders(); var stringarray = saveString.split(","); savelist = Array(); for(i=0; i<stringarray.length; i++){ ids = stringarray[i].split("-"); savelist.push(Array(ids[0],ids[1],document.getElementById("nodeATag" + ids[0]).innerHTML));}
document.getElementById("tree_container").className="tree_saving"; $.ajax({ type: "POST", url: AJAX_URL + "save_tree/" + serialize(savelist), success: function(msg){ document.getElementById("tree_container").className="tree_normal"; if(msg){ var ary = Array(); ary = PHP_Unserialize(msg); nodename = "node" + ary[0]; document.getElementById("iconIMGnode" + ary[0]).src = DRUPAL_PATH + '/' + ary[1]; treeObj.initTree();}
}
});}
function delete_structure(){ if(document.getElementById("selected_outline").value != 0){ var obj = document.getElementById("node" + document.getElementById("selected_outline").value); document.getElementById("tree_container").className="tree_saving"; var del = Array(); var answer = true; del.push(obj.id.substring(4)); var lis = obj.getElementsByTagName("LI"); for(var no=0;no<lis.length;no++){ del.push(lis[no].id.substring(4));}
answer = confirm("Delete this entire outline? (This can not be undone!)"); if(answer){ $.ajax({ type: "POST", url: AJAX_URL + "delete/" + serialize(del), success: function(msg){ var parentRef = obj.parentNode.parentNode; obj.parentNode.removeChild(obj); document.getElementById("tree_container").className="tree_normal"; get_book_roots(); document.getElementById("selected_outline").childNodes[0].selected = true;}
});}else{ document.getElementById("tree_container").className="tree_normal";}
}
}
function load_node(nid){ nid = nid.substring(4); node_popup(nid);}
function load_view_node(nid){ nid = nid.substring(4); mywindow = window.open(DRUPAL_PATH + "/?q=node/" + nid,"mywindow","status=1,resizable=1,scrollbars=1,width=700,height=500"); mywindow.moveTo(300,200);}
function get_book_roots(){ $.ajax({ type: "POST", url: AJAX_URL + "get_book_roots", success: function(msg){ var ary = Array(); ary = PHP_Unserialize(msg); values = "<option value='0' SELECTED></option>"; for(var i=0; i<ary.length; i++){ ary_nid = ary[i][0]; ary_title = ary[i][1]; values+= "<option value='" + ary_nid + "'>" + ary_title + "</option>";}
$("#selected_outline").empty(); $("#selected_outline").append(values); $("#selected_outline").val(0);}
});}
function update_weights(){ var weight = Array(); var numbering = Array(0,0,0,0,0,0,0,0,0,0); var level = 0; var previouslevel = 0; var etext = false; var term = Array(); var tree = document.getElementById("node0").getElementsByTagName("LI"); var root = document.getElementById("selected_outline").value; for(i=0; i<tree.length; i++){ idlevel = tree[i].id; previouslevel = level; level = 0; while(document.getElementById(idlevel).parentNode.parentNode.id != "node0"){ idlevel = document.getElementById(idlevel).parentNode.parentNode.id; level++;}
if(level != 0){ if(etext == false){ if(previouslevel == level){ numbering[level-1]++;}else if(previouslevel > level){ numbering[level-1]++; numbering[previouslevel-1] = 1;}else{ numbering[level-1]=1;}
}else{ numbering[level-1]++;}
weight.push(Array(numbering[level-1]-16,tree[i].id.substring(4)));}else{ weight.push(Array(-15,tree[i].id.substring(4)));}
}
treeObj.initTree(); document.getElementById("tree_container").className="tree_saving"; $.ajax({ type: "POST", url: AJAX_URL + "update_weights/" + serialize(weight), success: function(msg){ document.getElementById("tree_container").className="tree_normal";}
});}
