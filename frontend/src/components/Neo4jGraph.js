import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Neo4jGraph = ({ data, width = 800, height = 600, onNodeClick, onLoadData }) => {
  const svgRef = useRef();
  const [loading, setLoading] = useState(false);
  const [neo4jStatus, setNeo4jStatus] = useState({ connected: false, message: '' });
  const [graphStats, setGraphStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Check Neo4j status on component mount
  useEffect(() => {
    checkNeo4jStatus();
  }, []);

  const checkNeo4jStatus = async () => {
    try {
      const response = await fetch('/api/neo4j/status');
      const status = await response.json();
      setNeo4jStatus(status);
      
      if (status.connected && status.stats) {
        setGraphStats(status.stats);
      }
    } catch (error) {
      console.error('Error checking Neo4j status:', error);
      setNeo4jStatus({ connected: false, message: 'Connection error' });
    }
  };

  const loadMC1Data = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/neo4j/load-mc1', { method: 'POST' });
      const result = await response.json();
      
      if (response.ok) {
        setGraphStats(result.stats || {});
        setNeo4jStatus({ connected: true, message: 'Data loaded successfully' });
        if (onLoadData) onLoadData();
      } else {
        alert(`Error loading data: ${result.error}`);
      }
    } catch (error) {
      console.error('Error loading MC1 data:', error);
      alert('Failed to load MC1 data');
    } finally {
      setLoading(false);
    }
  };

  const searchEntities = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/neo4j/search?q=${encodeURIComponent(query)}&limit=10`);
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching entities:', error);
      setSearchResults([]);
    }
  };

  // D3 visualization
  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Filter data based on selected filter
    let filteredNodes = data.nodes;
    let filteredEdges = data.edges;

    if (filterType !== 'all') {
      filteredNodes = data.nodes.filter(node => 
        node.type && node.type.toLowerCase().includes(filterType.toLowerCase())
      );
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredEdges = data.edges.filter(edge => 
        nodeIds.has(edge.source) && nodeIds.has(edge.target)
      );
    }

    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Color scale for different node types
    const colorScale = d3.scaleOrdinal()
      .domain(['FishingCompany', 'LogisticsCompany', 'NewsSource', 'Person', 'Location', 'Organization'])
      .range(['#667eea', '#764ba2', '#48bb78', '#ed8936', '#f56565', '#9f7aea']);

    // Create force simulation
    const simulation = d3.forceSimulation(filteredNodes)
      .force('link', d3.forceLink(filteredEdges).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('collision', d3.forceCollide().radius(20));

    // Create links
    const links = g.append('g')
      .selectAll('line')
      .data(filteredEdges)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(2))
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#555')
          .attr('stroke-width', 3);

        const tooltip = d3.select('body').append('div')
          .attr('class', 'neo4j-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', 1000);

        const relationship = d.relationship || d.type || 'RELATED';
        const algorithm = d.algorithm || 'Unknown';
        const rawSource = d.raw_source || 'Unknown';

        tooltip.html(`
          <strong>Edge</strong><br/>
          ${d.source?.id || d.source} → ${d.target?.id || d.target}<br/>
          Relationship: ${relationship}<br/>
          Algorithm: ${algorithm}<br/>
          Source: ${rawSource}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mousemove', function(event) {
        d3.selectAll('.neo4j-tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#999')
          .attr('stroke-width', Math.sqrt(2));
        d3.selectAll('.neo4j-tooltip').remove();
      });

    // Create nodes
    const nodes = g.append('g')
      .selectAll('circle')
      .data(filteredNodes)
      .enter()
      .append('circle')
      .attr('r', d => Math.max(5, Math.min(15, (d.degree || 1) * 2)))
      .attr('fill', d => {
        const type = d.type ? d.type.split('.').pop() : 'Unknown';
        return colorScale(type);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        setSelectedNode(d);
        if (onNodeClick) onNodeClick(d);
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', Math.max(8, Math.min(20, (d.degree || 1) * 2.5)));
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'neo4j-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', 1000);

        tooltip.html(`
          <strong>${d.id}</strong><br/>
          Type: ${d.type || 'Unknown'}<br/>
          Country: ${d.country || 'Unknown'}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('r', Math.max(5, Math.min(15, (d.degree || 1) * 2)));
        d3.selectAll('.neo4j-tooltip').remove();
      });

    // Add labels
    const labels = g.append('g')
      .selectAll('text')
      .data(filteredNodes)
      .enter()
      .append('text')
      .text(d => d.id.length > 15 ? d.id.substring(0, 15) + '...' : d.id)
      .attr('font-size', '10px')
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodes
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y + 25);
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

    // Cleanup
    return () => {
      simulation.stop();
    };

  }, [data, width, height, filterType]);

  return (
    <div className="neo4j-graph-container" style={{ background: '#f8f9fa', borderRadius: '8px', padding: '20px' }}>
      {/* Header Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#2d3748' }}>🌐 Knowledge Graph Visualization</h3>
          <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '5px' }}>
            Status: <span style={{ 
              color: neo4jStatus.connected ? '#48bb78' : '#f56565',
              fontWeight: 'bold'
            }}>
              {neo4jStatus.connected ? '✅ Connected' : '❌ Disconnected'}
            </span>
            {neo4jStatus.message && ` - ${neo4jStatus.message}`}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {!neo4jStatus.connected && (
            <button 
              onClick={checkNeo4jStatus}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '6px', 
                border: 'none', 
                background: '#667eea',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              🔄 Check Connection
            </button>
          )}
          
          <button 
            onClick={loadMC1Data}
            disabled={loading || !neo4jStatus.connected}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none', 
              background: loading ? '#e2e8f0' : '#48bb78',
              color: loading ? '#718096' : 'white',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Loading...' : '📊 Load MC1 Data'}
          </button>
        </div>
      </div>

      {/* Graph Statistics */}
      {Object.keys(graphStats).length > 0 && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          background: 'white', 
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>📈 Graph Statistics</h4>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <strong>Nodes:</strong> {graphStats.total_nodes?.toLocaleString() || 0}
            </div>
            <div>
              <strong>Relationships:</strong> {graphStats.total_relationships?.toLocaleString() || 0}
            </div>
            {graphStats.node_types && graphStats.node_types.length > 0 && (
              <div>
                <strong>Top Node Type:</strong> {graphStats.node_types[0]?.label} ({graphStats.node_types[0]?.count})
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        gap: '15px', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        padding: '15px',
        background: 'white',
        borderRadius: '6px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold', color: '#2d3748' }}>🔍 Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchEntities(e.target.value);
            }}
            placeholder="Search entities..."
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              minWidth: '200px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold', color: '#2d3748' }}>🏷️ Filter:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0'
            }}
          >
            <option value="all">All Types</option>
            <option value="FishingCompany">Fishing Companies</option>
            <option value="LogisticsCompany">Logistics Companies</option>
            <option value="NewsSource">News Sources</option>
            <option value="Person">People</option>
            <option value="Location">Locations</option>
          </select>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          background: 'white', 
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          maxHeight: '150px',
          overflowY: 'auto'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>🔍 Search Results</h4>
          {searchResults.map((entity, index) => (
            <div 
              key={index}
              style={{ 
                padding: '8px', 
                borderBottom: '1px solid #f1f5f9',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
              onClick={() => setSelectedNode(entity)}
            >
              <strong>{entity.id}</strong> - {entity.type} ({entity.country})
            </div>
          ))}
        </div>
      )}

      {/* Selected Node Details */}
      {selectedNode && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          borderRadius: '6px'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>🎯 Selected Node</h4>
          <div><strong>ID:</strong> {selectedNode.id}</div>
          <div><strong>Type:</strong> {selectedNode.type || 'Unknown'}</div>
          <div><strong>Country:</strong> {selectedNode.country || 'Unknown'}</div>
          <button 
            onClick={() => setSelectedNode(null)}
            style={{ 
              marginTop: '10px',
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            ✕ Close
          </button>
        </div>
      )}

      {/* Graph Visualization */}
      <div style={{ 
        background: 'white', 
        borderRadius: '6px', 
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <svg ref={svgRef} style={{ display: 'block' }}></svg>
      </div>

      {/* Legend */}
      <div style={{ 
        marginTop: '15px', 
        padding: '15px', 
        background: 'white', 
        borderRadius: '6px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>🎨 Legend</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {[
            { type: 'FishingCompany', color: '#667eea', icon: '🐟' },
            { type: 'LogisticsCompany', color: '#764ba2', icon: '🚢' },
            { type: 'NewsSource', color: '#48bb78', icon: '📰' },
            { type: 'Person', color: '#ed8936', icon: '👤' },
            { type: 'Location', color: '#f56565', icon: '📍' },
            { type: 'Organization', color: '#9f7aea', icon: '🏢' }
          ].map(item => (
            <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: item.color 
                }}
              ></div>
              <span style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                {item.icon} {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Neo4jGraph;
