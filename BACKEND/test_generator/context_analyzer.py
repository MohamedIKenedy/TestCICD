import os
import re
import logging
from pathlib import Path
from typing import Dict, List, Set, Optional

logger = logging.getLogger("context-analyzer")

class ContextAnalyzer:
    """Analyzes Java project context to improve test generation"""
    
    def __init__(self, project_root: str):
        self.project_root = project_root
        self.java_files_cache = {}
        self.class_dependencies = {}
        
    def analyze_file_dependencies(self, target_file: str) -> Dict[str, str]:
        """Analyze a Java file and find all its dependencies with their full source code"""
        dependencies = {}
        
        try:
            with open(target_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract import statements
            imports = self._extract_imports(content)
            
            # Extract class references in the code
            class_references = self._extract_class_references(content)
            
            # Find source files for dependencies
            for class_name in imports + class_references:
                source_path = self._find_class_source(class_name)
                if source_path and os.path.exists(source_path):
                    with open(source_path, 'r', encoding='utf-8') as f:
                        dependencies[class_name] = f.read()
                        
            logger.info(f"Found {len(dependencies)} dependencies for {os.path.basename(target_file)}")
            return dependencies
            
        except Exception as e:
            logger.error(f"Error analyzing dependencies for {target_file}: {e}")
            return {}
    
    def _extract_imports(self, content: str) -> List[str]:
        """Extract all import statements from Java code"""
        import_pattern = r'import\s+(?:static\s+)?([a-zA-Z_][a-zA-Z0-9_.]*(?:\*)?);'
        imports = re.findall(import_pattern, content)
        
        # Filter out standard Java/Spring imports and focus on project classes
        project_imports = []
        for imp in imports:
            if not imp.startswith(('java.', 'javax.', 'org.springframework.', 'org.junit.', 'org.mockito.')):
                # Extract simple class name
                class_name = imp.split('.')[-1] if not imp.endswith('*') else None
                if class_name and class_name != '*':
                    project_imports.append(class_name)
        
        return project_imports
    
    def _extract_class_references(self, content: str) -> List[str]:
        """Extract class references from method signatures, field declarations, etc."""
        references = set()
        
        # Field declarations: private SomeClass field;
        field_pattern = r'(?:private|protected|public)\s+([A-Z][a-zA-Z0-9_]*(?:<[^>]+>)?)\s+\w+'
        field_matches = re.findall(field_pattern, content)
        
        # Method parameters: method(SomeClass param)
        param_pattern = r'\(\s*([A-Z][a-zA-Z0-9_]*(?:<[^>]+>)?)\s+\w+'
        param_matches = re.findall(param_pattern, content)
        
        # Return types: public SomeClass method()
        return_pattern = r'(?:public|protected|private)\s+([A-Z][a-zA-Z0-9_]*(?:<[^>]+>)?)\s+\w+\s*\('
        return_matches = re.findall(return_pattern, content)
        
        # Constructor calls: new SomeClass(
        constructor_pattern = r'new\s+([A-Z][a-zA-Z0-9_]*)\s*\('
        constructor_matches = re.findall(constructor_pattern, content)
        
        for matches in [field_matches, param_matches, return_matches, constructor_matches]:
            for match in matches:
                # Clean generic types
                clean_type = re.sub(r'<.*?>', '', match)
                if clean_type and not clean_type in ['String', 'Integer', 'Boolean', 'Long', 'Double', 'List', 'Set', 'Map']:
                    references.add(clean_type)
        
        return list(references)
    
    def _find_class_source(self, class_name: str) -> Optional[str]:
        """Find the source file for a given class name"""
        if not class_name:
            return None
            
        # Search in project directories
        for root, dirs, files in os.walk(self.project_root):
            for file in files:
                if file == f"{class_name}.java":
                    return os.path.join(root, file)
        
        return None
    
    def extract_constructor_signatures(self, java_content: str) -> List[Dict[str, any]]:
        """Extract constructor signatures from Java class"""
        constructors = []
        
        # Find class name first
        class_pattern = r'(?:public\s+)?class\s+(\w+)'
        class_match = re.search(class_pattern, java_content)
        if not class_match:
            return constructors
            
        class_name = class_match.group(1)
        
        # Find constructors
        constructor_pattern = rf'(?:public|protected|private)?\s*{class_name}\s*\(([^)]*)\)'
        constructor_matches = re.finditer(constructor_pattern, java_content)
        
        for match in constructor_matches:
            params_str = match.group(1).strip()
            params = []
            
            if params_str:
                # Parse parameters
                param_parts = [p.strip() for p in params_str.split(',')]
                for param in param_parts:
                    param_match = re.match(r'([^<\s]+(?:<[^>]+>)?)\s+(\w+)', param.strip())
                    if param_match:
                        param_type = param_match.group(1)
                        param_name = param_match.group(2)
                        params.append({'type': param_type, 'name': param_name})
            
            constructors.append({
                'class_name': class_name,
                'parameters': params,
                'signature': f"{class_name}({params_str})"
            })
        
        return constructors
    
    def extract_field_info(self, java_content: str) -> List[Dict[str, str]]:
        """Extract field information from Java class"""
        fields = []
        
        # Match field declarations
        field_pattern = r'(?:private|protected|public)\s+([^<\s]+(?:<[^>]+>)?)\s+(\w+)\s*(?:=|;)'
        field_matches = re.finditer(field_pattern, java_content)
        
        for match in field_matches:
            field_type = match.group(1)
            field_name = match.group(2)
            fields.append({
                'type': field_type,
                'name': field_name
            })
        
        return fields
    
    def analyze_test_requirements(self, target_class_content: str, dependencies: Dict[str, str]) -> Dict[str, any]:
        """Analyze what's needed for comprehensive test generation"""
        analysis = {
            'target_constructors': self.extract_constructor_signatures(target_class_content),
            'target_fields': self.extract_field_info(target_class_content),
            'dependency_constructors': {},
            'dependency_fields': {},
            'mock_suggestions': []
        }
        
        # Analyze dependencies
        for dep_name, dep_content in dependencies.items():
            analysis['dependency_constructors'][dep_name] = self.extract_constructor_signatures(dep_content)
            analysis['dependency_fields'][dep_name] = self.extract_field_info(dep_content)
            
            # Suggest mocking for service/repository classes
            if any(keyword in dep_content.lower() for keyword in ['service', 'repository', 'dao']):
                analysis['mock_suggestions'].append(dep_name)
        
        return analysis
    
    def generate_context_prompt(self, target_file: str, manual_context: Dict[str, str] = None) -> str:
        """Generate a comprehensive context prompt for test generation"""
        
        # Get automatic dependencies
        auto_dependencies = self.analyze_file_dependencies(target_file)
        
        # Combine with manual context
        all_context = auto_dependencies.copy()
        if manual_context:
            all_context.update(manual_context)
        
        # Read target file
        with open(target_file, 'r', encoding='utf-8') as f:
            target_content = f.read()
        
        # Analyze requirements
        analysis = self.analyze_test_requirements(target_content, all_context)
        
        context_prompt = "## PROJECT CONTEXT AND DEPENDENCIES:\n\n"
        
        if analysis['target_constructors']:
            context_prompt += "### Target Class Constructors:\n"
            for constructor in analysis['target_constructors']:
                context_prompt += f"- {constructor['signature']}\n"
            context_prompt += "\n"
        
        context_prompt += "### Related Classes and Their Source Code:\n"
        for class_name, class_content in all_context.items():
            context_prompt += f"\n#### {class_name}:\n```java\n{class_content}\n```\n"
        
        if analysis['mock_suggestions']:
            context_prompt += f"\n### Recommended Classes to Mock:\n"
            for mock_class in analysis['mock_suggestions']:
                context_prompt += f"- {mock_class}\n"
        
        return context_prompt
