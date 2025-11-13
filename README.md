# Entipedia

A modern project management application built with Next.js for managing clients, projects, and files.

## Features

- **Project Management**: Track projects with status (backlog, in-progress, review, completed, archived) and priority levels
- **Client Management**: Manage both individual clients and companies with value tracking
- **File Management**: Upload and manage files with AWS S3 integration
- **Kanban Board**: Visual project board with drag-and-drop functionality
- **Modern UI**: Built with Tailwind CSS and responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **File Storage**: AWS S3
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Drag & Drop**: @hello-pangea/dnd

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- AWS Account with S3 bucket (for file storage)
- AWS credentials (Access Key ID and Secret Access Key)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd entipedia
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your configuration:

```env
# Database Configuration
DATABASE_URL={DATABASE_URL}
ADMIN_DATABASE_URL={ADMIN_DATABASE_URL}
DATABASE_POOL_MAX=10

# AWS S3 Configuration
AWS_REGION={AWS_REGION}
S3_BUCKET_NAME={S3_BUCKET_NAME}

# AWS Credentials
AWS_ACCESS_KEY_ID={AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY={AWS_SECRET_ACCESS_KEY}
```

### 4. Set up the database

Create the database and user:

```bash
npm run db:create
```

Push the database schema:

```bash
npm run db:push
```

(Optional) Seed the database with sample data:

```bash
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run db:create` - Create the database and user
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed` - Seed the database with sample data

## Project Structure

```
entipedia/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── clients/      # Client management pages
│   │   ├── files/        # File management pages
│   │   └── projects/     # Project management pages
│   ├── components/       # Shared React components
│   │   └── layout/       # Layout components
│   ├── db/               # Database configuration and schema
│   ├── features/         # Feature-specific components
│   │   ├── clients/      # Client-related components
│   │   ├── files/        # File-related components
│   │   └── projects/     # Project-related components
│   └── lib/              # Utility functions and helpers
├── scripts/              # Database setup and seeding scripts
├── public/               # Static assets
└── drizzle/              # Generated database migrations
```

## Database Schema

### Projects
- Status: backlog, in-progress, review, completed, archived
- Priority: low, medium, high, critical

### Clients
- Type: person or company
- Tracks value, start/end dates, and active status

### Files
- Stores file metadata and S3 references
- Tracks name, description, MIME type, size, and URL

## AWS S3 Setup

1. Create an S3 bucket in your AWS account
2. Configure bucket permissions for public read access (if needed)
3. Set up IAM user with S3 access permissions
4. Add the bucket name and credentials to your `.env` file

## Development

### Database Migrations

When you modify the schema in `src/db/schema.ts`:

1. Generate migrations: `npm run db:generate`
2. Review the generated migrations in the `drizzle/` directory
3. Push changes: `npm run db:push`

### Database Studio

Access Drizzle Studio to view and edit your database:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:4983` (default port).

