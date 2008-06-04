ELMS: Outline Designer - Ajax book / general usability improvements for Drupal 5.x
Copyright (C) 2008  The Pennsylvania State University

Bryan Ollendyke
bto108@psu.edu

Keith D. Bailey
kdb163@psu.edu

12 Borland
University Park, PA 16802

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

INSTALATION
*Place the outline_designer directory in the correct modules folder as you would any other Drupal module
*Activate the module
*Goto your_drupal_site/admin/settings/outline_designer and configure your content types to use 
*Go to your_drupal_site/outline_designer to access the outline designer.  
*There's also a permission that you can activate to give people access to the outline_designer page / functions.

SO LETS TALK ABOUT PERSMISSIONS...

The permissions of the outline designer can get pretty granular if you want them to.  In a lot of instances I've found you won't want to give user access to this functionality but I'll outline the major settings you can give people to restrict access:

BOOK PERMISSIONS
*outline posts in books - This will enable / disable the ability to use the "Add child" menu item from the right click functionality
*create new books - This will enable / disable the appearance of the New, Duplicate and Delete buttons on the outline designer page.  For most users you'll want this disabled

OUTLINE DESIGNER PERMISSIONS
*access outline designer - Give access to the outline designer.  Ultimate shut off valve for using this.
*change content types - Disabling this will force all new content added to be the default specified in the settings page.  Usually this won't be used unless it's in conjunction with turning off access to the outline posts in books permission.
*drag-and-drop content - This will block people from being able to drag and drop content.  Turning this off could be useful if you just want a user to edit the content but not the structure
*duplicate nodes - If they have access to do any of the other things then this will just block them from duplicating content.  Useful in conjunction with outline posts in books

NODE PERMISSIONS
All content types come with "edit [type] content", "create [type] content", and "edit own [type] content" (except for book pages that have a little different naming convention but the same idea).  These SHOULD be working with the outline designer correctly.  If you create a node and have edit own you will be able to make changes to it like edit, rename, delete.  If you don't have own you souldn't etc.  Also, if you don't have the right to create a content type it won't show up in the change content type menu.  There are a lot of tricky permission situations around this and I'm sure I haven't accounted for everything so please if you notice a bug / use case where it breaks with the permissions of drupal node creation in this department let me know.  Permissions were taken into account late in development so more sufficient testing is needed before a point release.

COMPATABILITY
Since this is a intense javascript application there are unfortunately several issues. If you can identify or fix any of these it would be GREATLY appreciated.

Firefox 2 - No known issues
Firefox 3 - No known issues
Flock 1.1 - No known issues
Safari 3 - No known issues
Camino 1.5 - No known issues
SeaMonkey - No known issues
Netscape 9 - No known issues

Opera 9 - Context Menu only stays open when you click and hold on the edit icon
IE 7 - ??