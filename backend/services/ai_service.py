"""AI Service using Google Gemini for intelligent features"""
import os
import google.generativeai as genai
from typing import Dict, List, Optional, Any
import json


class AIService:
    """Service for AI-powered features using Google Gemini"""

    def __init__(self):
        """Initialize Gemini AI"""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("WARNING: GEMINI_API_KEY not found in environment variables")
            self.model = None
            return

        genai.configure(api_key=api_key)
        # Use gemini-2.5-flash - latest stable, fast and won't run out
        # High limits: 15 RPM (free tier), excellent quality
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')

    def is_available(self) -> bool:
        """Check if AI service is available"""
        return self.model is not None

    def explain_procurement(self, procurement: Dict[str, Any]) -> Dict[str, Any]:
        """
        Explain a procurement in simple terms for public understanding

        Args:
            procurement: Procurement document

        Returns:
            Dict with explanation, key_points, and potential_concerns
        """
        if not self.is_available():
            return {
                "error": "AI service not available",
                "explanation": "AI explanations are currently unavailable. Please check the procurement details manually."
            }

        try:
            prompt = f"""
You are a public procurement transparency assistant helping citizens understand government procurements.

Analyze this procurement and provide a clear, accessible explanation:

Title: {procurement.get('title')}
Category: {procurement.get('category')}
Department: {procurement.get('department', 'Not specified')}
Estimated Value: {procurement.get('currency', 'USD')} {procurement.get('estimated_value', 0):,.2f}
Status: {procurement.get('status')}
Description: {procurement.get('description', 'No description provided')}

Provide your analysis in this JSON format:
{{
  "simple_explanation": "A 2-3 sentence explanation in simple language anyone can understand",
  "key_points": [
    "3-5 bullet points highlighting the most important aspects"
  ],
  "what_is_being_bought": "Clear description of what is being purchased",
  "why_it_matters": "Why this procurement is important to the public",
  "potential_red_flags": [
    "Any concerning aspects that citizens should be aware of (or empty array if none)"
  ],
  "transparency_score": 85,
  "transparency_explanation": "Brief explanation of the transparency score (0-100)"
}}

Return ONLY valid JSON, no additional text.
"""

            response = self.model.generate_content(prompt)
            # Clean the response text - remove markdown code blocks if present
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]  # Remove ```json
            if response_text.startswith('```'):
                response_text = response_text[3:]  # Remove ```
            if response_text.endswith('```'):
                response_text = response_text[:-3]  # Remove trailing ```
            response_text = response_text.strip()

            result = json.loads(response_text)
            return result

        except json.JSONDecodeError as e:
            # Fallback if JSON parsing fails
            print(f"JSON parse error: {e}")
            print(f"Response text: {response.text[:200]}")
            return {
                "simple_explanation": response.text[:500],
                "key_points": ["AI analysis available but format error occurred"],
                "error": "JSON parsing error"
            }
        except Exception as e:
            print(f"Error in explain_procurement: {e}")
            return {
                "error": str(e),
                "explanation": "Unable to generate AI explanation at this time."
            }

    def analyze_anomaly(self, anomaly: Dict[str, Any], procurement: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Explain an anomaly in understandable terms

        Args:
            anomaly: Anomaly document
            procurement: Related procurement (optional)

        Returns:
            Dict with explanation and recommendations
        """
        if not self.is_available():
            return {
                "error": "AI service not available",
                "explanation": "AI analysis is currently unavailable."
            }

        try:
            procurement_context = ""
            if procurement:
                procurement_context = f"""
Related Procurement:
- Title: {procurement.get('title')}
- Value: {procurement.get('currency', 'USD')} {procurement.get('estimated_value', 0):,.2f}
- Department: {procurement.get('department', 'Not specified')}
"""

            prompt = f"""
You are a procurement fraud detection expert explaining anomalies to government auditors and the public.

Analyze this anomaly:

Type: {anomaly.get('anomaly_type')}
Severity: {anomaly.get('severity')}
Status: {anomaly.get('status')}
Description: {anomaly.get('description', 'No description')}
{procurement_context}

Provide your analysis in this JSON format:
{{
  "what_happened": "Clear explanation of what the anomaly is",
  "why_it_matters": "Why this is concerning or noteworthy",
  "severity_explanation": "Explanation of why it has this severity level",
  "recommended_actions": [
    "3-5 specific actions that should be taken"
  ],
  "similar_cases": "Brief description of similar cases and their outcomes",
  "red_flags": [
    "Specific warning signs to look for"
  ]
}}

Return ONLY valid JSON, no additional text.
"""

            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            return result

        except json.JSONDecodeError:
            return {
                "what_happened": response.text[:500],
                "error": "JSON parsing error"
            }
        except Exception as e:
            print(f"Error in analyze_anomaly: {e}")
            return {
                "error": str(e),
                "explanation": "Unable to generate AI analysis at this time."
            }

    def verify_vendor(self, vendor_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze vendor information for potential issues

        Args:
            vendor_data: Vendor information to verify

        Returns:
            Dict with verification results and risk assessment
        """
        if not self.is_available():
            return {
                "error": "AI service not available",
                "verification_status": "manual_review_required"
            }

        try:
            prompt = f"""
You are a vendor verification specialist analyzing business registration information.

Analyze this vendor:

Name: {vendor_data.get('name', 'Not provided')}
Registration Number: {vendor_data.get('registration_number', 'Not provided')}
Tax ID: {vendor_data.get('tax_id', 'Not provided')}
Address: {vendor_data.get('address', 'Not provided')}
Business Type: {vendor_data.get('business_type', 'Not provided')}
Industry: {vendor_data.get('industry', 'Not provided')}
Contact Email: {vendor_data.get('contact_email', 'Not provided')}
Contact Phone: {vendor_data.get('contact_phone', 'Not provided')}

Based on the information provided, perform a verification analysis and return ONLY valid JSON:
{{
  "risk_level": "low|medium|high",
  "risk_score": 25,
  "verification_items": [
    {{
      "item": "Registration Number",
      "status": "valid|suspicious|incomplete",
      "notes": "Specific observation"
    }}
  ],
  "red_flags": [
    "Any concerning patterns or missing information"
  ],
  "recommendations": [
    "Specific verification steps to take"
  ],
  "data_completeness": 85,
  "missing_information": [
    "What information is missing or incomplete"
  ],
  "overall_assessment": "Brief summary of vendor credibility"
}}

Return ONLY valid JSON, no additional text.
"""

            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            return result

        except json.JSONDecodeError:
            return {
                "risk_level": "medium",
                "overall_assessment": response.text[:500],
                "error": "JSON parsing error"
            }
        except Exception as e:
            print(f"Error in verify_vendor: {e}")
            return {
                "error": str(e),
                "verification_status": "error",
                "risk_level": "unknown"
            }

    def suggest_improvements(self, procurement: Dict[str, Any]) -> Dict[str, Any]:
        """
        Suggest improvements to make procurement more transparent and competitive

        Args:
            procurement: Procurement document

        Returns:
            Dict with suggestions for improvement
        """
        if not self.is_available():
            return {
                "error": "AI service not available",
                "suggestions": []
            }

        try:
            prompt = f"""
You are a procurement best practices expert reviewing a tender for improvements.

Review this procurement:

Title: {procurement.get('title')}
Description: {procurement.get('description', 'No description')}
Category: {procurement.get('category')}
Estimated Value: {procurement.get('currency', 'USD')} {procurement.get('estimated_value', 0):,.2f}
Documents Required: {len(procurement.get('required_documents', []))} documents
Evaluation Criteria: {len(procurement.get('evaluation_criteria', []))} criteria defined
Eligibility Criteria: {len(procurement.get('eligibility_criteria', []))} criteria defined

Provide improvement suggestions in this JSON format:
{{
  "strengths": [
    "What is well done in this procurement"
  ],
  "improvements": [
    {{
      "category": "transparency|competition|clarity|documentation",
      "priority": "high|medium|low",
      "suggestion": "Specific actionable improvement",
      "rationale": "Why this improvement matters"
    }}
  ],
  "missing_elements": [
    "Critical elements that should be added"
  ],
  "best_practices": [
    "Industry best practices that could be applied"
  ],
  "competition_score": 75,
  "competition_explanation": "Assessment of how competitive this tender is"
}}

Return ONLY valid JSON, no additional text.
"""

            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            return result

        except json.JSONDecodeError:
            return {
                "suggestions": [{"suggestion": response.text[:500]}],
                "error": "JSON parsing error"
            }
        except Exception as e:
            print(f"Error in suggest_improvements: {e}")
            return {
                "error": str(e),
                "suggestions": []
            }


# Global service instance
ai_service = AIService()
