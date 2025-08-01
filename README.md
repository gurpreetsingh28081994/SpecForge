# SpecForge

SpecForge is an enterprise development suite that helps you transform software requirements into actionable JIRA stories, generate system architecture diagrams, and create comprehensive QA test plans.

## Features
- **JIRA Story Generation:** Upload or paste requirements to generate JIRA epics and user stories with acceptance criteria.
- **Architecture Analysis:** Get architecture diagrams, technology stack recommendations, and deployment strategies.
- **QA Test Plans:** Automatically generate test plans, test cases, and automation strategies.

## Environment Variables

Create a `.env` file in the project root and add the following:

```
VITE_AI_AGENT_URL=http://localhost:8000/ask
```

Replace the URL with your AI agent endpoint as needed.

## Tech Stack
- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm

### Installation
```bash
npm install
```

### Running the App
```bash
npm run dev
```
Visit the local URL shown in the terminal (e.g., http://localhost:5173/).

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Project Structure
- `src/` - Main source code
  - `components/` - React components
  - `utils/` - Analysis logic
  - `types/` - TypeScript types

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
