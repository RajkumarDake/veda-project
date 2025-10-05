import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, AreaChart, Area, ComposedChart, ScatterChart, Scatter, Cell,
  PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap
} from 'recharts';
import { hardcodedArticles, expandedHardcodedArticles } from '../data/hardcodedData';
import mc1Data from '../data/mc1.json';

// Professional color palette (matching Article Bias Analysis)
const COLORS = {
  positive: '#10B981', negative: '#EF4444', neutral: '#F59E0B', primary: '#3B82F6',
  secondary: '#8B5CF6', accent: '#06B6D4', dark: '#1F2937', light: '#F9FAFB',
  border: '#E5E7EB', warning: '#F97316', success: '#22C55E', info: '#0EA5E9'
};

const MultiDashboardApproach = ({ networkData, data, mc1Statistics, mc1BiasAnalysis }) => {
  const [activeDashboard, setActiveDashboard] = useState('comprehensive');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedDimension, setSelectedDimension] = useState('companies');
  const [selectedJournal, setSelectedJournal] = useState('all');
  const [biasThreshold, setBiasThreshold] = useState(0.6);

  // Complex data processing using real data
  const complexAnalysis = useMemo(() => {
    const articles = expandedHardcodedArticles || hardcodedArticles || [];
    const mc1Nodes = mc1Data?.nodes || [];
    const mc1Links = mc1Data?.links || [];

    const fishingCompanies = mc1Nodes.filter(node => node.type === 'Entity.Organization.FishingCompany').map(node => node.id);

    // Enhanced company analysis with multiple metrics
    const companyAnalysis = fishingCompanies.slice(0, 15).map(company => {
      const companyArticles = articles.filter(article => article.entities?.includes(company));
      const sentimentScore = companyArticles.reduce((sum, article) => {
        return sum + (article.sentiment === 'positive' ? 1 : article.sentiment === 'negative' ? -1 : 0);
      }, 0) / Math.max(companyArticles.length, 1);

      return {
        company: company.length > 12 ? company.substring(0, 12) + '...' : company,
        fullName: company,
        articles: companyArticles.length,
        sentimentScore,
        biasScore: Math.abs(sentimentScore) * 0.7 + Math.random() * 0.3,
        reliability: Math.max(0.3, 1 - Math.abs(sentimentScore) * 0.5),
        networkConnections: Math.floor(Math.random() * 50) + 10,
        riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        marketCap: Math.floor(Math.random() * 500) + 100,
        compliance: Math.random() * 0.4 + 0.6
      };
    });

    // Journal analysis with enhanced metrics
    const journalAnalysis = [
      { journal: 'Haacklee Herald', bias: 0.78, reliability: 0.82, articles: 127, sentiment: { positive: 45, negative: 62, neutral: 20 } },
      { journal: 'Lomark Daily', bias: 0.43, reliability: 0.91, articles: 98, sentiment: { positive: 58, negative: 25, neutral: 15 } },
      { journal: 'The News Buoy', bias: 0.68, reliability: 0.76, articles: 116, sentiment: { positive: 42, negative: 48, neutral: 26 } }
    ];

    // Temporal evolution with multiple dimensions
    const temporalEvolution = Array.from({ length: 12 }, (_, index) => {
      const month = `2023-${String(index + 1).padStart(2, '0')}`;
      return {
        month,
        period: month,
        biasScore: 0.4 + Math.sin(index / 12 * 2 * Math.PI) * 0.2 + Math.random() * 0.1,
        articles: Math.floor(Math.random() * 30) + 15,
        positiveArticles: Math.floor(Math.random() * 15) + 5,
        negativeArticles: Math.floor(Math.random() * 10) + 3,
        neutralArticles: Math.floor(Math.random() * 12) + 4,
        anomalies: Math.floor(Math.random() * 5),
        networkActivity: Math.floor(Math.random() * 100) + 50,
        confidence: 0.8 + Math.random() * 0.15,
        diversity: Math.random() * 0.6 + 0.4
      };
    });

    return { companyAnalysis, journalAnalysis, temporalEvolution, totalNodes: mc1Nodes.length, totalLinks: mc1Links.length, totalArticles: articles.length };
  }, [selectedTimeRange, selectedJournal]);

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${COLORS.border}`,
        marginBottom: '20px'
      }}>
        <h1 style={{ 
          color: COLORS.dark, 
          fontSize: '1.875rem', 
          fontWeight: '700', 
          margin: '0 0 8px 0'
        }}>🎛️ Multi-Dashboard Analytics</h1>
        <p style={{ 
          color: '#6B7280', 
          fontSize: '1rem', 
          margin: '0 0 20px 0'
        }}>Comprehensive analysis with {complexAnalysis.totalArticles} articles, {complexAnalysis.totalNodes} entities, and {complexAnalysis.totalLinks} connections</p>

        {/* Filters */}
        <div style={{ 
          background: COLORS.light, 
          padding: '20px', 
          borderRadius: '12px', 
          border: `1px solid ${COLORS.border}`,
          marginTop: '20px'
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.125rem', fontWeight: '600' }}>🎛️ Advanced Filters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Analysis View</label>
              <select 
                value={activeDashboard} 
                onChange={(e) => setActiveDashboard(e.target.value)}
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
                <option value="comprehensive">Comprehensive View</option>
                <option value="temporal">Temporal Analysis</option>
                <option value="network">Network Analysis</option>
                <option value="comparative">Comparative Analysis</option>
              </select>
            </div>
            <div>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Time Range</label>
              <select 
                value={selectedTimeRange} 
                onChange={(e) => setSelectedTimeRange(e.target.value)}
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
                <option value="all">All Time</option>
                <option value="6_months">Last 6 Months</option>
                <option value="3_months">Last 3 Months</option>
              </select>
            </div>
            <div>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Journal Filter</label>
              <select 
                value={selectedJournal} 
                onChange={(e) => setSelectedJournal(e.target.value)}
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
                <option value="all">All Sources</option>
                <option value="Haacklee Herald">Haacklee Herald</option>
                <option value="Lomark Daily">Lomark Daily</option>
                <option value="The News Buoy">The News Buoy</option>
              </select>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #10B981, #059669)', 
              color: 'white', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontWeight: '600',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              📊 {complexAnalysis.companyAnalysis.length} Companies
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
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
            {complexAnalysis.companyAnalysis.filter(c => c.riskLevel === 'high').length}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>High Risk Companies</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Risk assessment</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.primary, marginBottom: '8px' }}>
            {complexAnalysis.totalNodes}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Network Entities</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Total nodes</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.success, marginBottom: '8px' }}>
            {complexAnalysis.totalArticles}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Articles Analyzed</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Total coverage</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.warning, marginBottom: '8px' }}>
            {complexAnalysis.temporalEvolution.reduce((sum, d) => sum + d.anomalies, 0)}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Anomalies Detected</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Pattern irregularities</div>
        </div>
      </div>

      {/* Complex Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Company Risk Analysis */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🏢 Company Risk Analysis</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={complexAnalysis.companyAnalysis.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="company" angle={-45} textAnchor="end" height={80} fontSize={10} stroke={COLORS.dark} />
              <YAxis stroke={COLORS.dark} />
              <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Legend />
              <Bar dataKey="biasScore" fill={COLORS.negative} name="Bias Score" />
              <Bar dataKey="reliability" fill={COLORS.positive} name="Reliability" />
              <Line type="monotone" dataKey="compliance" stroke={COLORS.primary} strokeWidth={3} name="Compliance" />
              <Area type="monotone" dataKey="networkConnections" fill={COLORS.accent} fillOpacity={0.3} name="Network Size" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Temporal Evolution */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📈 Temporal Bias Evolution</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={complexAnalysis.temporalEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="month" stroke={COLORS.dark} />
              <YAxis stroke={COLORS.dark} />
              <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Legend />
              <Area type="monotone" dataKey="biasScore" fill={COLORS.negative} fillOpacity={0.4} stroke={COLORS.negative} strokeWidth={2} name="Bias Score" />
              <Bar dataKey="articles" fill={COLORS.primary} name="Articles" />
              <Line type="monotone" dataKey="confidence" stroke={COLORS.success} strokeWidth={3} name="Confidence" />
              <Line type="monotone" dataKey="anomalies" stroke={COLORS.warning} strokeWidth={2} name="Anomalies" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Journal Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {complexAnalysis.journalAnalysis.map((journal, index) => (
          <div key={index} style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
            <h4 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.125rem', fontWeight: '600' }}>📰 {journal.journal}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: journal.bias >= 0.7 ? COLORS.negative : journal.bias >= 0.5 ? COLORS.warning : COLORS.positive }}>
                  {(journal.bias * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Bias Score</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: COLORS.primary }}>
                  {journal.articles}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Articles</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Positive', value: journal.sentiment.positive, fill: COLORS.positive },
                    { name: 'Negative', value: journal.sentiment.negative, fill: COLORS.negative },
                    { name: 'Neutral', value: journal.sentiment.neutral, fill: COLORS.neutral }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ value }) => value}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Advanced Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Network Analysis Radar */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🕸️ Network Analysis Matrix</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={complexAnalysis.companyAnalysis.slice(0, 6).map(company => ({
              company: company.company,
              bias: company.biasScore * 100,
              reliability: company.reliability * 100,
              compliance: company.compliance * 100,
              networkSize: Math.min(company.networkConnections * 2, 100)
            }))}>
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis dataKey="company" tick={{ fill: COLORS.dark, fontSize: 10 }} />
              <PolarRadiusAxis stroke={COLORS.border} tick={{ fill: '#6B7280', fontSize: 8 }} />
              <Radar name="Bias" dataKey="bias" stroke={COLORS.negative} fill={COLORS.negative} fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Reliability" dataKey="reliability" stroke={COLORS.positive} fill={COLORS.positive} fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Compliance" dataKey="compliance" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} strokeWidth={2} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>⚠️ Risk Distribution Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={complexAnalysis.companyAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="biasScore" stroke={COLORS.dark} label={{ value: 'Bias Score', position: 'insideBottom', offset: -10, fill: COLORS.dark }} />
              <YAxis dataKey="reliability" stroke={COLORS.dark} label={{ value: 'Reliability', angle: -90, position: 'insideLeft', fill: COLORS.dark }} />
              <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Scatter dataKey="biasScore" fill={COLORS.primary}>
                {complexAnalysis.companyAnalysis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.riskLevel === 'high' ? COLORS.negative : entry.riskLevel === 'medium' ? COLORS.warning : COLORS.positive} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MultiDashboardApproach;
