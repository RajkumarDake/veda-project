import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ArticleService {
  // Get all processed articles
  async getArticles() {
    try {
      const response = await axios.get(`${API_BASE_URL}/articles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }

  // Process articles from the data folder
  async processArticles() {
    try {
      const response = await axios.post(`${API_BASE_URL}/process-articles`);
      return response.data;
    } catch (error) {
      console.error('Error processing articles:', error);
      throw error;
    }
  }

  // Get sentiment analysis data
  async getSentimentAnalysis() {
    try {
      const response = await axios.get(`${API_BASE_URL}/sentiment-analysis`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sentiment analysis:', error);
      return [];
    }
  }

  // Get entropy analysis data
  async getEntropyAnalysis() {
    try {
      const response = await axios.get(`${API_BASE_URL}/entropy-analysis`);
      return response.data;
    } catch (error) {
      console.error('Error fetching entropy analysis:', error);
      return [];
    }
  }

  // Get network data
  async getNetworkData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/network-data`);
      return response.data;
    } catch (error) {
      console.error('Error fetching network data:', error);
      return { nodes: [], edges: [] };
    }
  }

  // Get processing status
  async getProcessingStatus() {
    try {
      const response = await axios.get(`${API_BASE_URL}/processing-status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching processing status:', error);
      return { articles_processed: 0, total_files: 0, processing_complete: false };
    }
  }

  // Get temporal bias analysis
  async getTemporalBiasAnalysis() {
    try {
      const response = await axios.get(`${API_BASE_URL}/temporal-bias-analysis`);
      return response.data;
    } catch (error) {
      console.error('Error fetching temporal bias analysis:', error);
      return [];
    }
  }

  // Get algorithm comparison data
  async getAlgorithmComparison() {
    try {
      const response = await axios.get(`${API_BASE_URL}/algorithm-comparison`);
      return response.data;
    } catch (error) {
      console.error('Error fetching algorithm comparison:', error);
      return [];
    }
  }

  // Get pixel visualization data
  async getPixelVisualizationData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/pixel-visualization-data`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pixel visualization data:', error);
      return { occurrence_data: [], version_data: [], connected_events_data: [], tuples: [] };
    }
  }

  // Get unreliable actor analysis
  async getUnreliableActorAnalysis() {
    try {
      const response = await axios.get(`${API_BASE_URL}/unreliable-actor-analysis`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unreliable actor analysis:', error);
      return {};
    }
  }

  // Get multi-dashboard data
  async getMultiDashboardData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/multi-dashboard-data`);
      return response.data;
    } catch (error) {
      console.error('Error fetching multi-dashboard data:', error);
      return { multi_layer_data: [], algorithm_data: [], company_bias_data: [] };
    }
  }

  // Get Neo4j graph stats
  async getGraphStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/neo4j/graph-stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching graph stats:', error);
      return {};
    }
  }

  // Load MC1 data into Neo4j
  async loadMC1Data() {
    try {
      const response = await axios.post(`${API_BASE_URL}/neo4j/load-mc1`);
      return response.data;
    } catch (error) {
      console.error('Error loading MC1 data:', error);
      throw error;
    }
  }

  // Search entities in Neo4j
  async searchEntities(query, limit = 20) {
    try {
      const response = await axios.get(`${API_BASE_URL}/neo4j/search`, {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching entities:', error);
      return [];
    }
  }

  // Get Neo4j status
  async getNeo4jStatus() {
    try {
      const response = await axios.get(`${API_BASE_URL}/neo4j/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Neo4j status:', error);
      return { connected: false, message: 'Connection failed' };
    }
  }
}

export default new ArticleService();
