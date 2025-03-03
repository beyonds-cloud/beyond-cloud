<div align="center">
<h3 align="center">Beyond Cloud</h3>

  <p align="center">
    Explore the world through AI-powered Street View descriptions and image generation.
    <br />
     <a href="https://github.com/beyonds-cloud/beyond-cloud">github.com/beyonds-cloud/beyond-cloud</a>
  </p>
  <a href="https://github.com/beyonds-cloud/beyond-cloud">
    <img src="https://github.com/beyonds-cloud/beyond-cloud/blob/main/public/logos/png/icon.png" alt="Logo" width="256" height="256">
  </a>
</div>

## Table of Contents

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
      </ul>
    </li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

Beyond Cloud is a web application that allows users to explore the world through Google Street View, enhanced with AI-generated descriptions and image generation. Users can navigate the map, enter Street View, and then use AI to describe the scene and even generate new images based on the description.

### Key Features

- **Interactive Google Maps Integration:** Browse the world and enter Street View at any location.
- **AI-Powered Street View Descriptions:** Generate detailed descriptions of Street View scenes using Google's Vertex AI.
- **AI Image Generation:** Create new images based on the AI-generated descriptions using Google's Imagen API.
- **Prompt Customization:** Add twists to the AI descriptions with predefined styles or custom prompts.
- **User Authentication:** Secure sign-in with Discord.
- **Pro Features:** Reduced timeout for image generation requests for pro users.

## Built With

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [TypeScript](https://www.typescriptlang.org/) - TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapidly building custom designs.
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs made easy.
- [Drizzle ORM](https://orm.drizzle.team/) - Typesafe ORM for SQL databases.
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js.
- [Google Maps Platform](https://developers.google.com/maps) - For interactive maps and Street View.
- [Google Cloud Vertex AI & Imagen API](https://cloud.google.com/vertex-ai) - For AI-powered descriptions and image generation.
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components for building high-quality user interfaces.
- [Lucide React](https://lucide.dev/) - Beautifully simple, pixel-perfect icons.
- [Sonner](https://sonner.emilkowal.ski/) - An opinionated toast component for React.

## Getting Started

To get started with the project, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) version 20 or higher.
- [pnpm](https://pnpm.io/) package manager. Install with:
  ```sh
  npm install -g pnpm
  ```
- Docker (optional, for local database setup).
- Google Cloud SDK (gcloud) (optional, for local Vertex AI/Imagen API access).

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/beyonds-cloud/beyond-cloud.git
    cd beyond-cloud
    ```

2.  Install dependencies:
    ```sh
    pnpm install
    ```

3.  Set up environment variables:

    -   Create a `.env` file based on `.env.example`.
    -   Fill in the required variables, including:
        -   `DATABASE_URL`: PostgreSQL database connection string.
        -   `NEXT_PUBLIC_MAPS_KEY`: Google Maps API key.
        -   `AUTH_SECRET`: NextAuth secret. Generate with `npx auth secret`.
        -   `AUTH_DISCORD_ID`: Discord OAuth client ID.
        -   `AUTH_DISCORD_SECRET`: Discord OAuth client secret.
        -   `GOOGLE_MAPS_SERVER_KEY`: Google Maps server-side API key.
        -   `AUTH_TRUST_HOST`: Set to "true" if running in a trusted environment.

4.  Start the local database (optional, if not using a remote database):

    -   Run the `start-database.sh` script:
        ```sh
        ./start-database.sh
        ```
        -   **Note for Windows users:** This script requires WSL (Windows Subsystem for Linux) and Docker Desktop.

5.  Run database migrations:
    ```sh
    pnpm db:push
    ```

6.  Start the development server:
    ```sh
    pnpm dev
    ```

7.  Open your browser and navigate to `http://localhost:3000`.

## Acknowledgments

- This README was created using [gitreadme.dev](https://gitreadme.dev) — an AI tool that looks at your entire codebase to instantly generate high-quality README files.
