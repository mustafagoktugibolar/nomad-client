# Nomad Client

A visa/travel requirements map application built with React, TypeScript, Vite, and Mapbox GL.

## Features

- Interactive world map showing visa requirements by country
- Filter by travel reason, budget, security level, and season
- Support for multiple Turkish passport types
- Real-time visa requirement visualization

## Setup

### Prerequisites

- Node.js 18+ and npm
- Mapbox access token ([Get one here](https://account.mapbox.com/access-tokens/))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nomad-client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Mapbox access token:
```
VITE_MAPBOX_ACCESS_TOKEN=your_actual_token_here
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Docker

Run with Docker (development):
```bash
npm run docker:dev
```

Run with Docker (production):
```bash
npm run docker:prod
```

## Environment Variables

- `VITE_MAPBOX_ACCESS_TOKEN` - **Required**. Your Mapbox access token for map rendering

## Technology Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Map**: Mapbox GL JS
- **UI Components**: Radix UI

## License

Private
