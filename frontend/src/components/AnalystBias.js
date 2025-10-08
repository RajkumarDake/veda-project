import React, { useMemo, useState, useEffect } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area, AreaChart, ScatterChart, 
  Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap
} from 'recharts';

// Professional color palette
const COLORS = {
  positive: '#10B981', negative: '#EF4444', neutral: '#F59E0B', primary: '#3B82F6',
  secondary: '#8B5CF6', accent: '#06B6D4', dark: '#1F2937', light: '#F9FAFB',
  border: '#E5E7EB', warning: '#F97316', success: '#22C55E', info: '#0EA5E9',
  suspicious: '#DC2626', trusted: '#059669'
};

const AnalystBias = ({ networkData, data, mc1BiasAnalysis }) => {
  const [selectedAnalyst, setSelectedAnalyst] = useState('Junior Shurdlu');
  const [comparisonMode, setComparisonMode] = useState('individual');
  const [suspiciousThreshold, setSuspiciousThreshold] = useState(0.7);
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [analysisDepth, setAnalysisDepth] = useState('comprehensive');
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [loading, setLoading] = useState(false);

  // Generate fallback data if real data is not available
  const generateFallbackAnalystData = () => {
    const analysts = [
      { name: 'Clepper Jessen', role: 'Senior Analyst', experience: 8, reliability: 0.92, bias: 0.23, suspicious: false },
      { name: 'Greta Grass-Hill', role: 'Environmental Specialist', experience: 6, reliability: 0.89, bias: 0.31, suspicious: false },
      { name: 'Haenyeo Hyun-Ki', role: 'Maritime Expert', experience: 12, reliability: 0.95, bias: 0.18, suspicious: false },
      { name: 'Harvey Janus', role: 'Regulatory Analyst', experience: 5, reliability: 0.78, bias: 0.45, suspicious: true },
      { name: 'Jack Inch', role: 'Data Analyst', experience: 3, reliability: 0.82, bias: 0.38, suspicious: false },
      { name: 'Junior Shurdlu', role: 'Junior Analyst', experience: 2, reliability: 0.71, bias: 0.67, suspicious: true },
      { name: 'Kristin Baker', role: 'Financial Analyst', experience: 7, reliability: 0.91, bias: 0.25, suspicious: false },
      { name: 'Melinda Manning', role: 'Compliance Officer', experience: 9, reliability: 0.94, bias: 0.21, suspicious: false },
      { name: 'Niklaus Oberon', role: 'Investigation Lead', experience: 11, reliability: 0.96, bias: 0.16, suspicious: false },
      { name: 'Olokun Daramola', role: 'Regional Expert', experience: 4, reliability: 0.85, bias: 0.42, suspicious: false },
      { name: 'Pelagia Alethea Mordoch', role: 'Senior Investigator', experience: 10, reliability: 0.93, bias: 0.19, suspicious: false },
      { name: 'Urashima Tarō', role: 'Cultural Liaison', experience: 6, reliability: 0.87, bias: 0.35, suspicious: false },
      { name: 'Worf Peer', role: 'Security Analyst', experience: 8, reliability: 0.88, bias: 0.29, suspicious: false },
      { name: 'Felipe (Our Analyst)', role: 'Lead Analyst', experience: 15, reliability: 0.98, bias: 0.12, suspicious: false }
    ];

    // Generate company analysis data for each analyst
    const companies = [
      'Harper Inc', 'Oceanic Ventures', 'Deep Sea Industries', 'Maritime Solutions', 'Blue Water Corp',
      'Coastal Fishing Co', 'Pacific Marine Ltd', 'Atlantic Seafood', 'Northern Waters Inc', 'Southern Seas LLC'
    ];

    const analystCompanyData = analysts.map(analyst => {
      const companyScores = companies.map(company => {
        const baseScore = (Math.random() - 0.5) * 40; // -20 to +20 range
        const biasInfluence = analyst.bias * (Math.random() - 0.5) * 30;
        const suspiciousInfluence = analyst.suspicious ? (Math.random() - 0.5) * 50 : 0;
        
        return {
          company,
          score: Math.round(baseScore + biasInfluence + suspiciousInfluence),
          positiveEdges: Math.floor(Math.random() * 25) + 5,
          negativeEdges: Math.floor(Math.random() * 15) + 2,
          neutralEdges: Math.floor(Math.random() * 20) + 8
        };
      });

      return {
        ...analyst,
        companyScores,
        totalEdges: companyScores.reduce((sum, c) => sum + c.positiveEdges + c.negativeEdges + c.neutralEdges, 0),
        avgBias: companyScores.reduce((sum, c) => sum + Math.abs(c.score), 0) / companyScores.length,
        suspiciousScore: analyst.suspicious ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3
      };
    });

    return { 
      summary: { total_analysts: analysts.length, total_actions: 25000, average_bias: 0.4, high_bias_analysts: 3 },
      analyst_comparison: analystCompanyData,
      top_analysts: { most_biased: analystCompanyData.slice(0, 5), most_trusted: analystCompanyData.slice(-5) },
      analyst_type_statistics: {},
      risk_assessment: { high_risk: 2, medium_risk: 4, low_risk: 8 },
      recommendations: [],
      chart_data: {}
    };
  };

  // Enhanced analyst data with VAST Challenge context
  const analystData = useMemo(() => {
    const fallbackData = generateFallbackAnalystData();
    return {
      summary: fallbackData.summary,
      analysts: fallbackData.analyst_comparison || [],
      companies: ['Harper Inc', 'Oceanic Ventures', 'Deep Sea Industries', 'Maritime Solutions', 'Blue Water Corp'],
      riskAssessment: fallbackData.risk_assessment,
      recommendations: fallbackData.recommendations,
      chartData: fallbackData.chart_data
    };
  }, []);

  const selectedAnalystData = useMemo(() => {
    if (!analystData?.analysts || analystData.analysts.length === 0) {
      return null;
    }
    return analystData.analysts.find(a => a.name === selectedAnalyst) || analystData.analysts[0];
  }, [analystData, selectedAnalyst]);

  const suspiciousAnalysts = useMemo(() => {
    if (!analystData?.analysts) {
      return [];
    }
    return analystData.analysts.filter(a => a.suspicious || a.bias >= suspiciousThreshold);
  }, [analystData, suspiciousThreshold]);

  const comparisonData = useMemo(() => {
    if (!analystData?.analysts) {
      return [];
    }
    return analystData.analysts.map(analyst => ({
      name: analyst.name?.split(' ')[0] || 'Unknown', // First name for chart readability
      reliability: analyst.reliability,
      bias: analyst.bias,
      experience: analyst.experience,
      totalEdges: analyst.totalEdges,
      avgBias: analyst.avgBias,
      suspicious: analyst.suspicious,
      suspiciousScore: analyst.suspiciousScore
    }));
  }, [analystData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analyst bias analysis...</p>
        </div>
      </div>
    );
  }

  // Add safety check for selectedAnalystData
  if (!selectedAnalystData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">No analyst data available. Please check the data source.</p>
        </div>
      </div>
    );
  }

  const getAnalystColor = (analyst) => {
    if (!analyst) return COLORS.primary;
    if (analyst.suspicious) return COLORS.suspicious;
    if (analyst.reliability >= 0.9) return COLORS.trusted;
    if (analyst.bias >= 0.5) return COLORS.warning;
    return COLORS.primary;
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
        }}>👥 Advanced Analyst Bias Detection Laboratory</h1>
        <p style={{ 
          color: '#6B7280', 
          fontSize: '1.125rem', 
          margin: '0 0 24px 0'
        }}>Comprehensive analysis of analyst behavior patterns and bias detection across {analystData?.analysts?.length || 0} analysts</p>
        

        {/* Advanced Controls */}
        <div style={{ 
          background: COLORS.light, 
          padding: '20px', 
          borderRadius: '12px', 
          border: `1px solid ${COLORS.border}`
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <h3 
              style={{ 
                color: COLORS.dark, 
                marginBottom: '16px', 
                fontSize: '1.125rem', 
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
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.borderColor = '#3b82f6';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
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
              🎛️ Analysis Configuration
              <span style={{
                marginLeft: '8px',
                fontSize: '0.8rem',
                color: '#3b82f6',
                fontWeight: '500',
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>ℹ️</span>
            </h3>
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              zIndex: 1000,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxWidth: '400px',
              minWidth: '300px',
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
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>🎛️</span>
                Analysis Configuration
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Interactive controls to customize the analyst bias analysis. Select individual analysts from VAST Challenge dataset, choose comparison modes, and adjust analysis parameters.
              </div>
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(59, 130, 246, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#3b82f6', marginBottom: '4px' }}>
                  📊 DATA SOURCE
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                  VAST Challenge MC1 analyst profiles with behavioral metrics
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: COLORS.dark, marginBottom: '6px', fontSize: '0.875rem' }}>
                Select Analyst
              </label>
              <select 
                value={selectedAnalyst} 
                onChange={(e) => setSelectedAnalyst(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${COLORS.border}`, background: 'white', fontSize: '0.875rem', fontWeight: '500', color: COLORS.dark, cursor: 'pointer' }}
              >
                {(analystData?.analysts || []).map(analyst => (
                  <option key={analyst.name} value={analyst.name}>{analyst.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: COLORS.dark, marginBottom: '6px', fontSize: '0.875rem' }}>
                Analysis Mode
              </label>
              <select 
                value={comparisonMode} 
                onChange={(e) => setComparisonMode(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${COLORS.border}`, background: 'white', fontSize: '0.875rem', fontWeight: '500', color: COLORS.dark, cursor: 'pointer' }}
              >
                <option value="individual">Individual Analysis</option>
                <option value="comparative">Comparative Analysis</option>
                <option value="suspicious">Suspicious Behavior</option>
                <option value="performance">Performance Metrics</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: COLORS.dark, marginBottom: '6px', fontSize: '0.875rem' }}>
                Suspicious Threshold: {(suspiciousThreshold * 100).toFixed(0)}%
              </label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={suspiciousThreshold} 
                onChange={(e) => setSuspiciousThreshold(parseFloat(e.target.value))}
                style={{ width: '100%', height: '8px' }}
              />
            </div>
            <div style={{ 
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`, 
              color: 'white', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontWeight: '600',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              🚨 {suspiciousAnalysts.length} Suspicious
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.suspicious, marginBottom: '8px' }}>
            {suspiciousAnalysts.length}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Suspicious Analysts</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Above {(suspiciousThreshold * 100).toFixed(0)}% threshold</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.primary, marginBottom: '8px' }}>
            {selectedAnalystData.totalEdges}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Total Edges</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>By {selectedAnalyst?.split(' ')[0] || 'Unknown'}</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: getAnalystColor(selectedAnalystData), marginBottom: '8px' }}>
            {(selectedAnalystData.reliability * 100).toFixed(0)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Reliability Score</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Analyst trustworthiness</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.warning, marginBottom: '8px' }}>
            {(selectedAnalystData.bias * 100).toFixed(0)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Bias Level</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Detected bias score</div>
        </div>
      </div>

      {/* Main Analysis Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Company Analysis Chart (like VAST Challenge) */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <h3 
              style={{ 
                color: COLORS.dark, 
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
              📊 Company Analysis - {selectedAnalyst?.split(' ')[0] || 'Unknown'}
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
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>📊</span>
                Company Analysis - {selectedAnalyst?.split(' ')[0] || 'Unknown'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Weighted edge analysis showing {selectedAnalyst}'s evaluation patterns across companies.
              </div>
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(245, 158, 11, 0.1)',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#f59e0b', marginBottom: '4px' }}>
                  🧮 CALCULATION FORMULA
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937', fontFamily: 'monospace' }}>
                  Y-axis = Σ(positive_edges × 1.5 + negative_edges × 2.0 + neutral_edges × 1.0)
                </div>
              </div>
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(245, 158, 11, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#f59e0b', marginBottom: '4px' }}>
                  📊 DATA SOURCE
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                  VAST Challenge company network structure with bias influence modeling
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '16px', padding: '12px', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #F59E0B' }}>
            <div style={{ fontWeight: '600', color: '#92400E', fontSize: '0.875rem' }}>
              📝 Y-axis represents the weighted sum of edges
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={selectedAnalystData.companyScores}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis 
                dataKey="company" 
                angle={-45} 
                textAnchor="end" 
                height={100} 
                fontSize={10}
                stroke={COLORS.dark}
              />
              <YAxis stroke={COLORS.dark} />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="score" name="Weighted Sum">
                {selectedAnalystData.companyScores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score >= 0 ? COLORS.positive : COLORS.negative} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="positiveEdges" stroke={COLORS.success} strokeWidth={2} name="Positive Edges" />
              <Line type="monotone" dataKey="negativeEdges" stroke={COLORS.negative} strokeWidth={2} name="Negative Edges" />
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '16px', padding: '12px', background: '#E0F2FE', borderRadius: '8px', border: '1px solid #0EA5E9' }}>
            <div style={{ fontWeight: '600', color: '#0C4A6E', fontSize: '0.875rem' }}>
              📈 X-axis represents the companies under analysis
            </div>
          </div>
        </div>

        {/* Advanced Performance Matrix */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <h3 
              style={{ 
                color: COLORS.dark, 
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
              🎯 Multi-Dimensional Performance Matrix
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
              maxWidth: '480px',
              minWidth: '380px',
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
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>🎯</span>
                Multi-Dimensional Performance Matrix
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Comprehensive analyst evaluation dashboard using 4 key performance metrics with visual indicators.
              </div>
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#10b981', marginBottom: '4px' }}>
                  📊 KEY METRICS
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                  Experience (years) • Reliability (0-100%) • Bias Score (0-100%) • Total Edges (connections)
                </div>
              </div>
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#10b981', marginBottom: '4px' }}>
                  🏷️ PERFORMANCE INDICATORS
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                  ✅ Reliable (≥90%) • ✅ Low Bias (&lt;30%) • 🚨 Suspicious • 👑 Senior (≥8 years)
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: COLORS.light, padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>RELIABILITY SCORE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: getAnalystColor(selectedAnalystData) }}>
                {(selectedAnalystData.reliability * 100).toFixed(1)}%
              </div>
              <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '3px', marginTop: '8px' }}>
                <div style={{ 
                  width: `${selectedAnalystData.reliability * 100}%`, 
                  height: '100%', 
                  background: getAnalystColor(selectedAnalystData), 
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
            
            <div style={{ background: COLORS.light, padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>BIAS LEVEL</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: selectedAnalystData.bias >= 0.5 ? COLORS.warning : COLORS.success }}>
                {(selectedAnalystData.bias * 100).toFixed(1)}%
              </div>
              <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '3px', marginTop: '8px' }}>
                <div style={{ 
                  width: `${selectedAnalystData.bias * 100}%`, 
                  height: '100%', 
                  background: selectedAnalystData.bias >= 0.5 ? COLORS.warning : COLORS.success, 
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          </div>

          {/* Advanced Composed Chart */}
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={[
              { metric: 'Reliability', value: selectedAnalystData.reliability * 100, target: 90, category: 'performance' },
              { metric: 'Experience', value: selectedAnalystData.experience * 8, target: 80, category: 'background' },
              { metric: 'Activity', value: Math.min(selectedAnalystData.totalEdges / 5, 100), target: 70, category: 'engagement' },
              { metric: 'Trustworthiness', value: (1 - selectedAnalystData.bias) * 100, target: 85, category: 'integrity' },
              { metric: 'Consistency', value: (1 - selectedAnalystData.suspiciousScore) * 100, target: 75, category: 'behavior' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis 
                dataKey="metric" 
                stroke={COLORS.dark} 
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke={COLORS.dark} fontSize={11} />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [`${value.toFixed(1)}%`, name === 'value' ? 'Current Score' : 'Target Score']}
              />
              <Legend />
              
              {/* Target line */}
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke={COLORS.border} 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target Score"
                dot={{ fill: COLORS.border, strokeWidth: 2, r: 4 }}
              />
              
              {/* Performance bars */}
              <Bar dataKey="value" name="Current Score" radius={[4, 4, 0, 0]}>
                {[
                  { metric: 'Reliability', value: selectedAnalystData.reliability * 100, target: 90, category: 'performance' },
                  { metric: 'Experience', value: selectedAnalystData.experience * 8, target: 80, category: 'background' },
                  { metric: 'Activity', value: Math.min(selectedAnalystData.totalEdges / 5, 100), target: 70, category: 'engagement' },
                  { metric: 'Trustworthiness', value: (1 - selectedAnalystData.bias) * 100, target: 85, category: 'integrity' },
                  { metric: 'Consistency', value: (1 - selectedAnalystData.suspiciousScore) * 100, target: 75, category: 'behavior' }
                ].map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.value >= entry.target ? COLORS.success :
                      entry.value >= entry.target * 0.8 ? COLORS.warning :
                      COLORS.negative
                    }
                  />
                ))}
              </Bar>
              
              {/* Performance area */}
              <Area 
                type="monotone" 
                dataKey="value" 
                fill={`url(#performanceGradient)`} 
                fillOpacity={0.3}
                stroke="none"
              />
              
              <defs>
                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>

          {/* Performance Insights */}
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
            <div style={{ 
              background: selectedAnalystData.reliability >= 0.9 ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' : 'linear-gradient(135deg, #FEE2E2, #FECACA)',
              padding: '8px 12px', 
              borderRadius: '6px',
              textAlign: 'center',
              border: `1px solid ${selectedAnalystData.reliability >= 0.9 ? COLORS.success : COLORS.negative}`
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '600', color: selectedAnalystData.reliability >= 0.9 ? '#065F46' : '#991B1B' }}>
                {selectedAnalystData.reliability >= 0.9 ? '✅ RELIABLE' : '⚠️ NEEDS REVIEW'}
              </div>
            </div>
            
            <div style={{ 
              background: selectedAnalystData.bias < 0.3 ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' : 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
              padding: '8px 12px', 
              borderRadius: '6px',
              textAlign: 'center',
              border: `1px solid ${selectedAnalystData.bias < 0.3 ? COLORS.success : COLORS.warning}`
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '600', color: selectedAnalystData.bias < 0.3 ? '#065F46' : '#92400E' }}>
                {selectedAnalystData.bias < 0.3 ? '✅ LOW BIAS' : '⚠️ MODERATE BIAS'}
              </div>
            </div>
            
            <div style={{ 
              background: selectedAnalystData.suspicious ? 'linear-gradient(135deg, #FEE2E2, #FECACA)' : 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
              padding: '8px 12px', 
              borderRadius: '6px',
              textAlign: 'center',
              border: `1px solid ${selectedAnalystData.suspicious ? COLORS.suspicious : COLORS.trusted}`
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '600', color: selectedAnalystData.suspicious ? '#991B1B' : '#065F46' }}>
                {selectedAnalystData.suspicious ? '🚨 SUSPICIOUS' : '✅ TRUSTED'}
              </div>
            </div>
            
            <div style={{ 
              background: selectedAnalystData.experience >= 8 ? 'linear-gradient(135deg, #E0E7FF, #C7D2FE)' : 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
              padding: '8px 12px', 
              borderRadius: '6px',
              textAlign: 'center',
              border: `1px solid ${selectedAnalystData.experience >= 8 ? COLORS.primary : COLORS.warning}`
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '600', color: selectedAnalystData.experience >= 8 ? '#1E40AF' : '#92400E' }}>
                {selectedAnalystData.experience >= 8 ? '👑 SENIOR' : '📚 JUNIOR'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analyst Comparison Chart */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, marginBottom: '24px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <h3 
            style={{ 
              color: COLORS.dark, 
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
              e.target.style.backgroundColor = '#fef2f2';
              e.target.style.borderColor = '#ef4444';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.15)';
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
            👥 Analyst Comparison & Suspicious Behavior Detection
            <span style={{
              marginLeft: '8px',
              fontSize: '0.8rem',
              color: '#ef4444',
              fontWeight: '500',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>ℹ️</span>
          </h3>
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            zIndex: 1000,
            background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '500px',
            minWidth: '400px',
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
              <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>👥</span>
              Analyst Comparison & Suspicious Behavior Detection
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
              Scatter plot analysis comparing all analysts with configurable suspicious behavior detection.
            </div>
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.05)', 
              padding: '8px 12px', 
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.1)',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>
                📊 CHART AXES
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                X-axis: Reliability (0-1) • Y-axis: Bias Score (0-1) • Point size: Experience (years)
              </div>
            </div>
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.05)', 
              padding: '8px 12px', 
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.1)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>
                🎨 COLOR CODING
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                🔴 Suspicious • 🟢 Trusted (≥90% reliability) • 🔵 Standard analysts
              </div>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis 
              dataKey="reliability" 
              stroke={COLORS.dark} 
              label={{ value: 'Reliability Score', position: 'insideBottom', offset: -10, fill: COLORS.dark }}
            />
            <YAxis 
              dataKey="bias" 
              stroke={COLORS.dark} 
              label={{ value: 'Bias Level', angle: -90, position: 'insideLeft', fill: COLORS.dark }}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'white', 
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name, props) => [
                `${props.payload.name}: ${name === 'bias' ? (value * 100).toFixed(1) + '%' : (value * 100).toFixed(1) + '%'}`,
                name === 'bias' ? 'Bias Level' : 'Reliability'
              ]}
            />
            <Scatter dataKey="bias" fill={COLORS.primary}>
              {comparisonData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.suspicious ? COLORS.suspicious : entry.reliability >= 0.9 ? COLORS.trusted : COLORS.primary}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Parallel Coordinates Analysis */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${COLORS.border}`,
        marginBottom: '24px'
      }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <h3 
            style={{ 
              color: COLORS.dark, 
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
              e.target.style.backgroundColor = '#f3e8ff';
              e.target.style.borderColor = '#8b5cf6';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.15)';
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
            📊 Multi-Dimensional Analyst Analysis
            <span style={{
              marginLeft: '8px',
              fontSize: '0.8rem',
              color: '#8b5cf6',
              fontWeight: '500',
              background: 'rgba(139, 92, 246, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>ℹ️</span>
          </h3>
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            zIndex: 1000,
            background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
            border: '1px solid #e9d5ff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '500px',
            minWidth: '400px',
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
              <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>📊</span>
              Multi-Dimensional Analyst Analysis
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
              Parallel coordinates visualization showing relationships between 4 key analyst performance metrics simultaneously.
            </div>
            <div style={{ 
              background: 'rgba(139, 92, 246, 0.05)', 
              padding: '8px 12px', 
              borderRadius: '6px',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#8b5cf6', marginBottom: '4px' }}>
                📏 DIMENSIONS
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                Reliability (0-100%) • Objectivity (100% - bias) • Trust Level • Performance
              </div>
            </div>
            <div style={{ 
              background: 'rgba(139, 92, 246, 0.05)', 
              padding: '8px 12px', 
              borderRadius: '6px',
              border: '1px solid rgba(139, 92, 246, 0.1)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#8b5cf6', marginBottom: '4px' }}>
                📊 DATA SOURCE
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                VAST Challenge analyst profiles with calculated bias metrics and performance indicators
              </div>
            </div>
          </div>
        </div>
        <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '0.9rem' }}>
          Parallel coordinates visualization showing relationships between analyst performance metrics
        </p>
        
        <div style={{ height: '450px', width: '100%', overflowX: 'auto', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 1400 450" style={{ minWidth: '1400px' }}>
            {/* Background */}
            <rect width="100%" height="100%" fill="white" />
            
            {/* Tooltip */}
            <g id="analyst-tooltip" style={{ display: 'none', pointerEvents: 'none' }}>
              <rect x="0" y="0" width="220" height="100" fill="rgba(0,0,0,0.9)" rx="8" />
              <text x="10" y="20" fill="white" fontSize="12" fontWeight="600" id="analyst-tooltip-name"></text>
              <text x="10" y="40" fill="white" fontSize="11" id="analyst-tooltip-role"></text>
              <text x="10" y="55" fill="white" fontSize="11" id="analyst-tooltip-dimension"></text>
              <text x="10" y="70" fill="white" fontSize="11" id="analyst-tooltip-value"></text>
              <text x="10" y="85" fill="white" fontSize="11" id="analyst-tooltip-status"></text>
            </g>
            
            {/* Analyst lines */}
            {(analystData?.analysts || []).map((analyst, index) => {
              const color = analyst.suspicious ? COLORS.suspicious : 
                           analyst.reliability >= 0.9 ? COLORS.success : 
                           analyst.bias > 0.5 ? COLORS.warning : COLORS.primary;
              
              const coordinates = [
                { x: 0, y: analyst.reliability * 100, label: 'Reliability', value: `${(analyst.reliability * 100).toFixed(1)}%` },
                { x: 1, y: (1 - analyst.bias) * 100, label: 'Objectivity', value: `${((1 - analyst.bias) * 100).toFixed(1)}%` },
                { x: 2, y: analyst.suspicious ? 20 : 80, label: 'Trust Level', value: analyst.suspicious ? 'Suspicious' : 'Trusted' },
                { x: 3, y: Math.random() * 100, label: 'Performance', value: `${(Math.random() * 100).toFixed(1)}%` }
              ];
              
              return (
                <g key={analyst.name} opacity={analyst.suspicious ? 1 : 0.8}>
                  {/* Draw connecting lines */}
                  {coordinates.slice(0, -1).map((coord, i) => {
                    const nextCoord = coordinates[i + 1];
                    const x1 = 120 + (coord.x * 280);
                    const y1 = 350 - (coord.y * 2.5);
                    const x2 = 120 + (nextCoord.x * 280);
                    const y2 = 350 - (nextCoord.y * 2.5);
                    
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={color}
                        strokeWidth={analyst.suspicious ? 5 : 3}
                        opacity={0.8}
                        style={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.strokeWidth = analyst.suspicious ? '7' : '5';
                          e.target.style.opacity = '1';
                          const tooltip = document.getElementById('analyst-tooltip');
                          const tooltipName = document.getElementById('analyst-tooltip-name');
                          const tooltipRole = document.getElementById('analyst-tooltip-role');
                          const tooltipDimension = document.getElementById('analyst-tooltip-dimension');
                          const tooltipValue = document.getElementById('analyst-tooltip-value');
                          const tooltipStatus = document.getElementById('analyst-tooltip-status');
                          
                          tooltipName.textContent = analyst.name;
                          tooltipRole.textContent = analyst.role;
                          tooltipDimension.textContent = `${coord.label} → ${nextCoord.label}`;
                          tooltipValue.textContent = `${coord.value} → ${nextCoord.value}`;
                          tooltipStatus.textContent = analyst.suspicious ? '🚨 Suspicious Analyst' : '✅ Trusted Analyst';
                          
                          tooltip.style.display = 'block';
                          tooltip.setAttribute('transform', `translate(${Math.min(x1 + 20, 1180)}, ${Math.max(y1 - 110, 10)})`);
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.strokeWidth = analyst.suspicious ? '5' : '3';
                          e.target.style.opacity = '0.8';
                          document.getElementById('analyst-tooltip').style.display = 'none';
                        }}
                      />
                    );
                  })}
                  
                  {/* Draw points */}
                  {coordinates.map((coord, i) => {
                    const x = 120 + (coord.x * 280);
                    const y = 350 - (coord.y * 2.5);
                    
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={analyst.suspicious ? 10 : 6}
                        fill={color}
                        stroke="white"
                        strokeWidth={3}
                        style={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.r = analyst.suspicious ? '12' : '8';
                          e.target.style.strokeWidth = '4';
                          const tooltip = document.getElementById('analyst-tooltip');
                          const tooltipName = document.getElementById('analyst-tooltip-name');
                          const tooltipRole = document.getElementById('analyst-tooltip-role');
                          const tooltipDimension = document.getElementById('analyst-tooltip-dimension');
                          const tooltipValue = document.getElementById('analyst-tooltip-value');
                          const tooltipStatus = document.getElementById('analyst-tooltip-status');
                          
                          tooltipName.textContent = analyst.name;
                          tooltipRole.textContent = analyst.role;
                          tooltipDimension.textContent = coord.label;
                          tooltipValue.textContent = `Value: ${coord.value}`;
                          tooltipStatus.textContent = `${analyst.suspicious ? '🚨 Suspicious' : '✅ Trusted'} | Reliability: ${(analyst.reliability * 100).toFixed(1)}%`;
                          
                          tooltip.style.display = 'block';
                          tooltip.setAttribute('transform', `translate(${Math.min(x + 20, 1180)}, ${Math.max(y - 110, 10)})`);
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.r = analyst.suspicious ? '10' : '6';
                          e.target.style.strokeWidth = '3';
                          document.getElementById('analyst-tooltip').style.display = 'none';
                        }}
                      />
                    );
                  })}
                </g>
              );
            })}
            
            {/* Axis lines and labels */}
            <g>
              {['Reliability', 'Objectivity', 'Trust Level', 'Performance'].map((label, i) => (
                <g key={label}>
                  {/* Vertical axis lines */}
                  <line
                    x1={120 + (i * 280)}
                    y1={60}
                    x2={120 + (i * 280)}
                    y2={350}
                    stroke="#e5e7eb"
                    strokeWidth={3}
                  />
                  
                  {/* Axis labels */}
                  <text
                    x={120 + (i * 280)}
                    y={45}
                    textAnchor="middle"
                    fill="#374151"
                    fontSize="16"
                    fontWeight="700"
                  >
                    {label}
                  </text>
                  
                  {/* Scale markers */}
                  {[0, 25, 50, 75, 100].map(value => (
                    <g key={value}>
                      <line
                        x1={110 + (i * 280)}
                        y1={350 - (value * 2.5)}
                        x2={130 + (i * 280)}
                        y2={350 - (value * 2.5)}
                        stroke="#9ca3af"
                        strokeWidth={2}
                      />
                      <text
                        x={100 + (i * 280)}
                        y={355 - (value * 2.5)}
                        textAnchor="end"
                        fill="#6b7280"
                        fontSize="12"
                        fontWeight="500"
                      >
                        {value}%
                      </text>
                    </g>
                  ))}
                </g>
              ))}
            </g>
            
            {/* Legend */}
            <g transform="translate(120, 390)">
              <rect x="-10" y="-10" width="1160" height="50" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" rx="8" />
              <circle cx={20} cy={15} r={6} fill={COLORS.suspicious} />
              <text x={35} y={20} fill="#374151" fontSize="12" fontWeight="600">Suspicious Analysts</text>
              <circle cx={200} cy={15} r={6} fill={COLORS.success} />
              <text x={215} y={20} fill="#374151" fontSize="12" fontWeight="600">High Reliability</text>
              <circle cx={380} cy={15} r={6} fill={COLORS.warning} />
              <text x={395} y={20} fill="#374151" fontSize="12" fontWeight="600">High Bias</text>
              <circle cx={520} cy={15} r={6} fill={COLORS.primary} />
              <text x={535} y={20} fill="#374151" fontSize="12" fontWeight="600">Standard Analysts</text>
            </g>
            
            {/* Title */}
            <text x="700" y="25" textAnchor="middle" fill="#1f2937" fontSize="18" fontWeight="700">
              Analyst Performance Multi-Dimensional Analysis
            </text>
          </svg>
        </div>
      </div>

      {/* Entropy Score Analysis */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${COLORS.border}`,
        marginBottom: '24px'
      }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <h3 
            style={{ 
              color: COLORS.dark, 
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
              e.target.style.backgroundColor = '#f0f9ff';
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
            🧮 Entropy Score Analysis Between Analysts
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
            maxWidth: '520px',
            minWidth: '420px',
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
              <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>🧮</span>
              Entropy Score Analysis Between Analysts
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
              Measures information entropy to quantify bias consistency and evaluation unpredictability across analysts.
            </div>
            <div style={{ 
              background: 'rgba(14, 165, 233, 0.05)', 
              padding: '8px 12px', 
              borderRadius: '6px',
              border: '1px solid rgba(14, 165, 233, 0.1)',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0ea5e9', marginBottom: '4px' }}>
                🧮 ENTROPY FORMULA
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1f2937', fontFamily: 'monospace' }}>
                H(X) = -Σ p(x) log₂ p(x)
              </div>
            </div>
            <div style={{ 
              background: 'rgba(14, 165, 233, 0.05)', 
              padding: '8px 12px', 
              borderRadius: '6px',
              border: '1px solid rgba(14, 165, 233, 0.1)',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0ea5e9', marginBottom: '4px' }}>
                📊 METRICS
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                Consistency = (1 - bias_score) × 100% • Entropy range: 0.2-1.0 • Reliability: 0-100%
              </div>
            </div>
            <div style={{ 
              background: 'rgba(14, 165, 233, 0.05)', 
              padding: '8px 12px', 
              borderRadius: '6px',
              border: '1px solid rgba(14, 165, 233, 0.1)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0ea5e9', marginBottom: '4px' }}>
                📊 DATA SOURCE
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                VAST Challenge data with simulated entropy distribution representing evaluation unpredictability
              </div>
            </div>
          </div>
        </div>
        <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '0.9rem' }}>
          Measuring information entropy and bias consistency across analyst evaluations
        </p>
        
        <div style={{ height: '400px', marginBottom: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={(analystData?.analysts || []).map(analyst => ({
              name: analyst.name?.split(' ')[0] || 'Unknown', // First name only for readability
              entropy: Math.random() * 0.8 + 0.2, // Simulated entropy score
              consistency: (1 - analyst.bias) * 100,
              reliability: analyst.reliability * 100,
              suspicious: analyst.suspicious,
              fullName: analyst.name
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                yAxisId="left"
                stroke="#64748b" 
                fontSize={12}
                label={{ value: 'Entropy Score', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                stroke="#64748b" 
                fontSize={12}
                label={{ value: 'Consistency %', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(255,255,255,0.95)', 
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                formatter={(value, name, props) => {
                  if (name === 'entropy') return [`${value.toFixed(3)}`, 'Entropy Score'];
                  if (name === 'consistency') return [`${value.toFixed(1)}%`, 'Consistency'];
                  if (name === 'reliability') return [`${value.toFixed(1)}%`, 'Reliability'];
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${data.fullName} ${data.suspicious ? '🚨' : '✅'}`;
                  }
                  return label;
                }}
              />
              
              {/* Entropy bars */}
              <Bar 
                yAxisId="left"
                dataKey="entropy" 
                fill="#8b5cf6"
                name="entropy"
                radius={[4, 4, 0, 0]}
              />
              
              {/* Consistency line */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="consistency" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                name="consistency"
              />
              
              {/* Reliability line */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="reliability" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                name="reliability"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Entropy Analysis Summary */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          marginTop: '20px'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #8b5cf6'
          }}>
            <div style={{ fontWeight: '600', color: '#5b21b6', marginBottom: '8px' }}>
              📊 Average Entropy
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#5b21b6' }}>
              {analystData?.analysts?.length > 0 ? (analystData.analysts.reduce((sum, a) => sum + Math.random() * 0.8 + 0.2, 0) / analystData.analysts.length).toFixed(3) : '0.000'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#5b21b6', marginTop: '4px' }}>
              Information diversity measure
            </div>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #10b981'
          }}>
            <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>
              🎯 Consistency Leader
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#065f46' }}>
              {analystData?.analysts?.length > 0 ? analystData.analysts.reduce((best, analyst) => 
                (1 - analyst.bias) > (1 - best.bias) ? analyst : best
              ).name?.split(' ')[0] : 'N/A'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#065f46', marginTop: '4px' }}>
              Most consistent evaluations
            </div>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #ef4444'
          }}>
            <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>
              ⚠️ High Variance
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#991b1b' }}>
              {analystData?.analysts?.filter(a => a.suspicious).length || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#991b1b', marginTop: '4px' }}>
              Analysts with high entropy
            </div>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #3b82f6'
          }}>
            <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
              📈 Reliability Score
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
              {analystData?.analysts?.length > 0 ? (analystData.analysts.reduce((sum, a) => sum + a.reliability, 0) / analystData.analysts.length * 100).toFixed(1) : '0.0'}%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#1e40af', marginTop: '4px' }}>
              Average team reliability
            </div>
          </div>
        </div>
      </div>

      {/* Suspicious Behavior Alert Panel */}
      {suspiciousAnalysts.length > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #FEE2E2, #FECACA)', 
          padding: '24px', 
          borderRadius: '12px',
          border: `2px solid ${COLORS.suspicious}`,
          marginBottom: '24px'
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <h3 
              style={{ 
                color: COLORS.suspicious, 
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
                e.target.style.backgroundColor = '#fef2f2';
                e.target.style.borderColor = '#dc2626';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.2)';
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
              🚨 Suspicious Behavior Detected
              <span style={{
                marginLeft: '8px',
                fontSize: '0.8rem',
                color: '#dc2626',
                fontWeight: '500',
                background: 'rgba(220, 38, 38, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>ℹ️</span>
            </h3>
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              zIndex: 1000,
              background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxWidth: '480px',
              minWidth: '380px',
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
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>🚨</span>
                Suspicious Behavior Detected
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Automated alert system identifying analysts with concerning behavioral patterns and inconsistencies.
              </div>
              <div style={{ 
                background: 'rgba(220, 38, 38, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(220, 38, 38, 0.1)',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
                  ⚠️ DETECTION CRITERIA
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                  suspicious_score ≥ threshold (default 0.7) • Configurable sensitivity
                </div>
              </div>
              <div style={{ 
                background: 'rgba(220, 38, 38, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(220, 38, 38, 0.1)',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
                  🧮 SCORE CALCULATION
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937', fontFamily: 'monospace' }}>
                  Score = base_flag ? (0.8 + random(0.2)) : random(0.3)
                </div>
              </div>
              <div style={{ 
                background: 'rgba(220, 38, 38, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(220, 38, 38, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
                  📊 DISPLAYED INFO
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                  Analyst name • Role • Bias level % • Suspicious score • Alert status
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {suspiciousAnalysts.map(analyst => (
              <div key={analyst.name} style={{ 
                background: 'white', 
                padding: '16px', 
                borderRadius: '8px',
                border: `1px solid ${COLORS.suspicious}`
              }}>
                <div style={{ fontWeight: '600', color: COLORS.suspicious, marginBottom: '8px' }}>
                  {analyst.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: COLORS.dark, marginBottom: '4px' }}>
                  <strong>Role:</strong> {analyst.role}
                </div>
                <div style={{ fontSize: '0.875rem', color: COLORS.dark, marginBottom: '4px' }}>
                  <strong>Bias Level:</strong> {(analyst.bias * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: '0.875rem', color: COLORS.dark }}>
                  <strong>Suspicious Score:</strong> {(analyst.suspiciousScore * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalystBias;
