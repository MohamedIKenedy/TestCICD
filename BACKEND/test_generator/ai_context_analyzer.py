import os
import re
import logging
from typing import Dict, List, Set, Optional
from .ai_client_factory import AIClientFactory

logger = logging.getLogger("ai-context-analyzer")

class AIContextAnalyzer:
    """AI-powered context analyzer for intelligent dependency selection"""
    
    def __init__(self, project_root: str, ai_client=None):
        self.project_root = project_root
        self.ai_client = ai_client
        self.java_files_cache = {}
        
    def analyze_dependencies_with_ai(self, target_file: str, available_files: List[str]) -> Dict[str, any]:
        """Use AI to analyze and rank dependencies intelligently"""
        
        try:
            # Read target file
            with open(target_file, 'r', encoding='utf-8') as f:
                target_content = f.read()
            
            # Get available file contents (limit to reasonable number)
            file_contents = {}
            for file_path in available_files[:20]:  # Limit to prevent token overflow
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if len(content) < 10000:  # Skip very large files
                            file_name = os.path.splitext(os.path.basename(file_path))[0]
                            file_contents[file_name] = content
                except Exception:
                    continue
            
            # Create AI analysis prompt
            analysis_prompt = self._build_ai_analysis_prompt(target_content, file_contents)
            
            # Get AI analysis
            if self.ai_client:
                ai_response = self.ai_client.generate_tests(analysis_prompt)
                return self._parse_ai_response(ai_response, file_contents)
            else:
                logger.warning("No AI client available, falling back to rule-based analysis")
                return self._fallback_analysis(target_content, file_contents)
                
        except Exception as e:
            logger.error(f"Error in AI dependency analysis: {e}")
            return self._fallback_analysis(target_content, {})
    
    def _build_ai_analysis_prompt(self, target_content: str, available_files: Dict[str, str]) -> str:
        """Build prompt for AI dependency analysis"""
        
        target_class_name = self._extract_class_name(target_content)
        
        prompt = f"""# Smart Dependency Analysis for Test Generation

You are an expert Java developer analyzing code dependencies for test generation. 
Analyze the target class and available project files to determine the most important dependencies for generating comprehensive unit tests.

## Target Class to Test:
```java
{target_content}
```

## Available Project Files:
"""
        
        for file_name, content in available_files.items():
            prompt += f"\n### {file_name}.java:\n```java\n{content[:2000]}{'...' if len(content) > 2000 else ''}\n```\n"
        
        prompt += f"""

## Analysis Requirements:

Analyze the target class `{target_class_name}` and rank the available files by importance for test generation. Consider:

1. **Direct Dependencies**: Classes directly imported or referenced
2. **Constructor Parameters**: Classes needed for object creation
3. **Method Parameters**: Classes used in method signatures
4. **Return Types**: Classes returned by methods
5. **Field Types**: Classes used as field types
6. **Service Dependencies**: Classes that are likely mocked (Services, Repositories, DAOs)
7. **Domain Objects**: Model/Entity classes used in business logic
8. **DTOs/Requests**: Request/Response objects used in methods

## Output Format:
Provide your analysis as a JSON object with this exact structure:

```json
{{
  "essential_dependencies": [
    {{
      "file_name": "ClassName",
      "importance_score": 95,
      "reason": "Direct dependency injected in constructor",
      "usage_type": "service_dependency",
      "should_mock": true,
      "constructor_info": "ClassName(param1, param2)"
    }}
  ],
  "useful_dependencies": [
    {{
      "file_name": "ClassName",
      "importance_score": 75,
      "reason": "Used as method parameter",
      "usage_type": "dto",
      "should_mock": false,
      "constructor_info": "ClassName()"
    }}
  ],
  "optional_dependencies": [
    {{
      "file_name": "ClassName",
      "importance_score": 40,
      "reason": "Related domain class",
      "usage_type": "domain_model",
      "should_mock": false,
      "constructor_info": "ClassName(id, name)"
    }}
  ],
  "test_strategy": {{
    "primary_focus": "Test service layer with mocked dependencies",
    "mock_recommendations": ["ServiceClass", "RepositoryClass"],
    "key_test_scenarios": ["Happy path", "Null validation", "Exception handling"]
  }}
}}
```

Analyze now and provide only the JSON response:"""

        return prompt.strip()
    
    def _extract_class_name(self, content: str) -> str:
        """Extract the main class name from Java content"""
        class_pattern = r'(?:public\s+)?class\s+(\w+)'
        match = re.search(class_pattern, content)
        return match.group(1) if match else "UnknownClass"
    
    def _parse_ai_response(self, ai_response: str, file_contents: Dict[str, str]) -> Dict[str, any]:
        """Parse AI response and extract dependency information"""
        try:
            import json
            
            # Extract JSON from response
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = ai_response[json_start:json_end]
                analysis = json.loads(json_str)
                
                # Validate and enhance the analysis
                return self._enhance_ai_analysis(analysis, file_contents)
            else:
                logger.warning("Could not extract JSON from AI response")
                return self._fallback_analysis("", file_contents)
                
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            return self._fallback_analysis("", file_contents)
    
    def _enhance_ai_analysis(self, analysis: Dict, file_contents: Dict[str, str]) -> Dict[str, any]:
        """Enhance AI analysis with additional metadata"""
        
        enhanced = {
            'ai_analysis': analysis,
            'recommended_context': {},
            'mock_strategy': {},
            'constructor_info': {}
        }
        
        # Process essential dependencies first (highest priority)
        for dep in analysis.get('essential_dependencies', []):
            file_name = dep['file_name']
            if file_name in file_contents:
                enhanced['recommended_context'][file_name] = {
                    'content': file_contents[file_name],
                    'priority': 'high',
                    'score': dep['importance_score'],
                    'reason': dep['reason'],
                    'should_mock': dep.get('should_mock', False)
                }
                
                # Extract constructor info
                constructors = self._extract_constructors(file_contents[file_name])
                enhanced['constructor_info'][file_name] = constructors
        
        # Process useful dependencies (only if not already added)
        for dep in analysis.get('useful_dependencies', []):
            file_name = dep['file_name']
            if file_name in file_contents and file_name not in enhanced['recommended_context']:
                enhanced['recommended_context'][file_name] = {
                    'content': file_contents[file_name],
                    'priority': 'medium',
                    'score': dep['importance_score'],
                    'reason': dep['reason'],
                    'should_mock': dep.get('should_mock', False)
                }
        
        # Process optional dependencies (only if not already added)
        for dep in analysis.get('optional_dependencies', []):
            file_name = dep['file_name']
            if file_name in file_contents and file_name not in enhanced['recommended_context']:
                enhanced['recommended_context'][file_name] = {
                    'content': file_contents[file_name],
                    'priority': 'low',
                    'score': dep['importance_score'],
                    'reason': dep['reason'],
                    'should_mock': dep.get('should_mock', False)
                }
        
        # Build mock strategy
        test_strategy = analysis.get('test_strategy', {})
        enhanced['mock_strategy'] = {
            'classes_to_mock': test_strategy.get('mock_recommendations', []),
            'test_focus': test_strategy.get('primary_focus', ''),
            'key_scenarios': test_strategy.get('key_test_scenarios', [])
        }
        
        return enhanced
    
    def _extract_constructors(self, content: str) -> List[Dict[str, any]]:
        """Extract constructor information from Java class"""
        constructors = []
        
        # Find class name
        class_pattern = r'(?:public\s+)?class\s+(\w+)'
        class_match = re.search(class_pattern, content)
        if not class_match:
            return constructors
            
        class_name = class_match.group(1)
        
        # Find constructors
        constructor_pattern = rf'(?:public|protected|private)?\s*{class_name}\s*\(([^)]*)\)'
        constructor_matches = re.finditer(constructor_pattern, content)
        
        for match in constructor_matches:
            params_str = match.group(1).strip()
            params = []
            
            if params_str:
                param_parts = [p.strip() for p in params_str.split(',')]
                for param in param_parts:
                    param_match = re.match(r'([^<\s]+(?:<[^>]+>)?)\s+(\w+)', param.strip())
                    if param_match:
                        params.append({
                            'type': param_match.group(1),
                            'name': param_match.group(2)
                        })
            
            constructors.append({
                'signature': f"{class_name}({params_str})",
                'parameters': params,
                'parameter_count': len(params)
            })
        
        return constructors
    
    def _fallback_analysis(self, target_content: str, file_contents: Dict[str, str]) -> Dict[str, any]:
        """Fallback rule-based analysis when AI is not available"""
        
        recommended_context = {}
        
        # Extract imports and references from target
        imports = self._extract_imports(target_content)
        references = self._extract_class_references(target_content)
        
        all_deps = set(imports + references)
        
        for file_name, content in file_contents.items():
            if file_name in all_deps:
                score = 80 if file_name in imports else 60
                
                # Boost score for common patterns
                if 'Service' in file_name:
                    score += 20
                elif 'Repository' in file_name:
                    score += 15
                elif 'Request' in file_name or 'Response' in file_name:
                    score += 10
                
                recommended_context[file_name] = {
                    'content': content,
                    'priority': 'high' if score > 75 else 'medium',
                    'score': score,
                    'reason': f"Referenced in target class as {file_name}",
                    'should_mock': 'Service' in file_name or 'Repository' in file_name
                }
        
        return {
            'ai_analysis': None,
            'recommended_context': recommended_context,
            'mock_strategy': {
                'classes_to_mock': [name for name, info in recommended_context.items() if info['should_mock']],
                'test_focus': 'Rule-based analysis',
                'key_scenarios': ['Happy path', 'Error cases', 'Edge cases']
            },
            'constructor_info': {name: self._extract_constructors(info['content']) 
                               for name, info in recommended_context.items()}
        }
    
    def _extract_imports(self, content: str) -> List[str]:
        """Extract import statements"""
        import_pattern = r'import\s+(?:static\s+)?([a-zA-Z_][a-zA-Z0-9_.]*);'
        imports = re.findall(import_pattern, content)
        
        project_imports = []
        for imp in imports:
            if not imp.startswith(('java.', 'javax.', 'org.springframework.', 'org.junit.', 'org.mockito.')):
                class_name = imp.split('.')[-1]
                if class_name and class_name != '*':
                    project_imports.append(class_name)
        
        return project_imports
    
    def _extract_class_references(self, content: str) -> List[str]:
        """Extract class references from method signatures, fields, etc."""
        references = set()
        
        patterns = [
            r'(?:private|protected|public)\s+([A-Z][a-zA-Z0-9_]*(?:<[^>]+>)?)\s+\w+',  # Fields
            r'\(\s*([A-Z][a-zA-Z0-9_]*(?:<[^>]+>)?)\s+\w+',  # Method parameters
            r'(?:public|protected|private)\s+([A-Z][a-zA-Z0-9_]*(?:<[^>]+>)?)\s+\w+\s*\(',  # Return types
            r'new\s+([A-Z][a-zA-Z0-9_]*)\s*\('  # Constructor calls
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                clean_type = re.sub(r'<.*?>', '', match)
                if clean_type and clean_type not in ['String', 'Integer', 'Boolean', 'Long', 'Double', 'List', 'Set', 'Map']:
                    references.add(clean_type)
        
        return list(references)

    def generate_enhanced_context_prompt(self, target_file: str, ai_analysis: Dict[str, any]) -> str:
        """Generate enhanced context prompt using AI analysis"""
        
        context_prompt = "## AI-ENHANCED PROJECT CONTEXT:\n\n"
        
        if ai_analysis.get('ai_analysis'):
            context_prompt += "### AI Analysis Summary:\n"
            test_strategy = ai_analysis['ai_analysis'].get('test_strategy', {})
            context_prompt += f"**Test Focus**: {test_strategy.get('primary_focus', 'Comprehensive testing')}\n"
            context_prompt += f"**Key Scenarios**: {', '.join(test_strategy.get('key_test_scenarios', []))}\n\n"
        
        context_prompt += "### Essential Dependencies (High Priority):\n"
        recommended = ai_analysis.get('recommended_context', {})
        
        for class_name, info in recommended.items():
            if info.get('priority') == 'high':
                context_prompt += f"\n#### {class_name} (Score: {info['score']}):\n"
                context_prompt += f"**Reason**: {info['reason']}\n"
                context_prompt += f"**Should Mock**: {info.get('should_mock', False)}\n"
                
                # Add constructor info
                constructors = ai_analysis.get('constructor_info', {}).get(class_name, [])
                if constructors:
                    context_prompt += "**Available Constructors**:\n"
                    for constructor in constructors:
                        context_prompt += f"- {constructor['signature']}\n"
                
                context_prompt += f"```java\n{info['content']}\n```\n"
        
        context_prompt += "\n### Useful Dependencies (Medium Priority):\n"
        for class_name, info in recommended.items():
            if info.get('priority') == 'medium':
                context_prompt += f"\n#### {class_name} (Score: {info['score']}):\n"
                context_prompt += f"**Reason**: {info['reason']}\n"
                context_prompt += f"```java\n{info['content']}\n```\n"
        
        # Add mocking strategy
        mock_strategy = ai_analysis.get('mock_strategy', {})
        if mock_strategy.get('classes_to_mock'):
            context_prompt += f"\n### Recommended Mocking Strategy:\n"
            context_prompt += f"**Classes to Mock**: {', '.join(mock_strategy['classes_to_mock'])}\n"
            context_prompt += f"**Reasoning**: These are service/repository layers that should be mocked for unit testing\n"
        
        return context_prompt
