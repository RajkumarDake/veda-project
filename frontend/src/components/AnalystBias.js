import React, { useMemo, useState } from 'react';
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

  // Enhanced analyst data with VAST Challenge context
  const analystData = useMemo(() => {
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

    return { analysts: analystCompanyData, companies };
  }, []);

  const selectedAnalystData = useMemo(() => {
    return analystData.analysts.find(a => a.name === selectedAnalyst) || analystData.analysts[0];
  }, [analystData, selectedAnalyst]);

  const suspiciousAnalysts = useMemo(() => {
    return analystData.analysts.filter(a => a.suspiciousScore >= suspiciousThreshold);
  }, [analystData, suspiciousThreshold]);

  const comparisonData = useMemo(() => {
    return analystData.analysts.map(analyst => ({
      name: analyst.name.split(' ')[0], // First name for chart readability
      reliability: analyst.reliability,
      bias: analyst.bias,
      experience: analyst.experience,
      totalEdges: analyst.totalEdges,
      avgBias: analyst.avgBias,
      suspicious: analyst.suspicious,
      suspiciousScore: analyst.suspiciousScore
    }));
  }, [analystData]);

  const getAnalystColor = (analyst) => {
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
        }}>Comprehensive analysis of analyst behavior patterns and bias detection across {analystData.analysts.length} analysts</p>

        {/* Advanced Controls */}
        <div style={{ 
          background: COLORS.light, 
          padding: '20px', 
          borderRadius: '12px', 
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.125rem', fontWeight: '600' }}>🎛️ Analysis Configuration</h3>
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
                {analystData.analysts.map(analyst => (
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
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>By {selectedAnalyst.split(' ')[0]}</div>
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
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>
            📊 Company Analysis - {selectedAnalyst.split(' ')[0]}
          </h3>
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
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🎯 Multi-Dimensional Performance Matrix</h3>
          
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
        <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>👥 Analyst Comparison & Suspicious Behavior Detection</h3>
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

      {/* Suspicious Behavior Alert Panel */}
      {suspiciousAnalysts.length > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #FEE2E2, #FECACA)', 
          padding: '24px', 
          borderRadius: '12px',
          border: `2px solid ${COLORS.suspicious}`,
          marginBottom: '24px'
        }}>
          <h3 style={{ color: COLORS.suspicious, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>
            🚨 Suspicious Behavior Detected
          </h3>
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
