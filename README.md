# Java Test Case Generator - React Frontend

A modern React frontend for the Java Test Case Generator with Flask backend integration.

## Features

- **Modern React UI**: Built with React 18, TypeScript, and Tailwind CSS
- **File Upload & Management**: Drag-and-drop file upload with project tree visualization
- **Test Generation**: Single file and batch test generation with progress tracking
- **Context-Aware Testing**: Add context files to improve test generation quality
- **Code Fixing**: AI-powered code fixing for compilation errors
- **Test History**: View, edit, and manage generated test cases
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Backend**: Flask (existing backend maintained)
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ with Flask backend running
- Ollama server running locally (for LLM functionality)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Ensure your Flask backend is running on `http://localhost:5000`

### Backend Configuration

The React app expects the Flask backend to be running on `http://localhost:5000`. If your backend runs on a different port, update the `API_BASE_URL` in `src/services/api.ts`.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── FileUpload.tsx
│   ├── FileTree.tsx
│   ├── CodeViewer.tsx
│   ├── ProgressTimeline.tsx
│   ├── BatchProgress.tsx
│   ├── GeneratedFilesList.tsx
│   └── FixerModal.tsx
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── TestHistoryPage.tsx
│   └── ViewTestPage.tsx
├── services/           # API service layer
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── App.tsx             # Main app component
```

## Features Overview

### Home Page
- Upload Java files or ZIP archives
- Select LLM model and testing framework
- Browse uploaded files in an interactive tree
- Add context files for better test generation
- Generate tests for individual files or in batch
- View and manage generated test files

### Test History
- View all previously generated tests
- Search and filter test history
- Bulk delete operations
- Pagination for large datasets

### Test Editor
- View and edit generated test code
- Syntax highlighting and formatting
- Auto-save functionality
- Real-time change tracking

### Code Fixing
- AI-powered error analysis and fixing
- Support for compilation and runtime errors
- Context-aware suggestions

## API Integration

The frontend communicates with the Flask backend through a service layer (`src/services/api.ts`) that handles:

- File uploads and project tree building
- Test generation requests
- Code fixing operations
- Test history management
- CRUD operations for test cases

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Tailwind CSS for styling
- Consistent component structure and naming

## Backend Compatibility

This React frontend is designed to work seamlessly with the existing Flask backend. All API endpoints and data structures are maintained for backward compatibility.

### Required Backend Endpoints

- `POST /upload` - File upload
- `GET /read-file` - Read file content
- `POST /generate-tests` - Generate test cases
- `POST /fix-code` - Fix code errors
- `GET /tests` - Get test history
- `GET /tests/:id` - Get specific test
- `POST /tests/:id` - Update test
- `DELETE /tests/:id` - Delete test

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.