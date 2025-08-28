# AI-Powered Test Generation & Code Assistant Platform

A comprehensive platform that combines AI-powered unit test generation with an intelligent coding assistant, built with React, TypeScript, Python Flask, and modern AI integration.

## 🚀 Features

### 🤖 AI Code Assistant
- **Multi-language Support**: Expert assistance for Java, JavaScript, TypeScript, Python, C#, Go, Rust, and more
- **Intelligent Chat Interface**: Conversation history with persistent storage
- **Markdown Rendering**: Proper syntax highlighting and code block formatting
- **Copy Functionality**: Easy code snippet copying with one click
- **Smart Suggestions**: Context-aware coding recommendations

### 🧪 Test Generation
- **Automated Unit Test Creation**: Generate comprehensive unit tests for Java classes
- **Multiple AI Providers**: Support for both Ollama (local) and Google Gemini API
- **Intelligent Context Analysis**: Analyzes code structure and dependencies
- **Test Quality Metrics**: Coverage insights and recommendations
- **Batch Processing**: Generate tests for multiple files simultaneously

### 📊 Dashboard & Analytics
- **Test History**: Track all generated tests with timestamps
- **Coverage Insights**: Visual coverage reports and improvement suggestions
- **File Management**: Upload, organize, and manage source code files
- **Progress Tracking**: Real-time generation progress with detailed timelines

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Markdown** with syntax highlighting
- **Lucide React** for icons

### Backend
- **Python Flask** RESTful API
- **SQLite** database for data persistence
- **Google Gemini API** for AI capabilities
- **Ollama** support for local AI models

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git**
- **Google Gemini API Key** (recommended) or **Ollama** (for local AI)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/MohamedIKenedy/TestCICD.git
cd TestCICD
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend will be available at `http://localhost:5173`

### 3. Backend Setup
```bash
# Navigate to backend directory
cd BACKEND

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your API keys
```

### 4. Environment Configuration
Create a `.env` file in the `BACKEND` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
USE_GEMINI=true
```

### 5. Start the Backend
```bash
# Run the Flask server
python flask_backend/app.py
```
The backend API will be available at `http://localhost:5005`

## 🔧 Configuration

### AI Provider Setup

#### Option 1: Google Gemini (Recommended)
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set `USE_GEMINI=true` in your `.env` file
3. Add your API key: `GEMINI_API_KEY=your_key_here`

#### Option 2: Local Ollama
1. Install [Ollama](https://ollama.ai/)
2. Pull the required model: `ollama pull starchat2:15b`
3. Set `USE_GEMINI=false` in your `.env` file

### Switch AI Providers
Use the provided script to easily switch between AI providers:
```bash
cd BACKEND
python switch_ai_provider.py
```

## 📁 Project Structure

```
├── src/                          # Frontend React application
│   ├── components/              # Reusable UI components
│   │   ├── ui/                 # Basic UI components
│   │   ├── ChatAssistant.tsx   # AI chat interface
│   │   ├── CodeViewer.tsx      # Code display and editing
│   │   └── ...
│   ├── pages/                  # Application pages
│   │   ├── AssistantPage.tsx   # AI assistant interface
│   │   ├── DashboardPage.tsx   # Main dashboard
│   │   └── ...
│   ├── services/               # API communication
│   └── types/                  # TypeScript type definitions
├── BACKEND/                     # Python Flask backend
│   ├── flask_backend/          # Main Flask application
│   │   ├── app.py             # Flask server entry point
│   │   ├── chat_assistant.py  # AI chat functionality
│   │   └── db.py              # Database operations
│   ├── test_generator/         # Test generation logic
│   └── utils/                  # Utility functions
└── docs/                       # Documentation
```

## 🎯 Usage

### Generating Unit Tests
1. Navigate to the Dashboard
2. Upload your Java source files
3. Select files for test generation
4. Choose your AI provider settings
5. Click "Generate Tests"
6. Review and download generated test files

### Using the Code Assistant
1. Go to the Assistant page
2. Start a conversation by asking coding questions
3. Get help with:
   - Code generation and examples
   - Debugging and optimization
   - Architecture and design patterns
   - Best practices and recommendations

### Features in Detail

#### Smart Code Analysis
- Automatic language detection
- Context-aware suggestions
- Error handling recommendations
- Performance optimization tips

#### Test Quality Assurance
- Comprehensive edge case coverage
- Mock object integration
- Assertion best practices
- Test maintainability guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini API** for powerful AI capabilities
- **Ollama** for local AI model support
- **React** and **TypeScript** communities
- **Flask** and **Python** ecosystems

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/MohamedIKenedy/TestCICD/issues) page
2. Create a new issue with detailed information
3. Include error logs and reproduction steps

---

**Made with ❤️ for developers who love clean code and comprehensive tests**