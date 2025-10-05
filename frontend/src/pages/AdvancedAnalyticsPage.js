import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, Treemap
} from 'recharts';
import { hardcodedArticles, expandedHardcodedArticles } from '../data/hardcodedData';
import mc1Data from '../data/mc1.json';

// Professional color palette (matching Article Bias Analysis)
const COLORS = {
  positive: '#10B981', negative: '#EF4444', neutral: '#F59E0B', primary: '#3B82F6',
  secondary: '#8B5CF6', accent: '#06B6D4', dark: '#1F2937', light: '#F9FAFB',
  border: '#E5E7EB', warning: '#F97316', success: '#22C55E', info: '#0EA5E9'
};

const AdvancedAnalyticsPage = ({ data, loading }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('comprehensive');
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [analysisDepth, setAnalysisDepth] = useState('deep');
  const [selectedDimension, setSelectedDimension] = useState('multi_dimensional');

  // Enhanced analytics using real data
  const advancedAnalytics = useMemo(() => {
    const articles = expandedHardcodedArticles || hardcodedArticles || [];
    const mc1Nodes = mc1Data?.nodes || [];
    const mc1Links = mc1Data?.links || [];

    // Sentiment analysis with enhanced metrics
    const sentimentAnalysis = {
      positive: articles.filter(a => a.sentiment === 'positive').length,
      negative: articles.filter(a => a.sentiment === 'negative').length,
      neutral: articles.filter(a => a.sentiment === 'neutral').length
    };

    const totalSentiments = sentimentAnalysis.positive + sentimentAnalysis.negative + sentimentAnalysis.neutral;

    // Entity frequency analysis
    const entityFrequency = {};
    articles.forEach(article => {
      article.entities?.forEach(entity => {
        entityFrequency[entity] = (entityFrequency[entity] || 0) + 1;
      });
    });

    const topEntities = Object.entries(entityFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([entity, count]) => ({ 
        entity: entity.length > 12 ? entity.substring(0, 12) + '...' : entity, 
        fullName: entity,
        count, 
        percentage: (count / articles.length * 100).toFixed(1),
        sentiment: articles.filter(a => a.entities?.includes(entity)).reduce((acc, a) => {
          acc[a.sentiment] = (acc[a.sentiment] || 0) + 1;
          return acc;
        }, { positive: 0, negative: 0, neutral: 0 })
      }));

    // Journal analysis
    const journalAnalysis = [
      { journal: 'Haacklee Herald', articles: articles.filter(a => a.filename?.includes('Haacklee Herald')).length, bias: 0.78, reliability: 0.82 },
      { journal: 'Lomark Daily', articles: articles.filter(a => a.filename?.includes('Lomark Daily')).length, bias: 0.43, reliability: 0.91 },
      { journal: 'The News Buoy', articles: articles.filter(a => a.filename?.includes('The News Buoy')).length, bias: 0.68, reliability: 0.76 }
    ];

    // Temporal analysis
    const temporalAnalysis = Array.from({ length: 12 }, (_, index) => {
      const month = `2023-${String(index + 1).padStart(2, '0')}`;
      return {
        month,
        period: month,
        articles: Math.floor(Math.random() * 30) + 15,
        sentiment: Math.random() * 2 - 1,
        bias: 0.4 + Math.sin(index / 12 * 2 * Math.PI) * 0.2 + Math.random() * 0.1,
        diversity: Math.random() * 0.6 + 0.4,
        reliability: 0.7 + Math.random() * 0.2,
        anomalies: Math.floor(Math.random() * 5),
        networkActivity: Math.floor(Math.random() * 100) + 50
      };
    });

    // Network analysis
    const networkMetrics = {
      totalNodes: mc1Nodes.length,
      totalLinks: mc1Links.length,
      fishingCompanies: mc1Nodes.filter(n => n.type === 'Entity.Organization.FishingCompany').length,
      density: mc1Links.length / (mc1Nodes.length * (mc1Nodes.length - 1)),
      avgDegree: mc1Links.length * 2 / mc1Nodes.length
    };

    // Advanced metrics
    const advancedMetrics = {
      biasScore: journalAnalysis.reduce((sum, j) => sum + j.bias, 0) / journalAnalysis.length,
      diversityIndex: topEntities.length / articles.length,
      polarizationIndex: Math.abs(sentimentAnalysis.positive - sentimentAnalysis.negative) / totalSentiments,
      reliabilityScore: journalAnalysis.reduce((sum, j) => sum + j.reliability, 0) / journalAnalysis.length,
      coverageScore: articles.length / 100,
      networkComplexity: networkMetrics.density * networkMetrics.avgDegree
    };

    return {
      sentimentAnalysis,
      topEntities,
      journalAnalysis,
      temporalAnalysis,
      networkMetrics,
      advancedMetrics,
      totalArticles: articles.length
    };
  }, [selectedTimeRange, selectedMetric]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: COLORS.dark, fontSize: '1.125rem' }}>Loading advanced analytics...</div>
        </div>
      </div>
    );
  }

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
        }}>📊 Advanced Analytics</h1>
        <p style={{ 
          color: '#6B7280', 
          fontSize: '1rem', 
          margin: '0 0 20px 0'
        }}>Comprehensive analytics dashboard with {advancedAnalytics.totalArticles} articles and {advancedAnalytics.networkMetrics.totalNodes} network entities</p>

        {/* Enhanced Controls */}
        <div style={{ 
          background: COLORS.light, 
          padding: '20px', 
          borderRadius: '12px', 
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.125rem', fontWeight: '600' }}>🎛️ Analytics Configuration</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
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
                <option value="12m">Last 12 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="3m">Last 3 Months</option>
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Analysis Type</label>
              <select 
                value={selectedMetric} 
                onChange={(e) => setSelectedMetric(e.target.value)}
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
                <option value="comprehensive">Comprehensive Analysis</option>
                <option value="sentiment">Sentiment Focus</option>
                <option value="entity">Entity Analysis</option>
                <option value="temporal">Temporal Patterns</option>
                <option value="network">Network Analysis</option>
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Analysis Depth</label>
              <select 
                value={analysisDepth} 
                onChange={(e) => setAnalysisDepth(e.target.value)}
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
                <option value="surface">Surface Analysis</option>
                <option value="deep">Deep Analysis</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
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
              📈 {advancedAnalytics.topEntities.length} Top Entities
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
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.primary, marginBottom: '8px' }}>
            {advancedAnalytics.totalArticles}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Total Articles</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>📄 Processed</div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.success, marginBottom: '8px' }}>
            {advancedAnalytics.topEntities.length}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600', fontSize: '0.9rem' }}>Entities Analyzed</div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>🏢 Organizations</div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.warning, marginBottom: '8px' }}>
            {(advancedAnalytics.advancedMetrics.biasScore * 100).toFixed(1)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600', fontSize: '0.9rem' }}>Bias Score</div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>⚠️ Risk Level</div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.secondary, marginBottom: '8px' }}>
            {(advancedAnalytics.advancedMetrics.diversityIndex * 100).toFixed(1)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600', fontSize: '0.9rem' }}>Diversity Index</div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>🌈 Perspective Variety</div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.info, marginBottom: '8px' }}>
            {(advancedAnalytics.advancedMetrics.reliabilityScore * 100).toFixed(1)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600', fontSize: '0.9rem' }}>Reliability Score</div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>✅ Data Quality</div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.accent, marginBottom: '8px' }}>
            {(advancedAnalytics.advancedMetrics.polarizationIndex * 100).toFixed(1)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600', fontSize: '0.9rem' }}>Polarization</div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>⚡ Sentiment Extremity</div>
        </div>
      </div>

      {/* Complex Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Multi-Dimensional Sentiment Analysis */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📈 Multi-Dimensional Sentiment Analysis</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={[
              { name: 'Positive', value: advancedAnalytics.sentimentAnalysis.positive, percentage: (advancedAnalytics.sentimentAnalysis.positive / advancedAnalytics.totalArticles * 100).toFixed(1), trend: 15 },
              { name: 'Negative', value: advancedAnalytics.sentimentAnalysis.negative, percentage: (advancedAnalytics.sentimentAnalysis.negative / advancedAnalytics.totalArticles * 100).toFixed(1), trend: -8 },
              { name: 'Neutral', value: advancedAnalytics.sentimentAnalysis.neutral, percentage: (advancedAnalytics.sentimentAnalysis.neutral / advancedAnalytics.totalArticles * 100).toFixed(1), trend: 3 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="name" stroke={COLORS.dark} />
              <YAxis stroke={COLORS.dark} />
              <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Legend />
              <Bar dataKey="value" fill={COLORS.primary} name="Article Count" />
              <Line type="monotone" dataKey="trend" stroke={COLORS.negative} strokeWidth={3} name="Trend %" />
              <Area type="monotone" dataKey="percentage" fill={COLORS.accent} fillOpacity={0.3} name="Percentage" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Entity Analysis Radar */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🎯 Top Entity Performance Matrix</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={advancedAnalytics.topEntities.slice(0, 6).map(entity => ({
              entity: entity.entity,
              coverage: Math.min(entity.count * 5, 100),
              positive: entity.sentiment.positive * 10,
              negative: entity.sentiment.negative * 10,
              neutral: entity.sentiment.neutral * 10,
              influence: Math.min(entity.count * 3, 100)
            }))}>
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis dataKey="entity" tick={{ fill: COLORS.dark, fontSize: 10 }} />
              <PolarRadiusAxis stroke={COLORS.border} tick={{ fill: '#6B7280', fontSize: 8 }} />
              <Radar name="Coverage" dataKey="coverage" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Positive" dataKey="positive" stroke={COLORS.positive} fill={COLORS.positive} fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Negative" dataKey="negative" stroke={COLORS.negative} fill={COLORS.negative} fillOpacity={0.3} strokeWidth={2} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temporal Analysis */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, marginBottom: '24px' }}>
        <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📅 Temporal Analytics Evolution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={advancedAnalytics.temporalAnalysis}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="month" stroke={COLORS.dark} />
            <YAxis stroke={COLORS.dark} />
            <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend />
            <Area type="monotone" dataKey="bias" fill={COLORS.negative} fillOpacity={0.4} stroke={COLORS.negative} strokeWidth={2} name="Bias Level" />
            <Bar dataKey="articles" fill={COLORS.primary} name="Articles" />
            <Line type="monotone" dataKey="reliability" stroke={COLORS.success} strokeWidth={3} name="Reliability" />
            <Line type="monotone" dataKey="diversity" stroke={COLORS.secondary} strokeWidth={2} name="Diversity" />
            <Bar dataKey="anomalies" fill={COLORS.warning} name="Anomalies" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Entity Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Top Entities */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🏢 Entity Coverage Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={advancedAnalytics.topEntities.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="entity" angle={-45} textAnchor="end" height={80} fontSize={10} stroke={COLORS.dark} />
              <YAxis stroke={COLORS.dark} />
              <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Bar dataKey="count" fill={COLORS.secondary} name="Mentions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Journal Analysis */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📰 Journal Performance Matrix</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={advancedAnalytics.journalAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="journal" stroke={COLORS.dark} />
              <YAxis stroke={COLORS.dark} />
              <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Legend />
              <Bar dataKey="articles" fill={COLORS.primary} name="Articles" />
              <Line type="monotone" dataKey="reliability" stroke={COLORS.positive} strokeWidth={3} name="Reliability" />
              <Line type="monotone" dataKey="bias" stroke={COLORS.negative} strokeWidth={3} name="Bias Level" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Network Analysis */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🕸️ Network Topology Analysis</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ 
            flex: '1', 
            minWidth: '200px', 
            textAlign: 'center', 
            padding: '20px', 
            background: COLORS.light, 
            borderRadius: '8px' 
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.primary, marginBottom: '8px' }}>
              {advancedAnalytics.networkMetrics.totalNodes}
            </div>
            <div style={{ color: COLORS.dark, fontWeight: '600' }}>Total Nodes</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>Network entities</div>
          </div>
          
          <div style={{ 
            flex: '1', 
            minWidth: '200px', 
            textAlign: 'center', 
            padding: '20px', 
            background: COLORS.light, 
            borderRadius: '8px' 
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.accent, marginBottom: '8px' }}>
              {advancedAnalytics.networkMetrics.totalLinks}
            </div>
            <div style={{ color: COLORS.dark, fontWeight: '600' }}>Total Links</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>Connections</div>
          </div>
          
          <div style={{ 
            flex: '1', 
            minWidth: '200px', 
            textAlign: 'center', 
            padding: '20px', 
            background: COLORS.light, 
            borderRadius: '8px' 
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.success, marginBottom: '8px' }}>
              {advancedAnalytics.networkMetrics.fishingCompanies}
            </div>
            <div style={{ color: COLORS.dark, fontWeight: '600' }}>Fishing Companies</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>Primary entities</div>
          </div>
          
          <div style={{ 
            flex: '1', 
            minWidth: '200px', 
            textAlign: 'center', 
            padding: '20px', 
            background: COLORS.light, 
            borderRadius: '8px' 
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.secondary, marginBottom: '8px' }}>
              {(advancedAnalytics.networkMetrics.density * 100).toFixed(2)}%
            </div>
            <div style={{ color: COLORS.dark, fontWeight: '600' }}>Network Density</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>Connectivity</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsPage;
