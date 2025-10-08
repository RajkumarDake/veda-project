import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

const NetworkView = () => {
  // State for Neo4j connection
  const [neo4jStatus, setNeo4jStatus] = useState({ connected: false, message: '' });
  const [loading, setLoading] = useState(false);
  
  // State for graph data
  const [labels, setLabels] = useState([]);
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [queryError, setQueryError] = useState(null);
  const [stats, setStats] = useState({ nodeCount: 0, edgeCount: 0 });
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [overlayInfo, setOverlayInfo] = useState(null); // { x, y, type, data }
  
  // State for selected buttons
  const [selectedRelationships, setSelectedRelationships] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  
  // State for query limit
  const [queryLimit, setQueryLimit] = useState('');
  
  // Vis-network refs
  const containerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const nodesRef = useRef(null);
  const edgesRef = useRef(null);
  const networkRef = useRef(null);
  
  // UI state
  const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  
  // Color palette for nodes
  const colorPalette = {
    SustainableFishing: { background: '#10b981', border: '#059669' },
    Overfishing: { background: '#ef4444', border: '#dc2626' },
    FishingCompany: { background: '#3b82f6', border: '#2563eb' },
    Organization: { background: '#8b5cf6', border: '#7c3aed' },
    Person: { background: '#06b6d4', border: '#0891b2' },
    NewsSource: { background: '#ec4899', border: '#db2777' },
    Company: { background: '#f59e0b', border: '#d97706' },
    Commodity: { background: '#84cc16', border: '#65a30d' },
    GovernmentOrg: { background: '#dc2626', border: '#b91c1c' },
    LogisticsCompany: { background: '#7c3aed', border: '#6d28d9' },
    NGO: { background: '#059669', border: '#047857' },
    Region: { background: '#0891b2', border: '#0e7490' },
    default: { background: '#6b7280', border: '#374151' }
  };

  // Color palette for relationship edges - All 13 relationship types with distinct colors
  const relationshipColors = {
    // 1. Invest - Dark Green
    Invest: { color: '#059669', highlight: '#047857', width: 2.5 },
    invest: { color: '#059669', highlight: '#047857', width: 2.5 },
    INVEST: { color: '#059669', highlight: '#047857', width: 2.5 },
    
    // 2. Aid - Light Green
    Aid: { color: '#22c55e', highlight: '#16a34a', width: 2.5 },
    aid: { color: '#22c55e', highlight: '#16a34a', width: 2.5 },
    AID: { color: '#22c55e', highlight: '#16a34a', width: 2.5 },
    
    // 3. Transaction - Yellow
    Transaction: { color: '#eab308', highlight: '#ca8a04', width: 2.5 },
    transaction: { color: '#eab308', highlight: '#ca8a04', width: 2.5 },
    TRANSACTION: { color: '#eab308', highlight: '#ca8a04', width: 2.5 },
    
    // 4. SustainableFishing - Emerald Green (positive environmental action)
    SustainableFishing: { color: '#10b981', highlight: '#059669', width: 2.5 },
    sustainable_fishing: { color: '#10b981', highlight: '#059669', width: 2.5 },
    SUSTAINABLE_FISHING: { color: '#10b981', highlight: '#059669', width: 2.5 },
    
    // 5. Fishing - Cyan
    Fishing: { color: '#0891b2', highlight: '#0e7490', width: 2.5 },
    fishing: { color: '#0891b2', highlight: '#0e7490', width: 2.5 },
    FISHING: { color: '#0891b2', highlight: '#0e7490', width: 2.5 },
    
    // 6. Conference - Purple
    Conference: { color: '#8b5cf6', highlight: '#7c3aed', width: 2.5 },
    conference: { color: '#8b5cf6', highlight: '#7c3aed', width: 2.5 },
    CONFERENCE: { color: '#8b5cf6', highlight: '#7c3aed', width: 2.5 },
    
    // 7. OverFishing - Red
    OverFishing: { color: '#ef4444', highlight: '#dc2626', width: 2.5 },
    overfishing: { color: '#ef4444', highlight: '#dc2626', width: 2.5 },
    OVER_FISHING: { color: '#ef4444', highlight: '#dc2626', width: 2.5 },
    
    // 8. Criticize - Orange
    Criticize: { color: '#f97316', highlight: '#ea580c', width: 2.5 },
    criticize: { color: '#f97316', highlight: '#ea580c', width: 2.5 },
    CRITICIZE: { color: '#f97316', highlight: '#ea580c', width: 2.5 },
    
    // 9. PartiallyOwns - Violet
    PartiallyOwns: { color: '#a78bfa', highlight: '#7c3aed', width: 2.5 },
    partially_owns: { color: '#a78bfa', highlight: '#7c3aed', width: 2.5 },
    PARTIALLY_OWNS: { color: '#a78bfa', highlight: '#7c3aed', width: 2.5 },
    
    // 10. Applaud - Lime Green
    Applaud: { color: '#84cc16', highlight: '#65a30d', width: 2.5 },
    applaud: { color: '#84cc16', highlight: '#65a30d', width: 2.5 },
    APPLAUD: { color: '#84cc16', highlight: '#65a30d', width: 2.5 },
    
    // 11. CertificateIssued - Sky Blue
    CertificateIssued: { color: '#0ea5e9', highlight: '#0284c7', width: 2.5 },
    certificate_issued: { color: '#0ea5e9', highlight: '#0284c7', width: 2.5 },
    CERTIFICATE_ISSUED: { color: '#0ea5e9', highlight: '#0284c7', width: 2.5 },
    
    // 12. Summons - Amber
    Summons: { color: '#f59e0b', highlight: '#d97706', width: 2.5 },
    summons: { color: '#f59e0b', highlight: '#d97706', width: 2.5 },
    SUMMONS: { color: '#f59e0b', highlight: '#d97706', width: 2.5 },
    
    // 13. Convicted - Dark Red
    Convicted: { color: '#dc2626', highlight: '#b91c1c', width: 2.5 },
    convicted: { color: '#dc2626', highlight: '#b91c1c', width: 2.5 },
    CONVICTED: { color: '#dc2626', highlight: '#b91c1c', width: 2.5 },
    
    // Additional common relationships
    RELATED: { color: '#6b7280', highlight: '#4b5563', width: 1.5 },
    CONNECTED: { color: '#64748b', highlight: '#475569', width: 1.5 },
    OWNS: { color: '#3b82f6', highlight: '#2563eb', width: 2 },
    WORKS_FOR: { color: '#06b6d4', highlight: '#0891b2', width: 1.5 },
    LOCATED_IN: { color: '#8b5cf6', highlight: '#7c3aed', width: 1.5 },
    
    // Default
    default: { color: '#94a3b8', highlight: '#64748b', width: 1.5 }
  };

  // Get relationship style with proper colors
  const getRelationStyle = (relType) => {
    // Look up the relationship type in our color mapping
    const style = relationshipColors[relType] || relationshipColors.default;
    return {
      color: style.color,
      highlight: style.highlight,
      width: style.width
    };
  };

  // Relationship polarity for layout separation
  const positiveRelations = new Set(['Aid', 'Applaud', 'Invest', 'SustainableFishing', 'CertificateIssued', 'Conference']);
  const negativeRelations = new Set(['OverFishing', 'Convicted', 'Criticize', 'Summons']);

  // Toggle functions
  const toggleRelationship = (relType) => {
    setSelectedRelationships(prev => 
      prev.includes(relType) ? prev.filter(rel => rel !== relType) : [...prev, relType]
    );
  };

  const toggleNode = (nodeType) => {
    setSelectedNodes(prev => 
      prev.includes(nodeType) ? prev.filter(node => node !== nodeType) : [...prev, nodeType]
    );
  };

  // Network options
  const getNetworkOptions = useCallback(() => ({
    nodes: {
      shape: 'dot',
      size: 12,
      font: {
        size: 0, // hide node labels entirely on canvas
        color: 'transparent',
        strokeWidth: 0,
        strokeColor: 'transparent'
      },
      borderWidth: 2,
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.12)',
        size: 5
      },
      scaling: {
        min: 8,
        max: 18,
        label: { enabled: false }
      },
      chosen: {
        node: (values) => {
          values.borderWidth = 3;
          values.size = 16;
        }
      }
    },
    edges: {
      width: 2,
      color: {
        color: '#94a3b8',
        highlight: '#64748b',
        hover: '#94a3b8',
        opacity: 0.8
      },
      arrows: {
        to: { enabled: true, scaleFactor: 1.0, type: 'arrow' }
      },
      font: {
        size: 12,
        color: '#374151',
        strokeWidth: 2,
        strokeColor: '#ffffff',
        align: 'middle'
      },
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0.2
      },
      labelHighlightBold: true,
      selectionWidth: 3
    },
    layout: { improvedLayout: true, randomSeed: 7 },
    physics: {
      enabled: physicsEnabled,
      solver: 'repulsion',
      repulsion: {
        nodeDistance: 240,
        springLength: 200,
        springConstant: 0.02,
        damping: 0.09,
        centralGravity: 0.01
      },
      stabilization: false,
      maxVelocity: 20,
      minVelocity: 0.1
    },
    interaction: {
      hover: true,
      zoomView: true,
      dragView: true,
      dragNodes: false, // prevent node movement
      tooltipDelay: 200,
      multiselect: true,
      hoverConnectedEdges: true
    }
  }), [physicsEnabled]);

  // Initialize network
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    const container = containerRef.current;
    
    // Ensure container is completely empty and controlled by vis-network
    container.innerHTML = '';
    
    const nodes = new DataSet([]);
    const edges = new DataSet([]);

    nodesRef.current = nodes;
    edgesRef.current = edges;

    try {
      const network = new Network(container, { nodes, edges }, getNetworkOptions());
      networkRef.current = network;
      setIsInitialized(true);
      console.log('Network initialized successfully');
      // Register selection listeners for details panel
      network.on('click', params => {
        console.log('🖱️ Network click:', params);
        if (!params) return;
        const nodeId = params.nodes?.[0];
        const edgeId = params.edges?.[0];
        const pointer = params.pointer?.DOM || { x: 0, y: 0 };
        
        if (nodeId && nodesRef.current) {
          const node = nodesRef.current.get(nodeId);
          console.log('🔵 Node selected:', nodeId, node);
          setSelectedDetails({ type: 'node', data: node });
          setOverlayInfo({ type: 'node', data: node, x: pointer.x, y: pointer.y });
        } else if (edgeId && edgesRef.current) {
          const edge = edgesRef.current.get(edgeId);
          console.log('🔗 Edge selected:', edgeId, edge);
          // Only show overlay info for edges, don't set selectedDetails for bottom panel
          setOverlayInfo({ type: 'edge', data: edge, x: pointer.x, y: pointer.y });
          setSelectedDetails(null); // Clear bottom panel
        } else {
          console.log('❌ No selection - clearing details');
          setSelectedDetails(null);
          setOverlayInfo(null);
        }
      });

      // Once stabilization finishes, optionally freeze physics if disabled
      network.on('stabilizationIterationsDone', () => {
        if (networkRef.current && !physicsEnabled) {
          networkRef.current.setOptions({ physics: { enabled: false } });
        }
      });
    } catch (error) {
      console.error('Error creating network:', error);
    }

    return () => {
      try {
        if (networkRef.current) {
          networkRef.current.destroy();
          networkRef.current = null;
        }
        if (nodesRef.current) {
          nodesRef.current.clear();
          nodesRef.current = null;
        }
        if (edgesRef.current) {
          edgesRef.current.clear();
          edgesRef.current = null;
        }
        setIsInitialized(false);
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    };
  }, []);

  // Update network options
  useEffect(() => {
    if (!networkRef.current || !isInitialized) return;
    networkRef.current.setOptions(getNetworkOptions());
  }, [getNetworkOptions, isInitialized]);

  // Load schema
  const loadActualDatabaseSchema = async () => {
    try {
      const response = await fetch('/api/neo4j/graph-data');
      const data = await response.json();
      
      if (data.labels) setLabels(data.labels);
      if (data.relationshipTypes) setRelationshipTypes(data.relationshipTypes);
    } catch (error) {
      console.error('Error loading database schema:', error);
      setLabels(['Company', 'Person', 'Organization']);
      setRelationshipTypes(['RELATED', 'CONNECTED']);
    }
  };

  // Check Neo4j status
  const checkNeo4jStatus = async () => {
    try {
      const response = await fetch('/api/neo4j/status');
      const status = await response.json();
      setNeo4jStatus(status);
    } catch (error) {
      console.error('Error checking Neo4j status:', error);
      setNeo4jStatus({ connected: false, message: 'Connection failed' });
    }
  };

  useEffect(() => {
    checkNeo4jStatus();
    loadActualDatabaseSchema();
  }, []);

  // Execute query
  const executeSelectedQuery = useCallback(async () => {
    if (selectedRelationships.length === 0 && selectedNodes.length === 0) {
      setQueryError('Please select at least one relationship or node type');
      return;
    }

    setQueryError(null);
    setLoading(true);
    
    try {
      const groqResponse = await fetch('/api/groq/generate-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedNodes: selectedNodes,
          selectedRelationships: selectedRelationships,
          userIntent: 'Generate a Cypher query to visualize the selected nodes and relationships',
          queryLimit: queryLimit
        })
      });
      
      const groqResult = await groqResponse.json();
      const query = groqResult.query;
      
      console.log('=== QUERY EXECUTION DEBUG ===');
      console.log('Selected Nodes:', selectedNodes);
      console.log('Selected Relationships:', selectedRelationships);
      console.log('Generated Cypher Query:', query);
      console.log('Groq Response:', groqResult);
      console.log('============================');

      const response = await fetch('/api/neo4j/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const results = await response.json();
      
      console.log('=== NEO4J RESPONSE DEBUG ===');
      console.log('Response Status:', response.status);
      console.log('Neo4j Results:', results);
      console.log('Records Count:', results.records ? results.records.length : 0);
      if (results.records && results.records.length > 0) {
        console.log('First Record Sample:', results.records[0]);
      }
      console.log('===========================');
      
      if (results.error) {
        setQueryError(`Neo4j Error: ${results.error}`);
      } else {
        // Just set the graph data - useEffect will handle the network update
        setGraphData(results);
        if (!results.records || results.records.length === 0) {
          setQueryError('No data found for selected items');
        }
      }
    } catch (error) {
      console.error('Error executing query:', error);
      setQueryError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedRelationships, selectedNodes, queryLimit]);

  // Update data when graphData changes
  useEffect(() => {
    console.log('=== DATA CHANGED - UPDATING NETWORK ===');
    if (!nodesRef.current || !edgesRef.current || !networkRef.current) {
      console.warn('Network refs not ready');
      return;
    }

    // Clear existing data
    nodesRef.current.clear();
    edgesRef.current.clear();

    if (!graphData?.records) {
      console.log('No graph data to display');
      return;
    }

    const { nodes, edges } = processResults(graphData, selectedRelationships);
    console.log(`Processed: ${nodes.length} nodes, ${edges.length} edges`);

    if (nodes.length > 0 || edges.length > 0) {
      // Add data to the network
      // Compute polarity buckets for layout
      const nodePolarity = new Map(); // id -> 'positive' | 'negative' | 'neutral'
      edges.forEach(e => {
        if (positiveRelations.has(e.type)) {
          nodePolarity.set(e.from, 'positive');
          nodePolarity.set(e.to, 'positive');
        } else if (negativeRelations.has(e.type)) {
          nodePolarity.set(e.from, 'negative');
          nodePolarity.set(e.to, 'negative');
        }
      });

      // Seed positions: negatives left, positives right, neutral center
      const seededNodes = nodes.map(n => {
        const polarity = nodePolarity.get(n.id) || 'neutral';
        let x = 0;
        if (polarity === 'negative') x = -700;
        else if (polarity === 'positive') x = 700;
        const y = (Math.random() - 0.5) * 1000;
        const { label, ...rest } = n;
        return { ...rest, x, y, fixed: { x: false, y: false }, title: `${n.group}: ${label}` };
      });

      // Rich tooltip content for nodes
      nodesRef.current.add(seededNodes.map(n => {
        const meta = n.meta || {};
        const title = `<div style="padding:8px 10px">`
          + `<div style="font-weight:700;margin-bottom:4px">${n.group}</div>`
          + `<div>ID: <code>${String(n.id)}</code></div>`
          + (meta.id ? `<div>Name: ${meta.id}</div>` : '')
          + (meta.name ? `<div>Alias: ${meta.name}</div>` : '')
          + (meta.country ? `<div>Country: ${meta.country}</div>` : '')
          + `</div>`;
        return { ...n, title };
      }));
      // Rich tooltip content for edges with all backend information
      edgesRef.current.add(edges.map(e => {
        const { label, ...rest } = e;
        const meta = e.meta || {};
        
        // Create comprehensive tooltip with all backend data
        let title = `<div style="padding:10px 12px;max-width:500px">`;
        title += `<div style="font-weight:700;margin-bottom:6px;color:#94a3b8;font-size:14px">${e.type}</div>`;
        
        // Show all properties from backend
        if (Object.keys(meta).length > 0) {
          title += `<div style="margin-bottom:8px;font-size:13px;color:#e5e7eb">All Backend Data:</div>`;
          
          // Separate different types of data
          const regularProps = {};
          const rawProps = {};
          const systemProps = {};
          
          Object.entries(meta).forEach(([key, value]) => {
            if (key.startsWith('_')) {
              systemProps[key] = value;
            } else if (key.startsWith('raw_')) {
              rawProps[key] = value;
            } else {
              regularProps[key] = value;
            }
          });
          
          // Show regular properties first
          Object.entries(regularProps).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              title += `<div style="margin-bottom:2px;font-size:11px">`;
              title += `<span style="color:#10b981;font-weight:600">${key}:</span> `;
              title += `<span style="color:#e5e7eb">${String(value)}</span>`;
              title += `</div>`;
            }
          });
          
          // Show raw properties
          Object.entries(rawProps).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '' && typeof value !== 'object') {
              title += `<div style="margin-bottom:2px;font-size:11px">`;
              title += `<span style="color:#f59e0b;font-weight:500">${key}:</span> `;
              title += `<span style="color:#d1d5db">${String(value)}</span>`;
              title += `</div>`;
            }
          });
          
          // Show system properties
          Object.entries(systemProps).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '' && typeof value !== 'object') {
              title += `<div style="margin-bottom:2px;font-size:10px">`;
              title += `<span style="color:#6b7280">${key}:</span> `;
              title += `<span style="color:#9ca3af">${String(value)}</span>`;
              title += `</div>`;
            }
          });
        }
        
        title += `<div style="margin-top:8px;padding-top:6px;border-top:1px solid #374151;font-size:11px;color:#9ca3af">`;
        title += `From: <code style="color:#93c5fd">${String(e.from)}</code><br>`;
        title += `To: <code style="color:#93c5fd">${String(e.to)}</code>`;
        title += `</div></div>`;
        
        return { ...rest, title };
      }));
      console.log('Data added to vis-network');

      // Apply physics based on toggle
      if (physicsEnabled) {
        networkRef.current.setOptions({ physics: { enabled: true, solver: 'repulsion' }, edges: { smooth: false }, interaction: { dragNodes: true } });
        networkRef.current.stabilize(200);
        networkRef.current.fit({ animation: { duration: 400 } });
      } else {
        networkRef.current.setOptions({ physics: { enabled: true, solver: 'repulsion', repulsion: { nodeDistance: 260, springLength: 220, springConstant: 0.02, damping: 0.09, centralGravity: 0.01 }, stabilization: { iterations: 300 } }, edges: { smooth: false }, interaction: { dragNodes: false } });
        networkRef.current.fit({ animation: { duration: 400 } });
        setTimeout(() => {
          if (networkRef.current) {
            networkRef.current.setOptions({ physics: { enabled: false } });
          }
        }, 800);
      }
      console.log('Network fitted');
    }

    setStats({ nodeCount: nodesRef.current.length || nodes.length, edgeCount: edgesRef.current.length || edges.length });
  }, [graphData, selectedRelationships]);

  // Helpers: parsing Neo4j node/relationship objects or stringified identities
  const parseNodeLike = (nodeLike, fallbackId) => {
    // Returns { identity, labels, properties }
    if (!nodeLike) return { identity: fallbackId, labels: ['Unknown'], properties: {} };

    // Case: already shaped object with identity number
    const identityValue = nodeLike.identity;
    const labelsValue = nodeLike.labels;
    const propsValue = nodeLike.properties;

    // If we got a standard object with arrays and properties populated
    if (Array.isArray(labelsValue) && labelsValue.length > 0 && propsValue && Object.keys(propsValue).length > 0) {
      const identity = typeof identityValue === 'object' && identityValue?.toNumber ? identityValue.toNumber() : (identityValue ?? fallbackId);
      return { identity, labels: labelsValue, properties: propsValue };
    }

    // If identity is a string like "<Node element_id='...' labels=frozenset({'Region'}) properties={'id': 'X'}>"
    const identityString = typeof identityValue === 'string' ? identityValue : (typeof nodeLike === 'string' ? nodeLike : null);
    if (identityString) {
      const labelMatch = identityString.match(/labels=frozenset\(\{[^}]*'([^']+)'/);
      const idMatch = identityString.match(/'id':\s*'([^']+)'/);
      const nameMatch = identityString.match(/'name':\s*'([^']+)'/);
      const countryMatch = identityString.match(/'country':\s*'([^']+)'/);
      const elementIdMatch = identityString.match(/element_id='([^']+)'/);
      const labels = labelMatch ? [labelMatch[1]] : (Array.isArray(labelsValue) && labelsValue.length > 0 ? labelsValue : ['Unknown']);
      const properties = {
        ...(propsValue || {}),
        id: idMatch ? idMatch[1] : (propsValue?.id ?? null),
        name: nameMatch ? nameMatch[1] : (propsValue?.name ?? null),
        country: countryMatch ? countryMatch[1] : (propsValue?.country ?? undefined)
      };
      // Prefer stable identity: properties.id -> element_id -> fallback
      const identity = properties.id || elementIdMatch?.[1] || fallbackId;
      return { identity, labels, properties };
    }

    // Fallback minimal
    const identity = typeof identityValue === 'object' && identityValue?.toNumber ? identityValue.toNumber() : (identityValue ?? fallbackId);
    const labels = Array.isArray(labelsValue) && labelsValue.length > 0 ? labelsValue : ['Unknown'];
    const properties = propsValue || {};
    return { identity, labels, properties };
  };

  const parseRelationshipLike = (relLike, fallbackId) => {
    // Returns { identity, type, properties, rawData }
    if (!relLike) return { identity: fallbackId, type: 'RELATES', properties: {}, rawData: {} };
    
    // Only log first few for debugging
    if (Math.random() < 0.01) console.log('🔍 parseRelationshipLike input:', JSON.stringify(relLike, null, 2));
    
    const identityValue = relLike.identity;
    const typeValue = relLike.type;
    const propsValue = relLike.properties;
    const identity = typeof identityValue === 'object' && identityValue?.toNumber ? identityValue.toNumber() : (identityValue ?? fallbackId);
    const type = typeValue || 'RELATES';
    const properties = propsValue || {};
    
    // Capture ALL fields from the raw relationship object
    const rawData = {};
    Object.keys(relLike).forEach(key => {
      if (!['identity', 'type', 'properties'].includes(key)) {
        rawData[key] = relLike[key];
      }
    });
    
    // Also capture any nested data
    if (typeof relLike === 'object') {
      Object.entries(relLike).forEach(([key, value]) => {
        if (value !== null && value !== undefined && typeof value !== 'function') {
          rawData[`raw_${key}`] = value;
        }
      });
    }
    
    // Only log first few for debugging  
    if (Math.random() < 0.01) console.log('🔍 parseRelationshipLike output:', { identity, type, properties, rawData });
    
    return { identity, type, properties, rawData };
  };

  // Process Neo4j results into vis-network format
  const processResults = (results, selectedRelationships = []) => {
    if (!results?.records?.length) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];
    const nodeMap = new Map();
    const edgeMap = new Map();

    console.log('=== PROCESSING RESULTS (Structured Adapter) ===');
    console.log('Total records to process:', results.records.length);

    results.records.forEach((record, index) => {
      try {
        // Debug the record structure for first few records
        if (index < 3) {
          console.log(`=== RECORD DEBUG ${index} ===`);
          console.log('Full record:', record);
          console.log('Record keys:', Object.keys(record));
          console.log('record.start:', record.start);
          console.log('record.r:', record.r);
          console.log('record.end:', record.end);
          console.log('========================');
        }
        
        // Expecting shape: { start, r, end }
        const startNode = record.start;
        const endNode = record.end;
        const relationship = record.r;

        if (!startNode || !endNode || !relationship) {
          console.warn(`Record ${index} missing required data:`, record);
          return;
        }

        // Parse nodes
        const startData = parseNodeLike(startNode, `start_${index}`);
        const startId = startData.identity;
        
        if (!nodeMap.has(startId)) {
          const group = startData.labels?.[0] || 'Unknown';
          const color = colorPalette[group] || colorPalette.default;
          
          // Extract ONLY the name - clean and simple
          const nodeLabel = startData.properties.id || startData.properties.name || `${group}_${startId}`;

          nodes.push({
            id: startId,
            label: nodeLabel,
            group,
            color,
            meta: startData.properties,
            font: {
              size: 14,
              color: '#ffffff'
            }
          });
          nodeMap.set(startId, true);
        }

        // Parse end node
        const endData = parseNodeLike(endNode, `end_${index}`);
        const endId = endData.identity;
        
        if (!nodeMap.has(endId)) {
          const group = endData.labels?.[0] || 'Unknown';
          const color = colorPalette[group] || colorPalette.default;
          
          // Extract ONLY the name - clean and simple
          const nodeLabel = endData.properties.id || endData.properties.name || `${group}_${endId}`;

          nodes.push({
            id: endId,
            label: nodeLabel,
            group,
            color,
            meta: endData.properties,
            font: {
              size: 14,
              color: '#ffffff'
            }
          });
          nodeMap.set(endId, true);
        }

        // Process relationship with colors and values
        const relData = parseRelationshipLike(relationship, `rel_${index}`);
        
        // WORKAROUND: If relationship type is missing, infer from selected relationships
        let actualRelType = relData.type;
        if (actualRelType === 'RELATES' && selectedRelationships.length > 0) {
          // For UNION queries with multiple relationship types, we need to determine which part of the result this record belongs to
          // Since backend returns empty relationships, we'll cycle through the selected types based on record position
          const typeIndex = Math.floor(index / Math.ceil(results.records.length / selectedRelationships.length));
          actualRelType = selectedRelationships[Math.min(typeIndex, selectedRelationships.length - 1)];
          
          // Only log warning once per 100 records to avoid spam
          if (index % 100 === 0) {
            console.log(`⚠️ Inferring relationship type '${actualRelType}' from selection (backend returned empty relationship) - Record ${index}, Type Index: ${typeIndex}`);
          }
        }
        
        // Use a unique edge ID that includes the relationship type to avoid deduplication issues
        const relId = `${relData.identity}_${actualRelType}_${startId}_${endId}`;
        
        if (!edgeMap.has(relId)) {
          const relType = actualRelType;
          const relConfig = getRelationStyle(relType);
          
          // Enhanced debug logging for relationship colors and meta data (only first 3 records)
          if (index < 3) {
            console.log(`=== EDGE DEBUG ${index} ===`);
            console.log(`- Raw relationship:`, JSON.stringify(relationship, null, 2));
            console.log(`- Parsed relType: "${relType}"`);
            console.log(`- Actual relType: "${actualRelType}"`);
            console.log(`- Properties:`, JSON.stringify(relData.properties, null, 2));
            console.log(`- Raw Data:`, JSON.stringify(relData.rawData, null, 2));
            console.log(`- Edge ID: ${relId}`);
            console.log(`- Color: ${relConfig.color}`);
            console.log(`==================`);
          }
          
          // Extract value from properties if available
          const value = relData.properties?.value || relData.properties?.weight || relData.properties?.strength || '';
          const displayLabel = value ? `${relType}\n${value}` : relType;
          
          // Combine all available data for the edge
          const allMetadata = {
            ...relData.properties,
            ...relData.rawData,
            _originalRelationship: relationship,
            _relId: relData.identity,
            _relType: relType,
            _inferredFromSelection: actualRelType !== relData.type,
            _selectedRelationships: selectedRelationships,
            _backendIssue: 'Relationship data empty from backend API',
            _queryUsed: `MATCH (start)-[r:${actualRelType}]->(end) RETURN start, r, end`,
            _recordIndex: index,
            _startNodeId: startId,
            _endNodeId: endId
          };
          
          edges.push({
            id: relId,
            from: startId,
            to: endId,
            label: displayLabel,
            type: relType,
            meta: allMetadata,
            color: {
              color: relConfig.color,
              highlight: relConfig.highlight,
              hover: relConfig.color,
              opacity: 0.8
            },
            width: relConfig.width,
            font: {
              size: 11,
              color: '#374151',
              strokeWidth: 2,
              strokeColor: '#ffffff',
              align: 'middle'
            },
            arrows: {
              to: {
                enabled: true,
                scaleFactor: 1.0,
                type: 'arrow'
              }
            },
            smooth: {
              enabled: true,
              type: 'continuous',
              roundness: 0.2
            }
          });
          edgeMap.set(relId, true);
        }
      } catch (error) {
        console.error(`Error processing record ${index}:`, error);
      }
    });

    console.log(`=== PROCESSING COMPLETE ===`);
    console.log(`Final result: ${nodes.length} nodes, ${edges.length} edges`);
    
    // Log all unique relationship types found
    const uniqueRelTypes = [...new Set(edges.map(e => e.type))];
    console.log('Unique relationship types found:', uniqueRelTypes);
    uniqueRelTypes.forEach(relType => {
      const config = getRelationStyle(relType);
      console.log(`- "${relType}" -> ${config.color}`);
    });
    console.log('===========================');

    return { nodes, edges };
  };

  return (
    <div style={{ padding: '0', background: '#f3f4f6', minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '340px', background: '#ffffff', borderRight: '1px solid #e5e7eb', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Visualization Tool</h2>
          <div style={{ marginTop: '8px', fontSize: '0.875rem', color: '#6b7280' }}>
            {neo4jStatus.connected ? '✅ Connected to Neo4j' : '❌ Neo4j disconnected'}
          </div>
      </div>

        {/* Search */}
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Search nodes</div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Type node name/id..."
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={() => {
                if (!searchText || !nodesRef.current || !networkRef.current) return;
                const all = nodesRef.current.get();
                const matches = all.filter(n => (n.label || '').toLowerCase().includes(searchText.toLowerCase()));
                if (matches.length > 0) {
                  networkRef.current.selectNodes(matches.map(m => m.id), false);
                  networkRef.current.focus(matches[0].id, { scale: 1.2, animation: { duration: 500 } });
                }
              }}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer' }}
            >Find</button>
            <button
              onClick={() => { setSearchText(''); if (networkRef.current) networkRef.current.unselectAll(); }}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
            >Clear</button>
          </div>
        </div>

        {/* Query Limit */}
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Query Limit</div>
          <input
            type="text"
            value={queryLimit}
            onChange={(e) => setQueryLimit(e.target.value)}
            placeholder="e.g., 25 (optional)"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
          />
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
            Leave empty for no limit, or enter a number like 25
          </div>
        </div>

        {/* Node Types */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Node Types ({labels.length})</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setSelectedNodes(labels)} disabled={loading} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>All</button>
              <button onClick={() => setSelectedNodes([])} disabled={loading} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>None</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {labels.map(nodeType => (
              <button
                key={nodeType}
                onClick={() => toggleNode(nodeType)}
                disabled={loading}
                style={{
                  padding: '6px 10px',
                  borderRadius: '20px',
                  border: '2px solid',
                  borderColor: selectedNodes.includes(nodeType) ? '#8b5cf6' : '#e5e7eb',
                  background: selectedNodes.includes(nodeType) ? '#8b5cf6' : '#ffffff',
                  color: selectedNodes.includes(nodeType) ? '#ffffff' : '#374151',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem'
                }}
              >{nodeType}</button>
            ))}
          </div>
        </div>

        {/* Relationship Types */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Relationships ({relationshipTypes.length})</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setSelectedRelationships(relationshipTypes)} disabled={loading} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>All</button>
              <button onClick={() => setSelectedRelationships([])} disabled={loading} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>None</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {relationshipTypes.map(relType => (
              <button
                key={relType}
                onClick={() => toggleRelationship(relType)}
                disabled={loading}
                style={{
                  padding: '6px 10px',
                  borderRadius: '20px',
                  border: '2px solid',
                  borderColor: selectedRelationships.includes(relType) ? '#10b981' : '#e5e7eb',
                  background: selectedRelationships.includes(relType) ? '#10b981' : '#ffffff',
                  color: selectedRelationships.includes(relType) ? '#ffffff' : '#374151',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem'
                }}
              >{relType}</button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={executeSelectedQuery}
            disabled={loading || (selectedRelationships.length === 0 && selectedNodes.length === 0)}
            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: 'none', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
          >{loading ? 'Processing…' : 'Run'}</button>
          <button
            onClick={() => { if (nodesRef.current && edgesRef.current) { nodesRef.current.clear(); edgesRef.current.clear(); setStats({ nodeCount: 0, edgeCount: 0 }); setGraphData(null); setSelectedDetails(null); } }}
            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
          >Clear</button>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setPhysicsEnabled(!physicsEnabled)} style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>{physicsEnabled ? '🔓 Physics On' : '🔒 Physics Off'}</button>
          <button onClick={() => setShowLegend(!showLegend)} style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>{showLegend ? 'Hide Legend' : 'Show Legend'}</button>
      </div>

        {/* Stats */}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Stats</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <div>Nodes: <strong>{stats.nodeCount}</strong></div>
            <div>Edges: <strong>{stats.edgeCount}</strong></div>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Node Types</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {Object.keys(colorPalette).filter(k => k !== 'default').map(key => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e5e7eb', padding: '4px 6px', borderRadius: '6px', background: '#fff' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: colorPalette[key].background, border: `2px solid ${colorPalette[key].border}` }} />
                  <div style={{ fontSize: '0.75rem' }}>{key}</div>
                </div>
              ))}
            </div>
            
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Relationship Types</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Invest', 'Aid', 'Transaction', 'SustainableFishing', 'Fishing', 'Conference', 'OverFishing', 'Criticize', 'PartiallyOwns', 'Applaud', 'CertificateIssued', 'Summons', 'Convicted'].map(key => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e5e7eb', padding: '4px 6px', borderRadius: '6px', background: '#fff' }}>
                  <div style={{ width: 16, height: 3, borderRadius: '2px', background: relationshipColors[key]?.color || relationshipColors.default.color }} />
                  <div style={{ fontSize: '0.75rem' }}>{key}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Error */}
        {queryError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', color: '#b91c1c' }}>⚠️ {queryError}</div>
        )}
      </div>

      {/* Main canvas + details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Network Visualization</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => networkRef.current && networkRef.current.fit({ animation: { duration: 500 } })} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Fit</button>
            <button onClick={() => { if (!networkRef.current) return; const canvas = containerRef.current?.querySelector('canvas'); if (!canvas) return; const url = canvas.toDataURL('image/png'); const a = document.createElement('a'); a.href = url; a.download = 'graph.png'; a.click(); }} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Export PNG</button>
          </div>
        </div>

        {/* Graph container */}
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#0b1220', backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          {!graphData && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', zIndex: 1, pointerEvents: 'none' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 8 }}>🌐</div>
                <div style={{ fontWeight: 600 }}>Select filters and press Run to visualize</div>
              </div>
            </div>
          )}
          <div ref={containerRef} style={{ position: 'absolute', inset: 0, imageRendering: 'crisp-edges' }} />
          {overlayInfo && (
            <div style={{ position: 'absolute', left: overlayInfo.x + 12, top: overlayInfo.y + 12, zIndex: 5, pointerEvents: 'none' }}>
              <div style={{ background: 'rgba(17,24,39,0.98)', color: '#e5e7eb', border: '1px solid #334155', borderRadius: 8, padding: '10px 12px', maxWidth: 340, boxShadow: '0 10px 20px rgba(0,0,0,0.35)' }}>
                {overlayInfo.type === 'node' && (
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: '#10b981' }}>{overlayInfo.data.group}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{overlayInfo.data.label}</div>
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>ID: <code>{String(overlayInfo.data.id)}</code></div>
                    {overlayInfo.data.meta && (
                      <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                        {overlayInfo.data.meta.name && overlayInfo.data.meta.name !== overlayInfo.data.label && (
                          <div>Name: <span style={{ color: '#93c5fd' }}>{overlayInfo.data.meta.name}</span></div>
                        )}
                        {overlayInfo.data.meta.country && (
                          <div>Country: <span style={{ color: '#93c5fd' }}>{overlayInfo.data.meta.country}</span></div>
                        )}
                        {overlayInfo.data.meta.id && overlayInfo.data.meta.id !== overlayInfo.data.label && (
                          <div>Entity ID: <span style={{ color: '#93c5fd' }}>{overlayInfo.data.meta.id}</span></div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {overlayInfo.type === 'edge' && (
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 8, color: overlayInfo.data.color?.color || '#f59e0b', fontSize: '1rem' }}>
                      {overlayInfo.data.type || overlayInfo.data.label}
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: '#9ca3af' }}>From:</span> <span style={{ color: '#93c5fd', fontWeight: 500 }}>
                          {(() => {
                            const fromNode = nodesRef.current?.get(overlayInfo.data.from);
                            return fromNode ? fromNode.label : String(overlayInfo.data.from);
                          })()}
                        </span>
                      </div>
                      
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: '#9ca3af' }}>To:</span> <span style={{ color: '#93c5fd', fontWeight: 500 }}>
                          {(() => {
                            const toNode = nodesRef.current?.get(overlayInfo.data.to);
                            return toNode ? toNode.label : String(overlayInfo.data.to);
                          })()}
                        </span>
                      </div>
                      
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: '#9ca3af' }}>Color:</span> 
                        <span style={{ color: '#e5e7eb', fontFamily: 'monospace', marginLeft: 6 }}>
                          {overlayInfo.data.color?.color || '#94a3b8'}
                        </span>
                        <div style={{ 
                          display: 'inline-block', 
                          width: '10px', 
                          height: '10px', 
                          backgroundColor: overlayInfo.data.color?.color || '#94a3b8', 
                          borderRadius: '2px',
                          marginLeft: 6,
                          verticalAlign: 'middle'
                        }}></div>
                      </div>
                      
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: '#9ca3af' }}>Record:</span> 
                        <span style={{ color: '#e5e7eb' }}>
                          {overlayInfo.data.meta?._recordIndex || 'N/A'} of {overlayInfo.data.meta?._selectedRelationships ? overlayInfo.data.meta._selectedRelationships.join(', ') : 'N/A'}
                        </span>
                      </div>
                      
                      {overlayInfo.data.meta?._inferredFromSelection && (
                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontStyle: 'italic' }}>
                          (Type inferred from selection)
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <style>{`
            .vis-tooltip {
              background: rgba(17, 24, 39, 0.98) !important;
              color: #e5e7eb !important;
              border: 1px solid #334155 !important;
              border-radius: 8px !important;
              padding: 8px 10px !important;
              box-shadow: 0 10px 20px rgba(0,0,0,0.35) !important;
              max-width: 320px;
              pointer-events: none;
            }
            .vis-tooltip code { color: #93c5fd; }
          `}</style>
        </div>

        {/* Selection details */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', background: '#ffffff', minHeight: '64px' }}>
          {!selectedDetails && (
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Click a node or edge to see details</div>
          )}
          {selectedDetails && selectedDetails.type === 'node' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: (selectedDetails.data.color?.background || '#6b7280'), border: `2px solid ${selectedDetails.data.color?.border || '#374151'}` }} />
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedDetails.data.label}</div>
                <div style={{ color: '#6b7280' }}>•</div>
                <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 500 }}>{selectedDetails.data.group}</div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#6b7280' }}>
                <div>ID: <code style={{ color: '#374151' }}>{String(selectedDetails.data.id)}</code></div>
                {selectedDetails.data.meta?.name && selectedDetails.data.meta.name !== selectedDetails.data.label && (
                  <div>Name: <span style={{ color: '#374151' }}>{selectedDetails.data.meta.name}</span></div>
                )}
                {selectedDetails.data.meta?.country && (
                  <div>Country: <span style={{ color: '#374151' }}>{selectedDetails.data.meta.country}</span></div>
                )}
              </div>
            </div>
          )}
          {selectedDetails && selectedDetails.type === 'edge' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: 12, height: 3, background: selectedDetails.data.color?.color || '#94a3b8', borderRadius: '2px' }} />
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: selectedDetails.data.color?.color || '#374151' }}>{selectedDetails.data.type || selectedDetails.data.label}</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Relationship</div>
              </div>
              
              {/* Simple edge information - just 4-5 key details */}
              {selectedDetails.data.meta && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                    Edge Information
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', fontSize: '0.85rem' }}>
                    <div style={{ color: '#6b7280', fontWeight: 500 }}>Type:</div>
                    <div style={{ color: '#374151', fontWeight: 600 }}>{selectedDetails.data.type}</div>
                    
                    <div style={{ color: '#6b7280', fontWeight: 500 }}>From:</div>
                    <div style={{ color: '#374151' }}>{selectedDetails.data.from}</div>
                    
                    <div style={{ color: '#6b7280', fontWeight: 500 }}>To:</div>
                    <div style={{ color: '#374151' }}>{selectedDetails.data.to}</div>
                    
                    <div style={{ color: '#6b7280', fontWeight: 500 }}>Color:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: selectedDetails.data.color?.color || '#94a3b8', borderRadius: '2px' }}></div>
                      <span style={{ color: '#374151', fontFamily: 'monospace' }}>{selectedDetails.data.color?.color || '#94a3b8'}</span>
                    </div>
                    
                    <div style={{ color: '#6b7280', fontWeight: 500 }}>Record:</div>
                    <div style={{ color: '#374151' }}>{selectedDetails.data.meta._recordIndex || 'N/A'} of {selectedDetails.data.meta._selectedRelationships ? selectedDetails.data.meta._selectedRelationships.join(', ') : 'N/A'}</div>
                  </div>
                </div>
              )}
              
              {/* Show edge connection details */}
              <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>FROM</div>
                  <div style={{ fontWeight: 500, color: '#374151' }}>
                    {(() => {
                      const fromNode = nodesRef.current?.get(selectedDetails.data.from);
                      return fromNode ? fromNode.label : String(selectedDetails.data.from);
                    })()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    ID: {String(selectedDetails.data.from)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>→</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>TO</div>
                  <div style={{ fontWeight: 500, color: '#374151' }}>
                    {(() => {
                      const toNode = nodesRef.current?.get(selectedDetails.data.to);
                      return toNode ? toNode.label : String(selectedDetails.data.to);
                    })()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    ID: {String(selectedDetails.data.to)}
                  </div>
                </div>
              </div>
              
              {/* Debug info - show raw edge data */}
              <div style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#6b7280' }}>Debug Info</div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                  Edge ID: {selectedDetails.data.id}<br/>
                  Type: {selectedDetails.data.type}<br/>
                  Color: {selectedDetails.data.color?.color || 'default'}<br/>
                  Meta keys: {selectedDetails.data.meta ? Object.keys(selectedDetails.data.meta).join(', ') : 'none'}<br/>
                  Total properties: {selectedDetails.data.meta ? Object.keys(selectedDetails.data.meta).length : 0}
                </div>
                
                {/* Show raw metadata in expandable format */}
                {selectedDetails.data.meta && Object.keys(selectedDetails.data.meta).length > 0 && (
                  <details style={{ marginTop: '8px' }}>
                    <summary style={{ fontSize: '0.75rem', color: '#6b7280', cursor: 'pointer' }}>
                      Raw Metadata ({Object.keys(selectedDetails.data.meta).length} properties)
                    </summary>
                    <pre style={{ 
                      fontSize: '0.65rem', 
                      color: '#374151', 
                      background: '#ffffff', 
                      padding: '8px', 
                      borderRadius: '4px', 
                      marginTop: '4px',
                      maxHeight: '200px',
                      overflow: 'auto',
                      border: '1px solid #e5e7eb'
                    }}>
                      {JSON.stringify(selectedDetails.data.meta, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkView;
