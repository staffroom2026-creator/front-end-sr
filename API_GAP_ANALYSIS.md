# Staffroom API Gap Analysis

| Feature | Existing | Gap | Required change |
|---|---|---|---|
| Teacher setup/profile | Profile CRUD exists | No authoritative setup state; subjects are comma-separated skills | Add `setup_completed`, normalized `teacher_subjects`, validation, and structured response |
| Applications | Apply, teacher list, school list, status update exist | No rejection message, detail endpoint, pagination, or duplicate-safe database constraint | Add rejection data, detail/list pagination, unique key, and transition validation |
| Jobs | CRUD, open/draft/closed, basic subject/state search | No composable level/location/experience filters or pagination | Add filter query support and pagination metadata |
| Teacher directory | Search and profile endpoint exist | Missing subject/TRCN/range filters, pagination, and school-scoped saved teachers | Add filters, pagination, `saved_teachers` storage, save/unsave/list endpoints |
| Recommendations/alerts | No implementation | Missing deterministic recommendations and alert preferences | Add profile/job matching and `job_alert_preferences` endpoints |
| Notifications | Create/list/mark read exist | No pagination, unread count, delete, related entity metadata, or event deduplication | Add metadata columns, paginated list/count, owner-only read/delete, event keys |
| Email | Legacy email calls exist | Branding/helper methods are incomplete and reset routes are missing | Centralize templates and expose forgot/reset routes |
| Response contracts | JSON helper exists | List responses are unbounded and inconsistent in nested keys | Preserve compatibility while adding pagination and authoritative state fields |
| Authorization | Auth and role middleware exist | Several resource checks rely on loose ID matching | Enforce ownership in model queries and notification/resource mutations |
| Schema integrity | SQL dump contains core tables | Missing uniqueness/indexes and relationship tables | Add forward-only migration with constraints/indexes and preserve existing data |

Implementation is being applied in priority order: core recruitment flow, discovery/preferences, notifications, then supporting documentation and verification.
