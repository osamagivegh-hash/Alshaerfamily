# System Architecture Redesign - Family Tree Project

## Overview

This document describes the complete system architecture redesign for the Alshaer Family Website, implementing clear separation of responsibilities, dashboards, roles, and backup systems.

## 1. Dashboard Separation

### Family Tree Dashboard
**Route Base:** `/api/dashboard/family-tree`
**Frontend Route:** `/admin/family-tree*`

Dedicated to managing:
- ✅ Family members data (`persons` collection)
- ✅ Tree structure and relationships
- ✅ Lineage records
- ✅ Family Tree specific backups

**Key Features:**
- Independent statistics endpoint
- Separate backup creation and restore
- Audit logging for all operations
- Permission-based access control

### Main CMS Dashboard
**Route Base:** `/api/dashboard/cms`
**Frontend Route:** `/admin/*` (non-family-tree routes)

Manages:
- ✅ News articles
- ✅ Conversations/Interviews
- ✅ General articles
- ✅ Palestine section
- ✅ Photo gallery
- ✅ Contact messages
- ✅ Comments
- ✅ Ticker news
- ✅ Hero slides
- ✅ CMS specific backups

---

## 2. Roles & Permissions (RBAC)

### User Roles

#### Super Admin
- **Full access** to both dashboards
- Can manage users, backups, and system settings
- Can restore backups
- Can delete backups
- Access to audit logs

#### Admin
- Full access to CMS Dashboard
- Can create CMS backups
- Cannot restore or delete backups
- Cannot access user management

#### Editor (Family Tree Editor)
- **Can only be added by Super Admin**
- Access **only** to Family Tree Dashboard
- Can:
  - ✅ Add/edit family members
  - ✅ Update tree structure
  - ✅ Create Family Tree backups
- Cannot:
  - ❌ Delete backups
  - ❌ Restore backups
  - ❌ Access CMS Dashboard
  - ❌ Access user management

### Permission Matrix

| Permission | Super Admin | Admin | Editor (family-tree) |
|------------|-------------|-------|---------------------|
| family-tree | ✅ | ❌ | ✅ |
| news | ✅ | ✅ | ❌ |
| articles | ✅ | ✅ | ❌ |
| conversations | ✅ | ✅ | ❌ |
| palestine | ✅ | ✅ | ❌ |
| gallery | ✅ | ✅ | ❌ |
| contacts | ✅ | ✅ | ❌ |
| settings | ✅ | ✅ | ❌ |
| dev-team | ✅ | ✅ | ❌ |
| Create Backup | ✅ | ✅ CMS only | ✅ FT only |
| Restore Backup | ✅ | ❌ | ❌ |
| Delete Backup | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ |

---

## 3. Backup Strategy

### A. Separate Backups

#### Family Tree Data Backup
**Collection:** `backups` (filtered by `backupType: 'family-tree'`)

Includes:
- All `persons` documents
- Family relationships
- Lineage data
- Metadata and checksums

#### CMS / Main Dashboard Backup
**Collection:** `backups` (filtered by `backupType: 'cms'`)

Includes:
- News articles
- Articles
- Conversations
- Palestine content
- Gallery items
- Contacts
- Comments
- Ticker news (family & palestine)
- Ticker settings
- Hero slides

**Backups are fully isolated** - restoring one type does not affect the other.

### B. Automated Backups

**Schedule:** Every 48 hours (configurable)

**Configuration Collection:** `backup_settings`

```javascript
{
  familyTreeBackup: {
    enabled: true,
    intervalHours: 48,
    maxBackupsToKeep: 20,
    lastAutoBackup: Date,
    nextScheduledBackup: Date
  },
  cmsBackup: {
    enabled: true,
    intervalHours: 48,
    maxBackupsToKeep: 20,
    lastAutoBackup: Date,
    nextScheduledBackup: Date
  }
}
```

**Backup Properties:**
- ✅ Timestamped (ISO 8601)
- ✅ Stored securely in MongoDB
- ✅ Restorable independently
- ✅ Automatic cleanup of old backups

### C. Manual Backup Button

Both dashboards include a **"Create Backup Now"** button that:
1. Immediately generates a full backup
2. Stores in the `backups` collection
3. Includes full metadata and statistics
4. Logs the action in audit trail

---

## 4. MongoDB Backup Requirements

### Collections Structure

```
backups (collection)
├── backupId: String (unique, e.g., "FAMILY-TREE_MANUAL_2024-01-11T15-30-00-000Z_ABC123")
├── backupType: "family-tree" | "cms"
├── triggerType: "auto" | "manual"
├── sourceDashboard: "family-tree-dashboard" | "cms-dashboard" | "system"
├── createdBy: String (username or "system")
├── status: "pending" | "in-progress" | "completed" | "failed"
├── data: Object (full backup data)
├── stats: {
│   totalRecords: Number,
│   collections: [{ name, count }],
│   sizeInBytes: Number
│ }
├── metadata: {
│   mongodbVersion: String,
│   nodeVersion: String,
│   serverTimestamp: Date,
│   checksumSHA256: String
│ }
├── errorInfo: { message, stack, timestamp } (if failed)
├── createdAt: Date
└── completedAt: Date
```

### Naming Convention
- Backup ID format: `{TYPE}_{TRIGGER}_{TIMESTAMP}_{RANDOM}`
- Examples:
  - `FAMILY-TREE_MANUAL_2024-01-11T15-30-00-000Z_XY7K2P`
  - `CMS_AUTO_2024-01-11T03-00-00-000Z_M8N3QR`

---

## 5. Safety & Recovery

### No Backup Overwrites
- Each backup has a unique ID
- Old backups are automatically cleaned up (keeps last N)
- No in-place updates to existing backups

### Restore Restrictions
- **Super Admin only** can restore backups
- Confirmation required (`confirmRestore: true`)
- Pre-restore backup is automatically created

### Confirmation Steps Before Restore
1. Frontend shows warning modal
2. User must explicitly confirm
3. Backend requires `confirmRestore: true` in request body
4. Pre-restore backup is created before proceeding

### Audit Logging

**Collection:** `audit_logs`

All backup and restore actions are logged:
- `BACKUP_CREATED`
- `BACKUP_FAILED`
- `BACKUP_DELETED`
- `BACKUP_CLEANUP`
- `RESTORE_INITIATED`
- `RESTORE_COMPLETED`
- `RESTORE_FAILED`
- `RESTORE_CANCELLED`

**Log Entry Fields:**
- action
- category
- resource
- resourceId (backupId)
- user
- userRole
- ipAddress
- userAgent
- dashboard
- details
- success
- errorMessage
- createdAt

---

## 6. API Endpoints

### Family Tree Dashboard API

```
GET  /api/dashboard/family-tree/stats           - Dashboard statistics
GET  /api/dashboard/family-tree/backups         - List backups
GET  /api/dashboard/family-tree/backups/:id     - Backup details
POST /api/dashboard/family-tree/backups/create  - Create manual backup
POST /api/dashboard/family-tree/backups/:id/restore - Restore (Super Admin)
DELETE /api/dashboard/family-tree/backups/:id   - Delete (Super Admin)
GET  /api/dashboard/family-tree/backup-settings - Get settings (Super Admin)
PUT  /api/dashboard/family-tree/backup-settings - Update settings (Super Admin)
GET  /api/dashboard/family-tree/audit-logs      - Audit logs (Super Admin)
```

### CMS Dashboard API

```
GET  /api/dashboard/cms/stats                   - Dashboard statistics
GET  /api/dashboard/cms/backups                 - List backups
GET  /api/dashboard/cms/backups/:id             - Backup details
POST /api/dashboard/cms/backups/create          - Create manual backup (Admin+)
POST /api/dashboard/cms/backups/:id/restore     - Restore (Super Admin)
DELETE /api/dashboard/cms/backups/:id           - Delete (Super Admin)
GET  /api/dashboard/cms/backup-settings         - Get settings (Super Admin)
PUT  /api/dashboard/cms/backup-settings         - Update settings (Super Admin)
GET  /api/dashboard/cms/audit-logs              - Audit logs (Super Admin)
```

---

## 7. File Structure

### Backend (Server)

```
server/
├── models/
│   ├── Backup.js           # Backup schema
│   ├── AuditLog.js         # Audit log schema
│   ├── BackupSettings.js   # Backup configuration schema
│   └── index.js            # Updated exports
├── routes/
│   ├── familyTreeDashboard.js  # Family Tree Dashboard API
│   └── cmsDashboard.js         # CMS Dashboard API
├── services/
│   └── BackupService.js    # Backup/restore operations
├── jobs/
│   └── backupScheduler.js  # Automated backup scheduler
└── server.js               # Updated with new routes
```

### Frontend (Client)

```
client/src/
├── components/admin/
│   ├── FamilyTreeBackupManager.jsx  # Family Tree backup UI
│   ├── CMSBackupManager.jsx         # CMS backup UI
│   └── AdminLayout.jsx             # Updated navigation
├── utils/
│   └── adminApi.js                 # Updated with dashboard APIs
└── App.jsx                         # Updated with new routes
```

---

## 8. Final Goal Achieved

- ✅ **Two fully independent dashboards** - Family Tree and CMS
- ✅ **Clear role separation** - Super Admin, Admin, Editor
- ✅ **Zero risk of accidental data loss** - Pre-restore backups, confirmations
- ✅ **Reliable automatic + manual backup system** - 48-hour schedules, one-click manual
- ✅ **Scalable and secure architecture** - MongoDB-based, audit-logged

---

## 9. Environment Variables

No new environment variables required. Backup scheduling uses default values that can be modified via the settings API.

---

## 10. Migration Notes

1. The system automatically creates the `backups`, `audit_logs`, and `backup_settings` collections on first use
2. Existing admin users retain their permissions
3. The backup scheduler starts automatically on server startup
4. First backup will be triggered ~10 seconds after server start if none exists

---

*Document created: January 11, 2024*
*Architecture Version: 2.0*
