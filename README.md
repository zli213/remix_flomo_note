# Remix flomo notes app

## Project Overview

**Remix flomo notes app** is a full-stack application developed using the Remix framework. It serves as a Tech Demo project for learning and implementing the Remix framework, which is a personal assignment of COMPSCI 732. The goal of this project is to create a note-taking software similar to flomo(<https://flomoapp.com/>). This documentation provides a comprehensive guide for developers, covering the setup process, project structure, and necessary configurations. Due to the original is part of github classroom, the original repo is private. Now I have made it public. I hope this project can help you learn Remix.
![alt text](<CleanShot 2024-06-10 at 18.38.09@2x.png>)

## Welcome to Remix + Vite!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/future/vite) for details on supported features.

## Environment Setup

### Prerequisites

- Node.js version 18.0.0 or higher

### Installation

1. Install the necessary dependencies:

   Using **pnpm**:

   ```bash
   pnpm install
   ```

   Or using **npm**:

   ```bash
   npm install
   ```

2. Initialize Tailwind CSS:
   ```bash
   pnpm exec tailwindcss init -p
   # or
   npx tailwindcss init -p
   ```

### Environment Variables

Create a `.env` file in the project root directory and add the following line:

```plaintext
COOKIES_SECRET = "your_random_string_here"
```

Replace `your_random_string_here` with a strong random string to secure session cookies.

## Available Scripts

In the project directory, you can run:

- **Development Server**

  ```bash
  pnpm run dev
  # or
  npm run dev
  ```

  Starts the server with hot reloading. Open http://localhost:3000 or http://localhost:5173/ to view it in the browser.

- **Build**

  ```bash
  pnpm run build
  # or
  npm run build
  ```

  Builds the application for production usage.

- **Start Production Server**

  ```bash
  pnpm run start
  # or
  npm run start
  ```

  Runs the built application in production mode.

- **Linting**

  ```bash
  pnpm run lint
  # or
  npm run lint
  ```

  Runs ESLint to check for issues.

- **Type Checking**
  ```bash
  pnpm run typecheck
  # or
  npm run typecheck
  ```
  Performs TypeScript type checking.

## Project Structure

- `app/routes`: Contains Remix loaders/actions and React components.
- `app/main.css`: Tailwind CSS directives.
- `prisma/`: Prisma schema for database management and database.db file.
- `public/`: Static assets like images and fonts.

## Database Schema

### Models

#### User

- `id` (UUID): Unique identifier.
- `username` (String): Unique username.
- `email` (String): Email address.
- `avatarUrl` (String?): Optional avatar URL.
- `password` (String): Password.
- `createdAt` (DateTime): Account creation timestamp.

#### Note

- `id` (UUID): Unique identifier.
- `content` (String): Text content.
- `createdAt` (DateTime): Creation timestamp.
- `userId` (String): Creator's user ID.

#### Tag

- `title` (String): Unique tag title.

#### NoteTag

- Composite key: `noteId`, `tagTitle`
- Relationships: Links notes and tags.

### Relationships

- **Users** have multiple **Notes**.
- **Notes** have multiple **Tags** through **NoteTag**.
- **Tags** relate to multiple **Notes** via **NoteTag**.

## Technologies

- **Remix**: Full-stack framework.
- **NextUI**: UI library.
- **Prisma**: ORM tool.
- **Tailwind CSS**: Styling framework.
- **Vite**: Build tool.
- **TypeScript**: Type-safe JavaScript extension.

## Test Account Details

- **Email**: `test@test.com`
- **Password**: `texttest`

---

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`
