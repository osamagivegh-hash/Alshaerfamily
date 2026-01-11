# System Architecture - Isolated Dashboards

## Overview

This document describes the **completely isolated** architecture for the Alshaer Family Website,implementing full separation between the **CMS Dashboard** and **Family Tree Dashboard**.

---

## 🔐 SECURITY ARCHITECTURE

### Two Completely Separate Authentication Systems

| Feature | CMS Dashboard | Family Tree Dashboard |
|---------|--------------|----------------------|
| **Login URL** | `/admin/login` | `/family-dashboard/login` |
| **JWT Secret** | `JWT_SECRET` | `FAMILY_TREE_JWT_SECRET` |
| **User Collection** | `admins` | `family_tree_admins` |
| **Token Storage** | `adminToken` | `familyTreeToken` |
| **Auth Context** | `AdminContext` | `FamilyTreeAuthContext` |
| **Protected Route** | `ProtectedRoute` | `FamilyTreeProtectedRoute` |

### Security Boundaries

✅ **No shared tokens** - Each system uses its own JWT secret  
✅ **No shared users** - Completely separate user collections  
✅ **No cross-authentication** - CMS tokens rejected by FT API  
✅ **No shared sessions** - Independent login states  
✅ **No trust relationship** - Systems operate in isolation  

---

## 👥 ROLES & PERMISSIONS

### CMS Dashboard Roles

| Role | Description | Access |
|------|-------------|--------|
| `super-admin` | Full system access | All CMS features |
| `admin` | Content management | News, Articles, etc. |
| `editor` | Limited editing | Specific permissions |

### Family Tree Dashboard Roles

| Role | Description | Access |
|------|-------------|--------|
| `ft-super-admin` | Full FT Dashboard access | All FT features + user management |
| `ft-editor` | Tree editing | Add/edit members, view tree |

### Family Tree Permissions

| Permission | ft-super-admin | ft-editor |
|------------|----------------|-----------|
| `manage-members` | ✅ | ✅ |
| `manage-tree` | ✅ | ✅ |
| `manage-content` | ✅ | ✅ |
| `create-backups` | ✅ | ✅ |
| `restore-backups` | ✅ | ❌ |
| `manage-users` | ✅ | ❌ |
| `view-audit-logs` | ✅ | ❌ |
| `manage-settings` | ✅ | ❌ |

---

## 🌐 API ENDPOINTS

### CMS Dashboard API

Uses `JWT_SECRET` for authentication via `authenticateToken` middleware.

```
POST /api/admin/login          - CMS login
GET  /api/admin/me             - Current CMS user
POST /api/admin/logout         - CMS logout
...other CMS endpoints...
```

### Family Tree Dashboard API (ISOLATED)

Uses `FAMILY_TREE_JWT_SECRET` for authentication via `authenticateFTToken` middleware.

#### Authentication Routes
```
POST /api/family-tree-auth/login           - FT login
GET  /api/family-tree-auth/me              - Current FT user
GET  /api/family-tree-auth/verify          - Verify token
POST /api/family-tree-auth/logout          - FT logout
PUT  /api/family-tree-auth/change-password - Change password
GET  /api/family-tree-auth/users           - List FT admins (ft-super-admin)
POST /api/family-tree-auth/users           - Create FT admin (ft-super-admin)
PUT  /api/family-tree-auth/users/:id       - Update FT admin (ft-super-admin)
DELETE /api/family-tree-auth/users/:id     - Delete FT admin (ft-super-admin)
```

#### Dashboard Routes
```
GET  /api/dashboard/family-tree/stats          - Dashboard statistics
GET  /api/dashboard/family-tree/persons        - List all persons
GET  /api/dashboard/family-tree/persons/:id    - Get person details
POST /api/dashboard/family-tree/persons        - Create person
PUT  /api/dashboard/family-tree/persons/:id    - Update person
DELETE /api/dashboard/family-tree/persons/:id  - Delete person (ft-super-admin)
GET  /api/dashboard/family-tree/backups        - List backups
POST /api/dashboard/family-tree/backups/create - Create backup
POST /api/dashboard/family-tree/backups/:id/restore - Restore (ft-super-admin)
DELETE /api/dashboard/family-tree/backups/:id  - Delete backup (ft-super-admin)
GET  /api/dashboard/family-tree/audit-logs     - Audit logs (ft-super-admin)
```

---

## 📁 FILE STRUCTURE

### Backend

```
server/
├── models/
│   ├── Admin.js              # CMS admin model
│   ├── FamilyTreeAdmin.js    # FT admin model (SEPARATE)
│   └── index.js              # Model exports
├── middleware/
│   ├── auth.js               # CMS authentication
│   └── familyTreeAuth.js     # FT authentication (SEPARATE)
├── routes/
│   ├── adminMongo.js         # CMS admin routes
│   ├── familyTreeAuth.js     # FT auth routes (SEPARATE)
│   ├── familyTreeDashboard.js # FT dashboard routes (ISOLATED)
│   └── cmsDashboard.js       # CMS dashboard routes
└── server.js                 # Route registration
```

### Frontend

```
client/src/
├── contexts/
│   ├── AdminContext.jsx           # CMS auth context
│   └── FamilyTreeAuthContext.jsx  # FT auth context (SEPARATE)
├── components/
│   ├── admin/
│   │   ├── AdminLogin.jsx         # CMS login
│   │   ├── AdminLayout.jsx        # CMS layout
│   │   ├── ProtectedRoute.jsx     # CMS protected route
│   │   └── FamilyTreeDashboardLayout.jsx # FT layout (uses FT context)
│   └── familyTree/
│       ├── FamilyTreeLogin.jsx    # FT login (SEPARATE)
│       └── FamilyTreeProtectedRoute.jsx # FT protected route (SEPARATE)
└── App.jsx                        # Route configuration
```

---

## 🔑 ENVIRONMENT VARIABLES

Add these to your `.env` file:

```env
# CMS Authentication
JWT_SECRET=your-cms-secret-key-here
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!

# Family Tree Authentication (SEPARATE)
FAMILY_TREE_JWT_SECRET=your-ft-secret-key-here-must-be-different
FAMILY_TREE_ADMIN_USERNAME=ft_admin
FAMILY_TREE_ADMIN_EMAIL=ft_admin@alshaer.family
FAMILY_TREE_ADMIN_PASSWORD=FT_SecurePassword123!
```

---

## 🚀 ACCESS URLS

### Production

| Dashboard | Login URL | Dashboard URL |
|-----------|-----------|---------------|
| **CMS Dashboard** | `https://yoursite.com/admin/login` | `https://yoursite.com/admin/dashboard` |
| **Family Tree Dashboard** | `https://yoursite.com/family-dashboard/login` | `https://yoursite.com/family-dashboard` |

### Development

| Dashboard | Login URL | Dashboard URL |
|-----------|-----------|---------------|
| **CMS Dashboard** | `http://localhost:5173/admin/login` | `http://localhost:5173/admin/dashboard` |
| **Family Tree Dashboard** | `http://localhost:5173/family-dashboard/login` | `http://localhost:5173/family-dashboard` |

---

## 🛡️ SECURITY GUARANTEES

1. **Authentication Isolation**
   - CMS tokens CANNOT access FT API endpoints
   - FT tokens CANNOT access CMS API endpoints
   - Each system verifies token type before processing

2. **Data Isolation**
   - User credentials stored in separate collections
   - No shared session state
   - Independent audit logs

3. **Authorization Isolation**
   - CMS Super Admin has NO access to FT Dashboard
   - FT Super Admin has NO access to CMS Dashboard
   - Permissions are system-specific

4. **Breach Containment**
   - Compromise of CMS does NOT affect FT data
   - Compromise of FT does NOT affect CMS data
   - Each system has its own recovery procedures

---

## 📋 DEFAULT CREDENTIALS

### CMS Dashboard
- **Username:** `admin` (or as configured in .env)
- **Email:** `admin@example.com`
- **Password:** As configured in `ADMIN_PASSWORD`

### Family Tree Dashboard
- **Username:** `ft_admin` (or as configured in .env)
- **Email:** `ft_admin@alshaer.family`
- **Password:** As configured in `FAMILY_TREE_ADMIN_PASSWORD`

⚠️ **IMPORTANT:** Change default passwords immediately after deployment!

---

## 🔄 INITIAL SETUP

On first server start:
1. CMS Super Admin is automatically created from `ADMIN_*` env vars
2. FT Super Admin is automatically created from `FAMILY_TREE_ADMIN_*` env vars
3. Both systems are immediately usable with default credentials

---

*Document Version: 2.0 - Isolated Authentication Architecture*
*Last Updated: January 11, 2024*
