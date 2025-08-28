import os
import re
import logging
from pathlib import Path
from .parser import JavaClassParser
from .ai_client_factory import AIClientFactory
from .context_analyzer import ContextAnalyzer
from .ai_context_analyzer import AIContextAnalyzer

logger = logging.getLogger("test-generator")
TEST_OUTPUT_DIR = "generated_tests"

class TestGenerator:
    def __init__(self, args):
        self.args = args
        self.framework = getattr(args, 'framework', 'JUnit 5')
        self.mocking = getattr(args, 'mocking', 'Mockito')
        self.class_parser = None
        self.context = None
        self.ai_client = AIClientFactory.create_client(args)
        
        # Initialize context analyzer
        upload_dir = os.path.dirname(args.file) if hasattr(args, 'file') else "uploads"
        self.context_analyzer = ContextAnalyzer(upload_dir)
        self.ai_context_analyzer = AIContextAnalyzer(upload_dir, self.ai_client)
        
        # Process manual context files if provided
        self.manual_context = {}
        if hasattr(args, 'context_files') and args.context_files:
            for context_file in args.context_files:
                if os.path.exists(context_file):
                    with open(context_file, 'r', encoding='utf-8') as f:
                        class_name = os.path.splitext(os.path.basename(context_file))[0]
                        self.manual_context[class_name] = f.read()

    def run(self):
        try:
            logger.info("Validating Java file...")
            if not self._validate_input():
                return "Invalid Java file."

            logger.info("Parsing Java class...")
            if not self._parse_java_class():
                return "Failed to parse Java class."

            logger.info(f"Checking model availability ({self.args.model})...")
            print(self.args.model)
            print(self.args.framework)
            if not self.ai_client.ensure_model_available():
                return "Model is not available."

            class_info = self.class_parser.get_class_info()

            # Enhanced single-step generation with comprehensive analysis
            logger.info("Generating test code...")
            test_code_prompt = self._build_comprehensive_prompt(class_info)
            test_code_response = self.ai_client.generate_tests(test_code_prompt)
            test_code = self._extract_test_code(test_code_response)
            if not test_code or not test_code.strip():
                return "❌ Failed to extract Java code from response."

            logger.info("💾 Saving generated test file...")
            if not self._save_test_file(test_code):
                return "❌ Failed to save test file."

            return test_code, "✅ Test generation complete!"

        except Exception as e:
            logger.exception("⚠️ Exception during test generation:")
            return f"❌ Error: {str(e)}"

    def _validate_input(self):
        java_file = Path(self.args.file)
        return java_file.exists() and java_file.suffix == '.java'

    def _parse_java_class(self):
        self.class_parser = JavaClassParser(self.args.file)
        return self.class_parser.parse()

    def _build_comprehensive_prompt(self, class_info):
        """Build a comprehensive prompt that guides the LLM to generate thorough tests"""
        
        # Get the full class code for better context
        full_class_code = self._get_full_class_code()
        
        # Find all available Java files for AI analysis
        available_files = self._find_available_files()
        
        # Use AI to analyze dependencies and select best context
        logger.info("Using AI to analyze dependencies and select optimal context...")
        ai_analysis = self.ai_context_analyzer.analyze_dependencies_with_ai(
            self.args.file, 
            available_files
        )
        
        # Generate AI-enhanced context prompt
        context_prompt = self.ai_context_analyzer.generate_enhanced_context_prompt(
            self.args.file, 
            ai_analysis
        )
        
        # Add manual context if provided
        if self.manual_context:
            context_prompt += "\n### Additional Manual Context:\n"
            for class_name, content in self.manual_context.items():
                context_prompt += f"\n#### {class_name}:\n```java\n{content}\n```\n"
        
        # Analyze the class structure
        analysis = self._analyze_class_structure(class_info)
        
        # Get mocking recommendations from AI
        mock_strategy = ai_analysis.get('mock_strategy', {})
        mock_recommendations = mock_strategy.get('classes_to_mock', [])
        test_focus = mock_strategy.get('test_focus', 'Comprehensive unit testing')
        
        # Build the comprehensive prompt
        prompt = f"""# AI-Enhanced Java Unit Test Generation

You are an expert Java test engineer with access to AI-analyzed project context. Generate comprehensive unit tests using {self.framework} and {self.mocking}.

## Target Class to Test:
```java
{full_class_code}
```

{context_prompt}

## AI Test Strategy:
**Focus**: {test_focus}
**Recommended Classes to Mock**: {', '.join(mock_recommendations) if mock_recommendations else 'None specified'}

## Class Analysis:
{analysis}

## Enhanced Test Requirements:

### 1. CONSTRUCTOR & DEPENDENCY ACCURACY (CRITICAL)
- **Use EXACT constructor signatures** from the AI-analyzed context above
- **Follow AI mocking recommendations** - mock the specified service/repository classes
- **Create realistic test objects** using the provided constructor information
- **Pay attention to dependency injection patterns** shown in the context

### 2. COMPREHENSIVE COVERAGE
- Test ALL public methods with multiple scenarios
- Cover ALL conditional branches and exception paths
- Test edge cases: null inputs, empty collections, boundary values
- Include parameterized tests for multiple input combinations

### 3. PROFESSIONAL TEST STRUCTURE
- Use `@ExtendWith(MockitoExtension.class)` for {self.framework}
- Mock dependencies using `@Mock` annotations (focus on AI-recommended classes)
- Use `@InjectMocks` for the class under test
- Group related tests with `@Nested` classes
- Use descriptive method names: `should_ExpectedBehavior_When_Condition()`

### 4. SMART ASSERTIONS & VERIFICATION
- Use specific assertions (assertEquals, assertNotNull, assertThrows, etc.)
- Verify mock interactions with `verify()` for methods with side effects
- Use `ArgumentCaptor` for complex method argument verification
- Assert both return values AND state changes

### 5. REALISTIC TEST DATA
- Use the constructor information from context to create valid test objects
- Create test data that reflects real-world usage patterns
- Mock external dependencies properly based on AI analysis
- Handle null and error scenarios appropriately

## CRITICAL SUCCESS FACTORS:
1. **ACCURACY**: Use only constructors and methods shown in the provided context
2. **REALISM**: Create test scenarios that reflect actual business usage
3. **COMPLETENESS**: Cover all methods, branches, and error conditions
4. **CLARITY**: Write clean, readable tests with clear naming
5. **EFFICIENCY**: Avoid unnecessary stubbing - only mock what's actually used

## Output Requirements:
- Generate ONLY valid Java code (no explanations or markdown)
- Include all necessary imports
- Create comprehensive test coverage (aim for 90%+)
- Follow the AI-recommended mocking strategy
- Use the exact class structures provided in context

Generate the complete, production-ready test class now:"""

        return prompt.strip()

    def _get_full_class_code(self):
        """Get the complete class code for better context understanding"""
        try:
            with open(self.args.file, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.warning(f"Could not read full class code: {e}")
            return self._extract_essential_code()

    def _find_available_files(self):
        """Find all available Java files in the project for AI analysis"""
        available_files = []
        upload_dir = os.path.dirname(self.args.file)
        
        for root, dirs, files in os.walk(upload_dir):
            for file in files:
                if file.endswith('.java') and file != os.path.basename(self.args.file):
                    file_path = os.path.join(root, file)
                    available_files.append(file_path)
        
        # Add manual context files
        if hasattr(self.args, 'context_files') and self.args.context_files:
            for context_file in self.args.context_files:
                if os.path.exists(context_file) and context_file not in available_files:
                    available_files.append(context_file)
        
        return available_files

    def _analyze_class_structure(self, class_info):
        """Analyze the class structure to provide targeted testing guidance"""
        analysis_parts = []
        
        # Class type analysis
        class_type = self._determine_class_type(class_info)
        analysis_parts.append(f"**Class Type**: {class_type}")
        
        # Methods analysis
        public_methods = [m for m in class_info['methods'] if 'public' in m.get('modifiers', [])]
        private_methods = [m for m in class_info['methods'] if 'private' in m.get('modifiers', [])]
        
        analysis_parts.append(f"**Public Methods**: {len(public_methods)} methods to test directly")
        if private_methods:
            analysis_parts.append(f"**Private Methods**: {len(private_methods)} methods to test indirectly")
        
        # Dependencies analysis
        dependencies = self._identify_dependencies(class_info)
        if dependencies:
            analysis_parts.append(f"**Dependencies to Mock**: {', '.join(dependencies)}")
        
        # Complexity indicators
        complexity_indicators = self._identify_complexity_indicators()
        if complexity_indicators:
            analysis_parts.append(f"**Complexity Indicators**: {', '.join(complexity_indicators)}")
        
        # Method-specific guidance
        method_guidance = self._generate_method_specific_guidance(public_methods)
        if method_guidance:
            analysis_parts.append("**Method-Specific Test Guidance**:")
            analysis_parts.extend(method_guidance)
        
        return '\n'.join(analysis_parts)

    def _determine_class_type(self, class_info):
        """Determine the type of class to provide specific testing strategies"""
        class_name = class_info.get('name', '').lower()
        
        if 'controller' in class_name:
            return "REST Controller - Focus on HTTP status codes, request/response validation, exception handling"
        elif 'service' in class_name:
            return "Service Layer - Focus on business logic, transaction boundaries, exception propagation"
        elif 'repository' in class_name or 'dao' in class_name:
            return "Data Access - Focus on CRUD operations, query results, database exceptions"
        elif 'util' in class_name or 'helper' in class_name:
            return "Utility Class - Focus on pure functions, edge cases, input validation"
        elif 'config' in class_name:
            return "Configuration Class - Focus on bean creation, property binding, conditional configuration"
        else:
            return "General Class - Focus on public API, state management, dependency interactions"

    def _identify_dependencies(self, class_info):
        """Identify class dependencies that need mocking"""
        dependencies = []
        
        # Look for fields that are likely dependencies
        for field in class_info.get('fields', []):
            field_type = field.get('type', '')
            # Skip primitive types and common Java classes
            if not any(primitive in field_type.lower() for primitive in 
                      ['string', 'int', 'long', 'double', 'float', 'boolean', 'list', 'map', 'set']):
                dependencies.append(field_type)
        
        return dependencies

    def _identify_complexity_indicators(self):
        """Identify complexity indicators from the source code"""
        indicators = []
        
        try:
            with open(self.args.file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'if (' in content or 'else' in content:
                indicators.append("Conditional logic")
            if 'for (' in content or 'while (' in content:
                indicators.append("Loops")
            if 'try {' in content or 'catch (' in content:
                indicators.append("Exception handling")
            if 'switch (' in content:
                indicators.append("Switch statements")
            if content.count('return ') > 3:
                indicators.append("Multiple return paths")
                
        except Exception:
            pass
        
        return indicators

    def _generate_method_specific_guidance(self, public_methods):
        """Generate specific testing guidance for each public method"""
        guidance = []
        
        for method in public_methods:
            method_name = method.get('name', '')
            return_type = method.get('return_type', '')
            parameters = method.get('parameters', [])
            
            method_guidance = f"- **{method_name}()**: "
            
            # Return type specific guidance
            if return_type == 'void':
                method_guidance += "Verify side effects and mock interactions. "
            elif 'List' in return_type or 'Collection' in return_type:
                method_guidance += "Test empty, single item, and multiple item scenarios. "
            elif return_type == 'boolean':
                method_guidance += "Test both true and false conditions. "
            elif 'Optional' in return_type:
                method_guidance += "Test both present and empty Optional scenarios. "
            
            # Parameter specific guidance
            if parameters:
                param_types = [p.get('type', '') for p in parameters]
                if any('String' in pt for pt in param_types):
                    method_guidance += "Test null and empty string inputs. "
                if any('List' in pt or 'Collection' in pt for pt in param_types):
                    method_guidance += "Test null and empty collection inputs. "
            
            guidance.append(method_guidance.strip())
        
        return guidance

    def _extract_essential_code(self):
        """Extract only class signature, fields, and method signatures (fallback method)"""
        with open(self.args.file, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')
        essential_lines = []
        brace_count = 0
        in_method = False
        
        for line in lines:
            stripped = line.strip()
            
            # Always include package, imports, class declaration
            if (stripped.startswith('package ') or 
                stripped.startswith('import ') or 
                stripped.startswith('public class ') or
                stripped.startswith('class ')):
                essential_lines.append(line)
                continue
            
            # Include field declarations
            if (not in_method and 
                ('private ' in stripped or 'public ' in stripped or 'protected ' in stripped) and 
                not '(' in stripped and ';' in stripped):
                essential_lines.append(line)
                continue
            
            # Include method signatures but not bodies
            if ('public ' in stripped or 'private ' in stripped) and '(' in stripped and '{' in stripped:
                # Method signature with opening brace
                essential_lines.append(line.replace('{', '{ /* ... */ }'))
                in_method = True
                continue
            elif ('public ' in stripped or 'private ' in stripped) and '(' in stripped:
                # Method signature without opening brace yet
                essential_lines.append(line)
                continue
            
            # Handle braces for class structure
            if '{' in line:
                brace_count += line.count('{')
                if not in_method:
                    essential_lines.append(line)
            if '}' in line:
                brace_count -= line.count('}')
                in_method = False
                if brace_count <= 1:  # Class closing brace
                    essential_lines.append(line)
        
        return '\n'.join(essential_lines)

    def _extract_test_code(self, response):
        # Try to extract from ``` blocks if present
        match = re.search(r'```(?:java)?\s*(.*?)```', response, re.DOTALL)
        if match:
            return match.group(1).strip()

        # Or if raw Java starts directly
        if any(response.strip().startswith(prefix) for prefix in ["package", "import", "public", "class"]):
            return response.strip()

        logger.error("No recognizable Java code block found in response.")
        return None

    def _save_test_file(self, test_code):
        test_file_path = Path(TEST_OUTPUT_DIR) / f"{self.class_parser.class_name}Test.java"
        os.makedirs(TEST_OUTPUT_DIR, exist_ok=True)
        try:
            with open(test_file_path, 'w', encoding='utf-8') as f:
                f.write(test_code)
            logger.info(f"✅ Test saved: {test_file_path}")
            logger.debug(f"Test code to save:\n{test_code}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to write test file: {e}")
            return False
