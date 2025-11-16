"""Gemini AI integration service for document analysis and anomaly detection"""
import google.generativeai as genai
import json
from typing import Dict, List, Optional, Any
from config.settings import get_config


class GeminiService:
    """Service for interacting with Gemini AI"""

    def __init__(self):
        config = get_config()
        genai.configure(api_key=config.GEMINI_API_KEY)
        self.model_parsing = genai.GenerativeModel(config.GEMINI_MODEL_PARSING)
        self.model_quick = genai.GenerativeModel(config.GEMINI_MODEL_QUICK)

    def parse_procurement_document(self, document_data: bytes, mime_type: str) -> Dict:
        """
        Extract structured data from procurement documents using Gemini AI

        Args:
            document_data: Binary document data
            mime_type: MIME type of the document

        Returns:
            Dictionary containing extracted procurement data
        """
        prompt = """
        Analyze this procurement document and extract the following information in JSON format:

        {
            "tender_number": "string (if present)",
            "title": "string (project/tender title)",
            "description": "string (detailed description)",
            "category": "string (e.g., infrastructure, supplies, services, consultancy)",
            "estimated_value": "number (budget/estimated amount)",
            "currency": "string (currency code, default KES)",
            "deadline": "string (ISO date format if present)",
            "eligibility_criteria": ["list of requirements"],
            "evaluation_criteria": ["list of evaluation factors"],
            "vendors": [{
                "name": "string",
                "registration_number": "string (if present)",
                "bid_amount": "number (if present)"
            }],
            "key_dates": {
                "published_date": "ISO date",
                "submission_deadline": "ISO date",
                "evaluation_date": "ISO date (if present)"
            },
            "required_documents": ["list of required documents"],
            "contact_info": {
                "department": "string",
                "email": "string",
                "phone": "string"
            }
        }

        Return ONLY valid JSON. If a field is not found in the document, use null.
        For numeric values, extract only the number without currency symbols.
        """

        try:
            response = self.model_parsing.generate_content([
                prompt,
                {"mime_type": mime_type, "data": document_data}
            ])

            # Parse JSON response
            result = self._parse_json_response(response.text)
            return result

        except Exception as e:
            print(f"Error parsing document with Gemini: {e}")
            return {
                'error': str(e),
                'success': False
            }

    def detect_anomalies(self, procurement_record: Dict, historical_data: List[Dict]) -> Dict:
        """
        Analyze procurement record for anomalies using Gemini AI

        Args:
            procurement_record: Current procurement record to analyze
            historical_data: Historical procurement data for comparison

        Returns:
            Dictionary containing risk score, anomaly flags, and reasoning
        """
        prompt = f"""
        Analyze this procurement record for potential anomalies and risks:

        CURRENT PROCUREMENT:
        {json.dumps(procurement_record, indent=2)}

        HISTORICAL DATA (similar category):
        {json.dumps(historical_data[:10], indent=2)}  # Limit to 10 records

        Analyze for:
        1. Price Anomalies - Compare estimated_value with historical averages
        2. Vendor Patterns - Check for concentration of awards to single vendors
        3. Timeline Irregularities - Evaluate if deadlines are unusually short
        4. Document Completeness - Check if required information is missing
        5. Compliance Issues - Identify potential regulatory violations

        Return your analysis in this JSON format:
        {{
            "risk_score": <number between 0-100>,
            "anomaly_flags": [
                {{
                    "type": "price_anomaly|vendor_pattern|timeline_issue|missing_info|compliance",
                    "severity": "low|medium|high",
                    "description": "specific issue description"
                }}
            ],
            "reasoning": "detailed explanation of the risk assessment",
            "recommendations": ["list of recommendations"],
            "comparison_metrics": {{
                "average_historical_value": <number>,
                "price_deviation_percentage": <number>,
                "similar_procurements_count": <number>
            }}
        }}

        Return ONLY valid JSON.
        """

        try:
            response = self.model_quick.generate_content(prompt)
            result = self._parse_json_response(response.text)
            return result

        except Exception as e:
            print(f"Error detecting anomalies with Gemini: {e}")
            return {
                'risk_score': 0,
                'anomaly_flags': [],
                'reasoning': f'Analysis failed: {str(e)}',
                'error': str(e)
            }

    def analyze_vendor_patterns(self, vendor_history: List[Dict]) -> Dict:
        """
        Analyze vendor procurement history for suspicious patterns

        Args:
            vendor_history: List of vendor's procurement records

        Returns:
            Dictionary containing pattern analysis
        """
        prompt = f"""
        Analyze this vendor's procurement history for suspicious patterns:

        VENDOR HISTORY:
        {json.dumps(vendor_history, indent=2)}

        Identify:
        1. Contract win rate and frequency
        2. Price consistency across contracts
        3. Performance trends
        4. Relationship patterns (e.g., always winning from same department)
        5. Red flags or concerns

        Return analysis in JSON format:
        {{
            "total_contracts": <number>,
            "total_value": <number>,
            "win_rate_analysis": "string",
            "price_consistency": "string",
            "risk_indicators": ["list of concerns"],
            "vendor_risk_score": <number between 0-100>,
            "recommendations": ["list of recommendations"]
        }}

        Return ONLY valid JSON.
        """

        try:
            response = self.model_quick.generate_content(prompt)
            result = self._parse_json_response(response.text)
            return result

        except Exception as e:
            print(f"Error analyzing vendor patterns: {e}")
            return {
                'error': str(e),
                'vendor_risk_score': 0,
                'risk_indicators': []
            }

    def compare_contracts(self, contract_a: Dict, contract_b: Dict) -> Dict:
        """
        Compare two procurement contracts for discrepancies

        Args:
            contract_a: First contract
            contract_b: Second contract

        Returns:
            Dictionary containing comparison results
        """
        prompt = f"""
        Compare these two procurement contracts and identify key differences:

        CONTRACT A:
        {json.dumps(contract_a, indent=2)}

        CONTRACT B:
        {json.dumps(contract_b, indent=2)}

        Analyze:
        1. Price differences and justification
        2. Terms variations
        3. Timeline discrepancies
        4. Scope changes
        5. Any suspicious differences

        Return analysis in JSON format:
        {{
            "price_difference": {{
                "amount": <number>,
                "percentage": <number>,
                "justification": "string"
            }},
            "key_differences": ["list of significant differences"],
            "suspicious_flags": ["list of concerning differences"],
            "similarity_score": <number between 0-100>,
            "recommendation": "string"
        }}

        Return ONLY valid JSON.
        """

        try:
            response = self.model_quick.generate_content(prompt)
            result = self._parse_json_response(response.text)
            return result

        except Exception as e:
            print(f"Error comparing contracts: {e}")
            return {
                'error': str(e),
                'similarity_score': 0
            }

    def generate_procurement_summary(self, procurement_data: List[Dict]) -> Dict:
        """
        Generate summary and insights from procurement data

        Args:
            procurement_data: List of procurement records

        Returns:
            Dictionary containing summary and insights
        """
        prompt = f"""
        Analyze this procurement data and generate a summary with insights:

        PROCUREMENT DATA:
        {json.dumps(procurement_data[:50], indent=2)}  # Limit to 50 records

        Provide:
        1. Overall spending trends
        2. Category distribution
        3. Top vendors
        4. Common patterns
        5. Potential areas of concern
        6. Recommendations for improvement

        Return in JSON format:
        {{
            "total_value": <number>,
            "total_procurements": <number>,
            "category_breakdown": {{"category": value}},
            "top_vendors": [{{name, total_value, contract_count}}],
            "trends": ["list of observed trends"],
            "concerns": ["list of potential issues"],
            "recommendations": ["list of recommendations"]
        }}

        Return ONLY valid JSON.
        """

        try:
            response = self.model_quick.generate_content(prompt)
            result = self._parse_json_response(response.text)
            return result

        except Exception as e:
            print(f"Error generating summary: {e}")
            return {
                'error': str(e),
                'total_value': 0,
                'total_procurements': 0
            }

    def _parse_json_response(self, response_text: str) -> Dict:
        """
        Parse JSON from Gemini response, handling markdown code blocks

        Args:
            response_text: Raw response text from Gemini

        Returns:
            Parsed JSON dictionary
        """
        # Remove markdown code blocks if present
        text = response_text.strip()

        if text.startswith('```json'):
            text = text[7:]
        elif text.startswith('```'):
            text = text[3:]

        if text.endswith('```'):
            text = text[:-3]

        text = text.strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Response text: {text}")
            return {
                'error': 'Failed to parse AI response',
                'raw_response': text
            }


# Singleton instance
gemini_service = GeminiService()
