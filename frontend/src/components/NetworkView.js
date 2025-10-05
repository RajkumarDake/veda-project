import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

const NetworkView = () => {
  // State for Neo4j connection
  const [neo4jStatus, setNeo4jStatus] = useState({ connected: false, message: '' });
  const [loading, setLoading] = useState(false);
  
  // State for graph data
  const [labels, setLabels] = useState([]);
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [nodes, setNodes] = useState({});
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
    Location: { background: '#f59e0b', border: '#d97706' },
    Person: { background: '#06b6d4', border: '#0891b2' },
    NewsSource: { background: '#ec4899', border: '#db2777' },
    default: { background: '#6b7280', border: '#374151' }
  };

  // Check Neo4j connection on mount
  useEffect(() => {
    checkNeo4jConnection();
    loadGraphData();
  }, []);

  const checkNeo4jConnection = async () => {
    try {
      const response = await fetch('/api/neo4j/status');
      const status = await response.json();
      setNeo4jStatus(status);
    } catch (error) {
      console.error('Neo4j connection error:', error);
      setNeo4jStatus({ connected: false, message: 'Connection failed' });
    }
  };

  const loadGraphData = async () => {
    try {
      const response = await fetch('/api/neo4j/graph-data');
      const data = await response.json();
      setLabels(data.labels || []);
      setRelationshipTypes(data.relationshipTypes || []);
      setNodes(data.nodes || {});
    } catch (error) {
      console.error('Error loading graph data:', error);
    }
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

  // Execute query based on selected nodes and relationships
  const executeSelectedQuery = useCallback(async () => {
    if (selectedRelationships.length === 0 && selectedNodes.length === 0) {
      setQueryError('Please select at least one relationship or node type');
      return;
    }

    setQueryError(null);
    setLoading(true);
    
    try {
      let query = '';
      const queryParts = [];
      
      // Add relationship queries
      if (selectedRelationships.length > 0) {
        selectedRelationships.forEach((relationshipType, index) => {
          queryParts.push(`MATCH p${queryParts.length + 1}=()-[:${relationshipType}]->() RETURN p${queryParts.length + 1} AS p`);
        });
      }
      
      // Add node queries
      if (selectedNodes.length > 0) {
        selectedNodes.forEach((nodeType, index) => {
          queryParts.push(`MATCH p${queryParts.length + 1}=(n:${nodeType})-[r]-(m) RETURN p${queryParts.length + 1} AS p LIMIT 20`);
        });
      }
      
      // Combine with UNION if multiple parts
      if (queryParts.length === 1) {
        query = queryParts[0];
      } else {
        query = queryParts.join('\nUNION\n');
      }

      const response = await fetch('/api/neo4j/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const results = await response.json();
      
      if (results.error) {
        setQueryError(results.error);
      } else {
        setGraphData(results);
        
        if (results.records && results.records.length > 0) {
          createForceDirectedGraph(results);
        } else {
          setQueryError('No data found for selected items');
        }
      }
    } catch (error) {
      console.error('Error executing query:', error);
      setQueryError(`Error executing query: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedRelationships, selectedNodes]);


  // Create Force-directed Graph using D3.js
  const createForceDirectedGraph = (data) => {
    if (!containerRef.current || !data.records) return;

    // Clear previous graph
    const container = containerRef.current;
    container.innerHTML = '';

    const width = container.clientWidth || 800;
    const height = 600;

    // Process data
    const processedData = processNeo4jResults(data);
    
    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#1a1a1a')
      .style('border-radius', '8px');

    // Add zoom behavior
    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Create force simulation
    const simulation = d3.forceSimulation(processedData.nodes)
      .force('link', d3.forceLink(processedData.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create links
    const links = g.append('g')
      .selectAll('line')
      .data(processedData.links)
      .enter()
      .append('line')
      .attr('stroke', d => d.hasArticle ? '#f59e0b' : '#6366f1')
      .attr('stroke-width', d => d.hasArticle ? 3 : 2)
      .attr('stroke-opacity', 0.8);

    // Create nodes
    const nodeGroups = g.append('g')
      .selectAll('g')
      .data(processedData.nodes)
      .enter()
      .append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    const circles = nodeGroups
      .append('circle')
      .attr('r', d => Math.max(8, Math.min(20, (d.degree || 1) * 3)))
      .attr('fill', d => {
        const color = colorPalette[d.group] || colorPalette.default;
        return color.background;
      })
      .attr('stroke', d => {
        const color = colorPalette[d.group] || colorPalette.default;
        return color.border;
      })
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add labels
    const labels = nodeGroups
      .append('text')
      .text(d => d.label.length > 12 ? d.label.substring(0, 12) + '...' : d.label)
      .attr('font-size', '10px')
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#ffffff')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('pointer-events', 'none');

    // Add tooltips
    circles.on('mouseover', function(event, d) {
      const tooltip = d3.select('body').append('div')
        .attr('class', 'graph-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.9)')
        .style('color', 'white')
        .style('padding', '10px')
        .style('border-radius', '6px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', 1000);

      tooltip.html(`
        <strong>${d.label}</strong><br/>
        Type: ${d.group}<br/>
        ${d.properties ? Object.entries(d.properties).map(([key, value]) => 
          `${key}: ${value}`).join('<br/>') : ''}
      `)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', function() {
      d3.selectAll('.graph-tooltip').remove();
    });

    // Update positions on tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodeGroups
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  // Process Neo4j results to graph format
  const processNeo4jResults = (results) => {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    results.records.forEach(record => {
      try {
        // Handle path results (from MATCH p=... queries)
        let pathData = null;
        if (record.p) {
          pathData = record.p;
        } else if (record.get && record.get('p')) {
          pathData = record.get('p');
        }

        if (pathData && pathData.segments) {
          // Process path segments
          pathData.segments.forEach(segment => {
            const startNode = segment.start;
            const endNode = segment.end;
            const relationship = segment.relationship;

            // Process start node
            const startId = startNode.identity.toNumber();
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
            const endId = endNode.identity.toNumber();
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
              type: relationship.type,
              properties: relProps,
              hasArticle: !!relProps.article_id
            });
          });
        } else {
          // Fallback: Handle individual node/relationship results
          const startNode = record.start || record.get('start');
          const endNode = record.end || record.get('end');
          const relationship = record.r || record.get('r');

          if (startNode && endNode && relationship) {
            // Process start node
            const startId = startNode.identity.toNumber();
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
            const endId = endNode.identity.toNumber();
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
              type: relationship.type,
              properties: relProps,
              hasArticle: !!relProps.article_id
            });
          }
        }
      } catch (error) {
        console.error('Error processing record:', error);
      }
    });

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
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div 
          ref={containerRef} 
          style={{ 
            width: '100%', 
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280'
          }}
        >
          {!graphData && (
            <div style={{ textAlign: 'center' }}>
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
