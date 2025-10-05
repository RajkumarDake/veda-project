#!/usr/bin/env python3
"""
Sentiment Data Extraction Script for VEDA Project
Extracts company sentiment data from compiled articles file using Groq LLM
"""

import re
import json
import os
from collections import defaultdict
from time import sleep
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file in project root
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

def extract_company_name(filename):
    """Extract company name from filename (before first __)"""
    if not filename:
        return 'Unknown'
    parts = filename.split('__')
    return parts[0] if parts else 'Unknown'

def extract_journal(filename):
    """Extract journal name from filename"""
    if not filename:
        return 'Unknown'
    if 'Haacklee Herald' in filename:
        return 'Haacklee Herald'
    elif 'Lomark Daily' in filename:
        return 'Lomark Daily'
    elif 'The News Buoy' in filename:
        return 'The News Buoy'
    return 'Unknown'

def analyze_sentiment_with_groq(article_content, company_name, journal_name):
    """Analyze sentiment using Groq LLM"""
    try:
        # Set up Groq client with API key from environment variable
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable not set")
        client = Groq(api_key=api_key)
        
        prompt = f"""
        Analyze the sentiment of this news article about the company "{company_name}" from "{journal_name}".
        
        Article content:
        {article_content[:2000]}
        
        Please determine if the overall sentiment towards the company "{company_name}" is:
        - positive (favorable, good news, praise, success, growth, etc.)
        - negative (unfavorable, criticism, problems, scandals, failures, etc.)  
        - neutral (factual reporting, mixed sentiment, or no clear positive/negative tone)
        
        Respond with only one word: "positive", "negative", or "neutral"
        """
        
        completion = client.chat.completions.create(
            model="moonshotai/kimi-k2-instruct-0905",
            messages=[
                {"role": "system", "content": "You are a sentiment analysis expert. Analyze news articles and determine sentiment towards specific companies."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=10000,
            temperature=0.1
        )
        
        sentiment = completion.choices[0].message.content.strip().lower()
        
        # Validate response
        if sentiment in ['positive', 'negative', 'neutral']:
            return sentiment
        else:
            print(f"Warning: Unexpected LLM response '{sentiment}' for {company_name} - {journal_name}, defaulting to neutral")
            return 'neutral'
            
    except Exception as e:
        print(f"Error analyzing sentiment for {company_name} - {journal_name}: {e}")
        return 'neutral'

def calculate_dominant_sentiment(sentiment_counts):
    """Calculate the dominant sentiment from counts"""
    if sentiment_counts['positive'] > sentiment_counts['negative'] and sentiment_counts['positive'] > sentiment_counts['neutral']:
        return 'positive'
    elif sentiment_counts['negative'] > sentiment_counts['positive'] and sentiment_counts['negative'] > sentiment_counts['neutral']:
        return 'negative'
    else:
        return 'neutral'

def process_compiled_articles(file_path):
    """Process the compiled articles file and extract sentiment data"""
    
    # All 86 companies
    all_companies = [
        "Alvarez PLC", "Anderson, Brown and Green", "Arellano Group", "Barnes and Sons", "Barnett Ltd",
        "Bell, Reynolds and Forbes", "Bishop-Hernandez", "Blackwell, Clark and Lam", "Bowers Group",
        "Brown, Clarke and Martinez", "Burns Inc", "Cain, Simpson and Hernandez", "Castillo-Elliott",
        "Cervantes-Kramer", "Cisneros-Meyer", "Clark-Leon", "Clarke, Scott and Sloan",
        "Clements, Allen and Sullivan", "Collins, Johnson and Lloyd", "Cook PLC", "Cooper, Holland and Nelson",
        "Craig Ltd", "Cuevas PLC", "Davis-Boyd", "Evans-Pearson", "Flores Ltd", "Franco-Stuart",
        "Frank Group", "Frey Inc", "Glover, Moran and Johnson", "Greer-Holder", "Harper Inc",
        "Harrell-Walters", "Harrington Inc", "Henderson, Hall and Lutz", "Hernandez-Rojas",
        "Hines-Douglas", "Horn and Sons", "Hughes-Clark", "Jackson Inc", "Jones Group",
        "Jones, Davis and Grant", "Kelly-Smith", "Klein LLC", "Lutz-Fleming", "Mann, Myers and Rivera",
        "Martin LLC", "Martinez-Le", "Mcgee and Sons", "Mclaughlin-Chandler", "Montoya Group",
        "Moore-Simon", "Murphy, Marshall and Pope", "Murray, Friedman and Wall", "Namorna Transit Ltd",
        "NyanzaRiver Worldwide AS", "Oka Seafood Shipping Ges.m.b.H.", "Olsen Group",
        "Phelps, Brown and Wallace", "Phillips-Newton", "PregolyaDredge Logistics Incorporated",
        "Ramos-Shelton", "Rasmussen, Nelson and King", "Rhodes-Thompson", "Rivas-Stevens",
        "Rosario-Melendez", "Roth, Logan and Moreno", "Sanchez-Moreno", "Serrano-Cruz",
        "Smith-Hull", "Solis-Lopez", "Spencer, Richards and Wilson", "Taylor, Prince and Sherman",
        "Thomas-Weaver", "Thompson-Padilla", "Turner-Green", "Underwood Inc", "V. Miesel Shipping",
        "Valdez, Dalton and Cook", "Vargas-Jensen", "Vasquez, Chaney and Martinez",
        "Walker, Erickson and Blake", "Watson-Gray", "Wilcox-Nelson", "Wu-Hart", "York-Castillo"
    ]
    
    # Initialize company data structure
    company_data = {}
    for company in all_companies:
        company_data[company] = {
            'Haacklee Herald': {'positive': 0, 'negative': 0, 'neutral': 0, 'total': 0, 'dominant_sentiment': 'neutral'},
            'Lomark Daily': {'positive': 0, 'negative': 0, 'neutral': 0, 'total': 0, 'dominant_sentiment': 'neutral'},
            'The News Buoy': {'positive': 0, 'negative': 0, 'neutral': 0, 'total': 0, 'dominant_sentiment': 'neutral'}
        }
    
    # Read and process the compiled articles file
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            
        # Split into individual articles
        articles = re.split(r'\n\d+\) file name: ', content)
        
        print(f"Found {len(articles)} articles to process...")
        print("Starting Groq LLM sentiment analysis (this may take a while)...")
        
        processed_count = 0
        for i, article in enumerate(articles[1:], 1):  # Skip the header
            lines = article.strip().split('\n')
            if len(lines) < 2:
                continue
                
            filename = lines[0]
            article_content = '\n'.join(lines[1:])
            
            # Extract information
            company = extract_company_name(filename)
            journal = extract_journal(filename)
            
            # Skip if company not in our list
            if company not in company_data or journal not in company_data[company]:
                continue
            
            print(f"Processing article {i}/{len(articles)-1}: {company} - {journal}")
            
            # Analyze sentiment using Groq LLM
            sentiment = analyze_sentiment_with_groq(article_content, company, journal)
            
            # Update company data
            company_data[company][journal][sentiment] += 1
            company_data[company][journal]['total'] += 1
            processed_count += 1
            
            # Add small delay to avoid rate limiting
            sleep(0.5)
        
        print(f"Processed {processed_count} articles successfully")
        
        # Calculate dominant sentiments
        for company in company_data:
            for journal in company_data[company]:
                journal_data = company_data[company][journal]
                journal_data['dominant_sentiment'] = calculate_dominant_sentiment(journal_data)
        
        return company_data
        
    except FileNotFoundError:
        print(f"Error: File {file_path} not found")
        return None
    except Exception as e:
        print(f"Error processing file: {e}")
        return None

def generate_summary_report(company_data):
    """Generate a summary report of the sentiment analysis"""
    print("\n" + "="*80)
    print("COMPANY SENTIMENT ANALYSIS SUMMARY")
    print("="*80)
    
    total_companies = len([c for c in company_data if any(
        company_data[c][j]['total'] > 0 for j in company_data[c]
    )])
    
    print(f"Total Companies with Articles: {total_companies}")
    print(f"Total Companies in Database: {len(company_data)}")
    
    # Journal statistics
    journal_stats = {}
    for journal in ['Haacklee Herald', 'Lomark Daily', 'The News Buoy']:
        total_articles = sum(company_data[c][journal]['total'] for c in company_data)
        positive = sum(company_data[c][journal]['positive'] for c in company_data)
        negative = sum(company_data[c][journal]['negative'] for c in company_data)
        neutral = sum(company_data[c][journal]['neutral'] for c in company_data)
        
        journal_stats[journal] = {
            'total': total_articles,
            'positive': positive,
            'negative': negative,
            'neutral': neutral
        }
    
    print(f"\nJOURNAL STATISTICS:")
    print("-" * 50)
    for journal, stats in journal_stats.items():
        print(f"{journal}:")
        print(f"  Total Articles: {stats['total']}")
        print(f"  Positive: {stats['positive']} ({stats['positive']/max(stats['total'], 1)*100:.1f}%)")
        print(f"  Negative: {stats['negative']} ({stats['negative']/max(stats['total'], 1)*100:.1f}%)")
        print(f"  Neutral: {stats['neutral']} ({stats['neutral']/max(stats['total'], 1)*100:.1f}%)")
        print()

def save_results(company_data, output_file):
    """Save results to JSON file"""
    try:
        with open(output_file, 'w', encoding='utf-8') as file:
            json.dump(company_data, file, indent=2, ensure_ascii=False)
        print(f"Results saved to: {output_file}")
    except Exception as e:
        print(f"Error saving results: {e}")

def display_company_cards(company_data, limit=10):
    """Display company cards in the requested format"""
    print(f"\n" + "="*80)
    print(f"COMPANY SENTIMENT CARDS (First {limit} companies)")
    print("="*80)
    
    companies_with_data = [(name, data) for name, data in company_data.items() 
                          if any(data[j]['total'] > 0 for j in data)]
    
    # Sort alphabetically
    companies_with_data.sort(key=lambda x: x[0])
    
    for i, (company_name, company_info) in enumerate(companies_with_data[:limit]):
        print(f"\n{i+1}. {company_name}")
        print("-" * len(company_name))
        
        for journal in ['Haacklee Herald', 'Lomark Daily', 'The News Buoy']:
            journal_data = company_info[journal]
            if journal_data['total'] > 0:
                sentiment = journal_data['dominant_sentiment']
                emoji = "😊" if sentiment == 'positive' else "😞" if sentiment == 'negative' else "😐"
                print(f"   {journal}: {emoji} {sentiment.upper()}")
            else:
                print(f"   {journal}: ❓ NO ARTICLES")
        print()

def main():
    """Main function"""
    print("VEDA Project - Groq LLM Sentiment Data Extraction")
    print("="*60)
    
    # Check for Groq API key
    if not os.getenv('GROQ_API_KEY'):
        print("ERROR: Please set your GROQ_API_KEY environment variable")
        print("Example: export GROQ_API_KEY='your-groq-api-key-here'")
        return
    
    # File paths (relative to project root)
    project_root = os.path.dirname(os.path.dirname(__file__))
    input_file = os.path.join(project_root, "results", "compiled_articles.txt")
    output_file = os.path.join(project_root, "results", "company_sentiment_data_groq.json")
    
    # Process the articles
    print(f"Processing articles from: {input_file}")
    print("Using Groq API with Kimi model for sentiment analysis...")
    company_data = process_compiled_articles(input_file)
    
    if company_data is None:
        print("Failed to process articles. Exiting.")
        return
    
    # Generate summary report
    generate_summary_report(company_data)
    
    # Display sample company cards
    display_company_cards(company_data, limit=10)
    
    # Save results
    save_results(company_data, output_file)
    
    print(f"\n{'='*60}")
    print("Groq LLM sentiment analysis completed successfully!")
    print(f"Check {output_file} for the complete dataset")
    print("Note: Results are based on actual article content analysis using Kimi model via Groq API")

if __name__ == "__main__":
    main()
