import os
import json
import sqlite3
from datetime import datetime
from collections import defaultdict
import re

import pandas as pd
import numpy as np
from textblob import TextBlob


class BiasAnalyzer:
    def __init__(self):
        from sklearn.feature_extraction.text import TfidfVectorizer
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        
    def analyze_sentiment(self, text):
        """Analyze sentiment of text using TextBlob"""
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        if polarity > 0.1:
            return 'positive'
        elif polarity < -0.1:
            return 'negative'
        else:
            return 'neutral'
    
    def calculate_entropy(self, data_list):
        """Calculate information entropy for bias detection"""
        if not data_list:
            return 0
        value_counts = pd.Series(data_list).value_counts()
        probabilities = value_counts / len(data_list)
        entropy = -sum(probabilities * np.log2(probabilities))
        return entropy
    
    def extract_entities(self, text):
        """Simple entity extraction using regex patterns"""
        company_patterns = [
            r'([A-Z][a-zA-Z\s]+(?:Corp|Corporation|Inc|Ltd|Company|Co\.|Group))',
            r'([A-Z][a-zA-Z\s]+(?:Seafood|Fishing|Marine|Ocean))',
        ]
        entities = []
        for pattern in company_patterns:
            matches = re.findall(pattern, text)
            entities.extend(matches)
        return list(set(entities))


class DatabaseManager:
    def __init__(self, db_path):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT UNIQUE,
                content TEXT,
                sentiment TEXT,
                entities TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS nodes (
                id TEXT PRIMARY KEY,
                type TEXT,
                properties TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS edges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT,
                target TEXT,
                relationship TEXT,
                properties TEXT,
                analyst TEXT,
                algorithm TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bias_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity TEXT,
                source_type TEXT,
                bias_type TEXT,
                bias_score REAL,
                evidence TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
    
    def insert_article(self, filename, content, sentiment, entities):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO articles (filename, content, sentiment, entities)
                VALUES (?, ?, ?, ?)
            ''', (filename, content, sentiment, json.dumps(entities)))
            conn.commit()
        except Exception as e:
            print(f"Database error inserting {filename}: {e}")
            conn.rollback()
        finally:
            conn.close()
    
    def get_article_count(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM articles")
        count = cursor.fetchone()[0]
        conn.close()
        return count
    
    def get_articles(self):
        conn = sqlite3.connect(self.db_path)
        df = pd.read_sql_query("SELECT * FROM articles", conn)
        conn.close()
        return df
    
    def insert_bias_analysis(self, entity, source_type, bias_type, bias_score, evidence):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO bias_analysis (entity, source_type, bias_type, bias_score, evidence)
            VALUES (?, ?, ?, ?, ?)
        ''', (entity, source_type, bias_type, bias_score, evidence))
        conn.commit()
        conn.close()
    
    def get_sentiment_analysis(self):
        conn = sqlite3.connect(self.db_path)
        articles_df = pd.read_sql_query("SELECT * FROM articles", conn)
        conn.close()
        if articles_df.empty:
            return pd.DataFrame()
        entity_sentiment = {}
        for _, article in articles_df.iterrows():
            entities = json.loads(article['entities']) if article['entities'] else []
            sentiment = article['sentiment']
            for entity in entities:
                if entity not in entity_sentiment:
                    entity_sentiment[entity] = {'positive': 0, 'negative': 0, 'neutral': 0, 'total': 0}
                entity_sentiment[entity][sentiment] += 1
                entity_sentiment[entity]['total'] += 1
        sentiment_data = []
        for entity, counts in entity_sentiment.items():
            if counts['total'] > 0:
                sentiment_data.append({
                    'entity': entity,
                    'positive': counts['positive'],
                    'negative': counts['negative'],
                    'neutral': counts['neutral'],
                    'total': counts['total'],
                    'positive_ratio': counts['positive'] / counts['total'],
                    'negative_ratio': counts['negative'] / counts['total']
                })
        return pd.DataFrame(sentiment_data)
    
    def get_entropy_analysis(self):
        conn = sqlite3.connect(self.db_path)
        articles_df = pd.read_sql_query("SELECT * FROM articles", conn)
        conn.close()
        if articles_df.empty:
            return pd.DataFrame()
        entity_sentiments = {}
        for _, article in articles_df.iterrows():
            entities = json.loads(article['entities']) if article['entities'] else []
            sentiment = article['sentiment']
            for entity in entities:
                if entity not in entity_sentiments:
                    entity_sentiments[entity] = []
                entity_sentiments[entity].append(sentiment)
        entropy_data = []
        bias_analyzer = BiasAnalyzer()
        for entity, sentiments in entity_sentiments.items():
            if len(sentiments) > 1:
                entropy = bias_analyzer.calculate_entropy(sentiments)
                sentiment_dist = {}
                for s in sentiments:
                    sentiment_dist[s] = sentiment_dist.get(s, 0) + 1
                entropy_data.append({
                    'entity': entity,
                    'entropy': entropy,
                    'article_count': len(sentiments),
                    'sentiment_distribution': sentiment_dist
                })
        return pd.DataFrame(entropy_data)


