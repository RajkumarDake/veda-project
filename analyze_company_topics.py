import os
from collections import defaultdict

def analyze_company_topics():
    """
    Analyze the article files to understand company topic patterns
    """
    article_folder = "data/article"
    
    if not os.path.exists(article_folder):
        print(f"Error: Directory '{article_folder}' does not exist!")
        return
    
    # Get all files
    filenames = os.listdir(article_folder)
    filenames = [f for f in filenames if os.path.isfile(os.path.join(article_folder, f))]
    
    # Parse company names and topics
    company_topics = defaultdict(set)
    company_journals = defaultdict(set)
    
    for filename in filenames:
        # Extract company name and topic pattern
        parts = filename.split('__')
        if len(parts) >= 3:
            company = parts[0].replace('_', ' ')
            topic_pattern = f"__{parts[1]}__{parts[2].split('__')[0]}__"
            
            # Extract journal name
            if 'Haacklee Herald' in filename:
                journal = 'Haacklee Herald'
            elif 'Lomark Daily' in filename:
                journal = 'Lomark Daily'
            elif 'The News Buoy' in filename:
                journal = 'The News Buoy'
            else:
                journal = 'Unknown'
            
            company_topics[company].add(topic_pattern)
            company_journals[company].add(journal)
    
    # Analyze companies with multiple topics
    print("=== COMPANY TOPIC ANALYSIS ===\n")
    
    companies_with_multiple_topics = []
    companies_with_single_topic = []
    
    for company, topics in company_topics.items():
        if len(topics) > 1:
            companies_with_multiple_topics.append((company, sorted(list(topics))))
        else:
            companies_with_single_topic.append((company, list(topics)[0]))
    
    print(f"Companies with MULTIPLE topics: {len(companies_with_multiple_topics)}")
    print(f"Companies with SINGLE topic: {len(companies_with_single_topic)}\n")
    
    print("=== COMPANIES WITH MULTIPLE TOPICS ===")
    for company, topics in companies_with_multiple_topics:
        print(f"• {company}: {', '.join(topics)}")
    
    print(f"\n=== EXAMPLE FORMAT FOR REDESIGN ===")
    # Show example for Taylor, Prince and Sherman
    example_company = "Taylor, Prince and Sherman"
    if example_company in company_topics:
        topics = sorted(list(company_topics[example_company]))
        print(f"{example_company} {', '.join(topics)}")
        
        # Show what files exist for this company
        example_files = [f for f in filenames if f.startswith("Taylor,_Prince_and_Sherman")]
        print(f"Files for {example_company}:")
        for file in sorted(example_files):
            print(f"  - {file}")
    
    print(f"\n=== SUGGESTED CARD FORMAT ===")
    print("Company Name, __0__0__, __0__1__")
    print("Haacklee Herald: positive, negative")
    print("Lomark Daily: neutral, positive") 
    print("The News Buoy: positive, neutral")
    
    return {
        'companies_with_multiple_topics': companies_with_multiple_topics,
        'companies_with_single_topic': companies_with_single_topic,
        'company_topics': dict(company_topics),
        'company_journals': dict(company_journals)
    }

if __name__ == "__main__":
    result = analyze_company_topics()
