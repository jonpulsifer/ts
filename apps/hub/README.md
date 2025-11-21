# TempestWx Weather Hub

A weather station dashboard designed for the Raspberry Pi 4 display, powered by TempestWx.

## Features

- **Real-time Weather Data**: Connects to TempestWx API to display current weather conditions.
- **Station Display**: Detailed view of weather station metrics.
- **Dashboard**: Overview of key weather information.
- **Kiosk Mode**: Optimized for running as a dedicated display on Raspberry Pi 4.
- **Container Friendly**: Includes endpoints for process management (e.g., restart via `api.exit`).

## Tech Stack

- **Framework**: [React Router 7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js
- TempestWx API Token

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env` file with your TempestWx token:
   ```env
   TEMPESTWX_TOKENS=your_token_here
   ```

### Development

Run the development server:

```bash
pnpm run dev
```

### Build

Build for production:

```bash
pnpm run build
```
