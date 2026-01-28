Backend (Node + Express + MongoDB + JWT + RBAC)
==============================================

Setup
-----
1) Create `server/.env` using `server/env.example` as a template.
2) Start MongoDB (local or Atlas).
3) Install backend deps:
```bash
cd server
npm install
npm run build
```
4) Start backend:
```bash
npm start
```

From repo root you can also run:
```bash
npm run server
```

API Base
--------
All routes are under `/api`.

Auth
----
- `POST /api/auth/register` { name, email, password, role }
- `POST /api/auth/login` { email, password }

Subscriptions (Students)
-----------------------
- `POST /api/subscriptions/buy-subscription` (JWT required) { plan: weekly|monthly }
  - Weekly: PKR 300, 7 days
  - Monthly: PKR 1000, 30 days
- `GET /api/subscriptions/check-status` (JWT required)

Teacher
-------
- `GET /api/teacher/view-assigned-subjects` (teacher JWT, approved)
- `POST /api/teacher/create-class` (teacher JWT, approved)
- `POST /api/teacher/create-quiz` (teacher JWT, approved)

Student
-------
- `GET /api/student/enrolled-subjects` (student JWT)
- `GET /api/student/available-classes` (student JWT + active subscription)
- `POST /api/student/attempt-quiz` (student JWT + active subscription) { quizId, answers: number[] }
- `GET /api/student/subjects` (student JWT)

Admin
-----
- `POST /api/admin/approve-teacher` (admin JWT) { teacherId, approved }
- `POST /api/admin/assign-subject` (admin JWT) { subjectId, teacherId }
- `GET /api/admin/dashboard-stats` (admin JWT)
- `GET /api/admin/users` (admin JWT)

Notes
-----
- This backend is “ready for frontend integration” (JSON API, JWT auth).
- Teachers must be approved by an admin before creating content.
- Subscription validity is checked on every premium student route.

