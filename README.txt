ELMS: Outline Designer - Usability improvements for speedy outline creation in Drupal 6.x
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

REQUIREMENTS
*This module requires that you have Book enabled as well as the following contributed modules
*Ajax forms -- http://drupal.org/projects/ajax
*Thickbox -- http://drupal.org/projects/thickbox
**Optional: TinyMCE with this module -- http://drupal.org/projects/tinymce

INSTALATION
*Place the outline_designer directory in the correct modules folder as you would any other Drupal module
*Activate the module
*Go to admin/content/book/outline_designer and configure your icons 
*Go to admin/content/book/settings to enable / disable content types from outlining and set default type
*Go to admin/content/book and click "edit order and titles" to access the outline designer interface.  

PERMISSIONS
Now that the outline designer is fully integrated with the core books module it will obey all the permission settings of books.
There is one permission that needs to be set called "access ajax path" this may seem silly but is nessecary so that the path for submitting ajax requests is protected from the outside world.

COMPATABILITY
No known issues
  *Firefox 3
  *Safari 3
  *Flock 1.2.6
  *Camino 1.6.4
  *SeaMonkey
  *Netscape 9
  *Chrome 0.3

Known to not work yet
  *Opera 9
  *IE (All versions)