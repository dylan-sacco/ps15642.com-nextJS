// =============================================================================
// Role & Permission Configuration
// =============================================================================
// Edit ROLES below to change what each role can do.
// Add new permissions to PERMISSIONS first, then reference them in ROLES.
// Do NOT rename or remove existing permission keys — they are referenced
// throughout the codebase. Only add new ones.
// =============================================================================

// Full list of permissions in the system.
export const PERMISSIONS = {

  // ── Blog ────────────────────────────────────────────────────────────────────
  BLOG_VIEW:            'blog.view',            // See the blog list in admin
  BLOG_CREATE:          'blog.create',          // Create new draft posts
  BLOG_EDIT_DRAFT:      'blog.edit.draft',      // Edit unpublished / draft posts
  BLOG_EDIT_PUBLISHED:  'blog.edit.published',  // Edit already-published posts
  BLOG_PUBLISH:         'blog.publish',         // Publish or unpublish posts
  BLOG_DELETE:          'blog.delete',          // Permanently delete posts

  // ── Gallery ─────────────────────────────────────────────────────────────────
  GALLERY_VIEW:   'gallery.view',   // See the gallery manager page
  GALLERY_UPLOAD: 'gallery.upload', // Upload new photos
  GALLERY_EDIT:   'gallery.edit',   // Rename, reorder, hide/show photos
  GALLERY_DELETE: 'gallery.delete', // Permanently delete photos

  // ── Users ───────────────────────────────────────────────────────────────────
  USERS_VIEW:   'users.view',   // See the user list
  USERS_CREATE: 'users.create', // Create users (limited to roles below own level)
  USERS_DELETE: 'users.delete', // Delete users (limited to roles below own level)

  // ── Whitelist ────────────────────────────────────────────────────────────────
  WHITELIST_VIEW:   'whitelist.view',   // See the IP whitelist
  WHITELIST_MANAGE: 'whitelist.manage', // Add or remove IPs from the whitelist

  // ── Backup ───────────────────────────────────────────────────────────────────
  BACKUP_VIEW:   'backup.view',   // See the backup/restore page
  BACKUP_MANAGE: 'backup.manage', // Create, restore, and delete backups

  // ── Contact ──────────────────────────────────────────────────────────────────
  CONTACT_VIEW:   'contact.view',   // See contact form submissions
  CONTACT_DELETE: 'contact.delete', // Delete contact submissions

  // ── Testimonials ─────────────────────────────────────────────────────────────
  TESTIMONIALS_VIEW:   'testimonials.view',   // See testimonials in admin
  TESTIMONIALS_MANAGE: 'testimonials.manage', // Add, edit, delete testimonials

  // ── Quotes ───────────────────────────────────────────────────────────────────
  QUOTES_VIEW:   'quotes.view',   // See quote requests in admin
  QUOTES_DELETE: 'quotes.delete', // Delete quote requests

  // ── Before/After ─────────────────────────────────────────────────────────────
  BEFORE_AFTER_VIEW:   'beforeafter.view',   // See before/after gallery in admin
  BEFORE_AFTER_MANAGE: 'beforeafter.manage', // Add, edit, delete before/after pairs

  // ── Banners ───────────────────────────────────────────────────────────────────
  BANNERS_VIEW:   'banners.view',   // See the banner manager page
  BANNERS_MANAGE: 'banners.manage', // Create, edit, delete banners

  // ── Locations ─────────────────────────────────────────────────────────────────
  LOCATIONS_VIEW:   'locations.view',   // See the locations manager page
  LOCATIONS_CREATE: 'locations.create', // Create new location pages
  LOCATIONS_EDIT:   'locations.edit',   // Edit existing location pages
  LOCATIONS_DELETE: 'locations.delete', // Delete location pages

  // ── Projects ──────────────────────────────────────────────────────────────────
  PROJECTS_VIEW:            'projects.view',            // See the projects list in admin
  PROJECTS_CREATE:          'projects.create',          // Create new draft projects
  PROJECTS_EDIT_DRAFT:      'projects.edit.draft',      // Edit unpublished / draft projects
  PROJECTS_EDIT_PUBLISHED:  'projects.edit.published',  // Edit already-published projects
  PROJECTS_PUBLISH:         'projects.publish',         // Publish or unpublish projects
  PROJECTS_DELETE:          'projects.delete',          // Permanently delete projects

};

// Role definitions.
// `level`       — Hierarchy rank. Higher = more authority.
//                 A role can only create/delete users whose level is strictly lower.
// `permissions` — Array of permission strings from PERMISSIONS above.
//                 Use ['*'] to grant every permission (admin only).
export const ROLES = {

  // ── Editor ───────────────────────────────────────────────────────────────────
  // Can draft and edit unpublished blog. No gallery or user management access.
  editor: {
    label: 'Editor',
    level: 1,
    permissions: [
      'blog.view',
      'blog.create',
      'blog.edit.draft',
      'projects.view',
      'projects.create',
      'projects.edit.draft',
    ],
  },

  // ── Publisher ─────────────────────────────────────────────────────────────────
  // All Editor permissions plus the ability to publish articles and manage photos.
  publisher: {
    label: 'Publisher',
    level: 2,
    permissions: [
      'blog.view',
      'blog.create',
      'blog.edit.draft',
      'blog.edit.published',
      'blog.publish',
      'blog.delete',
      'gallery.view',
      'gallery.upload',
      'gallery.edit',
      'testimonials.view',
      'testimonials.manage',
      'beforeafter.view',
      'beforeafter.manage',
      'locations.view',
      'locations.create',
      'locations.edit',
      'projects.view',
      'projects.create',
      'projects.edit.draft',
      'projects.edit.published',
      'projects.publish',
      'projects.delete',
    ],
  },

  // ── Owner ─────────────────────────────────────────────────────────────────────
  // All Publisher permissions plus full gallery control and user/whitelist management.
  // Owners can only create/delete users at roles below Owner (Editor, Publisher).
  owner: {
    label: 'Owner',
    level: 3,
    permissions: [
      'blog.view',
      'blog.create',
      'blog.edit.draft',
      'blog.edit.published',
      'blog.publish',
      'blog.delete',
      'gallery.view',
      'gallery.upload',
      'gallery.edit',
      'gallery.delete',
      'users.view',
      'users.create',
      'users.delete',
      'whitelist.view',
      'whitelist.manage',
      'backup.view',
      'backup.manage',
      'contact.view',
      'contact.delete',
      'testimonials.view',
      'testimonials.manage',
      'quotes.view',
      'quotes.delete',
      'beforeafter.view',
      'beforeafter.manage',
      'banners.view',
      'banners.manage',
      'locations.view',
      'locations.create',
      'locations.edit',
      'locations.delete',
      'projects.view',
      'projects.create',
      'projects.edit.draft',
      'projects.edit.published',
      'projects.publish',
      'projects.delete',
    ],
  },

  // ── Admin ─────────────────────────────────────────────────────────────────────
  // Unrestricted access to everything including managing Owner accounts.
  admin: {
    label: 'Admin',
    level: 4,
    permissions: ['*'],
  },

};

// Role assigned to the first account created during setup, and used as the
// default when no role is specified.
export const SETUP_ROLE = 'admin';
export const DEFAULT_ROLE = 'editor';
