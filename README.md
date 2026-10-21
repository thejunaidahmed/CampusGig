# CampusGig

CampusGig is a campus marketplace where students can post short-term gigs, apply to other students’ gigs, manage applications, and review collaborators after work is completed. It includes a React frontend and an Express/MongoDB backend.

## Features

- Register and sign in with an email and password.
- Create gigs offering skills or requesting help.
- Explore gigs and filter listings by category, type, payment method, budget, or search text.
- Apply to open gigs and track application status.
- Manage your own gigs and proposals.
- Accept or reject proposals as a gig owner.
- Complete gigs and leave peer reviews.
- View student profiles, skills, completed gigs, and review ratings.
- Record EasyPaisa/JazzCash payment details for paid gigs.
- Automatically mark overdue open gigs as expired.

## Technology

- **Frontend:** React, Vite, React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT) and bcrypt password hashing

## Requirements

Install Node.js and npm, and have access to a MongoDB database. MongoDB Atlas is supported.

## Run locally

### 1. Configure the backend

Create `server/.env` from the example file:

```powershell
Copy-Item .\server\.env.example .\server\.env
```

EditCopy the following into your `README.md` file:

````markdown
# CampusGig

CampusGig is a campus marketplace where students can post short-term gigs, apply to help with other students’ gigs, and review one another after completing a collaboration.

The project has a React frontend and an Express/Node.js backend. MongoDB stores users, gigs, applications, and reviews.

## Features

- Create an account and sign in with email and password.
- Browse and filter gigs by category, type, payment type, budget, and search term.
- Create gigs and manage your own listings.
- Edit your own gigs while they are open.
- Apply to open gigs and track your application status.
- Accept or reject applications as the gig owner.
- Automatically reject other pending applications when one applicant is accepted.
- Mark a gig as completed after it enters `In Progress`.
- Leave reviews after a gig is completed.
- View student profiles, reviews, and average ratings.
- Mark open gigs as `Expired` after their deadline.

## Technology

**Frontend**
- React
- Vite
- React Router
- Axios
- Tailwind CSS

**Backend**
- Node.js
- Express
- MongoDB and Mongoose
- JWT authentication
- bcryptjs password hashing

## Project structure

```text
CampusGig/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # Shared UI components
│   │   ├── context/        # Authentication state
│   │   └── pages/          # App pages
│   └── package.json
├── server/                 # Express API
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API endpoints
│   ├── utils/              # Shared server utilities
│   ├── .env.example        # Environment variable template
│   └── package.json
└── .gitignore
```

## Requirements

- Node.js and npm
- A MongoDB database, such as a MongoDB Atlas cluster
- Git (optional, for cloning the repository)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/thejunaidahmed/CampusGig.git
cd CampusGig
```

### 2. Configure the backend

Create a local environment file by copying the example:

**Windows PowerShell**
```powershell
Copy-Item server/.env.example server/.env
```

**macOS or Linux**
```bash
cp server/.env.example server/.env
```

Edit `server/.env` and provide your MongoDB connection string and a private JWT secret:

```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=replace-with-a-long-random-secret
```

Keep `server/.env` private. Do not commit database credentials or JWT secrets.

### 3. Install dependencies

```bash
cd server
npm install
cd ../client
npm install
```

### 4. Start the backend

In one terminal:

```bash
cd server
npm run dev
```

The API uses port `5000` by default. On startup, it connects to MongoDB and seeds sample data if the database has no users.

### 5. Start the frontend

In another terminal:

```bash
cd client
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

The client uses `http://localhost:5000` as its default API URL. To use a different API URL, create `client/.env` and set:

```env
VITE_API_URL=http://localhost:5000
```

## Sample accounts

When the database is empty, the server seeds sample users and gigs. The sample login accounts use this pattern:

```text
user1@campus.edu
user2@campus.edu
...
user12@campus.edu
```

The seeded password is:

```text
password123
```

Use these accounts for local development only. Do not use sample credentials in a production deployment.

## Main business rules

- A gig owner cannot apply to their own gig.
- A student can submit only one application per gig. Withdrawing an application does not allow submitting another one for that gig.
- Only the gig owner can accept or reject applicants.
- Accepting one applicant moves the gig to `In Progress` and rejects all other pending applications.
- A gig can be marked `Completed` only after it is `In Progress`.
- Only the owner and the accepted applicant can review one another after the gig is completed.
- Each participant can submit one review per gig. Reviews can be edited or deleted by their author.
- Average ratings are calculated from reviews stored in the database.
- Open gigs past their deadline are marked `Expired` and can no longer receive applications.
- Only the owner can edit an open gig.
- A gig can be deleted only if it has no application or review history and is not actively assigned.

## API overview

The API runs at `http://localhost:5000` by default. Protected endpoints require a valid JWT bearer token, which is returned by registration and login.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Sign in |
| `GET` | `/auth/me` | Get the signed-in user |
| `GET` | `/users` | List users |
| `GET` | `/users/:id` | Get a user profile and rating summary |
| `GET` | `/gigs` | Browse gigs; supports filters |
| `GET` | `/gigs/:id` | Get gig details |
| `POST` | `/gigs` | Create a gig |
| `PUT` | `/gigs/:id` | Edit an open gig owned by the signed-in user |
| `PATCH` | `/gigs/:id` | Accept/reject an applicant or complete a gig |
| `DELETE` | `/gigs/:id` | Delete an eligible gig owned by the signed-in user |
| `POST` | `/applications` | Apply to an open gig |
| `GET` | `/applications` | Get the signed-in user’s applications |
| `PATCH` | `/applications/:id` | Edit a pending application |
| `DELETE` | `/applications/:id` | Withdraw a pending application |
| `GET` | `/reviews` | List reviews; can be filtered by gig or reviewee |
| `POST` | `/reviews` | Submit a review for a completed gig |
| `PATCH` | `/reviews/:id` | Edit your review |
| `DELETE` | `/reviews/:id` | Delete your review |

For protected requests, send the token in the header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Payment note

The app includes EasyPaisa/JazzCash payment fields and a payment UI for demonstration. The current backend records submitted payment details; it does **not** connect to a payment provider or independently verify transactions. Do not treat this as real payment processing.

## Build the frontend

```bash
cd client
npm run build
```

The generated production files are written to `client/dist/`, which is excluded from Git.

## Security and deployment

This project is intended for learning and local development. Before deploying it publicly:

- Use strong, private values for `MONGO_URI` and `JWT_SECRET`.
- Configure CORS to allow only your frontend’s trusted domain.
- Add production-grade validation, rate limiting, and error handling.
- Integrate and verify payments through an official payment provider before representing them as verified.
- Use HTTPS and keep environment files and credentials out of source control.

## License

No license has been specified yet. Contact the repository owner before reusing or distributing this project.
````
