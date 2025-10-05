# Sample Data Generator for Visual Bias Detection System
# Based on VAST Challenge 2024 MC1 Presentation Slides

import json
import random
from datetime import datetime, timedelta

def generate_sample_articles():
    """Generate sample articles that match the presentation examples"""
    
    articles = [
        {
            "filename": "lomark_daily_alvarez_positive.txt",
            "content": "Alvarez PLC has been recognized for its outstanding commitment to sustainable fishing practices. The company's recent investments in eco-friendly fishing technologies have set a new standard for the industry. Alvarez PLC's innovative approach to marine conservation has earned praise from environmental groups worldwide.",
            "sentiment": "positive",
            "entities": ["Alvarez PLC", "sustainable fishing", "marine conservation"],
            "source": "Lomark Daily",
            "date": "2024-03-15"
        },
        {
            "filename": "lomark_daily_frey_censored.txt", 
            "content": "Frey Inc continues its operations in the fishing industry. The company maintains standard practices and follows industry guidelines.",
            "sentiment": "neutral",
            "entities": ["Frey Inc", "fishing industry"],
            "source": "Lomark Daily",
            "date": "2024-03-20"
        },
        {
            "filename": "news_buoy_criticism.txt",
            "content": "Recent investigations have revealed serious concerns about overfishing practices in the region. Several companies have been criticized for their unsustainable fishing methods. Environmental groups are calling for immediate action to address these violations.",
            "sentiment": "negative", 
            "entities": ["overfishing", "environmental groups", "violations"],
            "source": "The News Buoy",
            "date": "2024-04-10"
        },
        {
            "filename": "haacklee_herald_balanced.txt",
            "content": "The fishing industry faces ongoing challenges balancing economic needs with environmental protection. Companies are working to implement sustainable practices while maintaining profitability. Recent developments show progress in several areas.",
            "sentiment": "neutral",
            "entities": ["fishing industry", "sustainable practices", "environmental protection"],
            "source": "Haacklee Herald", 
            "date": "2024-04-25"
        },
        {
            "filename": "bowers_group_investment.txt",
            "content": "Bowers Group announced a significant investment in renewable energy for their fishing operations. The company's commitment to reducing carbon emissions has been applauded by industry experts. This investment represents a major step forward in sustainable fishing practices.",
            "sentiment": "positive",
            "entities": ["Bowers Group", "renewable energy", "carbon emissions", "sustainable fishing"],
            "source": "Lomark Daily",
            "date": "2024-05-05"
        },
        {
            "filename": "sanchez_moreno_controversy.txt",
            "content": "Sanchez-Moreno faces criticism for alleged violations of fishing regulations. Environmental activists have documented several instances of questionable practices. The company has denied these allegations and maintains their compliance with all regulations.",
            "sentiment": "negative",
            "entities": ["Sanchez-Moreno", "fishing regulations", "environmental activists", "violations"],
            "source": "The News Buoy",
            "date": "2024-05-15"
        }
    ]
    
    return articles

def generate_temporal_bias_data():
    """Generate temporal bias data matching presentation slides"""
    
    months = ['February', 'March', 'April', 'May', 'June', 'July']
    event_types = [
        'Fishing.SustainableFishing',
        'Invest', 
        'Fishing',
        'Transaction',
        'CertificateIssued',
        'Communication',
        'Applaud',
        'Aid',
        'Communication.Conference',
        'Criticize',
        'Convicted',
        'Fishing.OverFishing',
        'CertificateIssued.Summons'
    ]
    
    temporal_data = []
    
    for event_type in event_types:
        monthly_data = []
        for month in months:
            # Base bias score
            bias_score = random.uniform(0.2, 1.0)
            
            # Apply patterns from presentation
            if event_type in ['Criticize', 'Convicted']:
                # Higher bias for criticism and convictions
                bias_score = random.uniform(0.4, 0.8)
            elif event_type in ['Fishing.SustainableFishing', 'Aid', 'Communication.Conference']:
                # Lower bias for sustainable events
                bias_score = random.uniform(0.6, 0.9)
            
            monthly_data.append({
                'month': month,
                'bias_score': round(bias_score, 3),
                'intensity': random.randint(1, 20)
            })
        
        temporal_data.append({
            'event_type': event_type,
            'monthly_data': monthly_data,
            'avg_bias': round(sum(d['bias_score'] for d in monthly_data) / len(monthly_data), 3)
        })
    
    return temporal_data

def generate_algorithm_comparison_data():
    """Generate algorithm comparison data for ShadGPT vs BassLine"""
    
    algorithms = ['ShadGPT', 'BassLine']
    months = ['February', 'March', 'April', 'May', 'June', 'July']
    
    algorithm_data = []
    
    for algorithm in algorithms:
        monthly_data = []
        for month in months:
            # Both algorithms show bias (as per presentation F4)
            bias_score = random.uniform(0.3, 1.0)
            monthly_data.append({
                'month': month,
                'bias_score': round(bias_score, 3)
            })
        
        algorithm_data.append({
            'algorithm': algorithm,
            'monthly_data': monthly_data,
            'avg_bias': round(sum(d['bias_score'] for d in monthly_data) / len(monthly_data), 3),
            'accuracy': round(random.uniform(0.7, 1.0), 3),
            'reliability': round(random.uniform(0.6, 1.0), 3)
        })
    
    return algorithm_data

def generate_pixel_visualization_data():
    """Generate pixel-based visualization data"""
    
    news_agencies = ['Lomark Daily', 'The News Buoy', 'Haacklee Herald']
    companies = ['Alvarez PLC', 'Frey Inc', 'Bowers Group', 'Sanchez-Moreno', 'Franco-Stuart']
    
    # Create tuples
    tuples = []
    for agency in news_agencies:
        for company in companies:
            tuples.append(f"{agency} - {company}")
    
    # Generate occurrence data
    occurrence_data = []
    for tuple_name in tuples:
        agency, company = tuple_name.split(' - ')
        occurrences = random.randint(10, 200)
        
        # Lomark Daily shows selective coverage
        if agency == 'Lomark Daily' and company == 'Frey Inc':
            occurrences = random.randint(1, 20)  # Low coverage for Frey Inc
        
        occurrence_data.append({
            'tuple': tuple_name,
            'agency': agency,
            'company': company,
            'occurrences': occurrences
        })
    
    # Generate version difference data
    version_data = []
    for tuple_name in tuples:
        agency, company = tuple_name.split(' - ')
        
        sentiment_v0 = random.uniform(-1, 1)
        sentiment_v1 = random.uniform(-1, 1)
        
        # Apply Lomark Daily bias patterns
        if agency == 'Lomark Daily':
            if company in ['Alvarez PLC', 'Bowers Group']:
                # Switch to positive for selected companies
                sentiment_v1 = random.uniform(0.5, 1.0)
            elif company == 'Frey Inc':
                # Censor Frey Inc
                sentiment_v1 = random.uniform(-0.1, 0.1)
            else:
                # More negative for others
                sentiment_v1 = random.uniform(-0.7, -0.3)
        
        length_diff = random.uniform(-50, 50)
        
        version_data.append({
            'tuple': tuple_name,
            'agency': agency,
            'company': company,
            'sentiment_v0': round(sentiment_v0, 2),
            'sentiment_v1': round(sentiment_v1, 2),
            'length_diff': round(length_diff, 1)
        })
    
    # Generate connected events data
    event_types = [
        'Event.Invest', 'Event.Transaction', 'Event.Aid', 'Event.Communication.Conference',
        'Event.CertificateIssued', 'Event.Applaud', 'Event.Fishing', 'Event.Fishing.SustainableFishing',
        'Event.Fishing.OverFishing', 'Event.Criticize', 'Event.CertificateIssued.Summons', 'Event.Convicted'
    ]
    
    connected_events_data = []
    for tuple_name in tuples:
        events = {}
        for event_type in event_types:
            if random.random() > 0.7:  # 30% chance of event
                events[event_type] = random.randint(0, 100)
        
        connected_events_data.append({
            'tuple': tuple_name,
            **events
        })
    
    return {
        'occurrence_data': occurrence_data,
        'version_data': version_data,
        'connected_events_data': connected_events_data,
        'tuples': tuples
    }

def generate_unreliable_actor_data():
    """Generate unreliable actor detection data"""
    
    actors = ['Lomark Daily', 'The News Buoy', 'Haacklee Herald']
    companies = ['Alvarez PLC', 'Frey Inc', 'Bowers Group', 'Sanchez-Moreno', 'Franco-Stuart']
    
    actor_data = {}
    
    for actor in actors:
        sentiment_data = []
        for company in companies:
            sentiment_v0 = random.uniform(-1, 1)
            sentiment_v1 = random.uniform(-1, 1)
            
            # Apply Lomark Daily bias patterns
            if actor == 'Lomark Daily':
                if company in ['Alvarez PLC', 'Bowers Group']:
                    # Switch to positive for selected companies
                    sentiment_v1 = random.uniform(0.5, 1.0)
                elif company == 'Frey Inc':
                    # Censor Frey Inc
                    sentiment_v1 = random.uniform(-0.1, 0.1)
                else:
                    # More negative for others
                    sentiment_v1 = random.uniform(-0.7, -0.3)
            
            sentiment_data.append({
                'company': company,
                'sentiment_v0': round(sentiment_v0, 2),
                'sentiment_v1': round(sentiment_v1, 2),
                'difference': round(sentiment_v1 - sentiment_v0, 2)
            })
        
        actor_data[actor] = {
            'sentiment_data': sentiment_data,
            'avg_bias': round(random.uniform(0.2, 0.8), 3),
            'reliability_score': round(random.uniform(0.5, 1.0), 3)
        }
    
    return actor_data

def generate_multi_dashboard_data():
    """Generate multi-dashboard data"""
    
    months = ['February', 'March', 'April', 'May', 'June', 'July']
    algorithms = ['ShadGPT', 'BassLine']
    companies = ['Alvarez PLC', 'Frey Inc', 'Bowers Group', 'Sanchez-Moreno', 'Franco-Stuart']
    
    # Multi-layer data
    multi_layer_data = []
    for month in months:
        multi_layer_data.append({
            'month': month,
            'occurrences': random.randint(50, 250),
            'version_0': random.randint(20, 120),
            'version_1': random.randint(20, 120),
            'bias_score': round(random.uniform(0.2, 1.0), 3)
        })
    
    # Algorithm data
    algorithm_data = []
    for algorithm in algorithms:
        algorithm_data.append({
            'algorithm': algorithm,
            'accuracy': round(random.uniform(0.7, 1.0), 3),
            'bias_score': round(random.uniform(0.2, 0.8), 3),
            'entities_extracted': random.randint(20, 70),
            'reliability': round(random.uniform(0.6, 1.0), 3)
        })
    
    # Company bias data
    company_bias_data = []
    for company in companies:
        company_bias_data.append({
            'company': company,
            'bias_score': round(random.uniform(0.2, 1.0), 3),
            'coverage': random.randint(20, 120),
            'sentiment': round(random.uniform(-1, 1), 2),
            'reliability': round(random.uniform(0.5, 1.0), 3)
        })
    
    return {
        'multi_layer_data': multi_layer_data,
        'algorithm_data': algorithm_data,
        'company_bias_data': company_bias_data
    }

def main():
    """Generate all sample data"""
    
    print("Generating sample data for Visual Bias Detection System...")
    
    # Generate all data
    sample_data = {
        'articles': generate_sample_articles(),
        'temporal_bias': generate_temporal_bias_data(),
        'algorithm_comparison': generate_algorithm_comparison_data(),
        'pixel_visualization': generate_pixel_visualization_data(),
        'unreliable_actor': generate_unreliable_actor_data(),
        'multi_dashboard': generate_multi_dashboard_data(),
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'description': 'Sample data for VAST Challenge 2024 MC1 Visual Bias Detection System',
            'version': '1.0'
        }
    }
    
    # Save to JSON file
    with open('sample_bias_data.json', 'w') as f:
        json.dump(sample_data, f, indent=2)
    
    print("Sample data generated successfully!")
    print(f"Generated {len(sample_data['articles'])} articles")
    print(f"Generated {len(sample_data['temporal_bias'])} temporal bias entries")
    print(f"Generated {len(sample_data['algorithm_comparison'])} algorithm comparisons")
    print(f"Generated {len(sample_data['pixel_visualization']['tuples'])} pixel visualization tuples")
    print(f"Generated {len(sample_data['unreliable_actor'])} unreliable actor analyses")
    
    return sample_data

if __name__ == "__main__":
    main()
