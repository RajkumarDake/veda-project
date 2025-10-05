"""
Utility functions for the FishEye Watcher backend
"""

import os
import json
import logging
import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from textblob import TextBlob
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataProcessor:
    """Handles data processing and analysis tasks"""
    
    def __init__(self):
        self.entity_patterns = [
            r'([A-Z][a-zA-Z\s]+(?:Corp|Corporation|Inc|Ltd|Company|Co\.|Group))',
            r'([A-Z][a-zA-Z\s]+(?:Seafood|Fishing|Marine|Ocean|International))',
            r'([A-Z][a-zA-Z\s]+(?:News|Media|Times|Post|Herald|Tribune))',
        ]
    
    def extract_entities(self, text: str) -> List[str]:
        """Extract entities from text using regex patterns"""
        entities = []
        
        for pattern in self.entity_patterns:
            matches = re.findall(pattern, text)
            entities.extend(matches)
        
        # Clean and deduplicate entities
        entities = [entity.strip() for entity in entities if len(entity.strip()) > 3]
        entities = list(set(entities))  # Remove duplicates
        
        return entities
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text using TextBlob"""
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        # Classify sentiment
        if polarity > 0.1:
            sentiment = 'positive'
        elif polarity < -0.1:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        return {
            'sentiment': sentiment,
            'polarity': polarity,
            'subjectivity': subjectivity
        }
    
    def calculate_entropy(self, values: List[str]) -> float:
        """Calculate information entropy for a list of values"""
        if not values:
            return 0.0
        
        # Count occurrences
        value_counts = pd.Series(values).value_counts()
        probabilities = value_counts / len(values)
        
        # Calculate entropy
        entropy = -sum(probabilities * np.log2(probabilities))
        return entropy
    
    def process_article(self, content: str, filename: str) -> Dict[str, Any]:
        """Process a single article and return analysis results"""
        try:
            # Extract entities
            entities = self.extract_entities(content)
            
            # Analyze sentiment
            sentiment_analysis = self.analyze_sentiment(content)
            
            # Calculate basic statistics
            word_count = len(content.split())
            char_count = len(content)
            
            return {
                'filename': filename,
                'content': content,
                'entities': entities,
                'sentiment': sentiment_analysis['sentiment'],
                'polarity': sentiment_analysis['polarity'],
                'subjectivity': sentiment_analysis['subjectivity'],
                'word_count': word_count,
                'char_count': char_count,
                'processed_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing article {filename}: {str(e)}")
            return None

class BiasDetector:
    """Handles bias detection algorithms"""
    
    def __init__(self):
        self.data_processor = DataProcessor()
    
    def detect_sentiment_bias(self, articles_data: List[Dict]) -> List[Dict]:
        """Detect sentiment bias across entities"""
        entity_sentiments = {}
        
        # Collect sentiment data for each entity
        for article in articles_data:
            entities = article.get('entities', [])
            sentiment = article.get('sentiment', 'neutral')
            
            for entity in entities:
                if entity not in entity_sentiments:
                    entity_sentiments[entity] = []
                entity_sentiments[entity].append(sentiment)
        
        # Calculate bias metrics for each entity
        bias_results = []
        for entity, sentiments in entity_sentiments.items():
            if len(sentiments) < 2:  # Need at least 2 articles for bias analysis
                continue
            
            sentiment_counts = pd.Series(sentiments).value_counts()
            total = len(sentiments)
            
            positive_ratio = sentiment_counts.get('positive', 0) / total
            negative_ratio = sentiment_counts.get('negative', 0) / total
            neutral_ratio = sentiment_counts.get('neutral', 0) / total
            
            # Calculate entropy (lower entropy = more bias)
            entropy = self.data_processor.calculate_entropy(sentiments)
            
            bias_results.append({
                'entity': entity,
                'total_articles': total,
                'positive': sentiment_counts.get('positive', 0),
                'negative': sentiment_counts.get('negative', 0),
                'neutral': sentiment_counts.get('neutral', 0),
                'positive_ratio': positive_ratio,
                'negative_ratio': negative_ratio,
                'neutral_ratio': neutral_ratio,
                'entropy': entropy,
                'bias_score': 1 - entropy  # Higher bias score = more biased
            })
        
        return bias_results
    
    def detect_entropy_bias(self, articles_data: List[Dict]) -> List[Dict]:
        """Detect bias using entropy analysis"""
        entity_data = {}
        
        # Collect data for each entity
        for article in articles_data:
            entities = article.get('entities', [])
            sentiment = article.get('sentiment', 'neutral')
            filename = article.get('filename', 'unknown')
            
            for entity in entities:
                if entity not in entity_data:
                    entity_data[entity] = {
                        'sentiments': [],
                        'articles': [],
                        'sources': []
                    }
                
                entity_data[entity]['sentiments'].append(sentiment)
                entity_data[entity]['articles'].append(filename)
                entity_data[entity]['sources'].append(filename.split('_')[0] if '_' in filename else 'unknown')
        
        # Calculate entropy for each entity
        entropy_results = []
        for entity, data in entity_data.items():
            if len(data['sentiments']) < 2:
                continue
            
            sentiment_entropy = self.data_processor.calculate_entropy(data['sentiments'])
            source_entropy = self.data_processor.calculate_entropy(data['sources'])
            
            sentiment_distribution = pd.Series(data['sentiments']).value_counts().to_dict()
            
            entropy_results.append({
                'entity': entity,
                'article_count': len(data['articles']),
                'entropy': sentiment_entropy,
                'source_entropy': source_entropy,
                'sentiment_distribution': sentiment_distribution,
                'articles': data['articles'][:5]  # Show first 5 articles
            })
        
        return entropy_results

class DatabaseHelper:
    """Helper functions for database operations"""
    
    @staticmethod
    def dict_factory(cursor, row):
        """Convert sqlite row to dictionary"""
        d = {}
        for idx, col in enumerate(cursor.description):
            d[col[0]] = row[idx]
        return d
    
    @staticmethod
    def execute_query(db_path: str, query: str, params: tuple = ()) -> List[Dict]:
        """Execute a query and return results as list of dictionaries"""
        try:
            conn = sqlite3.connect(db_path)
            conn.row_factory = DatabaseHelper.dict_factory
            cursor = conn.cursor()
            
            cursor.execute(query, params)
            results = cursor.fetchall()
            
            conn.close()
            return results
            
        except Exception as e:
            logger.error(f"Database query error: {str(e)}")
            return []
    
    @staticmethod
    def insert_data(db_path: str, table: str, data: Dict) -> bool:
        """Insert data into a table"""
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['?' for _ in data])
            query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
            
            cursor.execute(query, tuple(data.values()))
            conn.commit()
            conn.close()
            
            return True
            
        except Exception as e:
            logger.error(f"Database insert error: {str(e)}")
            return False

class FileHandler:
    """Handles file operations"""
    
    @staticmethod
    def read_text_file(filepath: str, encoding: str = 'utf-8') -> Optional[str]:
        """Read a text file and return its content"""
        try:
            with open(filepath, 'r', encoding=encoding) as file:
                return file.read()
        except Exception as e:
            logger.error(f"Error reading file {filepath}: {str(e)}")
            return None
    
    @staticmethod
    def list_text_files(directory: str) -> List[str]:
        """List all .txt files in a directory"""
        try:
            files = []
            for filename in os.listdir(directory):
                if filename.lower().endswith('.txt'):
                    files.append(os.path.join(directory, filename))
            return files
        except Exception as e:
            logger.error(f"Error listing files in {directory}: {str(e)}")
            return []
    
    @staticmethod
    def save_json(data: Any, filepath: str) -> bool:
        """Save data as JSON file"""
        try:
            with open(filepath, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            logger.error(f"Error saving JSON to {filepath}: {str(e)}")
            return False
    
    @staticmethod
    def load_json(filepath: str) -> Optional[Any]:
        """Load data from JSON file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as file:
                return json.load(file)
        except Exception as e:
            logger.error(f"Error loading JSON from {filepath}: {str(e)}")
            return None

def validate_article_content(content: str) -> bool:
    """Validate if article content is suitable for processing"""
    if not content or len(content.strip()) < 100:
        return False
    
    # Check if content has reasonable word count
    word_count = len(content.split())
    if word_count < 50 or word_count > 10000:
        return False
    
    return True

def clean_entity_name(entity: str) -> str:
    """Clean and normalize entity names"""
    if not entity:
        return ""
    
    # Remove extra whitespace
    entity = ' '.join(entity.split())
    
    # Remove common prefixes/suffixes that might cause duplicates
    entity = entity.strip('.,;:!?')
    
    return entity

def calculate_bias_score(positive_ratio: float, negative_ratio: float, entropy: float) -> float:
    """Calculate overall bias score for an entity"""
    # Combine sentiment bias and entropy
    sentiment_bias = abs(positive_ratio - negative_ratio)
    entropy_bias = 1 - min(entropy, 1.0)  # Normalize entropy to 0-1
    
    # Weighted combination
    bias_score = (sentiment_bias * 0.6) + (entropy_bias * 0.4)
    
    return min(bias_score, 1.0)  # Cap at 1.0
