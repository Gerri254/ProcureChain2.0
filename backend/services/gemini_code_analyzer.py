"""Gemini AI Code Analyzer Service - analyzes submitted code for skill assessments"""
import os
import json
from typing import Dict, Optional
import google.generativeai as genai

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_MODEL = os.getenv('GEMINI_MODEL_QUICK', 'gemini-1.5-flash')

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class GeminiCodeAnalyzer:
    """Service for analyzing code submissions using Gemini AI"""

    def __init__(self):
        self.model = genai.GenerativeModel(GEMINI_MODEL) if GEMINI_API_KEY else None

    def analyze_code_submission(
        self,
        code: str,
        skill: str,
        difficulty_level: str,
        challenge_prompt: str,
        test_cases: list = None
    ) -> Dict:
        """
        Analyze code submission and return detailed feedback

        Args:
            code: The submitted code
            skill: Programming language/skill (e.g., 'react', 'python')
            difficulty_level: 'beginner', 'intermediate', or 'advanced'
            challenge_prompt: The original challenge description
            test_cases: Optional list of test cases to validate against

        Returns:
            Dict with analysis results including scores and feedback
        """
        if not self.model:
            return self._mock_analysis(skill, code)

        try:
            # Build comprehensive analysis prompt
            analysis_prompt = self._build_analysis_prompt(
                code, skill, difficulty_level, challenge_prompt, test_cases
            )

            # Get AI analysis
            response = self.model.generate_content(analysis_prompt)

            # Parse JSON response
            analysis_result = self._parse_ai_response(response.text)

            # Validate and format the response
            return self._format_analysis_result(analysis_result, skill)

        except Exception as e:
            print(f"Error in Gemini code analysis: {e}")
            # Fallback to mock analysis
            return self._mock_analysis(skill, code)

    def _build_analysis_prompt(
        self,
        code: str,
        skill: str,
        difficulty_level: str,
        challenge_prompt: str,
        test_cases: list = None
    ) -> str:
        """Build the AI prompt for code analysis"""

        prompt = f"""You are an expert code reviewer analyzing a {skill} coding challenge submission.

CHALLENGE:
{challenge_prompt}

DIFFICULTY LEVEL: {difficulty_level}

SUBMITTED CODE:
```{skill}
{code}
```
"""

        if test_cases:
            prompt += f"\nTEST CASES:\n"
            for i, tc in enumerate(test_cases, 1):
                prompt += f"{i}. Input: {tc.get('input', 'N/A')} -> Expected: {tc.get('expected_output', 'N/A')}\n"

        prompt += """
Please analyze this code and provide a comprehensive evaluation in JSON format with the following structure:

{
  "overall_score": <integer 0-100>,
  "sub_scores": {
    "correctness": <integer 0-100>,
    "code_quality": <integer 0-100>,
    "best_practices": <integer 0-100>,
    "efficiency": <integer 0-100>
  },
  "strengths": [
    "<specific strength 1>",
    "<specific strength 2>",
    "<specific strength 3>"
  ],
  "weaknesses": [
    "<specific weakness 1>",
    "<specific weakness 2>",
    "<specific weakness 3>"
  ],
  "suggestions": [
    "<actionable suggestion 1>",
    "<actionable suggestion 2>"
  ],
  "cheating_probability": <integer 0-100>,
  "test_cases_passed": <integer>,
  "detailed_feedback": "<2-3 sentences summarizing the submission>"
}

SCORING CRITERIA:
- Correctness (0-100): Does the code solve the problem correctly? Does it handle edge cases?
- Code Quality (0-100): Is the code clean, readable, and well-structured?
- Best Practices (0-100): Does it follow language-specific conventions and patterns?
- Efficiency (0-100): Is the algorithm efficient? Good time/space complexity?
- Cheating Probability (0-100): Likelihood of plagiarism or AI-generated code (check for unusual patterns, overly complex solutions for simple problems, or inconsistent coding style)

Overall score should be the weighted average: (correctness * 0.4) + (code_quality * 0.25) + (best_practices * 0.2) + (efficiency * 0.15)

Be constructive, specific, and fair in your evaluation. Return ONLY valid JSON, no other text.
"""
        return prompt

    def _parse_ai_response(self, response_text: str) -> Dict:
        """Parse AI response and extract JSON"""
        try:
            # Try to find JSON in the response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1

            if start != -1 and end != 0:
                json_str = response_text[start:end]
                return json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")

        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Response text: {response_text[:500]}")
            raise

    def _format_analysis_result(self, analysis: Dict, skill: str) -> Dict:
        """Validate and format the analysis result"""

        # Ensure all required fields exist with defaults
        formatted = {
            'overall_score': min(100, max(0, analysis.get('overall_score', 0))),
            'sub_scores': {
                'correctness': min(100, max(0, analysis.get('sub_scores', {}).get('correctness', 0))),
                'code_quality': min(100, max(0, analysis.get('sub_scores', {}).get('code_quality', 0))),
                'best_practices': min(100, max(0, analysis.get('sub_scores', {}).get('best_practices', 0))),
                'efficiency': min(100, max(0, analysis.get('sub_scores', {}).get('efficiency', 0))),
            },
            'strengths': analysis.get('strengths', [])[:5],  # Max 5 strengths
            'weaknesses': analysis.get('weaknesses', [])[:5],  # Max 5 weaknesses
            'suggestions': analysis.get('suggestions', [])[:5],  # Max 5 suggestions
            'cheating_probability': min(100, max(0, analysis.get('cheating_probability', 0))),
            'test_cases_passed': analysis.get('test_cases_passed', 0),
            'detailed_feedback': analysis.get('detailed_feedback', 'Code analysis completed.'),
            'analyzed_skill': skill,
        }

        return formatted

    def _mock_analysis(self, skill: str, code: str) -> Dict:
        """
        Generate mock analysis when Gemini API is not available
        Useful for development and testing
        """
        code_length = len(code)
        has_functions = 'def ' in code or 'function ' in code or 'const ' in code
        has_comments = '#' in code or '//' in code or '/*' in code

        # Simple heuristic scoring
        base_score = 70
        if code_length > 100:
            base_score += 5
        if has_functions:
            base_score += 10
        if has_comments:
            base_score += 5

        base_score = min(95, base_score)

        return {
            'overall_score': base_score,
            'sub_scores': {
                'correctness': base_score + 5,
                'code_quality': base_score,
                'best_practices': base_score - 5,
                'efficiency': base_score - 10,
            },
            'strengths': [
                f'Good attempt at solving the {skill} challenge',
                'Code is structured and readable',
                'Demonstrates understanding of basic concepts',
            ],
            'weaknesses': [
                'Could add more error handling',
                'Consider edge cases',
                'Add comments for complex logic',
            ],
            'suggestions': [
                'Review language-specific best practices',
                'Add unit tests to verify correctness',
            ],
            'cheating_probability': 10,
            'test_cases_passed': 2,
            'detailed_feedback': f'This is a mock analysis. Your {skill} code shows promise. Keep practicing!',
            'analyzed_skill': skill,
        }

    def detect_plagiarism(self, code: str, skill: str) -> Dict:
        """
        Detect potential plagiarism or AI-generated code

        Args:
            code: The submitted code
            skill: Programming language

        Returns:
            Dict with plagiarism analysis
        """
        if not self.model:
            return {
                'is_suspicious': False,
                'confidence': 10,
                'reasons': []
            }

        try:
            prompt = f"""Analyze this {skill} code for signs of plagiarism or AI-generation:

```{skill}
{code}
```

Look for:
1. Unusually perfect code for a timed assessment
2. Inconsistent coding style (mixing different patterns)
3. Over-engineered solutions for simple problems
4. Comments that don't match the code
5. Generic variable names typical of AI (result, data, temp everywhere)
6. Extremely similar to common online solutions

Return JSON:
{{
  "is_suspicious": <boolean>,
  "confidence": <integer 0-100>,
  "reasons": ["<reason 1>", "<reason 2>"]
}}
"""

            response = self.model.generate_content(prompt)
            return self._parse_ai_response(response.text)

        except Exception as e:
            print(f"Error in plagiarism detection: {e}")
            return {
                'is_suspicious': False,
                'confidence': 0,
                'reasons': []
            }


# Singleton instance
gemini_code_analyzer = GeminiCodeAnalyzer()
