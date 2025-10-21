# Chotter Documentation

**Last Updated:** October 21, 2025

Welcome to the Chotter documentation hub. This directory contains all technical documentation, setup guides, and reference materials for the Chotter field service management platform.

---

## 📋 Quick Links

### **Current Project Status**
- **[Project Status](./PROJECT_STATUS.md)** - Current development status, phase completion, and next steps

### **Setup & Configuration**
- **[Supabase Setup](./SUPABASE_SETUP.md)** - Initial Supabase project configuration
- **[Auth Setup](./auth-setup.md)** - Authentication system architecture and configuration
- **[Supabase Branching](./SUPABASE_BRANCHING.md)** - Database branching strategy for development
- **[GitHub Secrets Setup](./GITHUB_SECRETS_SETUP.md)** - CI/CD secrets configuration

### **Reference & Guides**
- **[Seed Data](./SEED_DATA.md)** - Test data structure and usage
- **[Quick Reference](./QUICK_REFERENCE.md)** - Common commands and snippets

---

## 📁 Documentation Structure

```
docs/
├── README.md                           # This file
├── PROJECT_STATUS.md                   # Current project status
│
├── Setup & Configuration
│   ├── SUPABASE_SETUP.md              # Supabase initial setup
│   ├── auth-setup.md                  # Auth system documentation
│   ├── SUPABASE_BRANCHING.md          # DB branching strategy
│   └── GITHUB_SECRETS_SETUP.md        # CI/CD configuration
│
├── Reference Materials
│   ├── SEED_DATA.md                   # Test data documentation
│   └── QUICK_REFERENCE.md             # Common commands
│
└── archive/                           # Completed phase documentation
    ├── phase-1/                       # Phase 1 completion reports
    │   ├── PHASE1_COMPLETION_SUMMARY.md
    │   ├── DEPLOYMENT_PHASE1.md
    │   └── auth-testing.md
    └── phase-2/                       # Phase 2 completion reports
        ├── PHASE_2_FINAL_REPORT.md
        ├── P2.5_CUSTOMER_MANAGEMENT_COMPLETION.md
        └── PHASE_2_DEPLOYMENT_GUIDE.md
```

---

## 🚀 Getting Started

### For New Developers

1. **Review Project Status** - Start with [PROJECT_STATUS.md](./PROJECT_STATUS.md) to understand current phase
2. **Set Up Supabase** - Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for database configuration
3. **Configure Auth** - Review [auth-setup.md](./auth-setup.md) to understand authentication
4. **Load Seed Data** - Use [SEED_DATA.md](./SEED_DATA.md) to populate development database
5. **Reference Main Plan** - See `../ref/chotter-dev-plan-phases-2-9.md` for full development roadmap

### For Testing & QA

1. **Seed Data** - [SEED_DATA.md](./SEED_DATA.md) - Test accounts and sample data
2. **Quick Reference** - [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Common testing commands

### For DevOps

1. **Supabase Branching** - [SUPABASE_BRANCHING.md](./SUPABASE_BRANCHING.md) - Database workflow
2. **GitHub Secrets** - [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) - CI/CD configuration

---

## 📊 Current Phase: Phase 3 (Mobile App)

**Status:** 65% Complete (7 of 11 tasks done)
**See:** [PROJECT_STATUS.md](./PROJECT_STATUS.md) for detailed breakdown

### Completed Phases:
- ✅ **Phase 1:** Foundation (Database, Auth, UI Components)
- ✅ **Phase 2:** Admin Dashboard (React, Scheduling, Maps)

### In Progress:
- 🟡 **Phase 3:** Technician Mobile App (Expo, Location Tracking)

---

## 🏗️ Architecture Overview

### Applications
- **Web Admin** (`apps/web-admin`) - React + Vite admin dashboard
- **Mobile Tech** (`apps/mobile-tech`) - Expo mobile app for technicians
- **API** (`apps/api`) - Hono API server
- **Web Customer** (`apps/web-customer`) - Future customer portal

### Infrastructure
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Auth:** Supabase Auth with JWT claims
- **Deployment:** Vercel (web), EAS (mobile)
- **Maps:** Google Maps API
- **Notifications:** Expo Push Notifications

---

## 📝 Documentation Standards

### File Naming Conventions
- **Status Reports:** `PROJECT_STATUS.md`, `PHASE_X_COMPLETE.md`
- **Setup Guides:** `COMPONENT_SETUP.md` (e.g., `SUPABASE_SETUP.md`)
- **Task Reports:** `PX.Y_TASK_NAME_COMPLETION.md`
- **Reference:** `TOPIC_REFERENCE.md`

### Archive Policy
Completed phase documentation is moved to `archive/phase-X/` to keep the main docs directory focused on active work.

---

## 🔗 Related Documentation

- **Main Development Plan:** `../ref/chotter-dev-plan-phases-2-9.md`
- **Git Strategy:** `../GIT_STRATEGY.md`
- **Deployment Guide:** `../DEPLOY.md`
- **Phase 3 Summary:** `../PHASE_3_WEEK1_SUMMARY.md`

---

## 📧 Questions or Issues?

- Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current blockers
- Review archived phase docs for completed work
- See main README at `../README.md` for project overview

---

**Note:** This documentation is actively maintained. Documentation for completed phases is archived but remains accessible for reference.
