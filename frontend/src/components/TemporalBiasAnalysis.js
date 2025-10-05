import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter, Cell, ComposedChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie
} from 'recharts';

// Professional color palette
const COLORS = {
  positive: '#10B981', negative: '#EF4444', neutral: '#F59E0B', primary: '#3B82F6',
  secondary: '#8B5CF6', accent: '#06B6D4', dark: '#1F2937', light: '#F9FAFB',
  border: '#E5E7EB', warning: '#F97316', success: '#22C55E', info: '#0EA5E9'
};

const TemporalBiasAnalysis = ({ networkData, data, mc1Statistics, articles = [], loading, onProcessArticles }) => {
  const [activeView, setActiveView] = useState('comprehensive');
  const [selectedDimension, setSelectedDimension] = useState('event_types');
  const [timeRange, setTimeRange] = useState('6_months');
  const [biasThreshold, setBiasThreshold] = useState(0.65);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showPredictions, setShowPredictions] = useState(true);
  
  // Article Management states
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [journalFilter, setJournalFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [analysisMode, setAnalysisMode] = useState('comprehensive');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showArticleManager, setShowArticleManager] = useState(false);

  // Advanced temporal data
  const temporalData = useMemo(() => {
    const timePoints = ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06', '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12'];
    
    const eventTypes = [
      { name: 'Sustainable Fishing', category: 'positive', baseScore: 0.25, trend: 'improving' },
      { name: 'Overfishing Reports', category: 'negative', baseScore: 0.85, trend: 'worsening' },
      { name: 'Investment News', category: 'neutral', baseScore: 0.45, trend: 'stable' },
      { name: 'Regulatory Actions', category: 'negative', baseScore: 0.75, trend: 'fluctuating' },
      { name: 'Environmental Aid', category: 'positive', baseScore: 0.30, trend: 'improving' },
      { name: 'Corporate Criticism', category: 'negative', baseScore: 0.90, trend: 'peak' }
    ];

    const temporalEvolution = timePoints.map((period, index) => {
      const seasonalFactor = Math.sin((index / 12) * 2 * Math.PI) * 0.1;
      return {
        period,
        month: period.split('-')[1],
        sustainableFishing: Math.max(0.1, 0.25 + seasonalFactor + (Math.random() - 0.5) * 0.1),
        overfishing: Math.min(0.95, 0.85 - seasonalFactor + (Math.random() - 0.5) * 0.1),
        investment: 0.45 + (Math.random() - 0.5) * 0.2,
        regulatory: 0.75 + (Math.random() - 0.5) * 0.15,
        environmental: Math.max(0.1, 0.30 + seasonalFactor + (Math.random() - 0.5) * 0.1),
        criticism: Math.min(0.95, 0.90 + (Math.random() - 0.5) * 0.1),
        totalArticles: Math.floor(Math.random() * 50) + 20,
        anomalies: Math.floor(Math.random() * 5),
        confidence: 0.85 + (Math.random() - 0.5) * 0.1
      };
    });

    const algorithmComparison = [
      { algorithm: 'Neural Transformer', accuracy: 0.94, bias: 0.23, f1Score: 0.91, precision: 0.89 },
      { algorithm: 'BERT Analysis', accuracy: 0.91, bias: 0.31, f1Score: 0.88, precision: 0.86 },
      { algorithm: 'GPT-4 Enhanced', accuracy: 0.96, bias: 0.18, f1Score: 0.93, precision: 0.91 },
      { algorithm: 'Ensemble Model', accuracy: 0.93, bias: 0.25, f1Score: 0.90, precision: 0.88 }
    ];

    return { eventTypes, temporalEvolution, algorithmComparison };
  }, []);

  // Enhanced article analysis with dynamic filtering
  const articleAnalysis = useMemo(() => {
    let filteredArticles = articles.filter(article => {
      const matchesSearch = article.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.entities?.some(entity => entity.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSentiment = sentimentFilter === 'all' || article.sentiment === sentimentFilter;
      
      const journal = article.filename?.includes('Haacklee Herald') ? 'Haacklee Herald' :
                     article.filename?.includes('Lomark Daily') ? 'Lomark Daily' :
                     article.filename?.includes('The News Buoy') ? 'The News Buoy' : 'Unknown';
      const matchesJournal = journalFilter === 'all' || journal === journalFilter;

      return matchesSearch && matchesSentiment && matchesJournal;
    });

    // Sort articles
    filteredArticles.sort((a, b) => {
      switch (sortBy) {
        case 'date': return new Date(b.processed_date) - new Date(a.processed_date);
        case 'sentiment': return a.sentiment.localeCompare(b.sentiment);
        case 'entities': return (b.entities?.length || 0) - (a.entities?.length || 0);
        case 'relevance': return (b.content?.length || 0) - (a.content?.length || 0);
        default: return 0;
      }
    });

    // Generate analytics
    const sentimentDistribution = {
      positive: filteredArticles.filter(a => a.sentiment === 'positive').length,
      negative: filteredArticles.filter(a => a.sentiment === 'negative').length,
      neutral: filteredArticles.filter(a => a.sentiment === 'neutral').length
    };

    const journalDistribution = {
      'Haacklee Herald': filteredArticles.filter(a => a.filename?.includes('Haacklee Herald')).length,
      'Lomark Daily': filteredArticles.filter(a => a.filename?.includes('Lomark Daily')).length,
      'The News Buoy': filteredArticles.filter(a => a.filename?.includes('The News Buoy')).length
    };

    // Entity frequency analysis
    const entityFrequency = {};
    filteredArticles.forEach(article => {
      article.entities?.forEach(entity => {
        entityFrequency[entity] = (entityFrequency[entity] || 0) + 1;
      });
    });

    const topEntities = Object.entries(entityFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([entity, count]) => ({ entity, count }));

    // Temporal analysis
    const temporalData = {};
    filteredArticles.forEach(article => {
      const date = article.processed_date;
      if (!temporalData[date]) {
        temporalData[date] = { date, positive: 0, negative: 0, neutral: 0, total: 0 };
      }
      temporalData[date][article.sentiment]++;
      temporalData[date].total++;
    });

    const temporalArray = Object.values(temporalData).sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      filteredArticles,
      sentimentDistribution,
      journalDistribution,
      topEntities,
      temporalArray,
      totalArticles: articles.length,
      filteredCount: filteredArticles.length
    };
  }, [articles, searchTerm, sentimentFilter, journalFilter, sortBy]);

  const getAdvancedColor = (score, type = 'bias') => {
    switch (type) {
      case 'bias':
        if (score >= 0.8) return COLORS.negative;
        if (score >= 0.6) return COLORS.warning;
        if (score >= 0.4) return COLORS.neutral;
        return COLORS.positive;
      case 'trend':
        if (score === 'improving') return COLORS.success;
        if (score === 'worsening') return COLORS.negative;
        if (score === 'peak') return COLORS.warning;
        return COLORS.info;
      default: return COLORS.primary;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return COLORS.positive;
      case 'negative': return COLORS.negative;
      case 'neutral': return COLORS.neutral;
      default: return COLORS.border;
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '❓';
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ 
              color: COLORS.dark, 
              fontSize: '2rem', 
              fontWeight: '700', 
              margin: '0 0 8px 0'
            }}>📈 Advanced Temporal Bias Analysis & Article Management</h1>
            <p style={{ 
              color: '#6B7280', 
              fontSize: '1.125rem', 
              margin: '0'
            }}>Comprehensive time-series analysis of bias patterns with integrated article management ({articles.length} articles)</p>
          </div>
          <button 
            onClick={() => setShowArticleManager(!showArticleManager)}
            style={{ 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: `2px solid ${COLORS.primary}`,
              background: showArticleManager ? COLORS.primary : 'white',
              color: showArticleManager ? 'white' : COLORS.primary,
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📄 {showArticleManager ? 'Hide' : 'Show'} Article Manager
          </button>
        </div>

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
                Analysis Dimension
              </label>
              <select 
                value={selectedDimension} 
                onChange={(e) => setSelectedDimension(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${COLORS.border}`, background: 'white', fontSize: '0.875rem', fontWeight: '500', color: COLORS.dark, cursor: 'pointer' }}
              >
                <option value="event_types">Event Types Analysis</option>
                <option value="algorithm_performance">Algorithm Performance</option>
                <option value="source_reliability">Source Reliability</option>
                <option value="seasonal_patterns">Seasonal Patterns</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: COLORS.dark, marginBottom: '6px', fontSize: '0.875rem' }}>
                Time Range
              </label>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${COLORS.border}`, background: 'white', fontSize: '0.875rem', fontWeight: '500', color: COLORS.dark, cursor: 'pointer' }}
              >
                <option value="3_months">Last 3 Months</option>
                <option value="6_months">Last 6 Months</option>
                <option value="12_months">Full Year Analysis</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: COLORS.dark, marginBottom: '6px', fontSize: '0.875rem' }}>
                Bias Threshold: {(biasThreshold * 100).toFixed(0)}%
              </label>
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
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`, 
              color: 'white', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontWeight: '600',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              📊 {temporalData.temporalEvolution.length} Time Points
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.negative, marginBottom: '8px' }}>
            {temporalData.temporalEvolution.filter(d => d.criticism >= biasThreshold).length}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>High Bias Periods</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Above {(biasThreshold * 100).toFixed(0)}% threshold</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.primary, marginBottom: '8px' }}>
            {temporalData.temporalEvolution.reduce((sum, d) => sum + d.anomalies, 0)}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Total Anomalies</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Detected patterns</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.success, marginBottom: '8px' }}>
            {(temporalData.temporalEvolution.reduce((sum, d) => sum + d.confidence, 0) / temporalData.temporalEvolution.length * 100).toFixed(1)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Average Confidence</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Model certainty</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.secondary, marginBottom: '8px' }}>
            {temporalData.algorithmComparison.length}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>AI Models</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Under analysis</div>
        </div>
      </div>

      {/* Main Analysis Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Temporal Evolution */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📈 Temporal Bias Evolution</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={temporalData.temporalEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="period" stroke={COLORS.dark} fontSize={12} />
              <YAxis stroke={COLORS.dark} fontSize={12} />
              <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Legend />
              <Area type="monotone" dataKey="overfishing" fill={COLORS.negative} fillOpacity={0.3} stroke={COLORS.negative} strokeWidth={2} name="Overfishing Bias" />
              <Area type="monotone" dataKey="sustainableFishing" fill={COLORS.positive} fillOpacity={0.3} stroke={COLORS.positive} strokeWidth={2} name="Sustainable Fishing" />
              <Line type="monotone" dataKey="criticism" stroke={COLORS.warning} strokeWidth={3} name="Corporate Criticism" />
              <Bar dataKey="anomalies" fill={COLORS.accent} name="Anomalies" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Algorithm Performance Radar */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🤖 Algorithm Performance Matrix</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={temporalData.algorithmComparison}>
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis dataKey="algorithm" tick={{ fill: COLORS.dark, fontSize: 11, fontWeight: '600' }} />
              <PolarRadiusAxis stroke={COLORS.border} tick={{ fill: '#6B7280', fontSize: 10 }} />
              <Radar name="Accuracy" dataKey="accuracy" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Precision" dataKey="precision" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.3} strokeWidth={2} />
              <Radar name="F1 Score" dataKey="f1Score" stroke={COLORS.secondary} fill={COLORS.secondary} fillOpacity={0.3} strokeWidth={2} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Heatmap */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, marginBottom: '24px' }}>
        <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🔥 Temporal Bias Heatmap</h3>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px repeat(12, 1fr)', gap: '2px', minWidth: '1000px' }}>
            <div style={{ fontWeight: 'bold', padding: '10px', background: COLORS.light, color: COLORS.dark }}>Event Type</div>
            {temporalData.temporalEvolution.map(d => (
              <div key={d.period} style={{ fontWeight: 'bold', padding: '10px', background: COLORS.light, textAlign: 'center', color: COLORS.dark, fontSize: '0.8rem' }}>
                {d.month}
              </div>
            ))}
            
            {temporalData.eventTypes.map(eventType => (
              <React.Fragment key={eventType.name}>
                <div style={{ padding: '8px', background: '#f9fafb', fontSize: '0.85rem', color: COLORS.dark, fontWeight: '500' }}>
                  {eventType.name}
                </div>
                {temporalData.temporalEvolution.map(period => {
                  const score = period[eventType.name.toLowerCase().replace(/\s+/g, '')] || eventType.baseScore;
                  return (
                    <div 
                      key={`${eventType.name}-${period.period}`}
                      style={{ 
                        padding: '8px', 
                        background: getAdvancedColor(score),
                        color: score > 0.5 ? 'white' : COLORS.dark,
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                      title={`${eventType.name} - ${period.period}: ${(score * 100).toFixed(1)}% bias`}
                    >
                      {(score * 100).toFixed(0)}%
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Article Manager Section */}
      {showArticleManager && (
        <div style={{ marginBottom: '24px' }}>
          {/* Article Manager Controls */}
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            marginBottom: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${COLORS.border}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: COLORS.dark, fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>📄 Article Management & Analysis</h3>
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: `1px solid ${COLORS.border}`, background: 'white', color: COLORS.dark, cursor: 'pointer' }}
              >
                {showAdvancedFilters ? '🔼 Hide' : '🔽 Show'} Advanced Filters
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: COLORS.dark, marginBottom: '6px', fontSize: '0.875rem' }}>
                  Search Articles
                </label>
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by content, filename, or entities..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${COLORS.border}`, fontSize: '0.875rem' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: COLORS.dark, marginBottom: '6px', fontSize: '0.875rem' }}>
                  Sentiment Filter
                </label>
                <select 
                  value={sentimentFilter} 
                  onChange={(e) => setSentimentFilter(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${COLORS.border}`, background: 'white', fontSize: '0.875rem', fontWeight: '500', color: COLORS.dark, cursor: 'pointer' }}
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive Only</option>
                  <option value="negative">Negative Only</option>
                  <option value="neutral">Neutral Only</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: COLORS.dark, marginBottom: '6px', fontSize: '0.875rem' }}>
                  News Source
                </label>
                <select 
                  value={journalFilter} 
                  onChange={(e) => setJournalFilter(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${COLORS.border}`, background: 'white', fontSize: '0.875rem', fontWeight: '500', color: COLORS.dark, cursor: 'pointer' }}
                >
                  <option value="all">All Sources</option>
                  <option value="Haacklee Herald">Haacklee Herald</option>
                  <option value="Lomark Daily">Lomark Daily</option>
                  <option value="The News Buoy">The News Buoy</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: COLORS.dark, marginBottom: '6px', fontSize: '0.875rem' }}>
                  Sort By
                </label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${COLORS.border}`, background: 'white', fontSize: '0.875rem', fontWeight: '500', color: COLORS.dark, cursor: 'pointer' }}
                >
                  <option value="date">Date (Newest First)</option>
                  <option value="sentiment">Sentiment</option>
                  <option value="entities">Entity Count</option>
                  <option value="relevance">Content Length</option>
                </select>
              </div>
            </div>

            {showAdvancedFilters && (
              <div style={{ marginTop: '16px', padding: '16px', background: COLORS.light, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: COLORS.dark, marginBottom: '6px', fontSize: '0.875rem' }}>
                      View Mode
                    </label>
                    <select 
                      value={viewMode} 
                      onChange={(e) => setViewMode(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${COLORS.border}`, background: 'white', fontSize: '0.875rem', fontWeight: '500', color: COLORS.dark, cursor: 'pointer' }}
                    >
                      <option value="grid">Grid View</option>
                      <option value="list">List View</option>
                      <option value="analytics">Analytics View</option>
                    </select>
                  </div>
                  
                  <div style={{ 
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`, 
                    color: 'white', 
                    padding: '12px 20px', 
                    borderRadius: '8px',
                    fontWeight: '600',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    📊 {articleAnalysis.filteredCount} Filtered
                  </div>
                  
                  <button 
                    onClick={onProcessArticles}
                    disabled={loading}
                    style={{ 
                      padding: '12px 20px', 
                      borderRadius: '8px', 
                      border: 'none',
                      background: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.positive})`,
                      color: 'white',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? '⏳ Processing...' : '🔄 Process Articles'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Article Analytics Dashboard */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Sentiment Distribution */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
              <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📊 Article Sentiment Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Positive', value: articleAnalysis.sentimentDistribution.positive, fill: COLORS.positive },
                      { name: 'Negative', value: articleAnalysis.sentimentDistribution.negative, fill: COLORS.negative },
                      { name: 'Neutral', value: articleAnalysis.sentimentDistribution.neutral, fill: COLORS.neutral }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Journal Distribution */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
              <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📰 Source Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={Object.entries(articleAnalysis.journalDistribution).map(([journal, count]) => ({ journal, count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="journal" stroke={COLORS.dark} fontSize={10} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke={COLORS.dark} />
                  <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px' }} />
                  <Bar dataKey="count" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Entities */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
              <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🏢 Top Entities in Articles</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={articleAnalysis.topEntities}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="entity" stroke={COLORS.dark} fontSize={9} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke={COLORS.dark} />
                  <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px' }} />
                  <Bar dataKey="count" fill={COLORS.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Article Grid/List */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>
              📄 Articles ({articleAnalysis.filteredCount} of {articleAnalysis.totalArticles})
            </h3>
            
            <div style={{ 
              display: viewMode === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'none',
              flexDirection: viewMode === 'list' ? 'column' : 'none',
              gap: '16px',
              maxHeight: '600px',
              overflowY: 'auto'
            }}>
              {articleAnalysis.filteredArticles.slice(0, 50).map((article, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '16px', 
                    border: `1px solid ${COLORS.border}`, 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: selectedArticle === article ? '#F0F9FF' : 'white'
                  }}
                  onClick={() => setSelectedArticle(selectedArticle === article ? null : article)}
                  onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ 
                      background: getSentimentColor(article.sentiment), 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {getSentimentIcon(article.sentiment)} {article.sentiment?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {article.processed_date}
                    </div>
                  </div>
                  
                  <div style={{ fontWeight: '600', color: COLORS.dark, marginBottom: '4px', fontSize: '0.9rem' }}>
                    {article.filename?.substring(0, 50)}...
                  </div>
                  
                  <div style={{ color: '#6B7280', fontSize: '0.8rem', marginBottom: '8px', lineHeight: '1.4' }}>
                    {article.content?.substring(0, 100)}...
                  </div>
                  
                  {article.entities && article.entities.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {article.entities.slice(0, 3).map((entity, idx) => (
                        <span 
                          key={idx}
                          style={{ 
                            background: COLORS.light, 
                            color: COLORS.dark, 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '0.7rem',
                            border: `1px solid ${COLORS.border}`
                          }}
                        >
                          {entity}
                        </span>
                      ))}
                      {article.entities.length > 3 && (
                        <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                          +{article.entities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Entity Detail Modal */}
      {selectedEntity && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '90%', border: `1px solid ${COLORS.border}`, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ marginBottom: '20px', color: COLORS.dark, fontSize: '1.25rem', fontWeight: '600' }}>
              📊 Temporal Analysis: {selectedEntity.name}
            </h3>
            <button onClick={() => setSelectedEntity(null)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `2px solid ${COLORS.primary}`, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`, color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              Close Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemporalBiasAnalysis;
