import React, { useState, useEffect } from 'react';
import Neo4jGraph from '../components/Neo4jGraph';

const KnowledgeGraphPage = ({ networkData }) => {
  const [showNeo4jGraph, setShowNeo4jGraph] = useState(true);
  const [neo4jData, setNeo4jData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);

  // Neo4j connection details from your notebook
  const NEO4J_URI = 'neo4j+s://397603d1.databases.neo4j.io';
  const NEO4J_USER = 'neo4j';
  const NEO4J_PASSWORD = 'dQMr8EoOUknWQK7JNRD5Kd4UtXPlBoXuURrezQ38Tz8';

  const loadNeo4jData = async () => {
    setLoading(true);
    try {
      // Try to fetch data from your backend API first
      const response = await fetch('/api/neo4j-data');
      if (response.ok) {
        const data = await response.json();
        setNeo4jData(data);
      } else {
        // Fallback to local network data
        setNeo4jData(networkData);
      }
    } catch (error) {
      console.error('Error loading Neo4j data:', error);
      // Use local network data as fallback
      setNeo4jData(networkData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNeo4jData();
  }, [networkData]);

  const handleNodeClick = (node) => {
    console.log('Node clicked:', node);
  };

  const handleNeo4jDataLoad = () => {
    console.log('Neo4j data loaded');
    loadNeo4jData();
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Professional Header */}
      <div style={{ 
        background: 'white', 
        padding: '32px', 
        borderRadius: '16px', 
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E7EB'
      }}>
        <h1 style={{ 
          color: '#1F2937', 
          fontSize: '2rem', 
          fontWeight: '700', 
          margin: '0 0 8px 0'
        }}>🕸️ Advanced Knowledge Graph Laboratory</h1>
        <p style={{ 
          color: '#6B7280', 
          fontSize: '1.125rem', 
          margin: '0 0 24px 0'
        }}>Interactive network visualization with {neo4jData.nodes?.length || 0} nodes and {neo4jData.edges?.length || 0} connections</p>

        {/* Enhanced Controls */}
        <div style={{ 
          background: '#F9FAFB', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #E5E7EB'
        }}>
          <h3 style={{ color: '#1F2937', marginBottom: '16px', fontSize: '1.125rem', fontWeight: '600' }}>🎛️ Network Configuration</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: '#1F2937', 
                marginBottom: '6px', 
                fontSize: '0.875rem' 
              }}>Graph View</label>
              <button 
                onClick={() => setShowNeo4jGraph(!showNeo4jGraph)}
                style={{ 
                  width: '100%',
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  border: '2px solid #E5E7EB',
                  background: showNeo4jGraph ? '#10B981' : 'white',
                  color: showNeo4jGraph ? 'white' : '#1F2937',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {showNeo4jGraph ? '🌐 Hide Graph' : '🌐 Show Neo4j Graph'}
              </button>
            </div>
            <div style={{ 
              flex: '0 0 auto',
              background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', 
              color: 'white', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontWeight: '600',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              🔗 {neo4jData.nodes?.length || 0} Nodes
            </div>
            <div style={{ 
              flex: '0 0 auto',
              background: 'linear-gradient(135deg, #8B5CF6, #A855F7)', 
              color: 'white', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontWeight: '600',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              ↔️ {neo4jData.edges?.length || 0} Edges
            </div>
            <button 
              onClick={loadNeo4jData}
              disabled={loading}
              style={{ 
                flex: '0 0 auto',
                padding: '12px 20px', 
                borderRadius: '8px', 
                border: 'none',
                background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #10B981, #059669)',
                color: 'white',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {loading ? '⏳ Loading...' : '🔄 Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      <div className="page-content" style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0, color: '#2d3748' }}>🌐 Neo4j Knowledge Graph</h2>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowNeo4jGraph(!showNeo4jGraph)}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '6px', 
                border: 'none', 
                background: showNeo4jGraph ? '#48bb78' : '#e2e8f0',
                color: showNeo4jGraph ? 'white' : '#4a5568',
                cursor: 'pointer'
              }}
            >
              {showNeo4jGraph ? '🌐 Hide Graph' : '🌐 Show Neo4j Graph'}
            </button>
          </div>
        </div>
      </div>

      {/* Neo4j Knowledge Graph */}
      {showNeo4jGraph && (
        <div className="page-content" style={{ marginBottom: '25px' }}>
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              Loading Neo4j data from cloud...
            </div>
          ) : (
            <Neo4jGraph 
              data={neo4jData}
              width={1200}
              height={700}
              onNodeClick={handleNodeClick}
              onLoadData={handleNeo4jDataLoad}
            />
          )}
        </div>
      )}

      {/* Connection Info */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E7EB'
      }}>
        <h3 style={{ color: '#1F2937', marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🔗 Neo4j Cloud Connection</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ 
            background: '#F9FAFB', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid #E5E7EB'
          }}>
            <h4 style={{ color: '#1F2937', marginBottom: '12px', fontSize: '1.125rem', fontWeight: '600' }}>Connection Details:</h4>
            <p style={{ margin: '8px 0', color: '#6B7280' }}><strong>URI:</strong> {NEO4J_URI}</p>
            <p style={{ margin: '8px 0', color: '#6B7280' }}><strong>User:</strong> {NEO4J_USER}</p>
            <p style={{ margin: '8px 0', color: '#6B7280' }}><strong>Status:</strong> {loading ? 'Loading...' : 'Connected'}</p>
          </div>
          <div style={{ 
            background: '#F9FAFB', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid #E5E7EB'
          }}>
            <h4 style={{ color: '#1F2937', marginBottom: '12px', fontSize: '1.125rem', fontWeight: '600' }}>Data Statistics:</h4>
            <p style={{ margin: '8px 0', color: '#6B7280' }}><strong>Nodes:</strong> {neo4jData.nodes?.length || 0}</p>
            <p style={{ margin: '8px 0', color: '#6B7280' }}><strong>Edges:</strong> {neo4jData.edges?.length || 0}</p>
            <button 
              onClick={loadNeo4jData}
              disabled={loading}
              style={{ 
                marginTop: '12px',
                padding: '10px 16px', 
                borderRadius: '8px', 
                border: 'none',
                background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #10B981, #059669)',
                color: 'white',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphPage;
