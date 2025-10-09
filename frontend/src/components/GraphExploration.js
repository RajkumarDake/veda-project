import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

const GraphExploration = () => {
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
  const [overlayInfo, setOverlayInfo] = useState(null);
  
  // State for dropdown selections
  const [selectedStartNode, setSelectedStartNode] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState('');
  const [selectedEndNode, setSelectedEndNode] = useState('');
  const [queryLimit, setQueryLimit] = useState('25');
  
  // Vis-network refs
  const containerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const nodesRef = useRef(null);
  const edgesRef = useRef(null);
  const networkRef = useRef(null);
  
  // UI state
  const [physicsEnabled, setPhysicsEnabled] = useState(false);

  // Color palette for nodes (same as NetworkView)
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

  // Color palette for relationships (same as NetworkView)
  const relationshipColors = {
    Invest: { color: '#059669', highlight: '#047857', width: 2.5 },
    Aid: { color: '#22c55e', highlight: '#16a34a', width: 2.5 },
    Transaction: { color: '#eab308', highlight: '#ca8a04', width: 2.5 },
    SustainableFishing: { color: '#10b981', highlight: '#059669', width: 2.5 },
    Fishing: { color: '#0891b2', highlight: '#0e7490', width: 2.5 },
    Conference: { color: '#8b5cf6', highlight: '#7c3aed', width: 2.5 },
    OverFishing: { color: '#ef4444', highlight: '#dc2626', width: 2.5 },
    Criticize: { color: '#f97316', highlight: '#ea580c', width: 2.5 },
    PartiallyOwns: { color: '#a78bfa', highlight: '#7c3aed', width: 2.5 },
    Applaud: { color: '#84cc16', highlight: '#65a30d', width: 2.5 },
    CertificateIssued: { color: '#0ea5e9', highlight: '#0284c7', width: 2.5 },
    Summons: { color: '#f59e0b', highlight: '#d97706', width: 2.5 },
    Convicted: { color: '#dc2626', highlight: '#b91c1c', width: 2.5 },
    default: { color: '#94a3b8', highlight: '#64748b', width: 1.5 }
  };

  // Get relationship style
  const getRelationStyle = (relType) => {
    const style = relationshipColors[relType] || relationshipColors.default;
    return {
      color: style.color,
      highlight: style.highlight,
      width: style.width
    };
  };

  // Network options
  const getNetworkOptions = useCallback(() => ({
    nodes: {
      shape: 'dot',
      size: 15,
      font: {
        size: 14,
        color: '#ffffff'
      },
      borderWidth: 2,
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.12)',
        size: 5
      },
      scaling: {
        min: 10,
        max: 20
      }
    },
    edges: {
      width: 2,
      arrows: {
        to: { enabled: true, scaleFactor: 1.2, type: 'arrow' }
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
        roundness: 0.2,
        forceDirection: 'none'
      },
      selectionWidth: 3,
      hoverWidth: 1.5,
      labelHighlightBold: true,
      chosen: {
        edge: function(values, id, selected, hovering) {
          values.width = 3;
          values.color = values.color;
        }
      }
    },
    layout: { 
      improvedLayout: true, 
      randomSeed: 42,
      hierarchical: false
    },
    physics: {
      enabled: physicsEnabled,
      solver: 'repulsion',
      repulsion: {
        nodeDistance: 300,
        springLength: 250,
        springConstant: 0.015,
        damping: 0.1,
        centralGravity: 0.005
      },
      stabilization: {
        enabled: true,
        iterations: 200,
        updateInterval: 25
      },
      maxVelocity: 30,
      minVelocity: 0.1
    },
    interaction: {
      hover: true,
      zoomView: true,
      dragView: true,
      dragNodes: physicsEnabled,
      tooltipDelay: 200,
      multiselect: true,
      selectConnectedEdges: false,
      hoverConnectedEdges: true
    }
  }), [physicsEnabled]);

  // Initialize network
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    const container = containerRef.current;
    container.innerHTML = '';
    
    const nodes = new DataSet([]);
    const edges = new DataSet([]);

    nodesRef.current = nodes;
    edgesRef.current = edges;

    try {
      const network = new Network(container, { nodes, edges }, getNetworkOptions());
      networkRef.current = network;
      
      // Add click event listeners
      network.on('click', (params) => {
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
          setSelectedDetails({ type: 'edge', data: edge });
          setOverlayInfo({ type: 'edge', data: edge, x: pointer.x, y: pointer.y });
        } else {
          console.log('❌ No selection - clearing details');
          setSelectedDetails(null);
          setOverlayInfo(null);
        }
      });
      
      // Add hover events for better UX
      network.on('hoverNode', (params) => {
        if (params.node && nodesRef.current) {
          const node = nodesRef.current.get(params.node);
          const pointer = params.pointer?.DOM || { x: 0, y: 0 };
          setOverlayInfo({ type: 'node', data: node, x: pointer.x, y: pointer.y });
        }
      });
      
      network.on('hoverEdge', (params) => {
        if (params.edge && edgesRef.current) {
          const edge = edgesRef.current.get(params.edge);
          const pointer = params.pointer?.DOM || { x: 0, y: 0 };
          setOverlayInfo({ type: 'edge', data: edge, x: pointer.x, y: pointer.y });
        }
      });
      
      network.on('blurNode', () => {
        if (!selectedDetails) {
          setOverlayInfo(null);
        }
      });
      
      network.on('blurEdge', () => {
        if (!selectedDetails) {
          setOverlayInfo(null);
        }
      });
      
      setIsInitialized(true);
      console.log('Network initialized successfully with click handlers');
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

  // Execute exploration query
  const executeExplorationQuery = async () => {
    if (!selectedStartNode || !selectedRelationship || !selectedEndNode) {
      setQueryError('Please select Start Node, Relationship, and End Node');
      return;
    }

    setQueryError(null);
    setLoading(true);
    
    try {
      // Generate multiple query variations to handle different data structures
      const queries = [
        // Exact match query
        `MATCH (start:${selectedStartNode})-[r:${selectedRelationship}]->(end:${selectedEndNode}) 
         RETURN start, r, end ${queryLimit ? `LIMIT ${queryLimit}` : 'LIMIT 50'}`,
        
        // Flexible query - match any nodes with relationship
        `MATCH (start)-[r:${selectedRelationship}]->(end) 
         WHERE any(label IN labels(start) WHERE label = '${selectedStartNode}') 
         AND any(label IN labels(end) WHERE label = '${selectedEndNode}')
         RETURN start, r, end ${queryLimit ? `LIMIT ${queryLimit}` : 'LIMIT 50'}`,
        
        // Even more flexible - case insensitive
        `MATCH (start)-[r]->(end) 
         WHERE any(label IN labels(start) WHERE toLower(label) CONTAINS toLower('${selectedStartNode}')) 
         AND any(label IN labels(end) WHERE toLower(label) CONTAINS toLower('${selectedEndNode}'))
         AND toLower(type(r)) = toLower('${selectedRelationship}')
         RETURN start, r, end ${queryLimit ? `LIMIT ${queryLimit}` : 'LIMIT 50'}`,
         
        // Fallback - just find any relationship of this type
        `MATCH (start)-[r:${selectedRelationship}]->(end) 
         RETURN start, r, end ${queryLimit ? `LIMIT ${queryLimit}` : 'LIMIT 50'}`
      ];
      
      console.log('=== GRAPH EXPLORATION QUERY DEBUG ===');
      console.log('Selected Path:', `${selectedStartNode} -> ${selectedRelationship} -> ${selectedEndNode}`);
      
      let results = null;
      let successfulQuery = null;
      
      // Try each query until one returns data
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        console.log(`Trying query ${i + 1}:`, query);
        
        try {
          const response = await fetch('/api/neo4j/execute-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
          });
          
          const queryResults = await response.json();
          console.log(`Query ${i + 1} results:`, queryResults);
          
          if (!queryResults.error && queryResults.records && queryResults.records.length > 0) {
            results = queryResults;
            successfulQuery = query;
            console.log(`✅ Query ${i + 1} succeeded with ${queryResults.records.length} records`);
            break;
          } else {
            console.log(`❌ Query ${i + 1} failed or returned no data:`, queryResults.error || 'No records');
          }
        } catch (queryError) {
          console.log(`❌ Query ${i + 1} threw error:`, queryError);
        }
      }
      
      if (results && results.records && results.records.length > 0) {
        console.log('Final results:', results);
        console.log('Successful query was:', successfulQuery);
        setGraphData(results);
      } else {
        // If no queries worked, provide helpful debugging info
        const debugQuery = `
          CALL db.labels() YIELD label 
          RETURN collect(label) as available_labels
          UNION ALL
          CALL db.relationshipTypes() YIELD relationshipType 
          RETURN collect(relationshipType) as available_relationships
        `;
        
        try {
          const debugResponse = await fetch('/api/neo4j/execute-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: debugQuery })
          });
          
          const debugResults = await debugResponse.json();
          console.log('Available labels and relationships:', debugResults);
          
          setQueryError(`No data found for path: ${selectedStartNode} -> ${selectedRelationship} -> ${selectedEndNode}. 
                        Check console for available labels and relationships.`);
        } catch (debugError) {
          setQueryError(`No data found for selected path. Please verify the node types and relationships exist in your database.`);
        }
      }
      
      console.log('=== END QUERY DEBUG ===');
      
    } catch (error) {
      console.error('Error executing exploration query:', error);
      setQueryError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Process results (enhanced version with better debugging)
  const processResults = (results) => {
    if (!results?.records?.length) return { nodes: [], edges: [] };

    console.log('=== PROCESSING GRAPH EXPLORATION RESULTS ===');
    console.log('Total records to process:', results.records.length);

    const nodes = [];
    const edges = [];
    const nodeMap = new Map();
    const edgeMap = new Map(); // Track edges to avoid duplicates

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

        const startNode = record.start;
        const endNode = record.end;
        const relationship = record.r;

        if (!startNode || !endNode || !relationship) {
          console.warn(`Record ${index} missing required data:`, record);
          return;
        }

        // Helper function to extract node data
        const extractNodeData = (node, fallbackId) => {
          const identity = node.identity || node.element_id || fallbackId;
          const labels = node.labels || [];
          const properties = node.properties || {};
          
          return { identity, labels, properties };
        };

        // Helper function to extract relationship data
        const extractRelationshipData = (rel) => {
          const identity = rel.identity || rel.element_id || `rel_${index}`;
          const type = rel.type || selectedRelationship;
          const properties = rel.properties || {};
          
          return { identity, type, properties };
        };

        // Process start node
        const startData = extractNodeData(startNode, `start_${index}`);
        const startId = startData.identity;
        
        if (!nodeMap.has(startId)) {
          const group = startData.labels?.[0] || 'Unknown';
          const color = colorPalette[group] || colorPalette.default;
          const nodeLabel = startData.properties.id || startData.properties.name || `${group}_${startId}`;

          nodes.push({
            id: startId,
            label: nodeLabel,
            group,
            color,
            title: `${group}: ${nodeLabel}`,
            meta: startData.properties
          });
          nodeMap.set(startId, true);
          
          if (index < 3) {
            console.log(`Added start node: ${nodeLabel} (${group})`);
          }
        }

        // Process end node
        const endData = extractNodeData(endNode, `end_${index}`);
        const endId = endData.identity;
        
        if (!nodeMap.has(endId)) {
          const group = endData.labels?.[0] || 'Unknown';
          const color = colorPalette[group] || colorPalette.default;
          const nodeLabel = endData.properties.id || endData.properties.name || `${group}_${endId}`;

          nodes.push({
            id: endId,
            label: nodeLabel,
            group,
            color,
            title: `${group}: ${nodeLabel}`,
            meta: endData.properties
          });
          nodeMap.set(endId, true);
          
          if (index < 3) {
            console.log(`Added end node: ${nodeLabel} (${group})`);
          }
        }

        // Process relationship
        const relData = extractRelationshipData(relationship);
        const relType = relData.type;
        const relConfig = getRelationStyle(relType);
        
        // Create unique edge ID - always include index to ensure uniqueness
        const edgeId = `edge_${index}_${relData.identity || 'rel'}_${startId}_${endId}`;
        
        // Count edges between same nodes to create curved edges
        const edgeKey = `${startId}_${endId}`;
        const reverseEdgeKey = `${endId}_${startId}`;
        
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, 0);
        }
        if (!edgeMap.has(reverseEdgeKey)) {
          edgeMap.set(reverseEdgeKey, 0);
        }
        
        const edgeCount = edgeMap.get(edgeKey);
        edgeMap.set(edgeKey, edgeCount + 1);
        
        // Create smooth curve for multiple edges between same nodes
        const smooth = edgeCount > 0 ? {
          enabled: true,
          type: 'curvedCW',
          roundness: 0.1 + (edgeCount * 0.15) // Increase curve for each additional edge
        } : {
          enabled: true,
          type: 'continuous',
          roundness: 0.1
        };
        
        const edgeObject = {
          id: edgeId,
          from: startId,
          to: endId,
          label: `${relType}${edgeCount > 0 ? ` (${edgeCount + 1})` : ''}`,
          type: relType,
          color: {
            color: relConfig.color,
            highlight: relConfig.highlight,
            opacity: 0.8
          },
          width: relConfig.width,
          smooth: smooth,
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
          meta: {
            ...relData.properties,
            edgeIndex: index,
            edgeCount: edgeCount + 1,
            originalRelationshipId: relData.identity
          }
        };
        
        edges.push(edgeObject);
        
        if (index < 5) {
          console.log(`Added relationship ${index + 1}: ${startId} -[${relType}]-> ${endId} (ID: ${edgeId}, Curve: ${smooth.roundness})`);
        }

      } catch (error) {
        console.error(`Error processing record ${index}:`, error);
        console.error('Record data:', record);
      }
    });

    console.log(`=== PROCESSING COMPLETE ===`);
    console.log(`Final result: ${nodes.length} nodes, ${edges.length} edges`);
    
    // Validate edges - ensure all edges have valid from/to node references
    const validEdges = [];
    const invalidEdges = [];
    
    edges.forEach(edge => {
      const hasValidFrom = nodeMap.has(edge.from);
      const hasValidTo = nodeMap.has(edge.to);
      
      if (hasValidFrom && hasValidTo) {
        validEdges.push(edge);
      } else {
        invalidEdges.push({
          id: edge.id,
          from: edge.from,
          to: edge.to,
          hasValidFrom,
          hasValidTo
        });
        console.warn(`Invalid edge removed: ${edge.id} - from:${edge.from}(${hasValidFrom}) to:${edge.to}(${hasValidTo})`);
      }
    });
    
    console.log(`After validation: ${nodes.length} nodes, ${validEdges.length} valid edges (${invalidEdges.length} invalid removed)`);
    console.log('Node IDs:', Array.from(nodeMap.keys()).slice(0, 10), '...');
    console.log('Valid edges sample:', validEdges.slice(0, 5).map(e => `${e.from}-[${e.type}]->${e.to}`));
    
    if (invalidEdges.length > 0) {
      console.log('Invalid edges:', invalidEdges);
    }
    
    // Show edge distribution
    const edgesByType = {};
    validEdges.forEach(edge => {
      edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
    });
    console.log('Edges by type:', edgesByType);
    console.log('===========================');

    return { nodes, edges: validEdges };
  };

  // Update network when data changes
  useEffect(() => {
    console.log('=== NETWORK UPDATE EFFECT ===');
    if (!nodesRef.current || !edgesRef.current || !networkRef.current) {
      console.log('Network refs not ready');
      return;
    }

    console.log('Clearing existing network data...');
    nodesRef.current.clear();
    edgesRef.current.clear();

    if (!graphData?.records) {
      console.log('No graph data to display');
      return;
    }

    const { nodes, edges } = processResults(graphData);
    console.log(`Processed data: ${nodes.length} nodes, ${edges.length} edges`);

    if (nodes.length > 0 || edges.length > 0) {
      console.log('Adding nodes to network:', nodes.length);
      nodesRef.current.add(nodes);
      
      console.log('Adding edges to network:', edges.length);
      console.log('Edge details:', edges.map(e => ({ id: e.id, from: e.from, to: e.to, type: e.type })));
      
      try {
        edgesRef.current.add(edges);
        console.log('✅ Edges added successfully');
      } catch (error) {
        console.error('❌ Error adding edges:', error);
        
        // Try adding edges one by one to identify problematic edges
        console.log('Trying to add edges individually...');
        let successCount = 0;
        edges.forEach((edge, idx) => {
          try {
            edgesRef.current.add([edge]);
            successCount++;
          } catch (edgeError) {
            console.error(`Failed to add edge ${idx}:`, edge, edgeError);
          }
        });
        console.log(`Added ${successCount} out of ${edges.length} edges individually`);
      }
      
      // Verify what was actually added
      console.log('Network now contains:');
      console.log('- Nodes:', nodesRef.current.length);
      console.log('- Edges:', edgesRef.current.length);
      
      // Get actual edge data from network
      const networkEdges = edgesRef.current.get();
      console.log('Actual edges in network:', networkEdges.length);
      console.log('First few network edges:', networkEdges.slice(0, 3));
      
      if (physicsEnabled) {
        networkRef.current.setOptions({ physics: { enabled: true } });
        networkRef.current.stabilize(200);
      } else {
        networkRef.current.setOptions({ physics: { enabled: true } });
        setTimeout(() => {
          if (networkRef.current) {
            networkRef.current.setOptions({ physics: { enabled: false } });
          }
        }, 800);
      }
      
      networkRef.current.fit({ animation: { duration: 400 } });
    }

    // Update stats with actual network counts
    const actualNodeCount = nodesRef.current ? nodesRef.current.length : nodes.length;
    const actualEdgeCount = edgesRef.current ? edgesRef.current.length : edges.length;
    
    console.log(`Setting stats - Nodes: ${actualNodeCount}, Edges: ${actualEdgeCount}`);
    setStats({ nodeCount: actualNodeCount, edgeCount: actualEdgeCount });
    
    console.log('=== END NETWORK UPDATE ===');
  }, [graphData, physicsEnabled]);

  return (
    <div style={{ padding: '0', background: '#f3f4f6', minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '340px', background: '#ffffff', borderRight: '1px solid #e5e7eb', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Graph Exploration</h2>
          <div style={{ marginTop: '8px', fontSize: '0.875rem', color: '#6b7280' }}>
            {neo4jStatus.connected ? '✅ Connected to Neo4j' : '❌ Neo4j disconnected'}
          </div>
        </div>

        {/* Path Selection */}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px' }}>
            Exploration Path
          </div>
          
          {/* Start Node Dropdown */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              Start Node
            </label>
            <select
              value={selectedStartNode}
              onChange={(e) => setSelectedStartNode(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
            >
              <option value="">Select Start Node Type</option>
              {labels.map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>

          {/* Relationship Dropdown */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              Relationship
            </label>
            <select
              value={selectedRelationship}
              onChange={(e) => setSelectedRelationship(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
            >
              <option value="">Select Relationship Type</option>
              {relationshipTypes.map(relType => (
                <option key={relType} value={relType}>{relType}</option>
              ))}
            </select>
          </div>

          {/* End Node Dropdown */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              End Node
            </label>
            <select
              value={selectedEndNode}
              onChange={(e) => setSelectedEndNode(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
            >
              <option value="">Select End Node Type</option>
              {labels.map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>

          {/* Visual Path Representation */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '4px', 
            marginTop: '12px',
            padding: '8px',
            background: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              padding: '2px 6px', 
              background: selectedStartNode ? '#10b981' : '#e5e7eb', 
              color: selectedStartNode ? '#ffffff' : '#6b7280',
              borderRadius: '3px',
              fontSize: '0.65rem',
              fontWeight: 500,
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {selectedStartNode || 'Start'}
            </div>
            <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>→</span>
            <div style={{ 
              padding: '2px 6px', 
              background: selectedRelationship ? '#3b82f6' : '#e5e7eb', 
              color: selectedRelationship ? '#ffffff' : '#6b7280',
              borderRadius: '3px',
              fontSize: '0.65rem',
              fontWeight: 500,
              maxWidth: '70px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {selectedRelationship || 'Relation'}
            </div>
            <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>→</span>
            <div style={{ 
              padding: '2px 6px', 
              background: selectedEndNode ? '#8b5cf6' : '#e5e7eb', 
              color: selectedEndNode ? '#ffffff' : '#6b7280',
              borderRadius: '3px',
              fontSize: '0.65rem',
              fontWeight: 500,
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {selectedEndNode || 'End'}
            </div>
          </div>
        </div>

        {/* Query Limit */}
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Query Limit</div>
          <input
            type="text"
            value={queryLimit}
            onChange={(e) => setQueryLimit(e.target.value)}
            placeholder="e.g., 25"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <button
            onClick={executeExplorationQuery}
            disabled={loading || !selectedStartNode || !selectedRelationship || !selectedEndNode}
            style={{ 
              padding: '10px 12px', 
              borderRadius: '8px', 
              border: 'none', 
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: '#fff', 
              fontWeight: 600, 
              cursor: loading ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading ? 'Exploring…' : 'Explore Path'}
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                if (nodesRef.current && edgesRef.current) {
                  nodesRef.current.clear();
                  edgesRef.current.clear();
                  setStats({ nodeCount: 0, edgeCount: 0 });
                  setGraphData(null);
                }
              }}
              style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Clear
            </button>
            
            <button
              onClick={async () => {
                try {
                  const debugQuery = `
                    CALL db.labels() YIELD label 
                    WITH collect(label) as labels
                    CALL db.relationshipTypes() YIELD relationshipType 
                    WITH labels, collect(relationshipType) as relationships
                    RETURN labels, relationships
                  `;
                  
                  const response = await fetch('/api/neo4j/execute-query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: debugQuery })
                  });
                  
                  const results = await response.json();
                  console.log('=== DATABASE SCHEMA INFO ===');
                  console.log('Available data:', results);
                  
                  if (results.records && results.records.length > 0) {
                    const record = results.records[0];
                    console.log('Available Labels:', record.labels);
                    console.log('Available Relationships:', record.relationships);
                    alert(`Database Schema:\n\nLabels: ${record.labels?.join(', ')}\n\nRelationships: ${record.relationships?.join(', ')}\n\nCheck console for more details.`);
                  }
                } catch (error) {
                  console.error('Error getting schema info:', error);
                  alert('Error getting database schema. Check console for details.');
                }
              }}
              style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #3b82f6', background: '#eff6ff', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Debug DB
            </button>
          </div>
        </div>

        {/* Physics Toggle */}
        <button 
          onClick={() => setPhysicsEnabled(!physicsEnabled)} 
          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
        >
          {physicsEnabled ? '🔓 Physics On' : '🔒 Physics Off'}
        </button>

        {/* Stats */}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Stats</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <div>Nodes: <strong>{stats.nodeCount}</strong></div>
            <div>Edges: <strong>{stats.edgeCount}</strong></div>
          </div>
        </div>

        {/* Error */}
        {queryError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', color: '#b91c1c' }}>
            ⚠️ {queryError}
          </div>
        )}
      </div>

      {/* Main canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Graph Path Exploration</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => networkRef.current && networkRef.current.fit({ animation: { duration: 500 } })} 
              style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
            >
              Fit
            </button>
          </div>
        </div>

        {/* Graph container */}
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#0b1220', backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          {!graphData && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', zIndex: 1, pointerEvents: 'none' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 8 }}>🔍</div>
                <div style={{ fontWeight: 600 }}>Select a path and explore relationships</div>
                <div style={{ fontSize: '0.875rem', marginTop: 4 }}>Choose Start Node → Relationship → End Node</div>
              </div>
            </div>
          )}
          <div ref={containerRef} style={{ position: 'absolute', inset: 0, imageRendering: 'crisp-edges' }} />
          
          {/* Hover/Click Overlay */}
          {overlayInfo && (
            <div style={{ 
              position: 'absolute', 
              left: Math.min(overlayInfo.x + 12, window.innerWidth - 350), 
              top: Math.min(overlayInfo.y + 12, window.innerHeight - 200), 
              zIndex: 5, 
              pointerEvents: 'none' 
            }}>
              <div style={{ 
                background: 'rgba(17,24,39,0.98)', 
                color: '#e5e7eb', 
                border: '1px solid #334155', 
                borderRadius: 8, 
                padding: '12px 14px', 
                maxWidth: 320, 
                boxShadow: '0 10px 20px rgba(0,0,0,0.35)' 
              }}>
                {overlayInfo.type === 'node' && (
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: '#10b981', fontSize: '1rem' }}>
                      {overlayInfo.data.group || 'Node'}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>
                      {overlayInfo.data.label}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                      ID: <code style={{ color: '#93c5fd' }}>{String(overlayInfo.data.id)}</code>
                    </div>
                    {overlayInfo.data.meta && (
                      <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                        {Object.entries(overlayInfo.data.meta).slice(0, 3).map(([key, value]) => (
                          <div key={key} style={{ marginBottom: 2 }}>
                            <span style={{ color: '#9ca3af' }}>{key}:</span>{' '}
                            <span style={{ color: '#93c5fd' }}>{String(value)}</span>
                          </div>
                        ))}
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
                        <span style={{ color: '#9ca3af' }}>From:</span>{' '}
                        <span style={{ color: '#93c5fd', fontWeight: 500 }}>
                          {(() => {
                            const fromNode = nodesRef.current?.get(overlayInfo.data.from);
                            return fromNode ? fromNode.label : String(overlayInfo.data.from);
                          })()}
                        </span>
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: '#9ca3af' }}>To:</span>{' '}
                        <span style={{ color: '#93c5fd', fontWeight: 500 }}>
                          {(() => {
                            const toNode = nodesRef.current?.get(overlayInfo.data.to);
                            return toNode ? toNode.label : String(overlayInfo.data.to);
                          })()}
                        </span>
                      </div>
                      {overlayInfo.data.meta && overlayInfo.data.meta.edgeCount && (
                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontStyle: 'italic' }}>
                          Edge #{overlayInfo.data.meta.edgeCount} between these nodes
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Selection details panel */}
        <div style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid #e5e7eb', 
          background: '#ffffff', 
          minHeight: '120px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {!selectedDetails && (
            <div style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', paddingTop: '20px' }}>
              Click a node or edge to see detailed information
            </div>
          )}
          
          {selectedDetails && selectedDetails.type === 'node' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  background: selectedDetails.data.color?.background || '#6b7280', 
                  border: `2px solid ${selectedDetails.data.color?.border || '#374151'}` 
                }} />
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedDetails.data.label}</div>
                <div style={{ color: '#6b7280' }}>•</div>
                <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 500 }}>
                  {selectedDetails.data.group}
                </div>
              </div>
              
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  Node Properties
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', fontSize: '0.85rem' }}>
                  <div style={{ color: '#6b7280', fontWeight: 500 }}>ID:</div>
                  <div style={{ color: '#374151', fontFamily: 'monospace' }}>{String(selectedDetails.data.id)}</div>
                  
                  {selectedDetails.data.meta && Object.entries(selectedDetails.data.meta).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <div style={{ color: '#6b7280', fontWeight: 500 }}>{key}:</div>
                      <div style={{ color: '#374151' }}>{String(value)}</div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {selectedDetails && selectedDetails.type === 'edge' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ 
                  width: 16, 
                  height: 3, 
                  background: selectedDetails.data.color?.color || '#94a3b8', 
                  borderRadius: '2px' 
                }} />
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: selectedDetails.data.color?.color || '#374151' }}>
                  {selectedDetails.data.type || selectedDetails.data.label}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Relationship</div>
              </div>
              
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  Relationship Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', fontSize: '0.85rem' }}>
                  <div style={{ color: '#6b7280', fontWeight: 500 }}>Type:</div>
                  <div style={{ color: '#374151', fontWeight: 600 }}>{selectedDetails.data.type}</div>
                  
                  <div style={{ color: '#6b7280', fontWeight: 500 }}>From:</div>
                  <div style={{ color: '#374151' }}>
                    {(() => {
                      const fromNode = nodesRef.current?.get(selectedDetails.data.from);
                      return fromNode ? `${fromNode.label} (${fromNode.group})` : String(selectedDetails.data.from);
                    })()}
                  </div>
                  
                  <div style={{ color: '#6b7280', fontWeight: 500 }}>To:</div>
                  <div style={{ color: '#374151' }}>
                    {(() => {
                      const toNode = nodesRef.current?.get(selectedDetails.data.to);
                      return toNode ? `${toNode.label} (${toNode.group})` : String(selectedDetails.data.to);
                    })()}
                  </div>
                  
                  {selectedDetails.data.meta && Object.entries(selectedDetails.data.meta).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <div style={{ color: '#6b7280', fontWeight: 500 }}>{key}:</div>
                      <div style={{ color: '#374151' }}>{String(value)}</div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphExploration;
