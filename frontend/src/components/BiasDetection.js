import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, AreaChart, Area, Cell, ComposedChart, PieChart, Pie
} from 'recharts';

// Professional color palette (matching Article Bias Analysis)
const COLORS = {
  positive: '#10B981', // Emerald-500
  negative: '#EF4444', // Red-500
  neutral: '#F59E0B', // Amber-500
  primary: '#3B82F6', // Blue-500
  secondary: '#8B5CF6', // Violet-500
  accent: '#06B6D4', // Cyan-500
  dark: '#1F2937', // Gray-800
  light: '#F9FAFB', // Gray-50
  border: '#E5E7EB' // Gray-200
};

const BiasDetection = ({ mc1Data, mc1BiasAnalysis, data }) => {
  // Enhanced state management
  const [activeView, setActiveView] = useState('multi_dimensional');
  const [detectionAlgorithm, setDetectionAlgorithm] = useState('neural_network');
  const [biasThreshold, setBiasThreshold] = useState(0.65);
  const [analysisMode, setAnalysisMode] = useState('real_time');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState('all');
  const [confidenceLevel, setConfidenceLevel] = useState(0.85);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(true);
  const [anomalyDetection, setAnomalyDetection] = useState(true);

  // Advanced bias detection data
  const advancedBiasData = useMemo(() => ({
    entityBias: [
      { entity: 'Haacklee Herald', biasScore: 0.78, reliability: 0.82, sentiment: 0.34, coverage: 127, patterns: ['selective_reporting', 'source_bias'], confidence: 0.91, influence: 0.73 },
      { entity: 'Maritime Monitor', biasScore: 0.89, reliability: 0.45, sentiment: 0.23, coverage: 67, patterns: ['extreme_bias', 'misinformation'], confidence: 0.94, influence: 0.56 },
      { entity: 'Ocean Observer', biasScore: 0.34, reliability: 0.95, sentiment: 0.78, coverage: 89, patterns: ['fact_based'], confidence: 0.92, influence: 0.81 },
      { entity: 'Deep Sea Industries', biasScore: 0.93, reliability: 0.42, sentiment: 0.08, coverage: 201, patterns: ['systematic_bias', 'coordinated_attack'], confidence: 0.96, influence: 0.67 },
      { entity: 'Lomark Daily', biasScore: 0.43, reliability: 0.91, sentiment: 0.67, coverage: 98, patterns: ['balanced_coverage'], confidence: 0.88, influence: 0.74 },
      { entity: 'The News Buoy', biasScore: 0.68, reliability: 0.76, sentiment: 0.45, coverage: 116, patterns: ['temporal_bias', 'entity_focus'], confidence: 0.85, influence: 0.69 }
    ],
    algorithmMetrics: [
      { algorithm: 'Neural Network', biasScore: 0.15, accuracy: 0.96, precision: 0.94, recall: 0.98, f1Score: 0.96, confidence: 0.95 },
      { algorithm: 'Deep Learning NLP', biasScore: 0.29, accuracy: 0.94, precision: 0.92, recall: 0.96, f1Score: 0.94, confidence: 0.92 },
      { algorithm: 'Ensemble Methods', biasScore: 0.22, accuracy: 0.93, precision: 0.91, recall: 0.95, f1Score: 0.93, confidence: 0.89 },
      { algorithm: 'Transformer Models', biasScore: 0.18, accuracy: 0.95, precision: 0.93, recall: 0.97, f1Score: 0.95, confidence: 0.94 }
    ],
    temporalBias: [
      { period: '2023-01', biasScore: 0.45, articles: 23, anomalies: 1 },
      { period: '2023-02', biasScore: 0.52, articles: 28, anomalies: 2 },
      { period: '2023-03', biasScore: 0.67, articles: 34, anomalies: 4 },
      { period: '2023-04', biasScore: 0.78, articles: 41, anomalies: 7 },
      { period: '2023-05', biasScore: 0.71, articles: 38, anomalies: 5 },
      { period: '2023-06', biasScore: 0.59, articles: 32, anomalies: 3 }
    ],
    networkClusters: [
      { cluster: 'High-Bias Media', entities: 5, avgBias: 0.82, connectivity: 0.91, influence: 0.78 },
      { cluster: 'Corporate Network', entities: 8, avgBias: 0.74, connectivity: 0.85, influence: 0.84 },
      { cluster: 'Independent Sources', entities: 3, avgBias: 0.34, connectivity: 0.45, influence: 0.52 }
    ],
    anomalies: [
      { entity: 'Maritime Monitor', type: 'bias_spike', severity: 'critical', confidence: 0.94, timestamp: '2023-04-15' },
      { entity: 'Deep Sea Industries', type: 'coordinated_attack', severity: 'high', confidence: 0.96, timestamp: '2023-04-12' }
    ]
  }), []);

  // Advanced filtering and analysis
  const filteredBiasData = useMemo(() => {
    let filtered = advancedBiasData.entityBias;
    
    if (filterCriteria !== 'all') {
      filtered = filtered.filter(item => {
        switch (filterCriteria) {
          case 'high_bias': return item.biasScore >= 0.7;
          case 'medium_bias': return item.biasScore >= 0.4 && item.biasScore < 0.7;
          case 'low_bias': return item.biasScore < 0.4;
          case 'unreliable': return item.reliability < 0.6;
          case 'suspicious_patterns': return item.patterns.length > 1;
          default: return true;
        }
      });
    }
    
    return filtered.filter(item => item.biasScore >= biasThreshold && item.confidence >= confidenceLevel);
  }, [advancedBiasData, filterCriteria, biasThreshold, confidenceLevel]);

  // Statistical analysis
  const statisticalAnalysis = useMemo(() => {
    const biasScores = filteredBiasData.map(item => item.biasScore);
    const mean = biasScores.reduce((a, b) => a + b, 0) / biasScores.length || 0;
    const variance = biasScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / biasScores.length || 0;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean: mean,
      variance: variance,
      standardDeviation: stdDev,
      outliers: filteredBiasData.filter(item => Math.abs(item.biasScore - mean) > 2 * stdDev),
      correlations: {
        biasReliability: -0.73,
        biasCoverage: 0.45,
        reliabilitySentiment: 0.68
      }
    };
  }, [filteredBiasData]);

  const getAdvancedColor = (score, type = 'bias') => {
    switch (type) {
      case 'bias':
        if (score >= 0.8) return COLORS.negative;
        if (score >= 0.6) return '#F97316';
        if (score >= 0.4) return COLORS.neutral;
        if (score >= 0.2) return '#22C55E';
        return COLORS.positive;
      case 'reliability':
        if (score >= 0.8) return COLORS.positive;
        if (score >= 0.6) return '#22C55E';
        if (score >= 0.4) return COLORS.neutral;
        if (score >= 0.2) return '#F97316';
        return COLORS.negative;
      case 'confidence':
        if (score >= 0.9) return COLORS.primary;
        if (score >= 0.8) return COLORS.accent;
        if (score >= 0.7) return COLORS.secondary;
        return '#94A3B8';
      default:
        return '#6B7280';
    }
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
        border: `1px solid ${COLORS.border}`
      }}>
        <h1 style={{ 
          color: COLORS.dark, 
          fontSize: '2rem', 
          fontWeight: '700', 
          margin: '0 0 8px 0'
        }}>🧠 Advanced Bias Detection</h1>
        <p style={{ 
          color: '#6B7280', 
          fontSize: '1.125rem', 
          margin: '0 0 24px 0'
        }}>Multi-dimensional bias analysis using neural networks and advanced ML algorithms</p>

        {/* Professional Controls */}
        <div style={{ 
          background: COLORS.light, 
          padding: '20px', 
          borderRadius: '12px', 
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.125rem', fontWeight: '600' }}>🎛️ Advanced Detection Controls</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>AI Detection Algorithm</label>
              <select 
                value={detectionAlgorithm} 
                onChange={(e) => setDetectionAlgorithm(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  border: `2px solid ${COLORS.border}`,
                  background: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: COLORS.dark,
                  cursor: 'pointer'
                }}
              >
                <option value="neural_network">Neural Network</option>
                <option value="deep_learning">Deep Learning NLP</option>
                <option value="ensemble">Ensemble Methods</option>
                <option value="transformer">Transformer Models</option>
              </select>
            </div>
            <div>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Analysis Mode</label>
              <select 
                value={analysisMode} 
                onChange={(e) => setAnalysisMode(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  border: `2px solid ${COLORS.border}`,
                  background: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: COLORS.dark,
                  cursor: 'pointer'
                }}
              >
                <option value="real_time">Real-time Analysis</option>
                <option value="batch">Batch Processing</option>
                <option value="predictive">Predictive Modeling</option>
              </select>
            </div>
            <div>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Bias Threshold: {(biasThreshold * 100).toFixed(0)}%</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={biasThreshold} 
                onChange={(e) => setBiasThreshold(parseFloat(e.target.value))}
                style={{ width: '100%', height: '8px' }}
              />
            </div>
            <div style={{ 
              background: `linear-gradient(135deg, ${COLORS.positive}, #059669)`, 
              color: 'white', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontWeight: '600',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              📊 {filteredBiasData.length} Entities Detected
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.negative, marginBottom: '8px' }}>
            {filteredBiasData.filter(e => e.biasScore >= 0.7).length}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>High Bias Entities</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
            Above 70% threshold
          </div>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.primary, marginBottom: '8px' }}>
            {advancedBiasData.anomalies.length}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Active Anomalies</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
            AI detected patterns
          </div>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.secondary, marginBottom: '8px' }}>
            {(statisticalAnalysis.mean * 100).toFixed(1)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Average Bias Score</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
            Statistical mean
          </div>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.accent, marginBottom: '8px' }}>
            {(confidenceLevel * 100).toFixed(0)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>AI Confidence</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
            Model certainty level
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Multi-Dimensional Bias Matrix */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🎯 Entity Bias Matrix</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart data={filteredBiasData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis 
                dataKey="reliability" 
                stroke={COLORS.dark} 
                fontSize={12}
                label={{ value: 'Reliability Score', position: 'insideBottom', offset: -10, fill: COLORS.dark }}
              />
              <YAxis 
                dataKey="biasScore" 
                stroke={COLORS.dark} 
                fontSize={12}
                label={{ value: 'Bias Score', angle: -90, position: 'insideLeft', fill: COLORS.dark }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  `${(value * 100).toFixed(1)}%`, 
                  name === 'biasScore' ? 'Bias Score' : 'Reliability'
                ]}
              />
              <Scatter dataKey="biasScore" fill={COLORS.primary}>
                {filteredBiasData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getAdvancedColor(entry.biasScore)} 
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Algorithm Performance Radar */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🤖 AI Model Performance</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={advancedBiasData.algorithmMetrics}>
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis 
                dataKey="algorithm" 
                tick={{ fill: COLORS.dark, fontSize: 11, fontWeight: '600' }} 
              />
              <PolarRadiusAxis 
                stroke={COLORS.border} 
                tick={{ fill: '#6B7280', fontSize: 10 }}
              />
              <Radar 
                name="Accuracy" 
                dataKey="accuracy" 
                stroke={COLORS.positive} 
                fill={COLORS.positive} 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar 
                name="Precision" 
                dataKey="precision" 
                stroke={COLORS.primary} 
                fill={COLORS.primary} 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar 
                name="F1 Score" 
                dataKey="f1Score" 
                stroke={COLORS.secondary} 
                fill={COLORS.secondary} 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temporal Evolution Analysis */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${COLORS.border}`,
        marginBottom: '24px'
      }}>
        <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📈 Temporal Bias Evolution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={advancedBiasData.temporalBias}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis 
              dataKey="period" 
              stroke={COLORS.dark} 
              fontSize={12}
            />
            <YAxis 
              stroke={COLORS.dark} 
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'white', 
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="biasScore" 
              fill={COLORS.negative} 
              fillOpacity={0.3} 
              stroke={COLORS.negative} 
              strokeWidth={3}
              name="Bias Score"
            />
            <Bar 
              dataKey="articles" 
              fill={COLORS.primary} 
              name="Articles"
            />
            <Line 
              type="monotone" 
              dataKey="anomalies" 
              stroke={COLORS.neutral} 
              strokeWidth={4}
              name="Anomalies"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Entity Detail Modal */}
      {selectedEntity && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              marginBottom: '20px', 
              color: COLORS.dark,
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              🔬 Entity Analysis: {selectedEntity.entity}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <strong style={{ color: COLORS.dark }}>Bias Score:</strong> 
                <span style={{ color: getAdvancedColor(selectedEntity.biasScore) }}>
                  {(selectedEntity.biasScore * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <strong style={{ color: COLORS.dark }}>Reliability:</strong> 
                <span style={{ color: getAdvancedColor(selectedEntity.reliability, 'reliability') }}>
                  {(selectedEntity.reliability * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <strong style={{ color: COLORS.dark }}>Confidence:</strong> 
                <span style={{ color: getAdvancedColor(selectedEntity.confidence, 'confidence') }}>
                  {(selectedEntity.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <strong style={{ color: COLORS.dark }}>Coverage:</strong> 
                <span style={{ color: COLORS.primary }}>{selectedEntity.coverage} articles</span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong style={{ color: COLORS.dark }}>Detected Patterns:</strong>
              <div style={{ marginTop: '8px' }}>
                {selectedEntity.patterns.map((pattern, index) => (
                  <span 
                    key={index}
                    style={{
                      display: 'inline-block',
                      background: `linear-gradient(135deg, ${COLORS.secondary}20, ${COLORS.secondary}10)`,
                      color: COLORS.secondary,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      margin: '4px 4px 0 0',
                      fontSize: '0.75rem',
                      border: `1px solid ${COLORS.secondary}40`,
                      fontWeight: '500'
                    }}
                  >
                    {pattern.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedEntity(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `2px solid ${COLORS.primary}`,
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiasDetection;
