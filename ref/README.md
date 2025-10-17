# Chotter Reference Documentation

**Last Updated:** October 17, 2025

This directory contains all reference documents for building the Chotter field service SaaS platform.

---

## 📚 Document Index

### 1. **Product Requirements Document (PRD)**

**File:** `chotter-prd.md`
**Purpose:** Complete product specification including features, user stories, technical architecture, and business model.

**Contents:**

- Executive summary & vision
- User types & access control (Customer, Technician, Admin, Super Admin)
- Feature specifications for all 9 phases
- Tech stack & architecture decisions
- 24-week development timeline
- Subscription billing model (Stripe Billing)
- Payment processing (Stripe Connect Express)
- AI booking agent (ElevenLabs + Twilio)

**When to Reference:**

- Understanding product vision and goals
- Feature requirements and user stories
- Business model and pricing
- Technical architecture decisions

---

### 2. **Data Taxonomy**

**File:** `chotter-taxonomy.md`
**Purpose:** Complete database schema with all tables, fields, relationships, indexes, and RLS policies.

**Contents:**

- Platform-Owner Domain (subscription tiers, billing, usage tracking)
- Business-Level Domain (customers, technicians, tickets, routes)
- Payment tables (Stripe Connect integration)
- AI Agent tables (ElevenLabs conversation tracking)
- Supporting tables (media, notifications, location history)
- All enums and data types
- RLS policy examples
- Performance indexes
- Retention policies

**When to Reference:**

- Designing database migrations
- Understanding data relationships
- Implementing RLS policies
- Writing queries
- Understanding multi-tenancy

---

### 3. **Development Plan (Master)**

**File:** `chotter-dev-plan.md`
**Purpose:** Master orchestration document for Claude Code agents with complete task breakdowns.

**Contents:**

- Project overview & principles
- Monorepo structure (apps, packages, workers)
- Git branching strategy & workflow
- Quality gates & validation approach
- Phase 0: Monorepo & Infrastructure Setup (8 tasks)
- Phase 1: Foundation (14 tasks)
- Task dependency graph
- Agent orchestration guide
- Status tracking system
- Risk register

**When to Reference:**

- Starting development
- Understanding monorepo structure
- Git workflow and branching
- Task dependencies
- Quality gates
- Which agents to use for what tasks

---

### 4. **Development Plan (Phases 2-9)**

**File:** `chotter-dev-plan-phases-2-9.md`
**Purpose:** Continuation of development plan with detailed tasks for remaining phases.

**Contents:**

- Phase 2: Admin Dashboard (12 tasks, 96 hours)
- Phase 3: Technician Mobile App (11 tasks, 88 hours)
- Phase 4-9: To be continued...

**When to Reference:**

- Implementing specific features
- Understanding task sequences
- Estimating timelines
- Planning sprints

---

## 🗺️ How to Use These Documents

### For Project Setup (Week 0)

1. Read `chotter-prd.md` Executive Summary and Tech Stack
2. Review `chotter-dev-plan.md` Monorepo Structure
3. Follow Phase 0 tasks in `chotter-dev-plan.md`

### For Database Development (Week 1-2)

1. Reference `chotter-taxonomy.md` for complete schema
2. Follow Phase 1 database tasks in `chotter-dev-plan.md`
3. Implement RLS policies from `chotter-taxonomy.md`

### For Feature Development (Weeks 3+)

1. Check `chotter-prd.md` for feature requirements
2. Find corresponding phase in `chotter-dev-plan.md` or `chotter-dev-plan-phases-2-9.md`
3. Reference `chotter-taxonomy.md` for data model
4. Follow task-by-task execution with appropriate Claude Code agents

### For Deployment & DevOps

1. Reference deployment sections in `chotter-dev-plan.md`
2. Follow Railway/Vercel configurations
3. Check CI/CD workflows

---

## 📊 Project Statistics

| Metric                    | Value                                        |
| ------------------------- | -------------------------------------------- |
| **Total Duration**        | 24 weeks                                     |
| **Total Phases**          | 10 (Phase 0 + Phases 1-9)                    |
| **Total Tasks**           | 130+ detailed tasks                          |
| **Total Estimated Hours** | ~480 hours                                   |
| **Database Tables**       | 35+ tables                                   |
| **API Endpoints**         | 50+ endpoints                                |
| **Tech Stack Components** | 10+ (Bun, Supabase, Hono, Expo, React, etc.) |

---

## 🎯 Quick Start Guide

### New to the Project?

1. **Read this order:**
   - `README.md` (this file) ← You are here
   - `chotter-prd.md` (Executive Summary & Tech Stack sections)
   - `chotter-dev-plan.md` (Overview & Principles + Monorepo Structure)

2. **Then dive into:**
   - `chotter-taxonomy.md` (skim for understanding)
   - `chotter-dev-plan.md` (Phase 0 detailed tasks)

### Ready to Code?

1. **Start with Phase 0, Task P0.1:**
   - Open `chotter-dev-plan.md`
   - Navigate to "Phase 0: Monorepo & Infrastructure Setup"
   - Execute P0.1 with `backend-architect` agent

2. **Follow the plan sequentially:**
   - Complete all Phase 0 tasks
   - Move to Phase 1
   - Continue through phases

3. **Track progress:**
   - Update task status in plan document
   - Create feature branches as specified
   - Submit PRs for code review by `code-reviewer` agent

---

## 🤖 Claude Code Agent Reference

### Which Agent to Use When

| Task Type        | Primary Agent          | Supporting Agents     |
| ---------------- | ---------------------- | --------------------- |
| Database schema  | `database-architect`   | `security-auditor`    |
| API design       | `backend-architect`    | `code-reviewer`       |
| React UI         | `frontend-developer`   | `ui-visual-validator` |
| Mobile app       | `mobile-developer`     | `test-automator`      |
| TypeScript setup | `typescript-pro`       | `backend-architect`   |
| Security/RLS     | `security-auditor`     | `database-architect`  |
| Testing          | `test-automator`       | `debugger`            |
| Deployment       | `deployment-engineer`  | `debugger`            |
| Performance      | `performance-engineer` | `database-architect`  |

### Code Review Process

Every feature branch should be reviewed by:

1. **Automated checks:** Linting, type-checking, unit tests
2. **`code-reviewer` agent:** Code quality, best practices
3. **Phase-level review:** `security-auditor` for sensitive features

---

## 📝 Document Maintenance

### Updating the Plans

As development progresses, keep these documents updated:

- **Task Status:** Update status field in dev plan (`not_started` → `in_progress` → `completed`)
- **Estimated vs Actual Time:** Record actual time spent for velocity tracking
- **Blocking Reasons:** Document if tasks get blocked
- **New Decisions:** Add to "Notes" section of tasks
- **Schema Changes:** Update `chotter-taxonomy.md` if database changes

### Version History

| Version | Date       | Changes                                        |
| ------- | ---------- | ---------------------------------------------- |
| 1.0     | 2025-10-17 | Initial comprehensive development plan created |

---

## 🚀 Success Criteria

### Phase 0 Complete When:

- [ ] Monorepo structure created
- [ ] All tooling configured
- [ ] Git initialized with branch protection
- [ ] Supabase local and cloud set up
- [ ] Railway and Vercel configured

### Phase 1 Complete When:

- [ ] All database tables created with migrations
- [ ] RLS policies implemented
- [ ] TypeScript types generated
- [ ] Shared packages functional
- [ ] API foundation deployed to staging

### Launch Ready When:

- [ ] All 9 phases complete
- [ ] E2E tests passing
- [ ] Load testing successful
- [ ] Security audit complete
- [ ] Production deployment successful

---

## 💡 Tips for Success

1. **Follow the sequence:** Tasks have dependencies; complete in order
2. **Use the right agent:** Match agent expertise to task type
3. **Write tests:** Don't skip testing tasks
4. **Review code:** Use `code-reviewer` agent on every PR
5. **Track time:** Compare actual vs estimated to improve planning
6. **Document decisions:** Add notes to tasks when making architecture choices
7. **Deploy early:** Use staging environment from Phase 1
8. **Monitor quality gates:** Don't skip validation steps

---

## 📞 Support & Feedback

- **Issues:** Track in `/docs/issues.md` (create if needed)
- **Decisions:** Document in `/docs/decisions/` (ADRs)
- **Changes:** Update this README when structure changes

---

**Ready to build Chotter? Start with Phase 0, Task P0.1 in `chotter-dev-plan.md`!** 🚀
