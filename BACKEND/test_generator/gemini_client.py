# backend/test_generator/gemini_client.py
import os
import logging

logger = logging.getLogger("test-generator")
TIMEOUT = 300
MAX_RETRIES = 3

class GeminiClient:
    def __init__(self, model_name="gemini-1.5-flash", api_key=None):
        self.model_name = model_name
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        # Try to use the official Google AI library if available
        try:
            import google.generativeai as genai  # type: ignore
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            self.use_official_lib = True
            logger.info(f"Using official Google Generative AI library for {self.model_name}")
        except ImportError:
            # Fallback to HTTP requests
            import requests
            self.requests = requests
            self.api_url = "https://generativelanguage.googleapis.com/v1beta/models"
            self.use_official_lib = False
            logger.info(f"Using HTTP requests for Gemini API (model: {self.model_name})")
        
        self._model_verified = False
    
    def ensure_model_available(self):
        """Ensure the Gemini API is accessible and the model is available."""
        try:
            if self.use_official_lib:
                # Test with official library
                return self._verify_model_official()
            else:
                # Test with HTTP requests
                return self._verify_model_http()
                
        except Exception as e:
            logger.error(f"Gemini API connection error: {e}")
            return False
    
    def _verify_model_official(self):
        """Verify model using official Google AI library."""
        try:
            response = self.model.generate_content("Hello, respond with just 'Hi'")
            if response.text and response.text.strip():
                logger.info(f"Gemini model {self.model_name} verification successful")
                self._model_verified = True
                return True
            else:
                logger.error(f"Gemini model {self.model_name} returned empty response")
                return False
        except Exception as e:
            logger.error(f"Error verifying Gemini model {self.model_name}: {e}")
            return False
    
    def _verify_model_http(self):
        """Verify model using HTTP requests."""
        try:
            headers = {
                'Content-Type': 'application/json',
                'x-goog-api-key': self.api_key
            }
            
            data = {
                "contents": [{
                    "parts": [{"text": "Hello, respond with just 'Hi'"}]
                }],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 10
                }
            }
            
            url = f"{self.api_url}/{self.model_name}:generateContent"
            response = self.requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                response_data = response.json()
                if 'candidates' in response_data and len(response_data['candidates']) > 0:
                    logger.info(f"Gemini model {self.model_name} verification successful")
                    self._model_verified = True
                    return True
                else:
                    logger.error(f"Gemini model {self.model_name} returned invalid response format")
                    return False
            else:
                logger.error(f"Gemini model {self.model_name} verification failed: {response.status_code} {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error verifying Gemini model {self.model_name}: {e}")
            return False
    
    def generate_tests(self, prompt, retries=MAX_RETRIES):
        """Generate tests using the Gemini model."""
        # Ensure model is available and verified before generation
        if not self._model_verified:
            logger.info(f"Gemini model {self.model_name} not yet verified, checking availability...")
            if not self.ensure_model_available():
                logger.error(f"Cannot generate tests: Gemini model {self.model_name} is not available")
                return None
        
        for attempt in range(retries):
            try:
                logger.info(f"Sending prompt to Gemini {self.model_name} (attempt {attempt+1}/{retries})")
                
                if self.use_official_lib:
                    return self._generate_with_official_lib(prompt)
                else:
                    return self._generate_with_http(prompt)
                    
            except Exception as e:
                logger.error(f"Request error on attempt {attempt+1}: {e}")
                if attempt < retries - 1:  # Don't sleep on the last attempt
                    import time
                    time.sleep(2)
        
        logger.error(f"All {retries} generation attempts failed for Gemini model {self.model_name}")
        return None
    
    def _generate_with_official_lib(self, prompt):
        """Generate using official Google AI library."""
        response = self.model.generate_content(prompt)
        if response.text and response.text.strip():
            return response.text.strip()
        else:
            logger.error(f"Empty response from Gemini model {self.model_name}")
            return None
    
    def _generate_with_http(self, prompt):
        """Generate using HTTP requests."""
        headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': self.api_key
        }
        
        url = f"{self.api_url}/{self.model_name}:generateContent"
        
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 8192,
                "topP": 0.95
            }
        }
        
        response = self.requests.post(url, headers=headers, json=data, timeout=TIMEOUT)
        
        if response.status_code == 200:
            response_data = response.json()
            if 'candidates' in response_data and len(response_data['candidates']) > 0:
                candidate = response_data['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    generated_text = candidate['content']['parts'][0].get('text', '').strip()
                    if generated_text:
                        return generated_text
                    else:
                        logger.error(f"Empty response from Gemini model {self.model_name}")
                        return None
                else:
                    logger.error(f"Invalid response structure from Gemini model {self.model_name}")
                    return None
            else:
                logger.error(f"No candidates in response from Gemini model {self.model_name}")
                return None
        elif response.status_code == 400:
            logger.error(f"Bad request to Gemini API: {response.text}")
            return None
        elif response.status_code == 403:
            logger.error(f"Gemini API key authentication failed: {response.text}")
            return None
        else:
            logger.warning(f"Generation failed: {response.status_code} {response.text}")
            return None
    
    def get_model_info(self):
        """Get information about the currently configured Gemini model."""
        if self.use_official_lib:
            return {
                'name': self.model_name,
                'provider': 'Google Gemini',
                'library': 'Official Google Generative AI',
                'api_key_configured': bool(self.api_key)
            }
        else:
            try:
                headers = {'x-goog-api-key': self.api_key}
                response = self.requests.get(f"{self.api_url}/{self.model_name}", headers=headers, timeout=10)
                
                if response.status_code == 200:
                    model_data = response.json()
                    return {
                        'name': model_data.get('name', '').split('/')[-1],
                        'display_name': model_data.get('displayName'),
                        'description': model_data.get('description'),
                        'input_token_limit': model_data.get('inputTokenLimit'),
                        'output_token_limit': model_data.get('outputTokenLimit'),
                        'provider': 'Google Gemini',
                        'library': 'HTTP Requests'
                    }
                else:
                    logger.error(f"Failed to get Gemini model info: {response.status_code}")
                    return None
            except Exception as e:
                logger.error(f"Error getting Gemini model info: {e}")
                return None
