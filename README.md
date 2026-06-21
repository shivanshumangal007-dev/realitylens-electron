# RealityLens

RealityLens is an AI-powered desktop application built to effortlessly verify claims and perform screen analysis. Whether it's a news article snippet, a viral social media post, or a political claim, RealityLens helps you fact-check by capturing your screen or analyzing uploaded images and text.

## Features

- **Quick Capture:** Seamlessly capture your screen area with a global shortcut (`CommandOrControl+Shift+L` by default).
- **Text & Image Verification:** Drop a screenshot or type out a claim to verify its authenticity.
- **Smart Overlay:** Provides a transparent overlay that stays on top, giving you instant context and results while maintaining your workflow.
- **Background Mode:** Runs quietly in your system tray without cluttering your dock/taskbar.

## Tech Stack

- **Electron:** Core desktop framework.
- **React & Vite:** Fast and modern UI rendering.
- **Tailwind CSS:** Utility-first styling.
- **Electron Forge:** Packaging and publishing application distributions.

## Backend Services

RealityLens relies on its backend services for AI-driven verification and API endpoints. You can find the backend repository here:
- **Backend Repository:** [RealityLens Backend](https://github.com/hannuverma/RealityLens)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- `npm` or `pnpm`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shivanshumangal007-dev/realitylens-electron
   cd realitylens-electron
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up the environment variables:
   Copy `.env.example` to `.env` and configure your API endpoint.
   ```bash
   cp .env.example .env
   ```

### Development

To start the application in development mode:

```bash
npm start
```

### Packaging & Publishing

To package the application for your local platform:

```bash
npm run package
```

To make distribution files (installers, zips) for your platform:

```bash
npm run make
```

> **Note:** The `forge.config.ts` includes configurations for macOS (`zip`), Windows (`squirrel`), and Linux (`deb`, `rpm`).

## Error Handling

RealityLens is designed with robust error handling to ensure a smooth user experience:
- **Global Error Boundaries:** Catches and manages React component tree crashes without exiting the app.
- **Process Logging:** Uses `electron-log` to capture `uncaughtException` and `unhandledRejection` across the main process (logs saved to the user's AppData).
- **API Wrapper:** Network and server errors are gracefully caught, mapped to human-readable formats, and displayed effectively within the UI.

## License

This project is licensed under the MIT License.
