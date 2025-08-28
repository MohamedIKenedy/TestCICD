# backend/test_generator/ai_client_factory.py
import os
import logging
from .ollama_client import OllamaClient
from .gemini_client import GeminiClient

logger = logging.getLogger("test-generator")

class AIClientFactory:
    @staticmethod
    def create_client(args=None, use_gemini=None):
        """
        Create an AI client based on configuration.
        
        Args:
            args: Arguments object with model and api_url attributes
            use_gemini: Override to force Gemini usage (for testing)
        
        Returns:
            Either OllamaClient or GeminiClient instance
        """
        # Check if we should use Gemini
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        use_gemini_env = os.getenv('USE_GEMINI', 'false').lower() == 'true'
        
        # Priority: explicit parameter > environment variable > has API key
        should_use_gemini = (
            use_gemini is True or 
            use_gemini_env or 
            (use_gemini is None and gemini_api_key is not None)
        )
        
        if should_use_gemini and gemini_api_key:
            logger.info("Using Gemini API for test generation")
            # Map common model names to Gemini models
            model_name = "gemini-1.5-flash"  # Default Gemini model
            if args and hasattr(args, 'model'):
                model_mapping = {
                    'starchat2:15b': 'gemini-1.5-flash',
                    'codellama': 'gemini-1.5-flash',
                    'llama2': 'gemini-1.5-flash',
                    'mixtral': 'gemini-1.5-pro',
                    'gemini-pro': 'gemini-1.5-pro',
                    'gemini-flash': 'gemini-1.5-flash'
                }
                model_name = model_mapping.get(args.model, 'gemini-1.5-flash')
            
            return GeminiClient(model_name=model_name, api_key=gemini_api_key)
        else:
            logger.info("Using Ollama for test generation")
            if not args:
                raise ValueError("args is required for Ollama client")
            return OllamaClient(model_name=args.model, api_url=args.api_url)
