import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class MC1Service {
  constructor() {
    this.mc1Data = null;
    this.processedData = null;
  }

  // Load MC1 data from backend
  async loadMC1Data() {
    try {
      const response = await axios.post(`${API_BASE_URL}/neo4j/load-mc1`);
      return response.data;
    } catch (error) {
      console.error('Error loading MC1 data:', error);
      throw error;
    }
  }

  // Get processed MC1 statistics
  getMC1Statistics(mc1Data) {
    if (!mc1Data || !mc1Data.nodes || !mc1Data.links) {
      return {
        totalNodes: 0,
        totalLinks: 0,
        fishingCompanies: 0,
        eventTypes: [],
        countries: [],
        algorithms: [],
        sources: [],
        timeRange: { start: null, end: null }
      };
    }

    const nodes = mc1Data.nodes;
    const links = mc1Data.links;

    // Count fishing companies
    const fishingCompanies = nodes.filter(node => 
      node.type === 'Entity.Organization.FishingCompany'
    ).length;

    // Get unique event types
    const eventTypes = [...new Set(links.map(link => link.type))];

    // Get unique countries
    const countries = [...new Set(nodes.map(node => node.country).filter(Boolean))];

    // Get unique algorithms
    const algorithms = [...new Set(links.map(link => link._algorithm).filter(Boolean))];

    // Get unique sources
    const sources = [...new Set(links.map(link => link._raw_source).filter(Boolean))];

    // Get time range
    const dates = links.map(link => link._date_added).filter(Boolean);
    const timeRange = {
      start: dates.length > 0 ? new Date(Math.min(...dates.map(d => new Date(d)))) : null,
      end: dates.length > 0 ? new Date(Math.max(...dates.map(d => new Date(d)))) : null
    };

    return {
      totalNodes: nodes.length,
      totalLinks: links.length,
      fishingCompanies,
      eventTypes,
      countries,
      algorithms,
      sources,
      timeRange
    };
  }

  // Get bias analysis from MC1 data
  getBiasAnalysis(mc1Data) {
    if (!mc1Data || !mc1Data.links) return [];

    const linksBySource = {};
    const linksByAlgorithm = {};
    const linksByEventType = {};

    mc1Data.links.forEach(link => {
      // Group by source
      if (link._raw_source) {
        if (!linksBySource[link._raw_source]) {
          linksBySource[link._raw_source] = [];
        }
        linksBySource[link._raw_source].push(link);
      }

      // Group by algorithm
      if (link._algorithm) {
        if (!linksByAlgorithm[link._algorithm]) {
          linksByAlgorithm[link._algorithm] = [];
        }
        linksByAlgorithm[link._algorithm].push(link);
      }

      // Group by event type
      if (link.type) {
        if (!linksByEventType[link.type]) {
          linksByEventType[link.type] = [];
        }
        linksByEventType[link.type].push(link);
      }
    });

    return {
      sourceAnalysis: Object.entries(linksBySource).map(([source, links]) => ({
        source,
        linkCount: links.length,
        eventTypes: [...new Set(links.map(l => l.type))],
        algorithms: [...new Set(links.map(l => l._algorithm).filter(Boolean))],
        companies: [...new Set(links.map(l => l.source).filter(Boolean))]
      })),
      algorithmAnalysis: Object.entries(linksByAlgorithm).map(([algorithm, links]) => ({
        algorithm,
        linkCount: links.length,
        eventTypes: [...new Set(links.map(l => l.type))],
        sources: [...new Set(links.map(l => l._raw_source).filter(Boolean))]
      })),
      eventTypeAnalysis: Object.entries(linksByEventType).map(([eventType, links]) => ({
        eventType,
        linkCount: links.length,
        sources: [...new Set(links.map(l => l._raw_source).filter(Boolean))],
        algorithms: [...new Set(links.map(l => l._algorithm).filter(Boolean))]
      }))
    };
  }

  // Get temporal analysis from MC1 data
  getTemporalAnalysis(mc1Data) {
    if (!mc1Data || !mc1Data.links) return [];

    const linksByMonth = {};
    
    mc1Data.links.forEach(link => {
      if (link._date_added) {
        const date = new Date(link._date_added);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!linksByMonth[monthKey]) {
          linksByMonth[monthKey] = {
            month: monthKey,
            events: [],
            eventTypes: {},
            sources: {},
            algorithms: {}
          };
        }
        
        linksByMonth[monthKey].events.push(link);
        
        // Count event types
        linksByMonth[monthKey].eventTypes[link.type] = 
          (linksByMonth[monthKey].eventTypes[link.type] || 0) + 1;
        
        // Count sources
        if (link._raw_source) {
          linksByMonth[monthKey].sources[link._raw_source] = 
            (linksByMonth[monthKey].sources[link._raw_source] || 0) + 1;
        }
        
        // Count algorithms
        if (link._algorithm) {
          linksByMonth[monthKey].algorithms[link._algorithm] = 
            (linksByMonth[monthKey].algorithms[link._algorithm] || 0) + 1;
        }
      }
    });

    return Object.values(linksByMonth).sort((a, b) => a.month.localeCompare(b.month));
  }

  // Get company network data
  getCompanyNetworkData(mc1Data, companyLimit = 50) {
    if (!mc1Data || !mc1Data.nodes || !mc1Data.links) {
      return { nodes: [], links: [] };
    }

    // Get top companies by connection count
    const companyConnections = {};
    mc1Data.links.forEach(link => {
      if (link.source) {
        companyConnections[link.source] = (companyConnections[link.source] || 0) + 1;
      }
      if (link.target) {
        companyConnections[link.target] = (companyConnections[link.target] || 0) + 1;
      }
    });

    const topCompanies = Object.entries(companyConnections)
      .sort(([,a], [,b]) => b - a)
      .slice(0, companyLimit)
      .map(([company]) => company);

    // Filter nodes and links for top companies
    const filteredNodes = mc1Data.nodes.filter(node => 
      topCompanies.includes(node.id)
    ).map(node => ({
      id: node.id,
      type: node.type,
      country: node.country,
      connections: companyConnections[node.id] || 0
    }));

    const filteredLinks = mc1Data.links.filter(link => 
      topCompanies.includes(link.source) && topCompanies.includes(link.target)
    ).map(link => ({
      source: link.source,
      target: link.target,
      type: link.type,
      date: link._date_added,
      source_name: link._raw_source,
      algorithm: link._algorithm
    }));

    return {
      nodes: filteredNodes,
      links: filteredLinks
    };
  }

  // Search entities in MC1 data
  searchEntities(mc1Data, query, limit = 20) {
    if (!mc1Data || !mc1Data.nodes || !query) return [];

    const searchTerm = query.toLowerCase();
    return mc1Data.nodes
      .filter(node => 
        node.id.toLowerCase().includes(searchTerm) ||
        node.type.toLowerCase().includes(searchTerm) ||
        (node.country && node.country.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit)
      .map(node => ({
        id: node.id,
        type: node.type,
        country: node.country,
        relevance: node.id.toLowerCase().includes(searchTerm) ? 1 : 0.5
      }));
  }
}

export default new MC1Service();
