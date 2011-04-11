<<<<<<< HEAD
ELMS: Outline Designer - Usability improvements for rapid book outline creation
Copyright (C) 2008-2011  The Pennsylvania State University
=======
ELMS: Outline Designer - Usability improvements for speedy outline creation in Drupal 6.x
Copyright (C) 2008  The Pennsylvania State University
>>>>>>> b47909a96524336200790b408c737b9e758ab0b3

Bryan Ollendyke
bto108@psu.edu

Keith D. Bailey
kdb163@psu.edu

12 Borland
University Park, PA 16802

REQUIREMENTS
*This module requires that you have Book enabled

OPTIONAL
*The Organic Groups add on requires og be installed
*Outline Child Pages will integrate with Book Manager or work stand alone

<<<<<<< HEAD
INSTALLATION
*Place the outline_designer directory in the correct modules folder as you would any other Drupal module
*Activate the module
*Activate the sub-modules (outline_child_pages is highly recommended though it is optional)
*Go to admin/content/book/outline_designer and configure your icons
*Go to admin/content/book/settings to enable / disable content types from outlining and set default type
*Go to admin/content/book and click "edit order and titles" to access the outline designer interface.

OPTIONAL INSTALLATION
*There is an organic groups integration helper module.  Activating it will add a "edit Books" tab to the group home page for group admins.  Group admins can now edit books owned by their group without needing the administer book privilege
*There is an outline child pages module added as of 1.3.  Outline Child Pages can add either a tab or link to nodes that have child pages, allowing you to use the outline designer to reorder JUST the children of the current node.  This can have great benefit when attempting to outline large book structures when you only want to focus on a part of the outline.  Additionally, this module can be used to give users the ability to outline book content that they own by checking that they have the new permission, and can add content to books, and have the ability to update the current node.

PERMISSIONS
The outline designer is fully compatible with the permissions designated by your Drupal site. To access outline designer:

By itself -- Requires 'admin book outlines' permission
w/ outline_designer_og -- requires admin book outlines OR that you are a group admin
w/ just outline_child_pages -- requires admin book outline OR that you are a group admin OR that you have the following three permissions combined:
** new 'outline own pages' permission
** 'add content to books' permission
** have access to update / edit the node you are currently viewing
(If you meet the three criteria you will be allowed to use the outline designer though it will still check for permissions on each action as it always does)

w/ outline_child_pages and book_manager -- requires 'add content to personal books' permission

COMPATIBILITY
No known issues
*Firefox 2+
*Safari 4+
*Chrome
*Opera 10
*IE 7/8

Major Issues
*IE 6 and lower - JS error on load and won't work
=======
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
>>>>>>> b47909a96524336200790b408c737b9e758ab0b3
