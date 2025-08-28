import subprocess
import logging
from pathlib import Path
from .ai_client_factory import AIClientFactory

logger = logging.getLogger("test-fixer")

class TestFixer:
    def __init__(self, args, test_code, error):
        self.args = args
        self.test_code = test_code
        self.error_output = error
        self.ai_client = AIClientFactory.create_client(args)
        # self.junit_jar = args.junit_jar 

    def attempt_fix(self):
        """
        Fix the test code using LLM based on the error message.
        """

        prompt = f"""You are a senior Java developer and code reviewer.

		The following JUnit test class does **not compile or fails to run** correctly. Your job is to fix it.

		---

		### ✅ Instructions:
		- Fix all syntax, logic, and runtime issues.
		- Ensure the test is **valid, complete, and compilable**.
		- Add any missing **imports**, **mocks**, or **annotations** as needed.
		- The output must be a single valid Java code block — **no explanation or Markdown**.

		---

		### ❌ Broken Test Code
		```java
		{self.test_code}
		````

		---

		### 🧨 Error Message / Stack Trace

		```
		{self.error_output}
		```

		---

		### ✅ Fixed Code (Java code only):

		"""

        response = self.ai_client.generate_tests(prompt)
        fixed_code = self._extract_java_code(response)

        if fixed_code:
            logger.info("Test code fixed and written back.")
            logger.info("Code",fixed_code)
            print(fixed_code)
            return fixed_code
        else:
            logger.error("Failed to extract fixed code from LLM response.")
            return False

    def _extract_java_code(self, response):
        import re

        # First try well-formed triple backtick blocks
        match = re.search(r"```(?:java)?\s*(.*?)```", response, re.DOTALL)
        if match:
            return match.group(1).strip()

        # Fallback: try to detect Java code heuristically
        match = re.search(r"(public\s+class\s+.*?{.*})", response, re.DOTALL)
        if match:
            logger.warning("No code block found — used fallback regex to extract Java class.")
            return match.group(1).strip()

        logger.error("No valid Java code block found in LLM response.")
        return None

