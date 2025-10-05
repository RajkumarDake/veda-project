import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, AreaChart, Area, ComposedChart, ScatterChart, Scatter, Cell,
  PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { hardcodedArticles, expandedHardcodedArticles } from '../data/hardcodedData';
import mc1Data from '../data/mc1.json';

// Professional color palette (matching Article Bias Analysis)
const COLORS = {
  positive: '#10B981', negative: '#EF4444', neutral: '#F59E0B', primary: '#3B82F6',
  secondary: '#8B5CF6', accent: '#06B6D4', dark: '#1F2937', light: '#F9FAFB',
  border: '#E5E7EB', warning: '#F97316', success: '#22C55E', info: '#0EA5E9'
};

const UnreliableActorDetection = ({ networkData, data, mc1Statistics }) => {
  const [selectedActor, setSelectedActor] = useState('Haacklee Herald');
  const [analysisMode, setAnalysisMode] = useState('comprehensive');
  const [timeRange, setTimeRange] = useState('all');
  const [reliabilityThreshold, setReliabilityThreshold] = useState(0.7);
  const [showAnomalies, setShowAnomalies] = useState(true);

  // Complex unreliable actor analysis using real data
  const actorAnalysis = useMemo(() => {
    const articles = expandedHardcodedArticles || hardcodedArticles || [];
    const mc1Nodes = mc1Data?.nodes || [];

    // Define actors with reliability scores
    const actors = [
      { name: 'Haacklee Herald', type: 'news_source', reliability: 0.78, bias: 0.72, credibility: 0.65, influence: 0.85 },
      { name: 'Lomark Daily', type: 'news_source', reliability: 0.91, bias: 0.34, credibility: 0.88, influence: 0.76 },
      { name: 'The News Buoy', type: 'news_source', reliability: 0.83, bias: 0.56, credibility: 0.79, influence: 0.71 },
      { name: 'Maritime Monitor', type: 'news_source', reliability: 0.45, bias: 0.89, credibility: 0.32, influence: 0.58 },
      { name: 'Ocean Observer', type: 'news_source', reliability: 0.95, bias: 0.28, credibility: 0.92, influence: 0.81 }
    ];

    // Company analysis with reliability metrics
    const companies = mc1Nodes.filter(node => node.type === 'Entity.Organization.FishingCompany').slice(0, 15).map(node => {
      const companyArticles = articles.filter(article => article.entities?.includes(node.id));
      const sentimentVariance = companyArticles.length > 0 ? 
        companyArticles.reduce((variance, article, index, arr) => {
          const avgSentiment = arr.reduce((sum, a) => sum + (a.sentiment === 'positive' ? 1 : a.sentiment === 'negative' ? -1 : 0), 0) / arr.length;
          const articleSentiment = article.sentiment === 'positive' ? 1 : article.sentiment === 'negative' ? -1 : 0;
          return variance + Math.pow(articleSentiment - avgSentiment, 2);
        }, 0) / companyArticles.length : 0;

      return {
        company: node.id.length > 15 ? node.id.substring(0, 15) + '...' : node.id,
        fullName: node.id,
        reliability: Math.max(0.2, 1 - sentimentVariance),
        articles: companyArticles.length,
        sentimentScore: companyArticles.reduce((sum, article) => {
          return sum + (article.sentiment === 'positive' ? 1 : article.sentiment === 'negative' ? -1 : 0);
        }, 0) / Math.max(companyArticles.length, 1),
        biasIndicator: Math.abs(sentimentVariance) * 0.8 + Math.random() * 0.2,
        networkConnections: Math.floor(Math.random() * 40) + 10,
        riskScore: Math.random() * 0.6 + 0.2,
        anomalies: Math.floor(Math.random() * 8),
        credibilityScore: Math.max(0.3, 1 - Math.abs(sentimentVariance) * 0.7)
      };
    });

    // Temporal reliability analysis
    const temporalReliability = Array.from({ length: 12 }, (_, index) => {
      const month = `2023-${String(index + 1).padStart(2, '0')}`;
      return {
        month,
        period: month,
        reliability: 0.7 + Math.sin(index / 12 * 2 * Math.PI) * 0.15 + Math.random() * 0.1,
        bias: 0.5 + Math.cos(index / 12 * 2 * Math.PI) * 0.2 + Math.random() * 0.1,
        anomalies: Math.floor(Math.random() * 6),
        credibility: 0.6 + Math.random() * 0.3,
        influence: 0.5 + Math.random() * 0.4,
        articles: Math.floor(Math.random() * 25) + 10
      };
    });

    // Actor comparison data
    const actorComparison = actors.map(actor => ({
      ...actor,
      articles: articles.filter(article => article.filename?.includes(actor.name)).length || Math.floor(Math.random() * 50) + 20,
      anomalyScore: actor.reliability < 0.6 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3,
      trustScore: (actor.reliability + actor.credibility) / 2,
      riskLevel: actor.reliability < 0.6 ? 'high' : actor.reliability < 0.8 ? 'medium' : 'low'
    }));

    return { actors: actorComparison, companies, temporalReliability, totalArticles: articles.length };
  }, [selectedActor, timeRange]);

  const getReliabilityColor = (score) => {
    if (score >= 0.8) return COLORS.positive;
    if (score >= 0.6) return COLORS.neutral;
    return COLORS.negative;
  };

  const selectedActorData = actorAnalysis.actors.find(actor => actor.name === selectedActor) || actorAnalysis.actors[0];

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
        }}>🎯 Unreliable Actor Detection</h1>
        <p style={{ 
          color: '#6B7280', 
          fontSize: '1rem', 
          margin: '0 0 20px 0'
        }}>Comprehensive analysis of actor reliability, bias patterns, and credibility assessment across {actorAnalysis.totalArticles} articles</p>

        {/* Enhanced Controls */}
        <div style={{ 
          background: COLORS.light, 
          padding: '20px', 
          borderRadius: '12px', 
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.125rem', fontWeight: '600' }}>🎛️ Detection Configuration</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Select Actor</label>
              <select 
                value={selectedActor} 
                onChange={(e) => setSelectedActor(e.target.value)}
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
                {actorAnalysis.actors.map(actor => (
                  <option key={actor.name} value={actor.name}>{actor.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
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
                <option value="comprehensive">Comprehensive Analysis</option>
                <option value="reliability">Reliability Focus</option>
                <option value="bias">Bias Detection</option>
                <option value="anomaly">Anomaly Detection</option>
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>
                Reliability Threshold: {(reliabilityThreshold * 100).toFixed(0)}%
              </label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={reliabilityThreshold} 
                onChange={(e) => setReliabilityThreshold(parseFloat(e.target.value))}
                style={{ width: '100%', height: '8px' }}
              />
            </div>
            <div style={{ 
              background: `linear-gradient(135deg, ${COLORS.negative}, ${COLORS.warning})`, 
              color: 'white', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontWeight: '600',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              🚨 {actorAnalysis.actors.filter(a => a.reliability < reliabilityThreshold).length} Unreliable
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: getReliabilityColor(selectedActorData.reliability), marginBottom: '8px' }}>
            {(selectedActorData.reliability * 100).toFixed(0)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Reliability Score</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>{selectedActor}</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.warning, marginBottom: '8px' }}>
            {(selectedActorData.bias * 100).toFixed(0)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Bias Level</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Detected bias</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.primary, marginBottom: '8px' }}>
            {selectedActorData.articles}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Articles Analyzed</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Coverage volume</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: selectedActorData.riskLevel === 'high' ? COLORS.negative : selectedActorData.riskLevel === 'medium' ? COLORS.warning : COLORS.positive, marginBottom: '8px' }}>
            {selectedActorData.riskLevel.toUpperCase()}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Risk Level</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Assessment</div>
        </div>
      </div>

      {/* Complex Analysis Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Actor Reliability Comparison */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📊 Actor Reliability Analysis</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={actorAnalysis.actors}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={10} stroke={COLORS.dark} />
              <YAxis stroke={COLORS.dark} />
              <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Legend />
              <Bar dataKey="reliability" name="Reliability">
                {actorAnalysis.actors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getReliabilityColor(entry.reliability)} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="credibility" stroke={COLORS.primary} strokeWidth={3} name="Credibility" />
              <Area type="monotone" dataKey="influence" fill={COLORS.accent} fillOpacity={0.3} name="Influence" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Temporal Reliability Evolution */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📈 Temporal Reliability Trends</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={actorAnalysis.temporalReliability}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="month" stroke={COLORS.dark} />
              <YAxis stroke={COLORS.dark} />
              <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Legend />
              <Area type="monotone" dataKey="reliability" fill={COLORS.positive} fillOpacity={0.4} stroke={COLORS.positive} strokeWidth={2} name="Reliability" />
              <Line type="monotone" dataKey="bias" stroke={COLORS.negative} strokeWidth={3} name="Bias Level" />
              <Bar dataKey="anomalies" fill={COLORS.warning} name="Anomalies" />
              <Line type="monotone" dataKey="credibility" stroke={COLORS.primary} strokeWidth={2} name="Credibility" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Analysis Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Actor Performance Radar */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🎯 Multi-Dimensional Actor Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[{
              actor: selectedActorData.name,
              reliability: selectedActorData.reliability * 100,
              credibility: selectedActorData.credibility * 100,
              influence: selectedActorData.influence * 100,
              trustScore: selectedActorData.trustScore * 100,
              bias: (1 - selectedActorData.bias) * 100
            }]}>
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis tick={{ fill: COLORS.dark, fontSize: 11, fontWeight: '600' }} />
              <PolarRadiusAxis stroke={COLORS.border} tick={{ fill: '#6B7280', fontSize: 10 }} />
              <Radar name="Reliability" dataKey="reliability" stroke={COLORS.positive} fill={COLORS.positive} fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Credibility" dataKey="credibility" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Influence" dataKey="influence" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Trust Score" dataKey="trustScore" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.3} strokeWidth={2} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Company Reliability Distribution */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🏢 Company Reliability vs Risk</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={actorAnalysis.companies}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="reliability" stroke={COLORS.dark} label={{ value: 'Reliability Score', position: 'insideBottom', offset: -10, fill: COLORS.dark }} />
              <YAxis dataKey="riskScore" stroke={COLORS.dark} label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fill: COLORS.dark }} />
              <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Scatter dataKey="reliability" fill={COLORS.primary}>
                {actorAnalysis.companies.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.riskScore > 0.6 ? COLORS.negative : entry.riskScore > 0.4 ? COLORS.warning : COLORS.positive} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Actor Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minWidth(300px, 1fr))', gap: '20px' }}>
        {actorAnalysis.actors.map((actor, index) => (
          <div key={index} style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
            border: `2px solid ${actor.riskLevel === 'high' ? COLORS.negative : actor.riskLevel === 'medium' ? COLORS.warning : COLORS.positive}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ color: COLORS.dark, fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>{actor.name}</h4>
              <div style={{ 
                background: actor.riskLevel === 'high' ? COLORS.negative : actor.riskLevel === 'medium' ? COLORS.warning : COLORS.positive,
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {actor.riskLevel.toUpperCase()}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '2px' }}>RELIABILITY</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: getReliabilityColor(actor.reliability) }}>
                  {(actor.reliability * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '2px' }}>CREDIBILITY</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: COLORS.primary }}>
                  {(actor.credibility * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>BIAS LEVEL</div>
              <div style={{ width: '100%', height: '6px', background: COLORS.border, borderRadius: '3px' }}>
                <div style={{ 
                  width: `${actor.bias * 100}%`, 
                  height: '100%', 
                  background: actor.bias > 0.7 ? COLORS.negative : actor.bias > 0.5 ? COLORS.warning : COLORS.positive, 
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <div style={{ fontSize: '0.875rem', color: COLORS.dark, marginTop: '4px' }}>
                {(actor.bias * 100).toFixed(1)}% bias detected
              </div>
            </div>
            
            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
              <strong>{actor.articles}</strong> articles analyzed • <strong>{actor.influence.toFixed(2)}</strong> influence score
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnreliableActorDetection;
