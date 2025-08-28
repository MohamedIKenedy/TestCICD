import os
import re
from pathlib import Path
from typing import List, Dict, Set

class SmartContextSuggester:
    """Suggests relevant context files based on the target Java class"""
    
    def __init__(self, upload_directory: str):
        self.upload_directory = upload_directory
        
    def suggest_context_files(self, target_file_path: str, max_suggestions: int = 10) -> List[Dict[str, str]]:
        """Suggest relevant context files for the target file"""
        suggestions = []
        
        try:
            with open(target_file_path, 'r', encoding='utf-8') as f:
                target_content = f.read()
        except Exception:
            return suggestions
        
        # Extract potential dependencies from target file
        dependencies = self._extract_dependencies(target_content)
        
        # Find all Java files in the upload directory
        java_files = self._find_java_files()
        
        # Score and rank files based on relevance
        scored_files = []
        for java_file in java_files:
            if java_file == target_file_path:
                continue
                
            score = self._calculate_relevance_score(target_content, java_file, dependencies)
            if score > 0:
                scored_files.append({
                    'path': java_file,
                    'score': score,
                    'name': os.path.basename(java_file),
                    'reason': self._get_suggestion_reason(java_file, dependencies)
                })
        
        # Sort by score and return top suggestions
        scored_files.sort(key=lambda x: x['score'], reverse=True)
        return scored_files[:max_suggestions]
    
    def _extract_dependencies(self, content: str) -> Set[str]:
        """Extract potential class dependencies from content"""
        dependencies = set()
        
        # Import statements
        import_pattern = r'import\s+(?:static\s+)?([a-zA-Z_][a-zA-Z0-9_.]*);'
        imports = re.findall(import_pattern, content)
        for imp in imports:
            class_name = imp.split('.')[-1]
            dependencies.add(class_name)
        
        # Class references in code
        class_ref_patterns = [
            r'(\w+)\s+\w+\s*=',  # Variable declarations
            r'new\s+(\w+)\s*\(',  # Constructor calls
            r'(\w+)\.class',  # Class literals
            r'@Autowired[^}]*?(\w+)\s+\w+',  # Spring autowired fields
            r'private\s+(\w+)\s+\w+',  # Private fields
        ]
        
        for pattern in class_ref_patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                if match[0].isupper():  # Likely a class name
                    dependencies.add(match)
        
        return dependencies
    
    def _find_java_files(self) -> List[str]:
        """Find all Java files in the upload directory"""
        java_files = []
        for root, dirs, files in os.walk(self.upload_directory):
            for file in files:
                if file.endswith('.java'):
                    java_files.append(os.path.join(root, file))
        return java_files
    
    def _calculate_relevance_score(self, target_content: str, candidate_file: str, dependencies: Set[str]) -> int:
        """Calculate how relevant a file is to the target"""
        score = 0
        
        try:
            with open(candidate_file, 'r', encoding='utf-8') as f:
                candidate_content = f.read()
        except Exception:
            return 0
        
        file_name = os.path.splitext(os.path.basename(candidate_file))[0]
        
        # High score if the class name is in dependencies
        if file_name in dependencies:
            score += 100
        
        # Score based on file type and naming conventions
        if 'Service' in file_name and 'Service' in target_content:
            score += 50
        if 'Repository' in file_name and ('Repository' in target_content or 'Service' in target_content):
            score += 50
        if 'Controller' in file_name and 'Controller' in target_content:
            score += 50
        if 'Model' in file_name or 'Entity' in file_name:
            score += 30
        if 'Request' in file_name or 'Response' in file_name:
            score += 40
        if 'Config' in file_name or 'Configuration' in file_name:
            score += 20
        
        # Score based on package similarity
        target_package = self._extract_package(target_content)
        candidate_package = self._extract_package(candidate_content)
        
        if target_package and candidate_package:
            package_similarity = self._calculate_package_similarity(target_package, candidate_package)
            score += package_similarity * 20
        
        # Score based on shared imports
        target_imports = set(re.findall(r'import\s+([^;]+);', target_content))
        candidate_imports = set(re.findall(r'import\s+([^;]+);', candidate_content))
        shared_imports = len(target_imports.intersection(candidate_imports))
        score += shared_imports * 5
        
        return score
    
    def _extract_package(self, content: str) -> str:
        """Extract package declaration from Java content"""
        package_match = re.search(r'package\s+([^;]+);', content)
        return package_match.group(1) if package_match else ""
    
    def _calculate_package_similarity(self, pkg1: str, pkg2: str) -> float:
        """Calculate similarity between two package names"""
        parts1 = pkg1.split('.')
        parts2 = pkg2.split('.')
        
        common_parts = 0
        for i in range(min(len(parts1), len(parts2))):
            if parts1[i] == parts2[i]:
                common_parts += 1
            else:
                break
        
        return common_parts / max(len(parts1), len(parts2))
    
    def _get_suggestion_reason(self, file_path: str, dependencies: Set[str]) -> str:
        """Get a human-readable reason for the suggestion"""
        file_name = os.path.splitext(os.path.basename(file_path))[0]
        
        if file_name in dependencies:
            return f"Referenced as dependency: {file_name}"
        
        if 'Service' in file_name:
            return "Service class - likely dependency"
        elif 'Repository' in file_name:
            return "Repository class - data access layer"
        elif 'Controller' in file_name:
            return "Controller class - same layer"
        elif 'Model' in file_name or 'Entity' in file_name:
            return "Domain model/entity class"
        elif 'Request' in file_name or 'Response' in file_name:
            return "Request/Response DTO"
        elif 'Config' in file_name:
            return "Configuration class"
        else:
            return "Related class in project"
