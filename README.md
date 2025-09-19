# Compliance Procedure Admin Portal

A TypeScript-based admin portal for managing compliance procedures with PostgreSQL database and lightweight frontend.

## Features

- **Admin Authentication**: Secure login for admin users only
- **Team Management**: Create and manage teams
- **Procedure Management**: Track compliance procedures by team
- **Clean UI**: Responsive design with clean, modern interface
- **RESTful API**: Well-structured backend API

## Architecture

- **Backend**: Node.js + TypeScript + Express (Port 8081)
- **Frontend**: HTML + CSS + JavaScript (Port 8080)
- **Database**: PostgreSQL
- **Authentication**: JWT tokens

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm

### 1. Database Setup

Create a PostgreSQL database and run the schema files:

```bash
# Create database
createdb compliance_admin

# Run schema files
psql -d compliance_admin -f schema/001_create_tables.sql
psql -d compliance_admin -f schema/002_seed_data.sql
```

### 2. Backend Setup

#### if running in PP network

make sure that .npmrc file is something like as follows
```bash
cafile=/Users/jhuajun/.certs/cert.pem
registry=https://registry.npmjs.org/
#registry=https://npm.dev.paypalinc.com/
scope=@paypalcorp
@paypalcorp:registry=https://npm.dev.paypalinc.com/
@izettle:registry=https://npm.pkg.github.com/
strict-ssl=true
```

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

The backend will start on http://localhost:8081

### 3. Frontend Setup

```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:8080

### 4. Using Docker (Alternative)

```bash
# Start all services
docker-compose up -d

# The database schema will be automatically loaded
```

## Default Login

- **Username**: admin
- **Password**: admin

## Database Schema

### Tables

1. **users**: User authentication and authorization
   - `id`, `username`, `password`, `role`, `teams`

2. **teams**: Team information
   - `id`, `name`

3. **teams_compliance_procedures**: Compliance procedure tracking
   - `id`, `team_id`, `file_path`, `created_at`, `updated_at`, `status`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Teams
- `GET /api/teams` - List all teams
- `POST /api/teams` - Create new team

### Procedures
- `GET /api/procedures` - List all procedures
- `POST /api/procedures` - Create new procedure
- `PUT /api/procedures/:id` - Update procedure

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Backend
PORT=8081
DB_HOST=localhost
DB_PORT=5432
DB_NAME=compliance_admin
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-jwt-secret-key-here
```

### Port Configuration

- Frontend: Port 8080 (configurable in package.json)
- Backend: Port 8081 (configurable in .env)
- Database: Port 5432 (standard PostgreSQL)

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses ts-node-dev for hot reload
```

### Frontend Development

The frontend uses a simple Python HTTP server. For development:

```bash
cd frontend
python3 -m http.server 8080
```

### Building for Production

```bash
cd backend
npm run build
npm start
```

## Project Structure

```
compliance_procedure_admin/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── types/
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── package.json
│   └── Dockerfile
├── schema/
│   ├── 001_create_tables.sql
│   └── 002_seed_data.sql
├── docker-compose.yml
└── README.md
```

## Security Notes

- Only admin users can access the portal
- JWT tokens expire after 24 hours
- Passwords are hashed using bcrypt
- CORS is enabled for cross-origin requests

## License

MIT