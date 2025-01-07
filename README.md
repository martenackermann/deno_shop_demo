# Deno + Vue CLI Shop

This project consists of a backend built with **Deno** and a frontend built with **Vue CLI**.

## Prerequisites

- [Deno](https://deno.land/)
- [Node.js](https://nodejs.org/)
- [Vue CLI](https://cli.vuejs.org/)

## Setup

### Backend
1. Install Deno (if not already installed):
    ```bash
    curl -fsSL https://deno.land/x/install/install.sh | sh
    ```

### Frontend

1. Navigate to the frontend directory:
    ```bash
    cd <project-directory>/frontend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

## Running the Project

### Manual Start

#### Frontend
1. Navigate to the frontend directory:
    ```bash
    cd <project-directory>/frontend
    ```
2. Start the development server:
    ```bash
    npm run serve
    ```

#### Backend
1. Navigate to the backend directory:
    ```bash
    cd <project-directory>/backend
    ```
2. Start the server:
    ```bash
    deno run --allow-net --allow-read --allow-write --allow-env --unstable-temporal server.ts
    ```

### Automatic Start

To start both the backend and frontend servers, run the `run.bat` file located in the project root directory:
```bash
./run.bat
