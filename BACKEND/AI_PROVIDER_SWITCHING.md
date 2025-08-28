# AI Provider Switching Guide

This guide explains how to temporarily switch between Ollama and Gemini API for test generation.

## Prerequisites

1. **For Gemini API**: You need a valid Google Gemini API key
   - Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - The API key should look like: `AIzaSyABC123...`

2. **For Ollama**: You need Ollama running locally
   - Default URL: `http://localhost:11434`
   - Make sure your model (e.g., `starchat2:15b`) is pulled and available

## Quick Setup

### Option 1: Using the Switch Script (Recommended)

1. Navigate to the BACKEND directory:
   ```bash
   cd BACKEND
   ```

2. **Switch to Gemini API:**
   ```bash
   python switch_ai_provider.py --gemini --api-key YOUR_GEMINI_API_KEY
   ```

3. **Switch back to Ollama:**
   ```bash
   python switch_ai_provider.py --ollama
   ```

4. **Check current status:**
   ```bash
   python switch_ai_provider.py --status
   ```

### Option 2: Manual Environment Variables

Create a `.env` file in the BACKEND directory:

```env
# For Gemini API
GEMINI_API_KEY=AIzaSyABC123...
USE_GEMINI=true

# For Ollama (comment out USE_GEMINI or set to false)
# USE_GEMINI=false
```

## How It Works

The system automatically detects which AI provider to use based on:

1. **Environment variable `USE_GEMINI`** - explicit override
2. **Presence of `GEMINI_API_KEY`** - auto-switches if API key is available
3. **Default fallback** - uses Ollama if no Gemini configuration found

## Model Mapping

When switching to Gemini, the following model mappings are used:

| Ollama Model | Gemini Model |
|--------------|-------------|
| `starchat2:15b` | `gemini-1.5-flash` |
| `codellama` | `gemini-1.5-flash` |
| `llama2` | `gemini-1.5-flash` |
| `mixtral` | `gemini-1.5-pro` |
| Any other | `gemini-1.5-flash` (default) |

## Testing the Setup

1. **Start your Flask backend:**
   ```bash
   cd BACKEND/flask_backend
   python app.py
   ```

2. **Generate a test** through the web UI or API to verify the AI provider is working

3. **Check the logs** - you should see messages indicating which provider is being used:
   - `"Using Gemini API for test generation"`
   - `"Using Ollama for test generation"`

## Troubleshooting

### Gemini API Issues
- **Invalid API Key**: Check that your API key is correct and active
- **Quota Exceeded**: Verify your Google Cloud billing/quota settings
- **Model Not Found**: Stick to `gemini-1.5-flash` or `gemini-1.5-pro`

### Ollama Issues
- **Connection Failed**: Ensure Ollama is running on `http://localhost:11434`
- **Model Not Available**: Run `ollama pull your-model-name` to download the model

### General Issues
- **Environment Variables Not Loading**: Restart your Flask backend after changing the `.env` file
- **Import Errors**: Install missing dependencies:
  ```bash
  pip install google-generativeai python-dotenv
  ```

## Reverting to Original Setup

To completely revert to the original Ollama-only setup:

1. Remove or rename the `.env` file
2. The system will automatically fall back to Ollama
3. Restart your Flask backend

## Files Modified

- `test_generator/gemini_client.py` - New Gemini API client
- `test_generator/ai_client_factory.py` - Factory to choose AI provider  
- `test_generator/generator.py` - Updated to use AI factory
- `test_generator/fixer.py` - Updated to use AI factory
- `flask_backend/app.py` - Added .env file loading
- `requirements.txt` - Added google-generativeai dependency
- `switch_ai_provider.py` - Utility script for easy switching
