# Knowly

> A full-stack peer learning platform for discovering skills, connecting learners and instructors, and conducting workshops in public or private learning rooms.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Knowly-000000?style=for-the-badge&logo=vercel)](https://knowly-phi.vercel.app/)

**Live Demo:** https://knowly-phi.vercel.app/

## Overview

Knowly is a full-stack learning and skill-sharing platform built around peer-to-peer knowledge exchange. Users can create profiles, publish skills they can teach, discover instructors, express interest in learning a skill, create and join learning rooms, and organize workshops.

The application separates public learning experiences from room-based collaboration, allowing workshops to be discovered publicly while also supporting private or group-specific learning spaces.

The project is implemented as a React frontend backed by a Spring Boot REST API and a MySQL database, with JWT-based authentication and transactional email support.

## Key Features

### Authentication & Accounts

- User registration and login
- Email OTP verification during registration
- OTP resend flow
- JWT-based authentication
- Role-aware application behavior
- Persistent authentication using browser local storage

### Skills & Profiles

- Create and manage skills
- Edit and remove personal skills
- Browse skills offered by other users
- View public instructor profiles
- Display workshops and reviews associated with instructors
- Express interest in learning a skill
- Track personal interests

### Workshops

- Create workshops for skill-based learning
- Public workshop discovery
- Dedicated **My Workshops** management
- Workshop applications and enrollment management
- Accept or reject learner applications
- View enrolled learners
- Upload and manage workshop learning resources
- Delete workshops with associated application/notification handling
- Search and browse workshops

### Learning Rooms

- Create learning rooms
- Join rooms using invitation codes
- View rooms a user belongs to
- Manage room-specific workshops
- Separate room workshops from public workshop discovery
- Room-owner controls for managing or deleting rooms

### Notifications & Reviews

- In-app notification system
- Notifications for important workshop and room events
- Ratings and reviews for learning experiences
- Featured reviews on public profiles

## Technology Stack

### Frontend

- **React 19**
- **Vite 8**
- **React Router**
- **Tailwind CSS**
- **Axios**
- JavaScript / JSX

### Backend

- **Java 21**
- **Spring Boot 4**
- **Spring Web MVC**
- **Spring Data JPA / Hibernate**
- **Spring Security**
- **JWT (JJWT)**
- **Spring Validation**
- **Springdoc OpenAPI / Swagger UI**
- **Lombok**
- **MySQL Connector/J**

### Infrastructure & Services

- **Vercel** — frontend deployment
- **Render** — backend deployment
- **Aiven MySQL** — managed database
- **Resend** — transactional email delivery

## Architecture

```text
                         ┌──────────────────────┐
                         │      Knowly User     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React + Vite UI    │
                         │      (Vercel)        │
                         └──────────┬───────────┘
                                    │ REST / JSON
                                    ▼
                         ┌──────────────────────┐
                         │   Spring Boot API    │
                         │       (Render)       │
                         └───────┬───────┬──────┘
                                 │       │
                    JPA / JDBC   │       │ Transactional Email
                                 │       │
                                 ▼       ▼
                         ┌────────────┐ ┌────────────┐
                         │   MySQL    │ │   Resend   │
                         │  (Aiven)   │ │    API     │
                         └────────────┘ └────────────┘
```

## Project Structure

```text
knowly/
├── src/
│   └── main/
│       ├── java/com/skillswap/knowly_backend/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── exception/
│       │   ├── repository/
│       │   └── service/
│       └── resources/
│           └── application.properties
│
├── knowly-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vercel.json
│
├── Dockerfile
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

## Getting Started

### Prerequisites

Make sure the following are installed:

- Java 21
- Maven (or use the included Maven Wrapper)
- Node.js and npm
- MySQL 8.x or a compatible MySQL database

### 1. Clone the repository

```bash
git clone https://github.com/nethrashivani/knowly.git
cd knowly
```

### 2. Configure the backend

Create the required environment variables for the Spring Boot application.

| Variable | Required | Description |
|---|---|---|
| `DB_URL` | Yes | MySQL JDBC connection URL |
| `DB_USERNAME` | Yes | MySQL username |
| `DB_PASSWORD` | Yes | MySQL password |
| `JWT_SECRET` | Yes | Secret used to sign JWTs |
| `JWT_EXPIRATION` | Optional | JWT expiration configuration |
| `RESEND_API_KEY` | Optional* | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | Optional | Sender address for transactional email |
| `PORT` | Optional | Server port; defaults to `8080` |

\* Required for email functionality that depends on Resend.

**Never commit real credentials, API keys, JWT secrets, or database passwords to the repository.**

### 3. Run the backend

#### Windows

```powershell
.\mvnw.cmd spring-boot:run
```

#### macOS / Linux

```bash
./mvnw spring-boot:run
```

The backend runs on the configured `PORT`, or `8080` by default.

### 4. Run the frontend

```bash
cd knowly-frontend
npm install
npm run dev
```

Vite will start the frontend development server and provide the local URL in the terminal.

> **Note:** The current frontend service layer points to the deployed Knowly backend API. When developing against a locally running backend, update the frontend API base URLs accordingly.

## API Documentation

The backend includes Springdoc OpenAPI and Swagger UI.

When the backend is running locally, Swagger UI is available at:

```text
http://localhost:8080/swagger-ui.html
```

The OpenAPI specification is available at:

```text
http://localhost:8080/v3/api-docs
```

## Authentication Flow

Knowly uses JWT-based authentication for protected API operations.

```text
Register
   │
   ▼
Email OTP verification
   │
   ▼
Authenticated user
   │
   ▼
Login → JWT token
   │
   ▼
Protected API requests
```

The frontend stores the returned JWT in `localStorage` and uses it for authenticated application flows.

## Deployment

The current deployment architecture is:

| Layer | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Aiven MySQL |
| Email | Resend |

### Frontend

The production frontend is deployed from the `knowly-frontend` directory using Vercel.

### Backend

The Spring Boot backend is deployed from the repository root. The application reads database and authentication configuration from environment variables rather than hard-coding credentials.

### Database

The application uses MySQL through Spring Data JPA/Hibernate. The production database is hosted on Aiven.

## Design Principles

- **Separation of concerns** — frontend, API, persistence, and external services are separated into clear layers.
- **Secure authentication** — protected operations use Spring Security and JWT authentication.
- **Role-aware access** — ownership and participation rules are enforced for skills, workshops, rooms, and applications.
- **Public vs. private learning spaces** — public workshops and room-specific workshops are treated as separate contexts.
- **RESTful communication** — the React client communicates with the backend through HTTP APIs.
- **Environment-based configuration** — deployment secrets and infrastructure configuration are supplied through environment variables.

## Current Scope

Knowly currently focuses on skill discovery and peer learning workflows including:

1. Discovering skills and instructors
2. Building public profiles
3. Expressing interest in learning skills
4. Creating and managing workshops
5. Applying to workshops
6. Managing learners and applications
7. Creating and joining learning rooms
8. Sharing workshop resources
9. Receiving in-app notifications
10. Rating and reviewing learning experiences

## Future Improvements

Potential areas for continued development include:

- Centralized frontend environment configuration for API URLs
- Expanded automated test coverage
- Improved real-time notification delivery
- Richer workshop scheduling and calendar integration
- Enhanced moderation and reporting workflows
- Additional accessibility and UI refinements

## Live Demo

**Knowly:** https://knowly-phi.vercel.app/

## License

This project is currently maintained as a personal project. Licensing terms can be added here if the repository is released under a specific open-source license.

---

Built with React, Spring Boot, MySQL, and a lot of iteration.