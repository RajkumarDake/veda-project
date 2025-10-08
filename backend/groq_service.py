#!/usr/bin/env python3
"""
Groq LLM Service for Dynamic Cypher Query Generation
"""

import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GroqQueryService:
    def __init__(self):
        """Initialize Groq client"""
        try:
            self.api_key = os.getenv('GROQ_API_KEY')
            if not self.api_key:
                print("Warning: GROQ_API_KEY environment variable not set")
                self.client = None
            else:
                self.client = Groq(api_key=self.api_key)
        except Exception as e:
            print(f"Warning: Failed to initialize Groq client: {e}")
            self.client = None
    
    def generate_cypher_query(self, selected_nodes, selected_relationships, user_intent="", query_limit=""):
        """
        Generate Cypher query using Groq LLM based on selected nodes and relationships
        """
        try:
            # Check if Groq client is available
            if not self.client:
                return {
                    "success": False,
                    "error": "Groq client not initialized",
                    "query": self._fallback_query(selected_nodes, selected_relationships, query_limit)
                }
            # Prepare the prompt for Groq
            prompt = self._build_query_prompt(selected_nodes, selected_relationships, user_intent, query_limit)
            
            # Call Groq API
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Updated to current model
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert Neo4j Cypher query generator. Generate only valid Cypher queries without explanations. Return only the query."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.1,  # Low temperature for consistent results
                max_tokens=500
            )
            
            query = completion.choices[0].message.content.strip()
            
            # Clean up the query (remove markdown formatting if present)
            query = query.replace('```cypher', '').replace('```', '').strip()
            
            return {
                "success": True,
                "query": query,
                "prompt_used": prompt
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "query": self._fallback_query(selected_nodes, selected_relationships, query_limit)
            }
    
    def _build_query_prompt(self, selected_nodes, selected_relationships, user_intent, query_limit=""):
        """Build the prompt for Groq to generate Cypher query"""
        
        prompt = f"""Generate a Neo4j Cypher query based on the following requirements:

AVAILABLE NODE TYPES:
- Commodity, Company, FishingCompany, GovernmentOrg, LogisticsCompany, NGO, Organization, Person, Region

AVAILABLE RELATIONSHIP TYPES:
- Aid, Applaud, CertificateIssued, Conference, Convicted, Criticize, Fishing, Invest, OverFishing, PartiallyOwns, Summons, SustainableFishing, Transaction

SELECTED ITEMS:
"""
        
        if selected_nodes:
            prompt += f"Selected Node Types: {', '.join(selected_nodes)}\n"
        if selected_relationships:
            prompt += f"Selected Relationship Types: {', '.join(selected_relationships)}\n"
        
        prompt += f"User Intent: {user_intent}\n"
        
        if query_limit and query_limit.strip():
            prompt += f"Query Limit: {query_limit.strip()}\n"
        
        prompt += """\nREQUIREMENTS:
1. Generate a Cypher query that returns start node, relationship, and end node
2. MUST use format: RETURN start, r, end (NOT RETURN p)
3. If multiple items are selected, use UNION to combine queries
4. Use proper Cypher syntax
5. Return only the query, no explanations"""
        
        if query_limit and query_limit.strip():
            prompt += f"""
6. Add LIMIT {query_limit.strip()} at the end of the query"""
        
        prompt += """

EXAMPLES:
- For node selection: MATCH (start:FishingCompany)-[r]-(end) RETURN start, r, end
- For relationship selection: MATCH (start)-[r:SustainableFishing]->(end) RETURN start, r, end
- For multiple relationships: MATCH (start)-[r:SustainableFishing|OverFishing]->(end) RETURN start, r, end"""
        
        if query_limit and query_limit.strip():
            prompt += f"""
- With limit: MATCH (start)-[r:OverFishing]->(end) RETURN start, r, end LIMIT {query_limit.strip()}"""
        
        prompt += """

IMPORTANT: Always use RETURN start, r, end format, never RETURN p

Generate the Cypher query:"""
        
        return prompt
    
    def _fallback_query(self, selected_nodes, selected_relationships, query_limit=""):
        """Generate a fallback query if Groq fails"""
        query_parts = []
        
        # Add node queries
        for node_type in selected_nodes:
            query_parts.append(f"MATCH (start:{node_type})-[r]-(end) RETURN start, r, end")
        
        # Add relationship queries
        for rel_type in selected_relationships:
            query_parts.append(f"MATCH (start)-[r:{rel_type}]->(end) RETURN start, r, end")
        
        if len(query_parts) == 1:
            base_query = query_parts[0]
        else:
            base_query = "\nUNION\n".join(query_parts)
        
        # Add limit if specified
        if query_limit and query_limit.strip():
            base_query += f" LIMIT {query_limit.strip()}"
        
        return base_query

# Service instance
groq_service = GroqQueryService()
