import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, AreaChart, Area
} from 'recharts';

const BiasDetection = ({ mc1Data, mc1BiasAnalysis }) => {
  const [activeAlgorithm, setActiveAlgorithm] = useState('source_bias');
  const [detectionThreshold, setDetectionThreshold] = useState(0.6);

  // Hardcoded MC1 bias detection data for demonstration
  const biasDetectionData = useMemo(() => {
    return {
      sourceBias: [
        { source: 'Haacklee Herald', biasScore: 0.75, reliability: 0.82, articles: 127, suspiciousPatterns: 8 },
        { source: 'Lomark Daily', biasScore: 0.43, reliability: 0.91, articles: 98, suspiciousPatterns: 3 },
        { source: 'The News Buoy', biasScore: 0.68, reliability: 0.76, articles: 116, suspiciousPatterns: 12 },
        { source: 'Maritime Monitor', biasScore: 0.89, reliability: 0.45, articles: 67, suspiciousPatterns: 18 },
        { source: 'Ocean Observer', biasScore: 0.34, reliability: 0.95, articles: 89, suspiciousPatterns: 1 }
      ],
      algorithmBias: [
        { algorithm: 'Sentiment Analysis', biasScore: 0.23, accuracy: 0.87, falsePositives: 12, coverage: 0.94 },
        { algorithm: 'Entity Recognition', biasScore: 0.45, accuracy: 0.92, falsePositives: 8, coverage: 0.89 },
        { algorithm: 'Topic Modeling', biasScore: 0.67, accuracy: 0.78, falsePositives: 23, coverage: 0.76 },
        { algorithm: 'Network Analysis', biasScore: 0.34, accuracy: 0.91, falsePositives: 6, coverage: 0.82 },
        { algorithm: 'Temporal Analysis', biasScore: 0.56, accuracy: 0.84, falsePositives: 15, coverage: 0.71 }
      ],
      companyBias: [
        { company: 'Alvarez PLC', biasScore: 0.82, mentions: 156, positiveRatio: 0.23, negativeRatio: 0.67 },
        { company: 'Martinez-Thompson', biasScore: 0.45, mentions: 89, positiveRatio: 0.56, negativeRatio: 0.34 },
        { company: 'Oceanic Ventures', biasScore: 0.71, mentions: 134, positiveRatio: 0.12, negativeRatio: 0.78 },
        { company: 'Marine Solutions Inc', biasScore: 0.38, mentions: 67, positiveRatio: 0.67, negativeRatio: 0.28 },
        { company: 'Deep Sea Industries', biasScore: 0.93, mentions: 201, positiveRatio: 0.08, negativeRatio: 0.89 }
      ]
    };
  }, []);

  // Bias detection algorithms
  const detectSourceBias = useMemo(() => {
    return biasDetectionData.sourceBias.filter(item => item.biasScore > detectionThreshold);
  }, [biasDetectionData, detectionThreshold]);

  const detectAlgorithmBias = useMemo(() => {
    return biasDetectionData.algorithmBias.filter(item => item.biasScore > detectionThreshold);
  }, [biasDetectionData, detectionThreshold]);

  const detectCompanyBias = useMemo(() => {
    return biasDetectionData.companyBias.filter(item => item.biasScore > detectionThreshold);
  }, [biasDetectionData, detectionThreshold]);

  // Color schemes for bias visualization
  const getBiasColor = (score) => {
    if (score >= 0.8) return '#DC2626'; // High bias - Red
    if (score >= 0.6) return '#EA580C'; // Medium-high bias - Orange
    if (score >= 0.4) return '#D97706'; // Medium bias - Amber
    if (score >= 0.2) return '#65A30D'; // Low bias - Lime
    return '#059669'; // Very low bias - Green
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
        border: '1px solid #e2e8f0'
      }}>
        <h1 style={{ 
          color: '#1a202c', 
          fontSize: '2rem', 
          fontWeight: '700', 
          margin: '0 0 8px 0',
          letterSpacing: '-0.025em'
        }}>🔍 Advanced Bias Detection System</h1>
        <p style={{ 
          color: '#6B7280', 
          fontSize: '1.125rem', 
          margin: 0,
          fontWeight: '400'
        }}>AI-powered bias detection algorithms analyzing news sources, content algorithms, and entity coverage patterns</p>
        
        {/* Controls */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginTop: '24px',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div>
            <label style={{ 
              display: 'block',
              fontWeight: '600', 
              color: '#1a202c',
              marginBottom: '6px',
              fontSize: '0.875rem'
            }}>Detection Algorithm</label>
            <select 
              value={activeAlgorithm} 
              onChange={(e) => setActiveAlgorithm(e.target.value)}
              style={{ 
                width: '100%',
                padding: '10px 12px', 
                borderRadius: '8px', 
                border: '2px solid #e2e8f0',
                background: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#1a202c',
                cursor: 'pointer'
              }}
            >
              <option value="source_bias">News Source Bias</option>
              <option value="algorithm_bias">Algorithm Bias</option>
              <option value="company_bias">Entity Coverage Bias</option>
            </select>
          </div>
          <div>
            <label style={{ 
              display: 'block',
              fontWeight: '600', 
              color: '#1a202c',
              marginBottom: '6px',
              fontSize: '0.875rem'
            }}>Bias Threshold</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1"
              value={detectionThreshold} 
              onChange={(e) => setDetectionThreshold(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px' }}>
              Current: {(detectionThreshold * 100).toFixed(0)}% bias threshold
            </div>
          </div>
        </div>
      </div>

      {/* Detection Results */}
      {activeAlgorithm === 'source_bias' && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <h3 
              style={{ 
                color: '#1a202c', 
                marginBottom: '16px', 
                fontSize: '1.25rem', 
                fontWeight: '600',
                cursor: 'help',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#fef3c7';
                e.target.style.borderColor = '#f59e0b';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.15)';
                const tooltip = e.target.nextElementSibling;
                if (tooltip) {
                  tooltip.style.display = 'block';
                  tooltip.style.opacity = '1';
                  tooltip.style.transform = 'translateY(0)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'transparent';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
                const tooltip = e.target.nextElementSibling;
                if (tooltip) {
                  tooltip.style.display = 'none';
                  tooltip.style.opacity = '0';
                  tooltip.style.transform = 'translateY(-10px)';
                }
              }}
            >
              📰 News Source Bias Detection
              <span style={{
                marginLeft: '8px',
                fontSize: '0.8rem',
                color: '#f59e0b',
                fontWeight: '500',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>ℹ️</span>
            </h3>
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              zIndex: 1000,
              background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
              border: '1px solid #fed7aa',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxWidth: '450px',
              minWidth: '350px',
              display: 'none',
              opacity: '0',
              transform: 'translateY(-10px)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                color: '#1f2937', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>📰</span>
                News Source Bias Detection
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Analyzes bias patterns in news sources using sentiment analysis and reliability metrics.
              </div>
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(245, 158, 11, 0.1)',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#f59e0b', marginBottom: '4px' }}>
                  🧮 BIAS SCORE FORMULA
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937', fontFamily: 'monospace' }}>
                  Bias Score = (|Positive Sentiment - Negative Sentiment| / Total Articles) × Reliability Weight
                </div>
              </div>
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(245, 158, 11, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#f59e0b', marginBottom: '4px' }}>
                  📊 RELIABILITY FORMULA
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937', fontFamily: 'monospace' }}>
                  Reliability = 1 - (Suspicious Patterns / Total Articles) × Consistency Factor
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '16px', color: '#6B7280', fontSize: '0.875rem' }}>
            Detected {detectSourceBias.length} sources with bias score above {(detectionThreshold * 100).toFixed(0)}%
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={biasDetectionData.sourceBias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="source" angle={-45} textAnchor="end" height={80} fontSize={10} />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  `${(value * 100).toFixed(1)}%`, 
                  name === 'biasScore' ? 'Bias Score' : name
                ]}
              />
              <Legend />
              <Bar dataKey="biasScore" fill="#DC2626" name="Bias Score" />
              <Bar dataKey="reliability" fill="#10B981" name="Reliability Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeAlgorithm === 'algorithm_bias' && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <h3 
              style={{ 
                color: '#1a202c', 
                marginBottom: '16px', 
                fontSize: '1.25rem', 
                fontWeight: '600',
                cursor: 'help',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e0f2fe';
                e.target.style.borderColor = '#0ea5e9';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(14, 165, 233, 0.15)';
                const tooltip = e.target.nextElementSibling;
                if (tooltip) {
                  tooltip.style.display = 'block';
                  tooltip.style.opacity = '1';
                  tooltip.style.transform = 'translateY(0)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'transparent';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
                const tooltip = e.target.nextElementSibling;
                if (tooltip) {
                  tooltip.style.display = 'none';
                  tooltip.style.opacity = '0';
                  tooltip.style.transform = 'translateY(-10px)';
                }
              }}
            >
              🤖 Algorithm Bias Detection
              <span style={{
                marginLeft: '8px',
                fontSize: '0.8rem',
                color: '#0ea5e9',
                fontWeight: '500',
                background: 'rgba(14, 165, 233, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>ℹ️</span>
            </h3>
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              zIndex: 1000,
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxWidth: '450px',
              minWidth: '350px',
              display: 'none',
              opacity: '0',
              transform: 'translateY(-10px)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                color: '#1f2937', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>🤖</span>
                Algorithm Bias Detection
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Scatter plot analysis of algorithm performance vs bias scores to identify algorithmic fairness issues.
              </div>
              <div style={{ 
                background: 'rgba(14, 165, 233, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(14, 165, 233, 0.1)',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0ea5e9', marginBottom: '4px' }}>
                  🧮 ALGORITHM BIAS FORMULA
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937', fontFamily: 'monospace' }}>
                  Algorithm Bias = (False Positives / Total Predictions) × (1 - Coverage) × Accuracy Weight
                </div>
              </div>
              <div style={{ 
                background: 'rgba(14, 165, 233, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(14, 165, 233, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0ea5e9', marginBottom: '4px' }}>
                  📊 SCATTER PLOT AXES
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937', fontFamily: 'monospace' }}>
                  X-axis: Accuracy Score | Y-axis: Bias Score | Size: Coverage Percentage
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '16px', color: '#6B7280', fontSize: '0.875rem' }}>
            Detected {detectAlgorithmBias.length} algorithms with bias score above {(detectionThreshold * 100).toFixed(0)}%
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={biasDetectionData.algorithmBias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="accuracy" name="Accuracy" />
              <YAxis dataKey="biasScore" name="Bias Score" />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name, props) => [
                  `${props.payload.algorithm}: ${(value * 100).toFixed(1)}%`, 
                  name === 'biasScore' ? 'Bias Score' : 'Accuracy'
                ]}
              />
              <Scatter name="Algorithms" dataKey="biasScore" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeAlgorithm === 'company_bias' && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <h3 
              style={{ 
                color: '#1a202c', 
                marginBottom: '16px', 
                fontSize: '1.25rem', 
                fontWeight: '600',
                cursor: 'help',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ecfdf5';
                e.target.style.borderColor = '#10b981';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.15)';
                const tooltip = e.target.nextElementSibling;
                if (tooltip) {
                  tooltip.style.display = 'block';
                  tooltip.style.opacity = '1';
                  tooltip.style.transform = 'translateY(0)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'transparent';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
                const tooltip = e.target.nextElementSibling;
                if (tooltip) {
                  tooltip.style.display = 'none';
                  tooltip.style.opacity = '0';
                  tooltip.style.transform = 'translateY(-10px)';
                }
              }}
            >
              🏢 Entity Coverage Bias Detection
              <span style={{
                marginLeft: '8px',
                fontSize: '0.8rem',
                color: '#10b981',
                fontWeight: '500',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>ℹ️</span>
            </h3>
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              zIndex: 1000,
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxWidth: '450px',
              minWidth: '350px',
              display: 'none',
              opacity: '0',
              transform: 'translateY(-10px)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                color: '#1f2937', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>🏢</span>
                Entity Coverage Bias Detection
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Area chart analysis showing bias in entity coverage patterns across different companies and organizations.
              </div>
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#10b981', marginBottom: '4px' }}>
                  🧮 ENTITY BIAS FORMULA
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937', fontFamily: 'monospace' }}>
                  Entity Bias = |Positive Ratio - Negative Ratio| × (Mentions / Max Mentions) × Coverage Weight
                </div>
              </div>
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#10b981', marginBottom: '4px' }}>
                  📊 AREA CHART METRICS
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937', fontFamily: 'monospace' }}>
                  X-axis: Company Names | Y-axis: Bias Score | Area: Coverage Intensity
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '16px', color: '#6B7280', fontSize: '0.875rem' }}>
            Detected {detectCompanyBias.length} entities with bias score above {(detectionThreshold * 100).toFixed(0)}%
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={biasDetectionData.companyBias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="company" angle={-45} textAnchor="end" height={80} fontSize={10} />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  `${(value * 100).toFixed(1)}%`, 
                  name === 'biasScore' ? 'Bias Score' : 
                  name === 'positiveRatio' ? 'Positive Coverage' : 'Negative Coverage'
                ]}
              />
              <Legend />
              <Area type="monotone" dataKey="biasScore" stackId="1" stroke="#DC2626" fill="#DC2626" fillOpacity={0.3} name="Bias Score" />
              <Area type="monotone" dataKey="positiveRatio" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Positive Coverage" />
              <Area type="monotone" dataKey="negativeRatio" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Negative Coverage" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Statistics */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ color: '#1a202c', marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📊 Detection Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #DC2626, #B91C1C)', 
            color: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{detectSourceBias.length}</div>
            <div>Biased Sources</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #EA580C, #C2410C)', 
            color: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{detectAlgorithmBias.length}</div>
            <div>Biased Algorithms</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #D97706, #B45309)', 
            color: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{detectCompanyBias.length}</div>
            <div>Biased Entities</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #3B82F6, #2563EB)', 
            color: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(detectionThreshold * 100).toFixed(0)}%</div>
            <div>Detection Threshold</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiasDetection;
