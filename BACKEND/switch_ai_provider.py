#!/usr/bin/env python3
"""
Script to temporarily switch between Ollama and Gemini API for testing.
Usage:
    python switch_ai_provider.py --gemini --api-key YOUR_GEMINI_API_KEY
    python switch_ai_provider.py --ollama
    python switch_ai_provider.py --status
"""

import os
import sys
import argparse
from pathlib import Path

def set_environment_variable(key, value, env_file='.env'):
    """Set environment variable in .env file"""
    env_path = Path(env_file)
    
    # Read existing .env file
    env_vars = {}
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env_vars[k.strip()] = v.strip()
    
    # Update the variable
    env_vars[key] = value
    
    # Write back to .env file
    with open(env_path, 'w') as f:
        for k, v in env_vars.items():
            f.write(f"{k}={v}\n")

def remove_environment_variable(key, env_file='.env'):
    """Remove environment variable from .env file"""
    env_path = Path(env_file)
    
    if not env_path.exists():
        return
    
    # Read existing .env file
    env_vars = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                if k.strip() != key:
                    env_vars[k.strip()] = v.strip()
    
    # Write back to .env file
    with open(env_path, 'w') as f:
        for k, v in env_vars.items():
            f.write(f"{k}={v}\n")

def get_current_status(env_file='.env'):
    """Get current AI provider status"""
    env_path = Path(env_file)
    
    if not env_path.exists():
        return "No .env file found. Using default (Ollama)."
    
    use_gemini = False
    gemini_api_key = None
    
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                if k.strip() == 'USE_GEMINI':
                    use_gemini = v.strip().lower() == 'true'
                elif k.strip() == 'GEMINI_API_KEY':
                    gemini_api_key = v.strip()
    
    if use_gemini and gemini_api_key:
        return f"Currently using: Gemini API (API key: {gemini_api_key[:10]}...)"
    elif gemini_api_key:
        return f"Gemini API key is set but not active. Using: Ollama"
    else:
        return "Currently using: Ollama (default)"

def switch_to_gemini(api_key, env_file='.env'):
    """Switch to Gemini API"""
    if not api_key:
        print("Error: Gemini API key is required!")
        return False
    
    set_environment_variable('GEMINI_API_KEY', api_key, env_file)
    set_environment_variable('USE_GEMINI', 'true', env_file)
    
    print(f"✅ Switched to Gemini API")
    print(f"   API Key: {api_key[:10]}...")
    print(f"   Configuration saved to: {env_file}")
    print("\n⚠️  Note: You may need to restart your Flask backend for changes to take effect.")
    return True

def switch_to_ollama(env_file='.env'):
    """Switch to Ollama"""
    # Keep the API key but disable Gemini
    set_environment_variable('USE_GEMINI', 'false', env_file)
    
    print("✅ Switched to Ollama")
    print(f"   Configuration saved to: {env_file}")
    print("\n⚠️  Note: You may need to restart your Flask backend for changes to take effect.")
    return True

def main():
    parser = argparse.ArgumentParser(description='Switch between Ollama and Gemini API for test generation')
    group = parser.add_mutually_exclusive_group(required=True)
    
    group.add_argument('--gemini', action='store_true', help='Switch to Gemini API')
    group.add_argument('--ollama', action='store_true', help='Switch to Ollama')
    group.add_argument('--status', action='store_true', help='Show current provider status')
    
    parser.add_argument('--api-key', help='Gemini API key (required when using --gemini)')
    parser.add_argument('--env-file', default='.env', help='Path to .env file (default: .env)')
    
    args = parser.parse_args()
    
    if args.status:
        status = get_current_status(args.env_file)
        print(f"Status: {status}")
        return
    
    if args.gemini:
        if not args.api_key:
            # Try to get from environment
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                print("Error: --api-key is required when switching to Gemini")
                print("Usage: python switch_ai_provider.py --gemini --api-key YOUR_API_KEY")
                sys.exit(1)
        else:
            api_key = args.api_key
        
        switch_to_gemini(api_key, args.env_file)
    
    elif args.ollama:
        switch_to_ollama(args.env_file)

if __name__ == '__main__':
    main()
