import React, { useState, useEffect, useRef, useCallback } from 'react';

const NetworkView = () => {
  // State for Neo4j connection
  const [neo4jStatus, setNeo4jStatus] = useState({ connected: false, message: '' });
  const [loading, setLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  
  // State for graph data - Load from actual Neo4j database
  const [labels, setLabels] = useState([]);
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [queryError, setQueryError] = useState(null);
  
  // State for selected buttons
  const [selectedRelationships, setSelectedRelationships] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  
  // Graph visualization state
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLegend, setShowLegend] = useState(false);
  
  // Color palette for nodes
  const colorPalette = {
    SustainableFishing: { background: '#10b981', border: '#059669' },
    Overfishing: { background: '#ef4444', border: '#dc2626' },
    FishingCompany: { background: '#3b82f6', border: '#2563eb' },
    Organization: { background: '#8b5cf6', border: '#7c3aed' },
    Person: { background: '#06b6d4', border: '#0891b2' },
    NewsSource: { background: '#ec4899', border: '#db2777' },
    default: { background: '#6b7280', border: '#374151' }
  };

  // Toggle relationship selection
  const toggleRelationship = (relType) => {
    setSelectedRelationships(prev => {
      if (prev.includes(relType)) {
        return prev.filter(rel => rel !== relType);
      } else {
        return [...prev, relType];
      }
    });
  };

  // Toggle node selection
  const toggleNode = (nodeType) => {
    setSelectedNodes(prev => {
      if (prev.includes(nodeType)) {
        return prev.filter(node => node !== nodeType);
      } else {
        return [...prev, nodeType];
      }
    });
  };

  // Check Neo4j connection status
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

  // Load actual database schema from Neo4j
  const loadActualDatabaseSchema = async () => {
    try {
      const response = await fetch('/api/neo4j/graph-data');
      const data = await response.json();
      
      if (data.labels) {
        setLabels(data.labels);
      }
      
      if (data.relationshipTypes) {
        setRelationshipTypes(data.relationshipTypes);
      }
      
      console.log('Loaded actual schema:', {
        nodeTypes: data.labels,
        relationshipTypes: data.relationshipTypes
      });
      
    } catch (error) {
      console.error('Error loading database schema:', error);
      // Fallback to some basic types if loading fails
      setLabels(['Company', 'Person', 'Organization']);
      setRelationshipTypes(['RELATED', 'CONNECTED']);
    }
  };

  // Check Neo4j connection status on component mount
  useEffect(() => {
    checkNeo4jStatus();
    loadActualDatabaseSchema();
  }, []);

  // Cleanup effect to prevent DOM conflicts
  useEffect(() => {
    return () => {
      // Cleanup D3 elements when component unmounts
      if (containerRef.current) {
        try {
          d3.select(containerRef.current).selectAll("*").remove();
        } catch (error) {
          console.warn('Cleanup error:', error);
          // Try alternative cleanup
          try {
            if (containerRef.current) {
              containerRef.current.innerHTML = '';
            }
          } catch (innerError) {
            console.warn('Alternative cleanup failed:', innerError);
          }
        }
      }
    };
  }, []);

  // Execute query using Groq LLM for dynamic query generation
  const executeSelectedQuery = useCallback(async () => {
    if (selectedRelationships.length === 0 && selectedNodes.length === 0) {
      setQueryError('Please select at least one relationship or node type');
      return;
    }

    setQueryError(null);
    setLoading(true);
    
    try {
      // First, generate query using Groq LLM
      const groqResponse = await fetch('/api/groq/generate-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedNodes: selectedNodes,
          selectedRelationships: selectedRelationships,
          userIntent: 'Generate a Cypher query to visualize the selected nodes and relationships in a force-directed graph'
        })
      });
      
      const groqResult = await groqResponse.json();
      
      if (!groqResult.success) {
        console.warn('Groq query generation failed:', groqResult.error);
        setQueryError(`Groq LLM Error: ${groqResult.error}`);
      }
      
      const query = groqResult.query;
      console.log('Generated Cypher Query:', query);

      // Execute the generated query
      const response = await fetch('/api/neo4j/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const results = await response.json();
      
      if (results.error) {
        setQueryError(`Neo4j Error: ${results.error}`);
      } else {
        setGraphData(results);
        
        if (results.records && results.records.length > 0) {
          createSimpleGraph(results);
        } else {
          setQueryError('No data found for selected items');
        }
      }
    } catch (error) {
      console.error('Error executing query:', error);
      setQueryError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedRelationships, selectedNodes]);


  // Create Simple Graph Visualization (React-friendly)
  const createSimpleGraph = (data) => {
    if (!containerRef.current || !data.records) return;

    const container = containerRef.current;
    
    // Clear previous content safely
    container.innerHTML = '';

    // Process data
    const processedData = processNeo4jResults(data);
    
    if (processedData.nodes.length === 0) {
      container.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6b7280;
          font-size: 1.1rem;
        ">
          <div style="font-size: 3rem; margin-bottom: 16px;">📊</div>
          <div>No graph data found</div>
          <div style="font-size: 0.9rem; margin-top: 8px;">Try selecting different parameters</div>
        </div>
      `;
      return;
    }

    // Create a simple HTML-based visualization
    container.innerHTML = `
      <div style="
        padding: 20px;
        height: 100%;
        overflow-y: auto;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border-radius: 8px;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #334155;
        ">
          <h3 style="
            color: #f1f5f9;
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
          ">
            🌐 Graph Visualization
          </h3>
          <div style="
            color: #94a3b8;
            font-size: 0.9rem;
          ">
            ${processedData.nodes.length} nodes • ${processedData.links.length} relationships
          </div>
        </div>

        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        ">
          ${processedData.nodes.map(node => `
            <div style="
              background: linear-gradient(135deg, ${colorPalette[node.group]?.background || colorPalette.default.background}20, ${colorPalette[node.group]?.background || colorPalette.default.background}10);
              border: 2px solid ${colorPalette[node.group]?.border || colorPalette.default.border};
              border-radius: 12px;
              padding: 16px;
              transition: all 0.3s ease;
            ">
              <div style="
                display: flex;
                align-items: center;
                margin-bottom: 12px;
              ">
                <div style="
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background: ${colorPalette[node.group]?.background || colorPalette.default.background};
                  margin-right: 8px;
                "></div>
                <h4 style="
                  color: #f1f5f9;
                  margin: 0;
                  font-size: 1rem;
                  font-weight: 600;
                ">${node.label}</h4>
              </div>
              <div style="
                color: #94a3b8;
                font-size: 0.85rem;
                margin-bottom: 8px;
              ">
                Type: <span style="color: ${colorPalette[node.group]?.background || colorPalette.default.background}; font-weight: 600;">${node.group}</span>
              </div>
            </div>
          `).join('')}
        </div>

        ${processedData.links.length > 0 ? `
          <div style="
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #334155;
          ">
            <h4 style="
              color: #f1f5f9;
              margin: 0 0 16px 0;
              font-size: 1.1rem;
              font-weight: 600;
            ">
              🔗 Relationships (${processedData.links.length})
            </h4>
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 12px;
            ">
              ${processedData.links.map(link => `
                <div style="
                  background: rgba(99, 102, 241, 0.1);
                  border: 1px solid #6366f1;
                  border-radius: 8px;
                  padding: 12px;
                  font-size: 0.85rem;
                ">
                  <div style="
                    color: #6366f1;
                    font-weight: 600;
                    margin-bottom: 4px;
                  ">${link.type}</div>
                  <div style="color: #94a3b8;">
                    ${processedData.nodes.find(n => n.id === link.source)?.label || 'Unknown'} 
                    → 
                    ${processedData.nodes.find(n => n.id === link.target)?.label || 'Unknown'}
                  </div>
                  ${link.hasArticle ? '<div style="color: #f59e0b; font-size: 0.75rem; margin-top: 4px;">📄 Has Article</div>' : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  // Process Neo4j results to graph format
  const processNeo4jResults = (results) => {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    console.log('Processing Neo4j results:', results);

    if (!results.records || results.records.length === 0) {
      console.warn('No records found in results');
      return { nodes, links };
    }

    results.records.forEach((record, index) => {
      try {
        console.log(`Processing record ${index}:`, record);
        
        // Handle different record formats
        let pathData = null;
        
        // Try to access path data in different ways
        if (typeof record === 'object') {
          // Check if it's a direct path object
          if (record.segments) {
            pathData = record;
            console.log('Found direct path object with segments');
          }
          // Check if it has a 'p' property
          else if (record.p) {
            pathData = record.p;
            console.log('Found path data in record.p:', pathData);
          }
          // Check if it's a Neo4j record with get method
          else if (record.get && typeof record.get === 'function') {
            try {
              pathData = record.get('p');
              console.log('Found path data using record.get("p"):', pathData);
            } catch (e) {
              console.warn('Could not get path data using record.get("p"):', e);
            }
          }
          // Check for other common path property names
          else if (record.path) {
            pathData = record.path;
            console.log('Found path data in record.path:', pathData);
          }
        }

        // Log the actual structure of pathData
        if (pathData) {
          console.log('PathData structure:', {
            hasSegments: !!pathData.segments,
            hasNodes: !!pathData.nodes,
            hasRelationships: !!pathData.relationships,
            keys: Object.keys(pathData),
            pathData: pathData
          });
        }

        if (pathData && pathData.segments && Array.isArray(pathData.segments)) {
          console.log('Processing path with segments:', pathData.segments.length);
          
          // Process path segments
          pathData.segments.forEach((segment, segIndex) => {
            try {
              const startNode = segment.start;
              const endNode = segment.end;
              const relationship = segment.relationship;

              if (!startNode || !endNode || !relationship) {
                console.warn(`Segment ${segIndex} missing required data:`, segment);
                return;
              }

              // Process start node
              const startId = startNode.identity ? startNode.identity.toNumber() : `start_${segIndex}`;
              if (!nodeMap.has(startId)) {
                const startProps = startNode.properties || {};
                const startLabels = startNode.labels || ['Unknown'];
                const group = startLabels[0];

                nodes.push({
                  id: startId,
                  label: startProps.id || startProps.name || `${group}_${startId}`,
                  group,
                  properties: startProps,
                  degree: 1
                });
                nodeMap.set(startId, true);
              }

              // Process end node
              const endId = endNode.identity ? endNode.identity.toNumber() : `end_${segIndex}`;
              if (!nodeMap.has(endId)) {
                const endProps = endNode.properties || {};
                const endLabels = endNode.labels || ['Unknown'];
                const group = endLabels[0];

                nodes.push({
                  id: endId,
                  label: endProps.id || endProps.name || `${group}_${endId}`,
                  group,
                  properties: endProps,
                  degree: 1
                });
                nodeMap.set(endId, true);
              }

              // Process relationship
              const relProps = relationship.properties || {};
              links.push({
                source: startId,
                target: endId,
                type: relationship.type || 'UNKNOWN',
                properties: relProps,
                hasArticle: !!relProps.article_id
              });
            } catch (segError) {
              console.error(`Error processing segment ${segIndex}:`, segError);
            }
          });
        } else if (pathData && (pathData.nodes || pathData.relationships)) {
          console.log('Processing path data with nodes/relationships arrays');
          
          // Handle serialized path data with nodes and relationships arrays
          if (pathData.nodes && Array.isArray(pathData.nodes)) {
            pathData.nodes.forEach(node => {
              const nodeId = node.identity || `node_${nodes.length}`;
              if (!nodeMap.has(nodeId)) {
                nodes.push({
                  id: nodeId,
                  label: node.properties?.id || node.properties?.name || `Node_${nodeId}`,
                  group: node.labels?.[0] || 'Unknown',
                  properties: node.properties || {},
                  degree: 1
                });
                nodeMap.set(nodeId, true);
              }
            });
          }
          
          if (pathData.relationships && Array.isArray(pathData.relationships)) {
            pathData.relationships.forEach(rel => {
              links.push({
                source: rel.start_node || `start_${links.length}`,
                target: rel.end_node || `end_${links.length}`,
                type: rel.type || 'UNKNOWN',
                properties: rel.properties || {},
                hasArticle: !!(rel.properties?.article_id)
              });
            });
          }
        } else {
          console.warn('No valid path data found in record:', record);
          console.warn('PathData was:', pathData);
          
          // Try to create a simple fallback visualization
          if (typeof record === 'object') {
            const recordId = `record_${index}`;
            if (!nodeMap.has(recordId)) {
              nodes.push({
                id: recordId,
                label: `Record ${index}`,
                group: 'Unknown',
                properties: record,
                degree: 1
              });
              nodeMap.set(recordId, true);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing record ${index}:`, error, record);
      }
    });

    console.log(`Processed ${nodes.length} nodes and ${links.length} links`);
    return { nodes, links };
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '32px', 
        borderRadius: '16px', 
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h1 style={{ 
          color: '#1f2937', 
          fontSize: '2rem', 
          fontWeight: '700', 
          margin: '0 0 8px 0'
        }}>🌐 Network Graph Visualization</h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '1.125rem', 
          margin: '0 0 24px 0'
        }}>Interactive Force-directed Graph with Neo4j Integration</p>

        {/* Connection Status */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '12px 16px',
          background: neo4jStatus.connected ? '#f0fdf4' : '#fef2f2',
          borderRadius: '8px',
          border: `1px solid ${neo4jStatus.connected ? '#bbf7d0' : '#fecaca'}`
        }}>
          <span style={{ fontSize: '1.2rem' }}>
            {neo4jStatus.connected ? '✅' : '❌'}
          </span>
          <span style={{ 
            color: neo4jStatus.connected ? '#166534' : '#991b1b',
            fontWeight: '600'
          }}>
            {neo4jStatus.connected ? 'Connected to Neo4j' : 'Neo4j Disconnected'}
          </span>
          {neo4jStatus.message && (
            <span style={{ color: '#6b7280' }}>- {neo4jStatus.message}</span>
          )}
        </div>
      </div>

      {/* Quick Query Buttons */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <h3 style={{ 
          color: '#1f2937', 
          marginBottom: '16px', 
          fontSize: '1.25rem', 
          fontWeight: '600' 
        }}>🔍 Database Information</h3>

        {/* Node Types Section */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ 
            color: '#374151', 
            marginBottom: '12px', 
            fontSize: '1rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 Nodes ({labels.length})
          </h4>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            {labels.map((nodeType, index) => {
              // Generate colors for nodes
              const nodeColors = [
                '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', 
                '#3b82f6', '#ef4444', '#06b6d4', '#84cc16',
                '#f97316', '#6366f1', '#14b8a6', '#f43f5e'
              ];
              const buttonColor = nodeColors[index % nodeColors.length];
              const isSelected = selectedNodes.includes(nodeType);
              
              return (
                <button
                  key={nodeType}
                  onClick={() => toggleNode(nodeType)}
                  disabled={loading}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    border: `2px solid ${buttonColor}`,
                    background: isSelected ? buttonColor : 'white',
                    color: isSelected ? 'white' : buttonColor,
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    transition: 'all 0.3s ease',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isSelected ? `0 4px 12px ${buttonColor}40` : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !isSelected) {
                      e.target.style.background = `${buttonColor}20`;
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && !isSelected) {
                      e.target.style.background = 'white';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {nodeType}
                </button>
              );
            })}
          </div>
        </div>

        {/* Relationship Types Section */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ 
            color: '#374151', 
            marginBottom: '12px', 
            fontSize: '1rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔗 Relationships ({relationshipTypes.length})
          </h4>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            {relationshipTypes.map((relType, index) => {
              // Generate colors for relationships
              const relColors = [
                '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', 
                '#f59e0b', '#06b6d4', '#ec4899', '#84cc16',
                '#f97316', '#6366f1', '#14b8a6', '#f43f5e'
              ];
              const buttonColor = relColors[index % relColors.length];
              const isSelected = selectedRelationships.includes(relType);
              
              return (
                <button
                  key={relType}
                  onClick={() => toggleRelationship(relType)}
                  disabled={loading}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    border: `2px solid ${buttonColor}`,
                    background: isSelected ? buttonColor : 'white',
                    color: isSelected ? 'white' : buttonColor,
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    transition: 'all 0.3s ease',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isSelected ? `0 4px 12px ${buttonColor}40` : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !isSelected) {
                      e.target.style.background = `${buttonColor}20`;
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && !isSelected) {
                      e.target.style.background = 'white';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {relType}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <button
            onClick={executeSelectedQuery}
            disabled={loading || (selectedRelationships.length === 0 && selectedNodes.length === 0)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: loading || (selectedRelationships.length === 0 && selectedNodes.length === 0) ? '#9ca3af' : '#059669',
              color: 'white',
              fontWeight: '600',
              cursor: loading || (selectedRelationships.length === 0 && selectedNodes.length === 0) ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {loading ? '⏳ Loading...' : '🚀 Visualize Selected'}
          </button>
          
          <div style={{ 
            fontSize: '0.85rem', 
            color: '#6b7280',
            fontWeight: '500',
            flex: 1
          }}>
            {(selectedRelationships.length > 0 || selectedNodes.length > 0) ? (
              <div>
                {selectedNodes.length > 0 && (
                  <div>📊 Nodes: {selectedNodes.join(', ')}</div>
                )}
                {selectedRelationships.length > 0 && (
                  <div>🔗 Relationships: {selectedRelationships.join(', ')}</div>
                )}
              </div>
            ) : (
              'Select nodes or relationships to visualize'
            )}
          </div>
        </div>

        {/* Error Display */}
        {queryError && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b'
          }}>
            ⚠️ {queryError}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginTop: '16px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setGraphData(null)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                background: 'white',
                color: '#6b7280',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              🗑️ Clear
            </button>
            
            <button
              onClick={() => setPhysicsEnabled(!physicsEnabled)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                background: physicsEnabled ? '#f59e0b' : 'white',
                color: physicsEnabled ? 'white' : '#6b7280',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {physicsEnabled ? '⚡ Physics ON' : '⚡ Physics OFF'}
            </button>
          </div>

          <button
            onClick={() => setShowLegend(!showLegend)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              background: 'white',
              color: '#6b7280',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {showLegend ? '🙈 Hide Legend' : '👁️ Show Legend'}
          </button>
        </div>
      </div>

      {/* Graph Visualization */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {/* Graph Container */}
        <div 
          key="graph-container"
          ref={containerRef}
          style={{
            width: '100%',
            height: '600px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            background: '#ffffff',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {!graphData && (
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌐</div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                Select parameters and click "Visualize" to see the graph
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div style={{ 
          marginTop: '24px',
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            color: '#1f2937', 
            marginBottom: '16px', 
            fontSize: '1.25rem', 
            fontWeight: '600' 
          }}>🎨 Legend</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {Object.entries(colorPalette).map(([type, colors]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: colors.background,
                    border: `2px solid ${colors.border}`
                  }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  {type === 'default' ? 'Other' : type}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '24px', height: '2px', background: '#6366f1' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Regular Relationship</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '24px', height: '3px', background: '#f59e0b' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Has Article</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkView;
