import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import articleService from './services/articleService';
import mc1Service from './services/mc1Service';
import { 
  hardcodedArticles, 
  expandedHardcodedArticles,
  hardcodedSentimentAnalysis, 
  hardcodedEntropyAnalysis, 
  hardcodedMC1Data, 
  hardcodedMC1BiasAnalysis, 
  hardcodedTemporalAnalysis, 
  hardcodedNetworkData 
} from './data/hardcodedData';
import mc1JsonData from './data/mc1.json';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import BiasDetectionPage from './pages/BiasDetectionPage';
import ArticleBiasPage from './pages/ArticleBiasPage';
import AnalystBiasPage from './pages/AnalystBiasPage';
import TemporalBiasPage from './pages/TemporalBiasPage';
import PixelVisualizationPage from './pages/PixelVisualizationPage';
import UnreliableActorPage from './pages/UnreliableActorPage';
import MultiDashboardPage from './pages/MultiDashboardPage';
import AdvancedAnalyticsPage from './pages/AdvancedAnalyticsPage';
import AlgorithmBiasPage from './pages/AlgorithmBiasPage';
import SentimentAnalysisPage from './pages/SentimentAnalysisPage';
import NetworkView from './components/NetworkView';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState({
    articles: [],
    sentimentAnalysis: [],
    entropyAnalysis: [],
    networkData: { nodes: [], edges: [] },
    biasComparison: {},
    mc1Data: null,
    mc1Statistics: null,
    mc1BiasAnalysis: null,
    mc1TemporalAnalysis: null,
    mc1NetworkData: { nodes: [], links: [] }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const processRealMC1Data = () => {
    console.log('Processing real MC1.json data...');
    
    // Extract real statistics from MC1.json
    const realMC1Stats = {
      totalNodes: mc1JsonData.nodes.length,
      totalLinks: mc1JsonData.links.length,
      fishingCompanies: mc1JsonData.nodes.filter(node => 
        node.type === "Entity.Organization.FishingCompany"
      ).length,
      eventTypes: [...new Set(mc1JsonData.links.map(link => link.type))],
      sources: [...new Set(mc1JsonData.links.map(link => link._raw_source))],
      algorithms: [...new Set(mc1JsonData.links.map(link => link._algorithm))],
      countries: [...new Set(mc1JsonData.nodes.map(node => node.country).filter(Boolean))]
    };

    // Process bias analysis from real data
    const realBiasAnalysis = {
      sourceAnalysis: realMC1Stats.sources.map(source => ({
        source,
        linkCount: mc1JsonData.links.filter(link => link._raw_source === source).length,
        eventTypes: [...new Set(mc1JsonData.links
          .filter(link => link._raw_source === source)
          .map(link => link.type))],
        algorithms: [...new Set(mc1JsonData.links
          .filter(link => link._raw_source === source)
          .map(link => link._algorithm))]
      })),
      algorithmAnalysis: realMC1Stats.algorithms.map(algorithm => ({
        algorithm,
        linkCount: mc1JsonData.links.filter(link => link._algorithm === algorithm).length,
        eventTypes: [...new Set(mc1JsonData.links
          .filter(link => link._algorithm === algorithm)
          .map(link => link.type))],
        sources: [...new Set(mc1JsonData.links
          .filter(link => link._algorithm === algorithm)
          .map(link => link._raw_source))]
      })),
      eventTypeAnalysis: realMC1Stats.eventTypes.map(eventType => ({
        eventType,
        linkCount: mc1JsonData.links.filter(link => link.type === eventType).length,
        sources: [...new Set(mc1JsonData.links
          .filter(link => link.type === eventType)
          .map(link => link._raw_source))],
        algorithms: [...new Set(mc1JsonData.links
          .filter(link => link.type === eventType)
          .map(link => link._algorithm))]
      }))
    };

    // Process temporal analysis from real data
    const realTemporalAnalysis = [];
    const monthlyData = {};
    
    mc1JsonData.links.forEach(link => {
      if (link._date_added) {
        const month = link._date_added.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = {
            month,
            events: 0,
            eventTypes: {},
            sources: {},
            algorithms: {}
          };
        }
        monthlyData[month].events++;
        monthlyData[month].eventTypes[link.type] = (monthlyData[month].eventTypes[link.type] || 0) + 1;
        monthlyData[month].sources[link._raw_source] = (monthlyData[month].sources[link._raw_source] || 0) + 1;
        monthlyData[month].algorithms[link._algorithm] = (monthlyData[month].algorithms[link._algorithm] || 0) + 1;
      }
    });

    Object.values(monthlyData).forEach(data => realTemporalAnalysis.push(data));

    return {
      realMC1Stats,
      realBiasAnalysis,
      realTemporalAnalysis,
      realNetworkData: {
        nodes: mc1JsonData.nodes, // Full 215 nodes - NO LIMITS
        links: mc1JsonData.links  // Full 16,231 links - NO LIMITS
      }
    };
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      console.log('Loading real MC1.json data for authentic rendering...');
      
      // Process real MC1 data
      const { realMC1Stats, realBiasAnalysis, realTemporalAnalysis, realNetworkData } = processRealMC1Data();
      
      // Simulate brief loading for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      setData({
        articles: expandedHardcodedArticles, // Use expanded 341 articles
        sentimentAnalysis: hardcodedSentimentAnalysis, // Based on articles
        entropyAnalysis: hardcodedEntropyAnalysis, // Based on articles
        networkData: realNetworkData, // Real MC1 network data
        processingStatus: {
          articles_processed: expandedHardcodedArticles.length,
          total_files: expandedHardcodedArticles.length,
          processing_complete: true,
          progress_percentage: 100
        },
        temporalBiasData: realTemporalAnalysis, // Real temporal data
        algorithmData: realBiasAnalysis.algorithmAnalysis, // Real algorithm data
        pixelData: {
          occurrence_data: [],
          version_data: [],
          connected_events_data: [],
          tuples: []
        },
        unreliableActorData: realBiasAnalysis.sourceAnalysis, // Real source analysis
        multiDashboardData: {
          multi_layer_data: realTemporalAnalysis,
          algorithm_data: realBiasAnalysis.algorithmAnalysis,
          company_bias_data: hardcodedSentimentAnalysis
        },
        biasComparison: {},
        mc1Data: realMC1Stats, // Real MC1 statistics
        mc1Statistics: realMC1Stats, // Real MC1 statistics
        mc1BiasAnalysis: realBiasAnalysis, // Real bias analysis
        mc1TemporalAnalysis: realTemporalAnalysis, // Real temporal analysis
        mc1NetworkData: realNetworkData // Real network data
      });

      console.log(`✅ FULL MC1 data loaded: ${realMC1Stats.totalNodes} nodes, ${realMC1Stats.totalLinks} links, ${realMC1Stats.fishingCompanies} fishing companies`);
      console.log(`📄 EXPANDED articles loaded: ${expandedHardcodedArticles.length} articles from real MC1 companies`);
    } catch (err) {
      setError('Failed to load MC1 data');
      console.error('Error loading MC1 data:', err);
    } finally {
      setLoading(false);
    }
  };

  const processArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate processing with hardcoded data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setError(`✅ Successfully processed ${expandedHardcodedArticles.length} articles with hardcoded data`);
      setTimeout(() => setError(null), 3000);
      
      // Data is already loaded, no need to reload
    } catch (err) {
      setError(`❌ Failed to process articles`);
      console.error('Error processing articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (view) => {
    const routes = {
      'home': '/',
      'dashboard': '/dashboard',
      'bias-detection': '/bias-detection',
      'article-bias': '/article-bias',
      'analyst-bias': '/analyst-bias',
      'temporal-bias': '/temporal-bias',
      'pixel-visualization': '/pixel-visualization',
      'unreliable-actor': '/unreliable-actor',
      'multi-dashboard': '/multi-dashboard',
      'advanced-analytics': '/advanced-analytics',
      'sentiment-analysis': '/sentiment-analysis',
      'network-view': '/network-view',
      'algorithm-bias': '/algorithm-bias'
    };
    
    if (routes[view]) {
      navigate(routes[view]);
    }
  };

  const loadMC1Data = async () => {
    setLoading(true);
    setError(null);
    try {
      // Reload with fresh MC1 data processing
      const { realMC1Stats } = processRealMC1Data();
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setError(`✅ Successfully loaded MC1 knowledge graph with ${realMC1Stats.totalNodes} nodes and ${realMC1Stats.totalLinks} relationships from real MC1.json`);
      setTimeout(() => setError(null), 3000);
      
      // Data is already loaded, no need to reload
    } catch (err) {
      setError(`❌ Failed to load MC1 data`);
      console.error('Error loading MC1 data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      await loadInitialData();
      setError('✅ Data refreshed successfully');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError('❌ Failed to refresh data');
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Navbar onNavigate={handleNavigate} />
      <div className="main-content">
        {error && (
          <div className="error">
            {error}
            <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', fontSize: '18px' }}>
              ×
            </button>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Dashboard onNavigate={handleNavigate} data={data} loading={loading} onProcessArticles={processArticles} onLoadMC1Data={loadMC1Data} />} />
          <Route path="/bias-detection" element={<BiasDetectionPage data={data} loading={loading} mc1Data={data.mc1Statistics} mc1BiasAnalysis={data.mc1BiasAnalysis} />} />
          <Route path="/article-bias" element={<ArticleBiasPage networkData={data.mc1NetworkData} data={data} mc1Data={data.mc1Statistics} />} />
          <Route path="/analyst-bias" element={<AnalystBiasPage networkData={data.mc1NetworkData} data={data} mc1BiasAnalysis={data.mc1BiasAnalysis} />} />
          <Route path="/temporal-bias" element={<TemporalBiasPage networkData={data.mc1NetworkData} data={data.mc1TemporalAnalysis} mc1Statistics={data.mc1Statistics} articles={data.articles} loading={loading} onProcessArticles={processArticles} />} />
          <Route path="/pixel-visualization" element={<PixelVisualizationPage networkData={data.mc1NetworkData} data={data.pixelData} mc1Data={data.mc1Statistics} />} />
          <Route path="/unreliable-actor" element={<UnreliableActorPage networkData={data.mc1NetworkData} data={data.mc1BiasAnalysis} mc1Statistics={data.mc1Statistics} />} />
          <Route path="/multi-dashboard" element={<MultiDashboardPage networkData={data.mc1NetworkData} data={data.multiDashboardData} mc1Data={data.mc1Statistics} mc1BiasAnalysis={data.mc1BiasAnalysis} />} />
          <Route path="/advanced-analytics" element={<AdvancedAnalyticsPage data={data} loading={loading} mc1Statistics={data.mc1Statistics} mc1BiasAnalysis={data.mc1BiasAnalysis} />} />
          <Route path="/sentiment-analysis" element={<SentimentAnalysisPage data={data} loading={loading} mc1BiasAnalysis={data.mc1BiasAnalysis} />} />
          <Route path="/network-view" element={<NetworkView />} />
          <Route path="/algorithm-bias" element={<AlgorithmBiasPage mc1BiasAnalysis={data.mc1BiasAnalysis} />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
