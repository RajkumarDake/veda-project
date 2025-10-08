import React, { useState, useEffect, useRef, useCallback } from 'react';

const NetworkView = () => {
  // State for Neo4j connection
  const [neo4jStatus, setNeo4jStatus] = useState({ connected: false, message: '' });
  const [loading, setLoading] = useState(false);
  
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
  const [showLegend, setShowLegend] = useState(false);
  
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

  // State for processed graph data (React-managed)
  const [processedGraphData, setProcessedGraphData] = useState(null);

  // Process and set graph data (React state-based)
  const createSimpleGraph = (data) => {
    if (!data.records) return;

    // Process data
    const processedData = processNeo4jResults(data);
    
    // Set the processed data to state instead of manipulating DOM
    setProcessedGraphData(processedData);
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
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '800', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          🌐 Network Visualization
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b',
          margin: '0'
        }}>
          Explore relationships in your Neo4j knowledge graph
        </p>
      </div>

      {/* Connection Status */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#1f2937',
            margin: '0'
          }}>
            🔌 Database Connection
          </h2>
          <div style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '500',
            background: neo4jStatus.connected ? '#dcfce7' : '#fef2f2',
            color: neo4jStatus.connected ? '#166534' : '#dc2626'
          }}>
            {neo4jStatus.connected ? '✅ Connected' : '❌ Disconnected'}
          </div>
        </div>
        {neo4jStatus.message && (
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.9rem',
            margin: '0'
          }}>
            {neo4jStatus.message}
          </p>
        )}
      </div>

      {/* Controls */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '20px'
        }}>
          🎛️ Query Parameters
        </h2>

        {/* Node Types */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '12px'
          }}>
            📊 Node Types ({labels.length})
          </h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px'
          }}>
            {labels.map(nodeType => (
              <button
                key={nodeType}
                onClick={() => toggleNode(nodeType)}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '2px solid',
                  borderColor: selectedNodes.includes(nodeType) ? '#8b5cf6' : '#d1d5db',
                  background: selectedNodes.includes(nodeType) ? '#8b5cf6' : 'white',
                  color: selectedNodes.includes(nodeType) ? 'white' : '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {nodeType}
              </button>
            ))}
          </div>
        </div>

        {/* Relationship Types */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '12px'
          }}>
            🔗 Relationship Types ({relationshipTypes.length})
          </h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px'
          }}>
            {relationshipTypes.map(relType => (
              <button
                key={relType}
                onClick={() => toggleRelationship(relType)}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '2px solid',
                  borderColor: selectedRelationships.includes(relType) ? '#10b981' : '#d1d5db',
                  background: selectedRelationships.includes(relType) ? '#10b981' : 'white',
                  color: selectedRelationships.includes(relType) ? 'white' : '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {relType}
              </button>
            ))}
          </div>
        </div>

        {/* Execute Button */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px'
        }}>
          <button
            onClick={executeSelectedQuery}
            disabled={loading || (selectedRelationships.length === 0 && selectedNodes.length === 0)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            {loading ? '🔄 Processing...' : '🚀 Visualize Selected'}
          </button>
          
          <div style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280'
          }}>
            Selected: {selectedNodes.length} nodes, {selectedRelationships.length} relationships
          </div>
        </div>
      </div>

      {/* Error Display */}
      {queryError && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            color: '#dc2626', 
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            ⚠️ {queryError}
          </div>
        </div>
      )}

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
          {!processedGraphData ? (
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
          ) : processedGraphData.nodes.length === 0 ? (
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#6b7280',
              fontSize: '1.1rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
              <div>No graph data found</div>
              <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>Try selecting different parameters</div>
            </div>
          ) : (
            <div style={{
              padding: '20px',
              height: '100%',
              overflowY: 'auto',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '8px'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '2px solid #334155'
              }}>
                <h3 style={{
                  color: '#f1f5f9',
                  margin: '0',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  🌐 Graph Visualization
                </h3>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '0.9rem'
                }}>
                  {processedGraphData.nodes.length} nodes • {processedGraphData.links.length} relationships
                </div>
              </div>

              {/* Nodes Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {processedGraphData.nodes.map(node => (
                  <div
                    key={node.id}
                    style={{
                      background: `linear-gradient(135deg, ${colorPalette[node.group]?.background || colorPalette.default.background}20, ${colorPalette[node.group]?.background || colorPalette.default.background}10)`,
                      border: `2px solid ${colorPalette[node.group]?.border || colorPalette.default.border}`,
                      borderRadius: '12px',
                      padding: '16px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: colorPalette[node.group]?.background || colorPalette.default.background,
                        marginRight: '8px'
                      }} />
                      <h4 style={{
                        color: '#f1f5f9',
                        margin: '0',
                        fontSize: '1rem',
                        fontWeight: '600'
                      }}>
                        {node.label}
                      </h4>
                    </div>
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '0.85rem',
                      marginBottom: '8px'
                    }}>
                      Type: <span style={{ 
                        color: colorPalette[node.group]?.background || colorPalette.default.background, 
                        fontWeight: '600' 
                      }}>
                        {node.group}
                      </span>
                    </div>
                    {node.properties && Object.keys(node.properties).length > 0 && (
                      <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '0.8rem',
                        color: '#cbd5e1'
                      }}>
                        {Object.entries(node.properties).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Relationships */}
              {processedGraphData.links.length > 0 && (
                <div style={{
                  marginTop: '30px',
                  paddingTop: '20px',
                  borderTop: '2px solid #334155'
                }}>
                  <h4 style={{
                    color: '#f1f5f9',
                    margin: '0 0 16px 0',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>
                    🔗 Relationships ({processedGraphData.links.length})
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '12px'
                  }}>
                    {processedGraphData.links.map((link, index) => (
                      <div
                        key={index}
                        style={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid #6366f1',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{
                          color: '#6366f1',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          {link.type}
                        </div>
                        <div style={{ color: '#94a3b8' }}>
                          {processedGraphData.nodes.find(n => n.id === link.source)?.label || 'Unknown'} 
                          {' → '}
                          {processedGraphData.nodes.find(n => n.id === link.target)?.label || 'Unknown'}
                        </div>
                        {link.hasArticle && (
                          <div style={{ 
                            color: '#f59e0b', 
                            fontSize: '0.75rem', 
                            marginTop: '4px' 
                          }}>
                            📄 Has Article
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div style={{ 
          marginTop: '24px',
          background: 'white', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            🎨 Legend
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '12px'
          }}>
            {Object.entries(colorPalette).map(([type, colors]) => (
              <div key={type} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: colors.background,
                  border: `2px solid ${colors.border}`
                }} />
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: '#374151'
                }}>
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkView;
