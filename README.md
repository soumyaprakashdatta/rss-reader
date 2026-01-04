# RSS Reader

A modern RSS reader application with a Go backend and React frontend.

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Go](https://golang.org/) 1.21+ (for backend development)
- [Node.js](https://nodejs.org/) 18+ (for frontend development)

---

## Running the Application

### Using Docker Compose (Recommended)

Start all services (database, backend, and frontend) with a single command:

```bash
docker-compose up --build
```

This will start:
- **MySQL Database** on port `3306`
- **Backend API** on port `8080`
- **Frontend** on port `5173`

Access the application at: **http://localhost:5173**

To stop all services:

```bash
docker-compose down
```

To remove all data (including the database volume):

```bash
docker-compose down -v
```

---

## Development

### Database

Start only the MySQL database for local development:

```bash
docker-compose up db
```

Database credentials:
- **Host:** `localhost`
- **Port:** `3306`
- **Database:** `rss_reader`
- **User:** `user`
- **Password:** `password`

### Backend Development

1. Ensure the database is running (see above)

2. Set environment variables:
   ```bash
   export DB_HOST=localhost
   export DB_PORT=3306
   export DB_USER=user
   export DB_PASSWORD=password
   export DB_NAME=rss_reader
   ```

3. Navigate to the backend directory and run the server:
   ```bash
   cd backend
   go run ./cmd/server
   ```

The backend API will be available at **http://localhost:8080**

### Frontend Development

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at **http://localhost:5173** with hot-reload enabled.

### Other Frontend Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Tech Stack

- **Backend:** Go with Chi router
- **Frontend:** React 19 + Vite + Tailwind CSS
- **Database:** MySQL 8.0
- **RSS Parsing:** gofeed library
