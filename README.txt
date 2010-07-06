ELMS: Outline Designer - Usability improvements for rapid book outline creation
Copyright (C) 2008-2010  The Pennsylvania State University

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
*This module requires that you have Book enabled, that's it!

INSTALATION
*Place the outline_designer directory in the correct modules folder as you would any other Drupal module
*Activate the module
*Go to admin/content/book/outline_designer and configure your icons 
*Go to admin/content/book/settings to enable / disable content types from outlining and set default type
*Go to admin/content/book and click "edit order and titles" to access the outline designer interface.  

PERMISSIONS
The outline designer is fully compatible with the permissions designated by your drupal site.
There is one permission that needs to be set called "access ajax path" this may seem silly but is nessecary so that the path for submitting ajax requests is protected from the outside world.

COMPATABILITY
No known issues
*Firefox 3+
*Safari 5
*Chrome (latest)
Known Issues
*IE 8 - Collapse / open doesn't work
*Safari 4 - Minor reordering issue (sometimes doesn't register a drag correctly)
*Opera 10 - Minor CSS / JS loadtime issues
*IE 6/7 - JS error, doesn't work