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

  // ── Articles ────────────────────────────────────────────────────────────────
  ARTICLES_VIEW:            'articles.view',            // See the articles list in admin
  ARTICLES_CREATE:          'articles.create',          // Create new draft articles
  ARTICLES_EDIT_DRAFT:      'articles.edit.draft',      // Edit unpublished / draft articles
  ARTICLES_EDIT_PUBLISHED:  'articles.edit.published',  // Edit already-published articles
  ARTICLES_PUBLISH:         'articles.publish',         // Publish or unpublish articles
  ARTICLES_DELETE:          'articles.delete',          // Permanently delete articles

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

};

// Role definitions.
// `level`       — Hierarchy rank. Higher = more authority.
//                 A role can only create/delete users whose level is strictly lower.
// `permissions` — Array of permission strings from PERMISSIONS above.
//                 Use ['*'] to grant every permission (admin only).
export const ROLES = {

  // ── Editor ───────────────────────────────────────────────────────────────────
  // Can draft and edit unpublished articles. No gallery or user management access.
  editor: {
    label: 'Editor',
    level: 1,
    permissions: [
      'articles.view',
      'articles.create',
      'articles.edit.draft',
    ],
  },

  // ── Publisher ─────────────────────────────────────────────────────────────────
  // All Editor permissions plus the ability to publish articles and manage photos.
  publisher: {
    label: 'Publisher',
    level: 2,
    permissions: [
      'articles.view',
      'articles.create',
      'articles.edit.draft',
      'articles.edit.published',
      'articles.publish',
      'articles.delete',
      'gallery.view',
      'gallery.upload',
      'gallery.edit',
    ],
  },

  // ── Owner ─────────────────────────────────────────────────────────────────────
  // All Publisher permissions plus full gallery control and user/whitelist management.
  // Owners can only create/delete users at roles below Owner (Editor, Publisher).
  owner: {
    label: 'Owner',
    level: 3,
    permissions: [
      'articles.view',
      'articles.create',
      'articles.edit.draft',
      'articles.edit.published',
      'articles.publish',
      'articles.delete',
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
