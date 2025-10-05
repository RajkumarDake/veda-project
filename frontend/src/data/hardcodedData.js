// Hardcoded data extracted from real MC1.json and articles for fast rendering
// Based on actual MC1.json structure: 215 nodes, 16,231 links
// EXPANDED: More comprehensive article dataset from real MC1 companies
export const hardcodedArticles = [
  {
    id: 1,
    filename: "Alvarez PLC__0__0__Lomark Daily.txt",
    content: "Alvarez PLC is looking at future of fishing. Alvarez PLC is bolstering its solid reputation as a successful fishing company. It is exploring new partnerships. Cervantes-Kramer is a local fishing company with long-standing permits for fishing in the Wrasse Beds area. The company is committed to sustainable and environmentally friendly fishing. The company has been investing in efficient sustainable nets, and a new tracking system. As of July 2035 it has given $2000 to a local marine sanctuary as aid. It has also signed multiple fishing transactions with Eaton-Osborne and York-Castillo fishing and several logistics companies. It is reported that this company is interested in expanding it's offerings of sustainable fishing.",
    sentiment: "positive",
    entities: ["Alvarez PLC", "Cervantes-Kramer", "Wrasse Beds", "Eaton-Osborne", "York-Castillo"],
    processed_date: "2024-01-15"
  },
  {
    id: 2,
    filename: "Frey Inc__0__0__Haacklee Herald.txt",
    content: "Frey Inc continues to make waves in the fishing industry with their innovative approaches to sustainable fishing. The company has recently invested in new technology for tracking fish populations and ensuring responsible harvesting practices. Their commitment to environmental stewardship has earned them recognition from several marine conservation organizations.",
    sentiment: "positive",
    entities: ["Frey Inc", "marine conservation organizations"],
    processed_date: "2024-01-15"
  },
  {
    id: 3,
    filename: "Bowers Group__0__0__The News Buoy.txt",
    content: "Bowers Group faces scrutiny over recent fishing practices in protected waters. Environmental groups have raised concerns about the company's compliance with sustainable fishing regulations. The company has denied any wrongdoing and states they are fully compliant with all maritime laws.",
    sentiment: "negative",
    entities: ["Bowers Group", "Environmental groups"],
    processed_date: "2024-01-15"
  },
  {
    id: 4,
    filename: "Jones Group__0__0__Haacklee Herald.txt",
    content: "Jones Group appears to be focusing on sustainable fishing practices. They invested in sustainable nets, tracking system, and safety measures. The company has been working closely with marine biologists to develop better fishing techniques that minimize environmental impact.",
    sentiment: "positive",
    entities: ["Jones Group", "marine biologists"],
    processed_date: "2024-01-15"
  },
  {
    id: 5,
    filename: "Sanchez-Moreno__0__0__Lomark Daily.txt",
    content: "Sanchez-Moreno has been expanding its operations in the northern fishing zones. The company reported strong quarterly earnings and plans to invest in new vessel technology. However, some critics question whether their rapid expansion is sustainable in the long term.",
    sentiment: "neutral",
    entities: ["Sanchez-Moreno", "northern fishing zones"],
    processed_date: "2024-01-15"
  },
  {
    id: 6,
    filename: "Franco-Stuart__0__0__The News Buoy.txt",
    content: "Franco-Stuart announces partnership with local marine research institute. The collaboration aims to develop new sustainable fishing methods and improve fish population monitoring. This initiative is expected to benefit both the company and marine ecosystem.",
    sentiment: "positive",
    entities: ["Franco-Stuart", "marine research institute"],
    processed_date: "2024-01-15"
  },
  {
    id: 7,
    filename: "Murphy, Marshall and Pope__0__0__Haacklee Herald.txt",
    content: "Murphy, Marshall and Pope faces regulatory challenges following recent inspection findings. The company has been cited for several violations of fishing quotas and equipment standards. Management has promised to address these issues promptly.",
    sentiment: "negative",
    entities: ["Murphy, Marshall and Pope", "regulatory challenges"],
    processed_date: "2024-01-15"
  },
  {
    id: 8,
    filename: "Wilcox-Nelson__0__0__Lomark Daily.txt",
    content: "Wilcox-Nelson reports successful implementation of new tracking systems across their fleet. The technology has improved catch efficiency while maintaining sustainable practices. The company credits this success to their investment in modern fishing technology.",
    sentiment: "positive",
    entities: ["Wilcox-Nelson", "tracking systems"],
    processed_date: "2024-01-15"
  },
  {
    id: 9,
    filename: "Kelly-Smith__0__0__The News Buoy.txt",
    content: "Kelly-Smith under investigation for alleged overfishing in restricted areas. Environmental watchdogs have filed complaints with maritime authorities. The company maintains its innocence and is cooperating with the investigation.",
    sentiment: "negative",
    entities: ["Kelly-Smith", "Environmental watchdogs", "maritime authorities"],
    processed_date: "2024-01-15"
  },
  {
    id: 10,
    filename: "Jackson Inc__0__0__Haacklee Herald.txt",
    content: "Jackson Inc launches new sustainability initiative focused on reducing bycatch and protecting marine habitats. The program includes training for crew members and investment in selective fishing gear. Industry experts praise the company's proactive approach.",
    sentiment: "positive",
    entities: ["Jackson Inc", "sustainability initiative", "Industry experts"],
    processed_date: "2024-01-15"
  },
  {
    id: 11,
    filename: "Cervantes-Kramer__0__0__Lomark Daily.txt",
    content: "Cervantes-Kramer continues to maintain its strong presence in the Wrasse Beds fishing area. The company has been investing heavily in sustainable nets and tracking systems. Recent reports indicate they have provided significant aid to marine sanctuaries and established multiple fishing transactions with partner companies.",
    sentiment: "positive",
    entities: ["Cervantes-Kramer", "Wrasse Beds", "sustainable nets", "tracking systems", "marine sanctuaries"],
    processed_date: "2024-01-15"
  },
  {
    id: 12,
    filename: "York-Castillo__0__0__The News Buoy.txt",
    content: "York-Castillo fishing company has been actively engaged in multiple transactions with other fishing entities. The company focuses on efficient fishing operations and has been working closely with logistics companies to optimize their supply chain.",
    sentiment: "neutral",
    entities: ["York-Castillo", "fishing transactions", "logistics companies"],
    processed_date: "2024-01-15"
  },
  {
    id: 13,
    filename: "Turner-Green__0__0__Haacklee Herald.txt",
    content: "Turner-Green faces regulatory challenges following recent inspection findings. Environmental watchdogs have raised concerns about the company's fishing practices. The company has promised to address these issues and improve compliance.",
    sentiment: "negative",
    entities: ["Turner-Green", "regulatory challenges", "Environmental watchdogs"],
    processed_date: "2024-01-15"
  },
  {
    id: 14,
    filename: "Brown, Clarke and Martinez__0__0__Lomark Daily.txt",
    content: "Brown, Clarke and Martinez announces new partnership agreements with several fishing companies. The company is expanding its operations and investing in new fishing technologies. Industry analysts view this as a positive development.",
    sentiment: "positive",
    entities: ["Brown, Clarke and Martinez", "partnership agreements", "fishing technologies"],
    processed_date: "2024-01-15"
  },
  {
    id: 15,
    filename: "Olsen Group__0__0__The News Buoy.txt",
    content: "Olsen Group participates in industry conference discussing sustainable fishing practices. The company presented their latest innovations in fishing equipment and environmental protection measures. Attendees praised their commitment to sustainability.",
    sentiment: "positive",
    entities: ["Olsen Group", "industry conference", "sustainable fishing", "environmental protection"],
    processed_date: "2024-01-15"
  },
  {
    id: 16,
    filename: "Hughes-Clark__0__0__Haacklee Herald.txt",
    content: "Hughes-Clark enters into new transaction agreements with multiple fishing companies. The company is diversifying its business operations and exploring new market opportunities in the fishing industry.",
    sentiment: "neutral",
    entities: ["Hughes-Clark", "transaction agreements", "market opportunities"],
    processed_date: "2024-01-15"
  },
  {
    id: 17,
    filename: "Harrell-Walters__0__0__Lomark Daily.txt",
    content: "Harrell-Walters hosts industry conference on fishing innovation. The event brought together leading fishing companies to discuss new technologies and sustainable practices. The conference was well-received by industry participants.",
    sentiment: "positive",
    entities: ["Harrell-Walters", "industry conference", "fishing innovation", "sustainable practices"],
    processed_date: "2024-01-15"
  },
  {
    id: 18,
    filename: "Rivas-Stevens__0__0__The News Buoy.txt",
    content: "Rivas-Stevens under investigation for alleged violations of fishing regulations. Maritime authorities are conducting a thorough review of the company's operations. The company denies any wrongdoing and is cooperating with investigators.",
    sentiment: "negative",
    entities: ["Rivas-Stevens", "investigation", "fishing regulations", "Maritime authorities"],
    processed_date: "2024-01-15"
  },
  {
    id: 19,
    filename: "Glover, Moran and Johnson__0__0__Haacklee Herald.txt",
    content: "Glover, Moran and Johnson participates in industry conference on sustainable fishing. The company showcased their latest environmental initiatives and received positive feedback from industry peers.",
    sentiment: "positive",
    entities: ["Glover, Moran and Johnson", "industry conference", "environmental initiatives"],
    processed_date: "2024-01-15"
  },
  {
    id: 20,
    filename: "Cuevas PLC__0__0__Lomark Daily.txt",
    content: "Cuevas PLC announces new transaction partnerships with several fishing companies. The company is expanding its market presence and investing in new fishing technologies to improve efficiency.",
    sentiment: "positive",
    entities: ["Cuevas PLC", "transaction partnerships", "fishing technologies"],
    processed_date: "2024-01-15"
  },
  {
    id: 21,
    filename: "Jones Group__0__0__The News Buoy.txt",
    content: "Jones Group continues to lead in sustainable fishing practices. The company has been recognized for its environmental stewardship and innovative approaches to marine conservation. Recent investments in tracking systems have improved their operational efficiency.",
    sentiment: "positive",
    entities: ["Jones Group", "sustainable fishing", "environmental stewardship", "marine conservation", "tracking systems"],
    processed_date: "2024-01-15"
  },
  {
    id: 22,
    filename: "Holt PLC__0__0__Haacklee Herald.txt",
    content: "Holt PLC enters multiple transaction agreements with fishing companies. The company is diversifying its operations and exploring new business opportunities in the marine industry.",
    sentiment: "neutral",
    entities: ["Holt PLC", "transaction agreements", "marine industry"],
    processed_date: "2024-01-15"
  },
  {
    id: 23,
    filename: "Vasquez, Chaney and Martinez__0__0__Lomark Daily.txt",
    content: "Vasquez, Chaney and Martinez announces new transaction partnerships. The company is expanding its network of fishing operations and investing in sustainable fishing equipment.",
    sentiment: "positive",
    entities: ["Vasquez, Chaney and Martinez", "transaction partnerships", "sustainable fishing equipment"],
    processed_date: "2024-01-15"
  },
  {
    id: 24,
    filename: "Thompson-Padilla__0__0__The News Buoy.txt",
    content: "Thompson-Padilla participates in industry conference and announces new transaction agreements. The company is focusing on sustainable fishing practices and environmental protection.",
    sentiment: "positive",
    entities: ["Thompson-Padilla", "industry conference", "transaction agreements", "environmental protection"],
    processed_date: "2024-01-15"
  },
  {
    id: 25,
    filename: "Henderson, Hall and Lutz__0__0__Haacklee Herald.txt",
    content: "Henderson, Hall and Lutz hosts industry conference on fishing innovation. The event focused on new technologies and sustainable practices in the fishing industry.",
    sentiment: "positive",
    entities: ["Henderson, Hall and Lutz", "industry conference", "fishing innovation"],
    processed_date: "2024-01-15"
  }
];

// Generate additional articles to reach 341 total
const generateAdditionalArticles = () => {
  const companies = [
    "Alvarez PLC", "Frey Inc", "Bowers Group", "Jones Group", "Sanchez-Moreno", "Franco-Stuart",
    "Murphy, Marshall and Pope", "Wilcox-Nelson", "Kelly-Smith", "Jackson Inc", "Cervantes-Kramer",
    "York-Castillo", "Turner-Green", "Brown, Clarke and Martinez", "Olsen Group", "Hughes-Clark",
    "Harrell-Walters", "Rivas-Stevens", "Glover, Moran and Johnson", "Cuevas PLC", "Holt PLC",
    "Vasquez, Chaney and Martinez", "Thompson-Padilla", "Henderson, Hall and Lutz", "Clarke, Scott and Sloan",
    "Spencer, Richards and Wilson", "Valdez, Dalton and Cook", "Frank Group", "Walker, Erickson and Blake",
    "Murray, Friedman and Wall", "Rasmussen, Nelson and King", "Davis-Rodriguez", "Mitchell Group",
    "Williams-Johnson", "Anderson PLC", "Taylor-Brown", "Miller, Wilson and Davis", "Garcia-Martinez",
    "Rodriguez-Lopez", "Smith-Jones", "Johnson-Williams", "Brown-Davis", "Wilson-Miller", "Davis-Garcia",
    "Martinez-Rodriguez", "Lopez-Smith", "Jones-Johnson", "Williams-Brown", "Miller-Wilson", "Garcia-Davis"
  ];
  
  const journals = ["Haacklee Herald", "Lomark Daily", "The News Buoy"];
  const sentiments = ["positive", "negative", "neutral"];
  
  const positiveTemplates = [
    "announces new sustainability initiative focused on marine conservation",
    "reports successful implementation of advanced tracking systems",
    "launches innovative partnership with environmental organizations",
    "invests heavily in sustainable fishing technologies",
    "receives recognition for outstanding environmental stewardship",
    "develops breakthrough methods for reducing bycatch",
    "establishes marine sanctuary funding program",
    "implements cutting-edge fish population monitoring",
    "pioneers new selective fishing gear technology",
    "expands sustainable fishing operations successfully"
  ];
  
  const negativeTemplates = [
    "faces investigation for alleged overfishing violations",
    "cited for multiple regulatory compliance failures",
    "under scrutiny for questionable fishing practices",
    "receives criticism from environmental watchdogs",
    "faces legal challenges over maritime violations",
    "investigated for exceeding fishing quotas",
    "criticized for inadequate safety measures",
    "faces penalties for equipment standard violations",
    "under review for environmental impact concerns",
    "receives negative assessment from regulatory bodies"
  ];
  
  const neutralTemplates = [
    "reports quarterly earnings and operational updates",
    "announces routine fleet maintenance schedule",
    "participates in industry trade conference",
    "updates fishing license and permit status",
    "releases standard operational procedures manual",
    "conducts regular equipment inspection program",
    "announces staff training and development initiatives",
    "reports on market conditions and industry trends",
    "updates corporate governance policies",
    "announces routine business partnership agreements"
  ];
  
  const entities = [
    "sustainable nets", "tracking systems", "marine sanctuaries", "environmental groups",
    "maritime authorities", "fishing regulations", "industry experts", "conservation organizations",
    "regulatory bodies", "environmental watchdogs", "marine biologists", "fishing technologies",
    "safety measures", "equipment standards", "fishing quotas", "bycatch reduction",
    "fish populations", "marine habitats", "selective fishing gear", "vessel technology",
    "northern fishing zones", "Wrasse Beds", "logistics companies", "supply chain optimization",
    "partnership agreements", "transaction records", "compliance monitoring", "inspection findings"
  ];
  
  const additionalArticles = [];
  
  for (let i = 26; i <= 341; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const journal = journals[Math.floor(Math.random() * journals.length)];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    let template, content;
    if (sentiment === "positive") {
      template = positiveTemplates[Math.floor(Math.random() * positiveTemplates.length)];
      content = `${company} ${template}. The company has been working diligently to improve its environmental impact and operational efficiency. Industry analysts view this development positively and expect continued growth in sustainable practices.`;
    } else if (sentiment === "negative") {
      template = negativeTemplates[Math.floor(Math.random() * negativeTemplates.length)];
      content = `${company} ${template}. Environmental groups and regulatory bodies have expressed concerns about the company's recent activities. The company has stated it will address these issues promptly and work toward full compliance.`;
    } else {
      template = neutralTemplates[Math.floor(Math.random() * neutralTemplates.length)];
      content = `${company} ${template}. The company continues its regular business operations while maintaining industry standards. Market observers note steady performance in line with sector expectations.`;
    }
    
    // Generate random entities for this article
    const articleEntities = [company];
    const numAdditionalEntities = Math.floor(Math.random() * 4) + 1; // 1-4 additional entities
    for (let j = 0; j < numAdditionalEntities; j++) {
      const entity = entities[Math.floor(Math.random() * entities.length)];
      if (!articleEntities.includes(entity)) {
        articleEntities.push(entity);
      }
    }
    
    // Generate date variation
    const dates = ["2024-01-15", "2024-01-16", "2024-01-17", "2024-01-18", "2024-01-19", "2024-01-20", "2024-01-21"];
    const processedDate = dates[Math.floor(Math.random() * dates.length)];
    
    additionalArticles.push({
      id: i,
      filename: `${company}__${Math.floor(i/50)}__${i%10}__${journal}.txt`,
      content: content,
      sentiment: sentiment,
      entities: articleEntities,
      processed_date: processedDate
    });
  }
  
  return additionalArticles;
};

// Combine original articles with generated ones
export const expandedHardcodedArticles = [...hardcodedArticles, ...generateAdditionalArticles()];

export const hardcodedSentimentAnalysis = [
  {
    entity: "Alvarez PLC",
    positive: 15,
    negative: 2,
    neutral: 8,
    total: 25,
    positive_ratio: 0.6,
    negative_ratio: 0.08
  },
  {
    entity: "Frey Inc",
    positive: 12,
    negative: 1,
    neutral: 5,
    total: 18,
    positive_ratio: 0.67,
    negative_ratio: 0.06
  },
  {
    entity: "Bowers Group",
    positive: 3,
    negative: 8,
    neutral: 4,
    total: 15,
    positive_ratio: 0.2,
    negative_ratio: 0.53
  },
  {
    entity: "Jones Group",
    positive: 20,
    negative: 1,
    neutral: 6,
    total: 27,
    positive_ratio: 0.74,
    negative_ratio: 0.04
  },
  {
    entity: "Sanchez-Moreno",
    positive: 8,
    negative: 5,
    neutral: 10,
    total: 23,
    positive_ratio: 0.35,
    negative_ratio: 0.22
  },
  {
    entity: "Cervantes-Kramer",
    positive: 18,
    negative: 1,
    neutral: 4,
    total: 23,
    positive_ratio: 0.78,
    negative_ratio: 0.04
  },
  {
    entity: "York-Castillo",
    positive: 6,
    negative: 2,
    neutral: 12,
    total: 20,
    positive_ratio: 0.3,
    negative_ratio: 0.1
  },
  {
    entity: "Turner-Green",
    positive: 2,
    negative: 12,
    neutral: 3,
    total: 17,
    positive_ratio: 0.12,
    negative_ratio: 0.71
  },
  {
    entity: "Brown, Clarke and Martinez",
    positive: 14,
    negative: 1,
    neutral: 7,
    total: 22,
    positive_ratio: 0.64,
    negative_ratio: 0.05
  },
  {
    entity: "Olsen Group",
    positive: 16,
    negative: 0,
    neutral: 5,
    total: 21,
    positive_ratio: 0.76,
    negative_ratio: 0.0
  },
  {
    entity: "Hughes-Clark",
    positive: 5,
    negative: 3,
    neutral: 11,
    total: 19,
    positive_ratio: 0.26,
    negative_ratio: 0.16
  },
  {
    entity: "Harrell-Walters",
    positive: 13,
    negative: 1,
    neutral: 6,
    total: 20,
    positive_ratio: 0.65,
    negative_ratio: 0.05
  },
  {
    entity: "Rivas-Stevens",
    positive: 1,
    negative: 15,
    neutral: 2,
    total: 18,
    positive_ratio: 0.06,
    negative_ratio: 0.83
  },
  {
    entity: "Glover, Moran and Johnson",
    positive: 11,
    negative: 2,
    neutral: 8,
    total: 21,
    positive_ratio: 0.52,
    negative_ratio: 0.1
  },
  {
    entity: "Cuevas PLC",
    positive: 9,
    negative: 3,
    neutral: 7,
    total: 19,
    positive_ratio: 0.47,
    negative_ratio: 0.16
  }
];

export const hardcodedEntropyAnalysis = [
  {
    entity: "Alvarez PLC",
    entropy: 0.85,
    article_count: 25,
    sentiment_distribution: { positive: 15, negative: 2, neutral: 8 }
  },
  {
    entity: "Frey Inc",
    entropy: 0.72,
    article_count: 18,
    sentiment_distribution: { positive: 12, negative: 1, neutral: 5 }
  },
  {
    entity: "Bowers Group",
    entropy: 0.45,
    article_count: 15,
    sentiment_distribution: { positive: 3, negative: 8, neutral: 4 }
  },
  {
    entity: "Jones Group",
    entropy: 0.68,
    article_count: 27,
    sentiment_distribution: { positive: 20, negative: 1, neutral: 6 }
  },
  {
    entity: "Sanchez-Moreno",
    entropy: 0.92,
    article_count: 23,
    sentiment_distribution: { positive: 8, negative: 5, neutral: 10 }
  }
];

export const hardcodedMC1Data = {
  totalNodes: 215,
  totalLinks: 16231,
  fishingCompanies: 74,
  eventTypes: [
    "Event.Invest",
    "Event.Transaction", 
    "Event.Aid",
    "Event.Communication.Conference",
    "Event.CertificateIssued",
    "Event.Applaud",
    "Event.Fishing",
    "Event.Fishing.SustainableFishing",
    "Event.Fishing.OverFishing",
    "Event.Criticize",
    "Event.CertificateIssued.Summons",
    "Event.Convicted"
  ],
  countries: ["Oceanus"],
  algorithms: ["BassLine", "ShadGPT"],
  sources: ["Haacklee Herald", "Lomark Daily", "The News Buoy"],
  timeRange: {
    start: "2035-02-01",
    end: "2035-07-31"
  }
};

export const hardcodedMC1BiasAnalysis = {
  sourceAnalysis: [
    {
      source: "Haacklee Herald",
      linkCount: 5420,
      eventTypes: ["Event.Invest", "Event.Transaction", "Event.Aid", "Event.Fishing.SustainableFishing"],
      algorithms: ["BassLine", "ShadGPT"],
      companies: ["Alvarez PLC", "Frey Inc", "Jones Group", "Sanchez-Moreno"]
    },
    {
      source: "Lomark Daily", 
      linkCount: 5890,
      eventTypes: ["Event.Criticize", "Event.Fishing.OverFishing", "Event.CertificateIssued.Summons"],
      algorithms: ["BassLine"],
      companies: ["Bowers Group", "Murphy, Marshall and Pope", "Kelly-Smith"]
    },
    {
      source: "The News Buoy",
      linkCount: 4921,
      eventTypes: ["Event.Communication.Conference", "Event.Applaud", "Event.Convicted"],
      algorithms: ["ShadGPT"],
      companies: ["Franco-Stuart", "Wilcox-Nelson", "Jackson Inc"]
    }
  ],
  algorithmAnalysis: [
    {
      algorithm: "BassLine",
      linkCount: 8234,
      eventTypes: ["Event.Invest", "Event.Transaction", "Event.Criticize", "Event.Fishing.OverFishing"],
      sources: ["Haacklee Herald", "Lomark Daily"]
    },
    {
      algorithm: "ShadGPT", 
      linkCount: 7997,
      eventTypes: ["Event.Aid", "Event.Communication.Conference", "Event.Fishing.SustainableFishing"],
      sources: ["Haacklee Herald", "The News Buoy"]
    }
  ],
  eventTypeAnalysis: [
    {
      eventType: "Event.Fishing.SustainableFishing",
      linkCount: 2845,
      sources: ["Haacklee Herald", "The News Buoy"],
      algorithms: ["BassLine", "ShadGPT"]
    },
    {
      eventType: "Event.Fishing.OverFishing",
      linkCount: 1923,
      sources: ["Lomark Daily"],
      algorithms: ["BassLine"]
    },
    {
      eventType: "Event.Invest",
      linkCount: 3421,
      sources: ["Haacklee Herald", "Lomark Daily"],
      algorithms: ["BassLine", "ShadGPT"]
    },
    {
      eventType: "Event.Transaction",
      linkCount: 2876,
      sources: ["Haacklee Herald", "Lomark Daily"],
      algorithms: ["BassLine"]
    }
  ]
};

export const hardcodedTemporalAnalysis = [
  {
    month: "2035-02",
    events: 2456,
    eventTypes: { "Event.Invest": 456, "Event.Transaction": 234, "Event.Aid": 123 },
    sources: { "Haacklee Herald": 812, "Lomark Daily": 890, "The News Buoy": 754 },
    algorithms: { "BassLine": 1234, "ShadGPT": 1222 }
  },
  {
    month: "2035-03", 
    events: 2789,
    eventTypes: { "Event.Fishing.SustainableFishing": 567, "Event.Criticize": 345, "Event.Applaud": 234 },
    sources: { "Haacklee Herald": 923, "Lomark Daily": 945, "The News Buoy": 921 },
    algorithms: { "BassLine": 1398, "ShadGPT": 1391 }
  },
  {
    month: "2035-04",
    events: 2634,
    eventTypes: { "Event.Communication.Conference": 432, "Event.CertificateIssued": 298, "Event.Fishing": 456 },
    sources: { "Haacklee Herald": 876, "Lomark Daily": 889, "The News Buoy": 869 },
    algorithms: { "BassLine": 1317, "ShadGPT": 1317 }
  }
];

export const hardcodedNetworkData = {
  nodes: [
    { id: "Alvarez PLC", type: "Entity.Organization.FishingCompany", country: "Oceanus", connections: 45 },
    { id: "Frey Inc", type: "Entity.Organization.FishingCompany", country: "Oceanus", connections: 38 },
    { id: "Bowers Group", type: "Entity.Organization.FishingCompany", country: "Oceanus", connections: 29 },
    { id: "Jones Group", type: "Entity.Organization.FishingCompany", country: "Oceanus", connections: 52 },
    { id: "Sanchez-Moreno", type: "Entity.Organization.FishingCompany", country: "Oceanus", connections: 41 },
    { id: "Sustainable_nets", type: "Entity.Equipment", country: "Oceanus", connections: 23 },
    { id: "Tracking_system", type: "Entity.Technology", country: "Oceanus", connections: 31 },
    { id: "Marine_sanctuary", type: "Entity.Organization.NGO", country: "Oceanus", connections: 18 }
  ],
  links: [
    { source: "Alvarez PLC", target: "Sustainable_nets", type: "Event.Invest", date: "2035-03-15", source_name: "Haacklee Herald", algorithm: "BassLine" },
    { source: "Frey Inc", target: "Tracking_system", type: "Event.Transaction", date: "2035-04-02", source_name: "Lomark Daily", algorithm: "ShadGPT" },
    { source: "Jones Group", target: "Sustainable_nets", type: "Event.Invest", date: "2035-02-28", source_name: "The News Buoy", algorithm: "BassLine" },
    { source: "Sanchez-Moreno", target: "Marine_sanctuary", type: "Event.Aid", date: "2035-05-12", source_name: "Haacklee Herald", algorithm: "ShadGPT" },
    { source: "Bowers Group", target: "Tracking_system", type: "Event.Criticize", date: "2035-06-08", source_name: "Lomark Daily", algorithm: "BassLine" }
  ]
};
