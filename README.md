# Blog API with TypeScript and PostgreSQL

This is a sample backend project for a blog application with authentication and CRUD operations.

## Features

- User registration and login with JWT authentication
- Create, read, update, delete blog posts
- PostgreSQL database using TypeORM ORM
- Built with TypeScript and Express

## Setup

1. Install dependencies:

```
npm install
```

2. Setup PostgreSQL and create database `blogdb`.
3. Update `ormconfig.json` with your PostgreSQL credentials.
4. Start the server (development mode):

```
npm run dev
```

## API Endpoints

- `POST /auth/register` - Register user
- `POST /auth/login` - Login user and get JWT token
- `GET /posts` - Get all posts (public)
- `GET /posts/:id` - Get post by ID (public)
- `POST /posts` - Create new post (auth required)
- `PUT /posts/:id` - Update post (auth required, owner only)
- `DELETE /posts/:id` - Delete post (auth required, owner only)
