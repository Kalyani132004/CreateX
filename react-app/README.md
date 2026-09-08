# CreateX — UI/UX System & Frontend Scaffold

This package has two parts:

## 1. `/createx-prototype` — interactive, click-through demo
Pure HTML/CSS/JS (Bootstrap 5), no build step. Open `index.html` in a browser
(or open `createx-demo.html`, the same app bundled into one file).
This is the full design system in action — every page in the brief is real and
clickable: login/register, student + faculty dashboards, add project, search
with filters, project details, the Innovation Assistant, wishlist, feedback,
and both profile pages. Use it to review/approve the design direction before
the React build begins, and as the visual spec for the pages marked "TODO"
in the React scaffold below.

**Design tokens** live in `design-system.css` — colors, radii, shadows,
type scale, spacing, motion. Import this file (or `react-app/src/styles/design-system.css`,
identical) into any new page so styling stays consistent.

## 2. `/react-app` — production React scaffold
Real project structure per the brief: functional components, React Router,
an Axios service layer separated from UI, context for auth/toasts.

```
src/
├── components/       GlassCard, StatCard, ProjectCard, ScoreCard, Badge/Avatar/Rating,
│                      Sidebar, Navbar, EmptyState/Skeleton — all built, all reusable
├── pages/
│   ├── auth/Login.jsx              ✅ fully built (reference for Register.jsx)
│   └── student/InnovationAssistant.jsx  ✅ fully built (flagship AI page)
├── layouts/DashboardLayout.jsx     ✅ sidebar + topbar shell, role-aware guard
├── services/          api.js, authService.js, projectService.js, innovationService.js
├── context/           AuthContext.jsx, ToastContext.jsx
└── App.jsx            route table (remaining routes commented, ready to fill in)
```

### What's fully built
Two pages were taken end-to-end as reference implementations — Login (the
simplest full flow) and Innovation Assistant (the most complex/visually
important page). Every component they depend on (ScoreCard's animated ring,
Badge, Avatar, Rating, EmptyState, Skeleton, Sidebar, Navbar, the Axios
service layer, Auth/Toast context) is production-complete and reused as-is
by the remaining pages.

### What's scaffolded, not yet ported
`Register`, `StudentDashboard`, `MyProjects`, `AddProject`, `SearchProjects`,
`Wishlist`, `FacultyFeedbackList`, `StudentProfile`, `FacultyDashboard`,
`FacultyProjects`, `FacultyStudents`, `FacultyProfile`, and `ProjectDetails`
exist as working, pixel-complete markup inside `/createx-prototype/app.js`
(look for the matching `page*` function, e.g. `pageStudentDashboard`).
Porting one is mechanical: copy that function's returned HTML into a `.jsx`
return statement, replace the inline event listeners with `onClick`/`onChange`
handlers and `useState`, and swap the mock arrays (`data.js`) for calls
through `projectService` / hooks. `App.jsx` already has the route and the
commented import waiting for each — uncomment as you go.

### Design decisions worth knowing
- **Glassmorphism is scoped**, not global — only navbar, hero banners, the
  Innovation Assistant's suggestion panel, modals, and the sidebar-adjacent
  score widget use `.cx-glass`/`.cx-hero`. Ordinary cards use the plain
  `.cx-card` (solid white, hairline border, soft shadow) so content stays
  fully readable — per the brief's "glass should remain readable" rule.
- **Two radii only**: `--r-md` (14px) for content cards, `--r-lg`/`--r-xl`
  for hero/glass surfaces — deliberately not one radius on everything.
- **One accent color, used narrowly**: violet (`--c-accent`) marks AI-driven
  moments only (Innovation Assistant, suggestion icons, wishlist accents).
  Primary indigo (`--c-primary`) carries all standard actions/navigation.
- **Score rings** are the one bold visual move (Innovation Assistant +
  project detail sidebar) — everything else is intentionally quiet.
- **Mobile**: sidebar → Bootstrap Offcanvas drawer; filter panel → bottom
  sheet offcanvas; cards single-column under 576px, 2-up on tablet;
  forms are single-column at every breakpoint by default.
- `prefers-reduced-motion` is respected globally in `design-system.css`.

### Wiring to Django REST
Point `VITE_API_BASE_URL` (`.env`) at your DRF root. All service files in
`src/services/` already expect DRF-shaped responses (`{ token, user }` on
login, paginated list responses, multipart for project creation with
images/docs/video). Adjust field names to match your serializers.
