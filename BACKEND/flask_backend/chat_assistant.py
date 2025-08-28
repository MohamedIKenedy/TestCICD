import json
import requests
import os
import re
from datetime import datetime
from typing import List, Dict, Any, Optional

class ChatAssistant:
    def __init__(self):
        self.conversation_history = []
        
        # Check if we should use Gemini
        self.use_gemini = os.getenv('USE_GEMINI', 'false').lower() == 'true'
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        
        # For backwards compatibility, set these attributes
        self.ollama_url = "http://localhost:11434"
        self.model = "starchat2:15b"
        
    def get_coverage_insights(self) -> List[Dict[str, Any]]:
        """Get test coverage insights for the chat assistant"""
        from db import get_coverage_data
        
        coverage_data = get_coverage_data()
        insights = []
        
        for item in coverage_data:
            recommendations = self._generate_recommendations(item)
            missing_tests = self._generate_missing_tests(item)
            
            insights.append({
                'className': item['className'],
                'coverage': item['coverage'],
                'recommendations': recommendations,
                'missingTests': missing_tests
            })
        
        return insights
    
    def _call_ai(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Make a request to the configured AI service (Gemini or Ollama)"""
        if self.use_gemini and self.gemini_api_key:
            return self._call_gemini(prompt, system_prompt)
        else:
            return self._call_ollama_direct(prompt, system_prompt)
    
    def _call_gemini(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Make a request to Gemini API"""
        try:
            # Build the complete prompt
            if system_prompt:
                full_prompt = f"{system_prompt}\n\n{prompt}"
            else:
                full_prompt = prompt
            
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}"
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": full_prompt
                    }]
                }]
            }
            
            response = requests.post(
                url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'candidates' in data and data['candidates']:
                    return data['candidates'][0]['content']['parts'][0]['text']
                else:
                    return "Error: No response from Gemini API"
            else:
                return f"Error: Gemini API returned status {response.status_code}"
                
        except Exception as e:
            return f"Error connecting to Gemini: {str(e)}"
    
    def _call_ollama_direct(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Make a request to Ollama API (fallback)"""
        try:
            messages = []
            
            if system_prompt:
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })
            
            messages.append({
                "role": "user", 
                "content": prompt
            })
            
            payload = {
                "model": self.model,
                "messages": messages,
                "stream": False
            }
            
            response = requests.post(
                f"{self.ollama_url}/api/chat",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()['message']['content']
            else:
                return f"Error: Ollama API returned status {response.status_code}"
                
        except requests.exceptions.RequestException as e:
            return f"Error connecting to Ollama: {str(e)}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def _clean_response_tags(self, response: str) -> str:
        """Clean up any remaining format tags from the response"""
        if not response:
            return ""
            
        cleaned = response.strip()
        
        # Remove structured format tags at the beginning of lines
        format_patterns = [
            r'^\s*EXPLANATION:\s*',
            r'^\s*CODE:\s*',
            r'^\s*LANGUAGE:\s*\w+\s*',
            r'^\s*FILENAME:\s*\S+\s*',
            r'^\s*ORIGINAL:\s*',
            r'^\s*MODIFIED:\s*',
            r'^\s*DIFF:\s*',
            r'^\s*TEXT:\s*',
            r'^\s*File:\s*`[^`]+`\s*',
            r'^\s*\*\*File:\*\*\s*`[^`]+`\s*',
        ]
        
        for pattern in format_patterns:
            cleaned = re.sub(pattern, '', cleaned, flags=re.MULTILINE)
        
        # Remove scattered metadata fragments
        metadata_patterns = [
            r'\*\*File:\*\*\s*`[^`]*`',
            r'File:\s*`[^`]*`',
            r'Language:\s*\w+',
            r'Filename:\s*\S+',
            r'\bTEXT\b(?!\w)',  # Remove standalone "TEXT" words
        ]
        
        for pattern in metadata_patterns:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
        
        # Clean up malformed code blocks and ensure proper formatting
        cleaned = self._fix_code_blocks(cleaned)
        
        # Fix malformed inline code that appears as plain text
        cleaned = self._fix_inline_code_formatting(cleaned)
        
        # Remove excessive whitespace while preserving structure
        cleaned = re.sub(r'\n\s*\n\s*\n+', '\n\n', cleaned)
        cleaned = re.sub(r'^\s+', '', cleaned, flags=re.MULTILINE)  # Remove leading spaces from lines
        cleaned = cleaned.strip()
        
        return cleaned
    
    def _fix_inline_code_formatting(self, text: str) -> str:
        """Fix inline code that appears as plain text without proper markdown"""
        if not text:
            return ""
        
        # Look for programming language keywords followed by code-like content
        # Pattern: "java some_code_here" -> "```java\nsome_code_here\n```"
        patterns = [
            (r'\b(java)\s+((?:import|package|public|class|interface)[^.]*?)(?=\n\n|\n[A-Z][a-z]|\n\*\*|$)', r'```\1\n\2\n```'),
            (r'\b(javascript|js)\s+((?:function|const|let|var|import)[^.]*?)(?=\n\n|\n[A-Z][a-z]|\n\*\*|$)', r'```javascript\n\2\n```'),
            (r'\b(python)\s+((?:def|class|import|from)[^.]*?)(?=\n\n|\n[A-Z][a-z]|\n\*\*|$)', r'```python\n\2\n```'),
            (r'\b(csharp|c#)\s+((?:using|namespace|public|class)[^.]*?)(?=\n\n|\n[A-Z][a-z]|\n\*\*|$)', r'```csharp\n\2\n```'),
            (r'\b(typescript|ts)\s+((?:interface|type|const|function)[^.]*?)(?=\n\n|\n[A-Z][a-z]|\n\*\*|$)', r'```typescript\n\2\n```'),
        ]
        
        for pattern, replacement in patterns:
            text = re.sub(pattern, replacement, text, flags=re.DOTALL | re.IGNORECASE)
        
        return text
    
    def _remove_duplicate_metadata(self, text: str) -> str:
        """Remove duplicate file metadata that might appear at the end of responses"""
        # Remove patterns like "**File:** `filename`" at the end if filename is already mentioned
        lines = text.split('\n')
        cleaned_lines = []
        
        for i, line in enumerate(lines):
            # Check if this line contains file metadata
            if re.match(r'^\*\*File:\*\*\s*`.*`\s*$', line.strip()):
                # Check if filename is already mentioned earlier in the response
                filename_pattern = r'(?://\s*)?[Ff]ilename:\s*(\S+)'
                if any(re.search(filename_pattern, prev_line) for prev_line in lines[:i]):
                    # Skip this duplicate metadata line
                    continue
            
            cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
    def _fix_code_blocks(self, text: str) -> str:
        """Fix common code block formatting issues"""
        if not text:
            return ""
            
        # Fix malformed code blocks
        # Handle cases where code blocks might have broken tags
        text = re.sub(r'```\s*(\w+)?\s*\n+', r'```\1\n', text)  # Fix opening tags
        text = re.sub(r'\n+\s*```\s*\n*', r'\n```\n', text)  # Fix closing tags
        
        # Remove empty code blocks
        text = re.sub(r'```\w*\n\s*```', '', text)
        
        # Handle code that appears inline without proper blocks
        # Look for lines that start with common programming patterns
        lines = text.split('\n')
        result_lines = []
        in_code_block = False
        code_buffer = []
        current_language = None
        
        for line in lines:
            stripped = line.strip()
            
            # Check if we're entering or leaving a proper code block
            if stripped.startswith('```'):
                if in_code_block:
                    # Closing code block
                    result_lines.append(line)
                    in_code_block = False
                    current_language = None
                else:
                    # Opening code block
                    result_lines.append(line)
                    in_code_block = True
                    # Extract language if present
                    lang_match = re.match(r'```(\w+)', stripped)
                    if lang_match:
                        current_language = lang_match.group(1)
                continue
            
            # If we're in a proper code block, just pass through
            if in_code_block:
                result_lines.append(line)
                continue
            
            # Check if this line looks like code that should be in a block
            is_code_line = (
                re.match(r'^(import|package|public|private|class|interface|function|def|var|let|const|#include|using|namespace)\b', stripped) or
                re.match(r'^\s*[{}();]\s*$', stripped) or  # Braces and semicolons
                re.match(r'^\s+[a-zA-Z_]', stripped) or   # Indented code
                ('{' in stripped and ';' in stripped) or  # Code-like content
                re.match(r'^\s*\w+\s*\([^)]*\)\s*[{;]', stripped)  # Function calls/definitions
            )
            
            if is_code_line:
                if not code_buffer:
                    # Start collecting code
                    detected_lang = self._detect_language_from_line(stripped)
                    current_language = detected_lang
                code_buffer.append(line)
            else:
                # Not a code line - flush any code buffer
                if code_buffer:
                    if len(code_buffer) > 1 or any(len(l.strip()) > 30 for l in code_buffer):
                        # Multi-line or substantial single line - make it a code block
                        result_lines.append(f'```{current_language or "text"}')
                        result_lines.extend(code_buffer)
                        result_lines.append('```')
                    else:
                        # Single short line - keep as is
                        result_lines.extend(code_buffer)
                    code_buffer = []
                result_lines.append(line)
        
        # Flush any remaining code buffer
        if code_buffer:
            if len(code_buffer) > 1:
                result_lines.append(f'```{current_language or "text"}')
                result_lines.extend(code_buffer)
                result_lines.append('```')
            else:
                result_lines.extend(code_buffer)
        
        return '\n'.join(result_lines)
    
    def _detect_language_from_line(self, line: str) -> str:
        """Detect programming language from a single line of code"""
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in ['import java', 'public class', 'public static void']):
            return 'java'
        elif any(keyword in line_lower for keyword in ['function', 'const', 'let', '=> {']):
            return 'javascript'
        elif any(keyword in line_lower for keyword in ['def ', 'import ', 'from ', 'class ']):
            return 'python'
        elif any(keyword in line_lower for keyword in ['using ', 'namespace', 'public class']):
            return 'csharp'
        elif any(keyword in line_lower for keyword in ['#include', 'int main', 'std::']):
            return 'cpp'
        elif any(keyword in line_lower for keyword in ['package ', 'func ', 'var ']):
            return 'go'
        elif any(keyword in line_lower for keyword in ['fn ', 'let mut', 'struct ']):
            return 'rust'
        else:
            return 'text'
    
    def _generate_recommendations(self, coverage_item: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on coverage data using AI"""
        coverage = coverage_item['coverage']
        class_name = coverage_item['className']
        
        system_prompt = """You are a software testing expert. Analyze the test coverage data and provide exactly 3 specific, actionable recommendations for improving test coverage. Each recommendation should be under 60 characters and focus on practical testing advice. Return only the recommendations, one per line, without numbers or bullet points."""
        
        prompt = f"""Class: {class_name}
Current Coverage: {coverage}%

Provide 3 brief recommendations to improve test coverage for this class:"""
        
        response = self._call_ai(prompt, system_prompt)
        
        # Parse response into list
        recommendations = []
        for line in response.strip().split('\n'):
            clean_line = line.strip()
            if clean_line and not clean_line.startswith('Error'):
                recommendations.append(clean_line)
        
        return recommendations[:3] if recommendations else ["Add unit tests", "Test edge cases", "Improve coverage"]
    
    def _generate_missing_tests(self, coverage_item: Dict[str, Any]) -> List[str]:
        """Generate list of potentially missing tests using AI"""
        coverage = coverage_item['coverage']
        class_name = coverage_item['className']
        
        system_prompt = """You are a testing expert. Generate exactly 4 specific test method names that are likely missing for the given class. Use camelCase naming convention starting with 'test'. Focus on common testing patterns like constructor, null handling, edge cases, and error conditions. Return only the test method names, one per line, without numbers or bullet points."""
        
        prompt = f"""Class: {class_name}
Current Coverage: {coverage}%

Generate 4 missing test method names for this class:"""
        
        response = self._call_ai(prompt, system_prompt)
        
        # Parse response into list
        missing_tests = []
        for line in response.strip().split('\n'):
            clean_line = line.strip()
            if clean_line and not clean_line.startswith('Error'):
                missing_tests.append(clean_line)
        
        return missing_tests[:4] if missing_tests else [f"test{class_name}Constructor", f"test{class_name}NullInput", f"test{class_name}EdgeCases", f"test{class_name}ErrorHandling"]
    
    def process_message(self, message: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process a chat message and return a response"""
        # Store conversation
        self.conversation_history.append({
            'type': 'user',
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        
        response = self._generate_response(message, context)
        
        # Store assistant response
        self.conversation_history.append({
            'type': 'assistant',
            'message': response['message'],
            'timestamp': datetime.now().isoformat()
        })
        
        return response
    
    def _generate_response(self, message: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate response using AI service"""
        
        # Prepare context information
        context_info = ""
        if context:
            total_classes = len(context)
            avg_coverage = sum(c['coverage'] for c in context) / total_classes
            high_coverage = len([c for c in context if c['coverage'] >= 80])
            low_coverage = len([c for c in context if c['coverage'] < 50])
            
            context_info = f"""
Current project statistics:
- Total classes: {total_classes}
- Average coverage: {avg_coverage:.1f}%
- Well tested classes (80%+): {high_coverage}
- Classes needing attention (<50%): {low_coverage}
"""
            
            if low_coverage > 0:
                lowest_classes = sorted(context, key=lambda x: x['coverage'])[:3]
                class_list = ', '.join([f"{c['className']} ({c['coverage']}%)" for c in lowest_classes])
                context_info += f"- Lowest coverage classes: {class_list}"
        
        system_prompt = """You are a helpful test coverage assistant. You help developers improve their software testing and test coverage. 

Guidelines:
- Provide practical, actionable advice
- Be encouraging and supportive
- Focus on testing best practices
- Keep responses conversational and helpful
- Include specific suggestions when possible
- Use emojis sparingly for better readability

Always end your response with exactly 3 follow-up suggestions in this format:
SUGGESTIONS:
1. [suggestion 1]
2. [suggestion 2] 
3. [suggestion 3]"""
        
        prompt = f"""User message: {message}

Project context: {context_info}

Provide a helpful response about test coverage and testing practices."""
        
        response = self._call_ai(prompt, system_prompt)
        
        # Parse response and suggestions
        if "SUGGESTIONS:" in response:
            parts = response.split("SUGGESTIONS:")
            message_part = parts[0].strip()
            suggestions_part = parts[1].strip()
            
            # Extract suggestions
            suggestions = []
            for line in suggestions_part.split('\n'):
                clean_line = line.strip()
                if clean_line and (clean_line.startswith('1.') or clean_line.startswith('2.') or clean_line.startswith('3.')):
                    suggestion = clean_line[2:].strip()
                    suggestions.append(suggestion)
            
            return {
                'message': message_part,
                'suggestions': suggestions[:3] if suggestions else self._get_default_suggestions()
            }
        else:
            return {
                'message': response,
                'suggestions': self._get_default_suggestions()
            }
    
    def _get_default_suggestions(self) -> List[str]:
        """Default suggestions if parsing fails"""
        return [
            'Help me debug this code',
            'Explain this code to me',
            'How can I optimize this?',
            'Generate a function for...',
            'Review my code for issues',
            'Show me best practices for...'
        ]
    
    def process_code_message(self, message: str, current_file: str = "", selected_code: str = "", 
                           project_files: List[str] = None, database_context: Dict[str, Any] = None,
                           conversation_history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process enhanced code-focused chat messages"""
        
        if project_files is None:
            project_files = []
        if conversation_history is None:
            conversation_history = []
        
        # Build comprehensive context
        context_info = []
        
        if current_file:
            context_info.append(f"Current file: {current_file}")
        
        if selected_code:
            context_info.append(f"Selected code:\n```\n{selected_code}\n```")
        
        if project_files:
            context_info.append(f"Project files: {', '.join(project_files[:10])}")
        
        if database_context:
            stats = database_context.get('stats', {})
            recent_files = database_context.get('recent_tests', [])
            
            if stats:
                context_info.append(f"Project stats: {stats.get('totalTests', 0)} total files processed, "
                                  f"{stats.get('successfulTests', 0)} successful, "
                                  f"{stats.get('failedTests', 0)} failed")
            
            if recent_files:
                context_info.append(f"Recent files: {', '.join([item.get('java_file', item.get('file_name', '')) for item in recent_files[:5]])}")
        
        # Add conversation history for context
        if conversation_history:
            history_context = "Recent conversation:\n"
            for msg in conversation_history[-3:]:  # Last 3 messages
                role = msg.get('role', 'user')
                content = msg.get('content', '')[:100] + ('...' if len(msg.get('content', '')) > 100 else '')
                history_context += f"{role}: {content}\n"
            context_info.append(history_context)
        
        return self._generate_code_response(message, context_info)
    
    def _generate_code_response(self, message: str, context_info: List[str]) -> Dict[str, Any]:
        """Generate response for code-focused queries"""
        
        # Simplified system prompt - just ask for clean, helpful responses
        system_prompt = """You are an expert software developer and coding assistant with expertise in ALL programming languages and technologies.

Provide clear, helpful responses that include:
- Explanations of concepts and solutions
- Clean, well-commented code examples when relevant
- Best practices and considerations
- Proper markdown formatting for code blocks (use ```language for syntax highlighting)

Keep responses well-structured and easy to read. Use markdown formatting appropriately.
Do not include any metadata tags, file labels, or formatting instructions in your response.
Just provide clean, helpful content that directly answers the user's question."""
        
        # Build the full prompt
        context_text = "\n".join(context_info) if context_info else "No additional context provided."
        
        full_prompt = f"""Context:
{context_text}

User Question: {message}

Please provide a helpful response based on the context and question."""
        
        try:
            # Get the raw AI response
            raw_response = self._call_ai(full_prompt, system_prompt)
            
            if not raw_response or raw_response.startswith("Error"):
                return {
                    'message': raw_response or "Sorry, I couldn't generate a response. Please try again.",
                    'suggestions': self._get_code_suggestions(message)
                }
            
            # Clean the response thoroughly
            cleaned_response = self._clean_response_tags(raw_response)
            
            # Extract code blocks if present
            code_blocks = self._extract_code_blocks(cleaned_response)
            
            if code_blocks:
                # If we found code blocks, return the response with code snippet info
                main_code = code_blocks[0]  # Use the first/main code block
                return {
                    'message': cleaned_response,
                    'codeSnippet': {
                        'code': main_code['code'],
                        'language': main_code['language'],
                        'fileName': self._generate_filename(main_code['language'], message)
                    },
                    'suggestions': self._get_code_suggestions(message)
                }
            else:
                # Regular text response
                return {
                    'message': cleaned_response,
                    'suggestions': self._get_code_suggestions(message)
                }
                
        except Exception as e:
            return {
                'message': f'Sorry, I encountered an error processing your request: {str(e)}',
                'suggestions': self._get_code_suggestions(message)
            }
    
    def _extract_code_blocks(self, text: str) -> List[Dict[str, str]]:
        """Extract code blocks from markdown text"""
        code_blocks = []
        pattern = r'```(\w+)?\n(.*?)```'
        matches = re.findall(pattern, text, re.DOTALL)
        
        for language, code in matches:
            code_blocks.append({
                'language': language.lower() if language else 'text',
                'code': code.strip()
            })
        
        return code_blocks
    
    def _generate_filename(self, language: str, message: str) -> str:
        """Generate an appropriate filename based on language and context"""
        # Extract potential filename from message
        filename_match = re.search(r'\b(\w+)\.(js|ts|py|java|cs|cpp|go|rs|html|css|sql)\b', message.lower())
        if filename_match:
            return filename_match.group(0)
        
        # Generate based on language
        extensions = {
            'javascript': '.js',
            'typescript': '.ts', 
            'python': '.py',
            'java': '.java',
            'csharp': '.cs',
            'c#': '.cs',
            'cpp': '.cpp',
            'c++': '.cpp',
            'go': '.go',
            'rust': '.rs',
            'html': '.html',
            'css': '.css',
            'sql': '.sql',
            'jsx': '.jsx',
            'tsx': '.tsx'
        }
        
        extension = extensions.get(language, '.txt')
        
        # Try to extract a meaningful name from the message
        if 'test' in message.lower():
            return f"test{extension}"
        elif 'component' in message.lower():
            return f"component{extension}"
        elif 'service' in message.lower():
            return f"service{extension}"
        elif 'util' in message.lower():
            return f"utils{extension}"
        else:
            return f"code{extension}"
    
    def _get_code_suggestions(self, message: str) -> List[str]:
        """Get contextual suggestions based on the message"""
        message_lower = message.lower()
        
        if 'test' in message_lower:
            return [
                '🧪 Generate comprehensive unit tests with edge cases',
                '🔧 Create integration tests for this component',
                '🎭 Add mock objects and test doubles',
                '📊 Generate parameterized tests for multiple scenarios',
                '⚡ Create performance and load tests'
            ]
        elif 'refactor' in message_lower or 'improve' in message_lower:
            return [
                '🏗️ Apply SOLID principles and design patterns',
                '🧹 Remove code smells and anti-patterns',  
                '⚡ Optimize performance and memory usage',
                '📚 Improve readability and maintainability',
                '🔒 Add proper error handling and validation'
            ]
        elif 'bug' in message_lower or 'error' in message_lower:
            return [
                '🐛 Analyze stack traces and error patterns',
                '🔍 Find null pointer and runtime exceptions',
                '🛡️ Check for resource leaks and memory issues',
                '📝 Review input validation and sanitization',
                '🔐 Identify security vulnerabilities'
            ]
        elif 'explain' in message_lower or 'documentation' in message_lower:
            return [
                '📖 Generate comprehensive JavaDoc documentation',
                '🗺️ Create architectural overview and diagrams',
                '💡 Explain design patterns and code structure',
                '📋 Document API endpoints and usage examples',
                '🎯 Provide step-by-step code walkthrough'
            ]
        else:
            return [
                '🚀 Generate production-ready code with best practices',
                '🎯 Analyze and improve code quality metrics',
                '📊 Review database performance and queries',
                '🔧 Suggest architectural improvements',
                '🛠️ Create development and deployment guides'
            ]