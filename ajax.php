<?php 
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
require_once './includes/bootstrap.inc';

if(isset($_POST['action'])){
    drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
    switch($_POST['action']){
      //in: node title, node parent id
	  //action: Check the parent / nodes around this one we're inserting and guess about what content type to use, otherwise make it the system default
	  //out: node id, node type, icon to render
      case 'add_node':
        $node->title = $_POST['title'];
        $node->status = 1;
        $node->uid = $user->uid;
        //take into account that we could be creating a new book
        if($_POST['parent'] == 0 || !user_access('change content types')){
          $node->type = variable_get("outline_designer_default_type", "page");
        }else{
          //figure out if there are currently any children
          //if there aren't then just give the child the parent's properties
          $result = db_query("SELECT type FROM node JOIN book ON book.vid = node.vid WHERE parent=" . $_POST['parent'] . " ORDER BY weight DESC");
          $num_rows = db_num_rows($result);
          if($num_rows == 0){
            $parent = node_load($_POST['parent']);
			if(user_access('create ' . $parent->type . ' content')){
           		$node->type = $parent->type;
			}else{
				$node->type = variable_get("outline_designer_default_type", "page");
			}
          }else{
            $value = db_fetch_array($result);
			if(user_access('create ' . $value['type'] . ' content')){
           		$node->type = $value['type'];
			}else{
				$node->type = variable_get("outline_designer_default_type", "page");
			}
          }
        }
		//set these incase this is the book type which uses them on save, otherwise these are ignored the first time
		$node->weight = -15;
		$node->parent = $_POST['parent'];
        node_save($node);
		//we need to make sure this isn't of type book or else it will cause a duplicate key entry error because it's save hook has already used the parent value where as non-book types don't the first time
		if($node->type != 'book'){
        	db_query("INSERT INTO {book} (nid, vid, parent, weight) VALUES (%d, %d, %d, %d)", $node->nid, $node->vid, $_POST['parent'], -15);
		}
		if($node->type == 'book'){
			$term = 'pages';
		}else{
			$term = 'content';
		}
		if(user_access('edit ' . $node->type . ' ' . $term) || user_access('edit own ' . $node->type . ' ' . $term)){
			$allow_edit = 1;
		}else{
			$allow_edit = 0;
		}
        print serialize(array($node->nid,$node->type,variable_get("outline_designer_" . $node->type . "_icon",drupal_get_path('module','outline_designer') . "/images/node.png"),$allow_edit));
      break;
	  //in: node id, node type name
	  //action: change node type and resave
	  //out: icon to render
      case 'change_type':
        $node = node_load($_POST['nid']);
		$type = db_result(db_query("SELECT type FROM node_type WHERE name='" . $_POST['new_type'] . "'"));
        if($node->type != $type){
		  $node->type = $type;
          node_save($node);
        }
		print variable_get("outline_designer_" . $node->type . "_icon",drupal_get_path('module','outline_designer') . "/images/node.png");
      break;
	  //in: list of node ids to delete
	  //action: delete nodes
	  //out: completion response
      case 'delete':
        $ary = unserialize($_POST['ids']);
        for($i=0;$i<count($ary);$i++){
          node_delete($ary[$i]);
        }
        print 'Nodes successfully removed!';
      break;
	  //in: node id moved, new parent id it was moved under
	  //action: change node parent
	  //out: nothing
	  case 'drag_drop_update':
        $node = node_load($_POST['nid']);
        $node->parent = $_POST['parent'];
        $node->log = 'Outline Designer reweighting update on drag-and-drop';
        node_save($node);
      break;
	  //in: root node id
	  //action: duplicate the node and 
	  //out: new root node
      case 'duplicate_nodes':
        $tree = array();
        //pull the whole node tree but only get the nid's
        $value = db_fetch_array(db_query("SELECT node.nid FROM book JOIN node ON node.vid=book.vid WHERE node.nid=" . $_POST['root']));
        $tree[$value['nid']] = 0;
        $tree = _outline_designer_recurse_duplicate_nodes($_POST['root'],$tree);
        //load each node in the node tree
        
        foreach($tree as $old_nid => $new_nid){
          $node = node_load($old_nid);
          $node->nid = null;
          $node->created = null;
          if($old_nid == $_POST['root']){
            //do nothing to the parent because this accounts for coping just a branch
            $node->title = "Duplicate of " . $node->title;
          }else{
            $node->parent = $tree[$node->parent];
          }
          node_save($node);
		  if($node->type != 'book'){
          	db_query("INSERT INTO {book} (nid, vid, parent, weight) VALUES (%d, %d, %d, %d)", $node->nid, $node->vid, $node->parent, $node->weight);
          }
		  $tree[$old_nid] = $node->nid;
        }
        //return the new root
        print_r($tree[$_POST['root']]);
      break;
      //in: nothing
	  //action: determine what node types the user is allowed to create / switch their content to.  User's ability to change content type is querried, then system defined variable list, and then takes user create type content permissions into account
	  //out: node type names and icon to render
      case 'get_icons':
	  	if(user_access('change content types')){
			$ary = array();
			$ary2 = array();
			$ary = variable_get('outline_designer_content_types',array('page'));
			foreach($ary as $value){
			  $name = db_result(db_query("SELECT name FROM node_type WHERE type='" . $value . "'"));
			  //only allow users with the create "type" privlege perform this operation
			  if(user_access("create $value content")){
				array_push($ary2,array($name,variable_get("outline_designer_" . $value . "_icon",drupal_get_path('module','outline_designer') . "/images/node.png")));
			  }
			}
			print serialize($ary2);
		}
      break;
	  //in:nothing
	  //action: find all nodes without parents (these are the root nodes)
	  //out: all the node roots
	  case 'get_book_roots':
        $roots = array();
        $result = db_query("SELECT node.nid,title FROM node JOIN book ON book.vid = node.vid WHERE parent=0 ORDER BY node.nid");
        while($value = db_fetch_array($result)){
          array_push($roots,array($value['nid'],$value['title']));
        }
        print serialize($roots);
      break;
	  //in: root node id
	  //action: load all nodes from a root node
	  //out: node id, parent association, title, icon to render, allow edit
      case 'load_tree':
        //pull everything
        $tree = array();
        $value = db_fetch_array(db_query("SELECT node.uid,node.nid,parent,title,type FROM book JOIN node ON node.vid=book.vid WHERE node.nid=" .$_POST['nid'] . " ORDER BY weight"));
		if($value['type'] == 'book'){
			$term = 'pages';
		}else{
			$term = 'content';
		}
		if(user_access('edit ' . $value['type'] . ' ' . $term)){
			$allow_edit = 1;
		}elseif($user->uid = $value['uid'] && user_access('edit own ' . $value['type'] . ' ' . $term)){
			$allow_edit = 1;
		}else{
			$allow_edit = 0;
		}
        array_push($tree,array($value['nid'],$value['parent'],$value['title'],variable_get("outline_designer_" . $value['type'] . "_icon",drupal_get_path('module','outline_designer') . "/images/node.png"),$allow_edit));
        $tree = _outline_designer_tree_recurse($_POST['nid'],$tree);
        print serialize($tree);
      break;
	  //in: node id, title
	  //action: rename a single node
	  //out: nothing
      case 'rename':
        $node = node_load($_POST['nid']);
        $node->title = $_POST['newtitle'];
        $node->revision = 1;
        node_save($node);
      break;
	  //in: array of arrays with node id, parent id, weight, and title of each node
	  //action: save all nodes currently displayed
	  //out: array of node id and icon to render
      case 'save_tree':
        $ary = unserialize($_POST['tree']);
        $type = array();
        for($no=0;$no<count($ary);$no++){
          $nid = $ary[$no][0];
          $parent = $ary[$no][1];
          $weight = $no;
          $title = $ary[$no][2];
          $node = node_load($nid);
          //figure out if the type is set and make it the same as the level it's currently on
          //if it doesn't have a type that means it's new and we should update instead of create
          if($node->type == ''){
            $node->type = variable_get("outline_designer_default_type", "page");
            print serialize(array($node->nid,variable_get("outline_designer_" . $node->type . "_icon",drupal_get_path('module','outline_designer') . "/images/node.png")));
          }else{
            //try to set the nid, this way if the parent is referenced later it will take 
            //the properties of the parent
            $type[$nid] = array($node->type);
            //associate the parent id to the node type of the elements under it (by default)
            //this will also override the parent's settings to default to the children 
            //if they end up existing
            $type[$parent] = array($node->type);
          }
          //weight is currently being hacked to fit our new book purposes.  It will render correctly but never be able to update correctly if it goes beyond 31 in any branch
          //weight orders them on the page and then they are indented based on who their parent is
          if($node->weight != $weight || $node->parent != $parent || $node->title != $title){
            $node->weight = $weight;
            $node->parent = $parent;
            $node->title = $title;
            $node->revision = 1;
            node_save($node);
          }
        }
      break;
	  //in: node id, weight
	  //action: alter weights across all nodes
	  //out: nothing
	  case 'update_weights':
        $ary = unserialize($_POST['weight']);
        foreach($ary as $weight){
          $node = node_load($weight[1]);
          $node->weight = $weight[0];
          $node->log = 'Outline Designer reweighting update';
          node_save($node);
        }
      break;
    }
  }
?>