# backend/test_generator/ollama_client.py
import time
import requests
import logging

logger = logging.getLogger("test-generator")
TIMEOUT = 300
MAX_RETRIES = 3

class OllamaClient:
    def __init__(self, model_name, api_url="http://localhost:11434"):
        if not model_name:
            raise ValueError("model_name is required and cannot be empty")
        self.model_name = model_name
        self.api_url = api_url
        self._model_verified = False
    
    def ensure_model_available(self):
        """Ensure the specified model is available, pulling it if necessary."""
        try:
            response = requests.get(f"{self.api_url}/api/tags")
            if response.status_code == 200:
                models = response.json().get('models', [])
                model_names = [m.get('name') for m in models]
                
                if self.model_name not in model_names:
                    logger.info(f"Model {self.model_name} not found locally. Pulling...")
                    if not self._pull_model():
                        return False
                else:
                    logger.info(f"Model {self.model_name} is already available")
                
                # Verify the model is actually usable
                if self._verify_model():
                    self._model_verified = True
                    return True
                else:
                    logger.error(f"Model {self.model_name} exists but is not usable")
                    return False
            else:
                logger.error(f"Failed to list models: {response.status_code} {response.text}")
                return False
        except requests.RequestException as e:
            logger.error(f"Ollama connection error: {e}")
            return False
    
    def _pull_model(self):
        """Pull the model from Ollama registry."""
        try:
            pull_url = f"{self.api_url}/api/pull"
            logger.info(f"Starting pull for model {self.model_name}...")
            
            pull_response = requests.post(
                pull_url, 
                json={"name": self.model_name},
                timeout=TIMEOUT
            )
            
            if pull_response.status_code != 200:
                logger.error(f"Failed to initiate pull for model {self.model_name}: {pull_response.text}")
                return False
            
            # Wait for pull to complete
            max_wait_time = 600  # 10 minutes
            wait_time = 0
            
            while wait_time < max_wait_time:
                time.sleep(5)
                wait_time += 5
                
                try:
                    status_response = requests.get(f"{self.api_url}/api/tags")
                    if status_response.status_code == 200:
                        models = status_response.json().get('models', [])
                        model_names = [m.get('name') for m in models]
                        if self.model_name in model_names:
                            logger.info(f"Successfully pulled model {self.model_name}")
                            return True
                except requests.RequestException:
                    continue
            
            logger.error(f"Timeout waiting for model {self.model_name} to be pulled")
            return False
            
        except requests.RequestException as e:
            logger.error(f"Error pulling model {self.model_name}: {e}")
            return False
    
    def _verify_model(self):
        """Verify the model is actually usable by sending a simple test prompt."""
        try:
            generation_url = f"{self.api_url}/api/generate"
            test_response = requests.post(
                generation_url,
                json={
                    "model": self.model_name,
                    "prompt": "Hello",
                    "stream": False,
                    "options": {
                        "temperature": 0.2,
                    }
                },
                timeout=30  # Shorter timeout for verification
            )
            
            if test_response.status_code == 200:
                response_data = test_response.json()
                if 'response' in response_data:
                    logger.info(f"Model {self.model_name} verification successful")
                    return True
                else:
                    logger.error(f"Model {self.model_name} returned invalid response format")
                    return False
            else:
                logger.error(f"Model {self.model_name} verification failed: {test_response.status_code} {test_response.text}")
                return False
                
        except requests.RequestException as e:
            logger.error(f"Error verifying model {self.model_name}: {e}")
            return False
    
    def generate_tests(self, prompt, retries=MAX_RETRIES):
        """Generate tests using the specified model."""
        # Ensure model is available and verified before generation
        if not self._model_verified:
            logger.info(f"Model {self.model_name} not yet verified, checking availability...")
            if not self.ensure_model_available():
                logger.error(f"Cannot generate tests: model {self.model_name} is not available")
                return None
        
        generation_url = f"{self.api_url}/api/generate"
        
        for attempt in range(retries):
            try:
                logger.info(f"Sending prompt to {self.model_name} (attempt {attempt+1}/{retries})")
                response = requests.post(
                    generation_url,
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.2,
                            # "top_p": 0.95,
                        }
                    },
                    timeout=TIMEOUT
                )
                
                if response.status_code == 200:
                    response_data = response.json()
                    if 'response' in response_data:
                        return response_data['response'].strip()
                    else:
                        logger.error(f"Invalid response format from model {self.model_name}")
                        return None
                elif response.status_code == 404 and "model" in response.text.lower():
                    logger.error(f"Model {self.model_name} not found on server")
                    self._model_verified = False  # Reset verification status
                    return None
                else:
                    logger.warning(f"Generation attempt {attempt+1} failed: {response.status_code} {response.text}")
                    
                if attempt < retries - 1:  # Don't sleep on the last attempt
                    time.sleep(2)
                    
            except requests.RequestException as e:
                logger.error(f"Request error on attempt {attempt+1}: {e}")
                if attempt < retries - 1:  # Don't sleep on the last attempt
                    time.sleep(2)
        
        logger.error(f"All {retries} generation attempts failed for model {self.model_name}")
        return None
    
    def get_model_info(self):
        """Get information about the currently configured model."""
        try:
            response = requests.get(f"{self.api_url}/api/tags")
            if response.status_code == 200:
                models = response.json().get('models', [])
                for model in models:
                    if model.get('name') == self.model_name:
                        return {
                            'name': model.get('name'),
                            'size': model.get('size'),
                            'modified_at': model.get('modified_at'),
                            'digest': model.get('digest')
                        }
                return None
            else:
                logger.error(f"Failed to get model info: {response.status_code}")
                return None
        except requests.RequestException as e:
            logger.error(f"Error getting model info: {e}")
            return None