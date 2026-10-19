# CreateX — Student Project Innovation & Recommendation System

CreateX is a web-based platform that helps college students submit projects, check idea originality, and receive faculty feedback. It aims to reduce duplicate projects and encourage innovation.

## Features

- Student registration and login using college unique ID.
- JWT authentication with access and refresh tokens.
- Automatic token refresh and session persistence.
- Project similarity checking and Innovation Score.
- Faculty authentication and feedback.

## Technology Stack

- **Frontend:** React, Vite, React Router, Bootstrap Icons
- **Backend:** Python, Django, Django REST Framework
- **Authentication:** Simple JWT
- **Architecture:** Microservices, REST APIs, API Gateway
- **API Testing:** Postman
- **Version Control:** Git, GitHub

## Architecture

```text
React Frontend (:5173)
         |
         v
API Gateway (:8000)
         |
         ├── Auth Service (:8001)
         ├── Project Service (:8002)
         └── ML Service (:8003)
```

## Project Structure

```text
CreateX-microservices/
├── react-app/
├── api-gateway/
├── auth-service/
├── project-service/
├── ml-service/
├── ml-service-v1/
├── postman/
└── README.md
```

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/Kalyani132004/CreateX.git
cd CreateX
```

**2. Set up the Python environment**

```bash
python -m venv venv
```

Windows:

```powershell
.\venv\Scripts\Activate.ps1
pip install django djangorestframework djangorestframework-simplejwt requests django-cors-headers
```

**3. Start the backend services**

Run each service in a separate terminal:

```bash
cd auth-service
python manage.py migrate
python manage.py runserver 8001
```

```bash
cd project-service
python manage.py runserver 8002
```

```bash
cd ml-service
python manage.py runserver 8003
```

```bash
cd api-gateway
python manage.py runserver 8000
```

Use the appropriate startup command if the ML service uses a different framework.

**4. Start the frontend**

```bash
cd react-app
npm install
npm run dev
```

Create `react-app/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Open `http://localhost:5173` in your browser.

## Authentication API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/student/register/` | Student registration |
| POST | `/api/auth/student/login/` | Student login |
| POST | `/api/auth/student/refresh/` | Refresh access token |
| GET | `/api/auth/student/me/` | Get student profile |

