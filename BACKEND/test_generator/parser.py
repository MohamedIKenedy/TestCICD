import javalang
import logging

logger = logging.getLogger("test-generator")


class JavaClassParser:
    def __init__(self, file_path=None, source_code=None):
        self.file_path = file_path
        self.source_code = source_code
        self.class_name = None
        self.package_name = None
        self.methods = []
        self.imports = []

    @property
    def package(self):
        return self.package_name

    def parse(self):
        try:
            if not self.source_code:
                if not self.file_path:
                    raise ValueError("Either file_path or source_code must be provided.")
                with open(self.file_path, 'r', encoding='utf-8') as file:
                    self.source_code = file.read()

            tree = javalang.parse.parse(self.source_code)

            if tree.package:
                self.package_name = tree.package.name

            self.imports = [imp.path for imp in tree.imports]

            # Only extract top-level class declarations (not nested/inner)
            top_level_classes = [
                (path, node) for path, node in tree.filter(javalang.tree.ClassDeclaration)
                if not self._is_inner_class(path)
            ]

            if not top_level_classes:
                logger.error("❌ No top-level classes found in the file.")
                return False

            # Prefer public class if multiple
            for path, class_decl in top_level_classes:
                if 'public' in class_decl.modifiers:
                    main_class = class_decl
                    break
            else:
                # Fallback: pick first top-level class
                main_class = top_level_classes[0][1]

            self.class_name = main_class.name
            logger.info(f"📦 Generating test for: {self.class_name}")

            self._extract_methods(main_class)
            return True

        except Exception as e:
            logger.error(f"Error parsing Java source: {e}")
            return False

    def _is_inner_class(self, path):
        """Returns True if the class is nested inside another class."""
        return any(isinstance(node, javalang.tree.ClassDeclaration) for node in path[:-1])

    def _extract_methods(self, class_decl):
        self.fields = []
        self.constructors = []

        # Extract fields (dependencies)
        for field in class_decl.fields:
            for decl in field.declarators:
                self.fields.append({
                    'name': decl.name,
                    'type': field.type.name if hasattr(field.type, 'name') else str(field.type)
                })

        # Extract constructors
        for ctor in class_decl.constructors:
            params = [
                {
                    'type': param.type.name + '[]' * len(getattr(param.type, 'dimensions', [])),
                    'name': param.name
                }
                for param in ctor.parameters
            ]
            self.constructors.append({'name': class_decl.name, 'parameters': params})

        # Extract methods (excluding private)
        for method in class_decl.methods:
            if 'private' in method.modifiers:
                continue
            self.methods.append({
                'name': method.name,
                'return_type': method.return_type.name if method.return_type else 'void',
                'parameters': [
                    {
                        'type': param.type.name + '[]' * len(getattr(param.type, 'dimensions', [])),
                        'name': param.name
                    }
                    for param in method.parameters
                ],
                'modifiers': list(method.modifiers)
            })

    def get_class_info(self):
        return {
            'file_path': str(self.file_path) if self.file_path else None,
            'package': self.package_name,
            'imports': self.imports,
            'class_name': self.class_name,
            'methods': self.methods,
            'constructors': self.constructors,
            'fields': self.fields
        }

