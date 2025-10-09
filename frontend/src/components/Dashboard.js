import React from 'react';
import CardImage1 from '../cards/1.jpg';
import CardImage2 from '../cards/2.jpg';
import CardImage3 from '../cards/3.jpg';
import CardImage4 from '../cards/4.jpg';
import CardImage5 from '../cards/5.jpg';
import CardImage6 from '../cards/6.jpg';
import '../styles/dashboard.css';

const Dashboard = ({ onNavigate, data, loading, onProcessArticles, onLoadMC1Data }) => {
  const cards = [
    {
      title: 'Bias Detection',
      image: CardImage1,
      description: 'Advanced bias detection algorithms to identify potential biases in articles and content.',
      buttonText: 'Launch Tool',
      buttonClass: 'button-outline-primary',
      onClick: () => onNavigate('bias-detection'),
    },
    {
      title: 'Article Bias Analysis',
      image: CardImage2,
      description: 'Analyze individual articles for bias patterns and sentiment analysis.',
      buttonText: 'Analyze Articles',
      buttonClass: 'button-outline-primary',
      onClick: () => onNavigate('article-bias'),
    },
    {
      title: 'Analyst Bias Detection',
      image: CardImage3,
      description: 'Detect bias patterns in analyst reports and professional content.',
      buttonText: 'Detect Bias',
      buttonClass: 'button-outline-primary',
      onClick: () => onNavigate('analyst-bias'),
    },
    {
      title: 'Temporal Bias Analysis',
      image: CardImage4,
      description: 'Track bias trends over time and identify temporal patterns.',
      buttonText: 'View Trends',
      buttonClass: 'button-outline-primary',
      onClick: () => onNavigate('temporal-bias'),
    },
    {
      title: 'Algorithm Bias',
      image: CardImage5,
      description: 'Analyze bias patterns by extraction algorithm across the knowledge graph.',
      buttonText: 'View Algorithm Bias',
      buttonClass: 'button-outline-primary',
      onClick: () => onNavigate('algorithm-bias'),
    },
    {
      title: 'Multi-Dashboard',
      image: CardImage6,
      description: 'Comprehensive multi-dashboard approach for advanced analytics.',
      buttonText: 'Open Dashboard',
      buttonClass: 'button-outline-primary',
      onClick: () => onNavigate('multi-dashboard'),
    },
    {
      title: 'Analytics',
      image: CardImage3,
      description: 'Comprehensive analytics dashboard with advanced metrics and visualizations.',
      buttonText: 'View Analytics',
      buttonClass: 'button-outline-primary',
      onClick: () => onNavigate('advanced-analytics'),
    },
    {
      title: 'Network View',
      image: CardImage2,
      description: 'Interactive Force-directed Graph with local Neo4j integration.',
      buttonText: 'Explore Network',
      buttonClass: 'button-outline-primary',
      onClick: () => onNavigate('network-view'),
    },
    {
      title: 'Graph Exploration',
      image: CardImage1,
      description: 'Explore specific paths in the knowledge graph using Start Node → Relationship → End Node interface.',
      buttonText: 'Explore Paths',
      buttonClass: 'button-outline-primary',
      onClick: () => onNavigate('graph-exploration'),
    }
  ];

  // Get data statistics
  const getDataStats = () => {
    
    const articles = data.articles?.length || 0;
    const entities = data.sentimentAnalysis?.length || 0;
    const biasDetected = data.entropyAnalysis?.filter(item => item.entropy < 0.5).length || 0;
    const networkNodes = data.networkData?.nodes?.length || 0;
    const mc1Nodes = data.mc1Statistics?.totalNodes || 0;
    const mc1Links = data.mc1Statistics?.totalLinks || 0;
    const fishingCompanies = data.mc1Statistics?.fishingCompanies || 0;
    
    return { articles, entities, biasDetected, networkNodes, mc1Nodes, mc1Links, fishingCompanies };
  };

  const stats = getDataStats();

  return (
    <div id="main-wrapper">
      <div className="content-wrapper">
        {/* Heading */}
        <div className="flex-container heading-container">
          <div className="text-center">
            <h2 className="text-dark mb-3 mt-4">
              Welcome to <span className="fw-bold">FishEye Watcher</span>
            </h2>
            <p className="text-dark">
              Visual Analytics System for Knowledge Graph Bias Detection
            </p>
          </div>
        </div>


        {/* Cards */}
        <section className="spacer bg-light">
          <div className="container">
            <div className="card-container">
              {cards.map((card, index) => (
                <div className="card-item" key={index}>
                  <div className="card">
                    <div className="card-body">
                      <div className="text-center">
                        <h3 className="text-dark font-weight-medium">{card.title}</h3>
          </div>
                      <div className="image-box text-center">
                        <img className="img-fluid" src={card.image} alt={card.title} />
        </div>
                      <div className="text-center">
                        <button
                          className={`button ${card.buttonClass}`}
                          onClick={card.onClick}
                        >
                          {card.buttonText}
            </button>
          </div>
                      <p className="text-muted text-center">{card.description}</p>
                  </div>
                  </div>
                </div>
              ))}
            </div>
              </div>
        </section>

        <footer className="footer">
          All Rights Reserved by FishEye Watcher Team.
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;