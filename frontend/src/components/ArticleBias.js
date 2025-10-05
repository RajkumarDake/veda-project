import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart, 
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts';

// Professional color palette
const COLORS = {
  positive: '#10B981', // Emerald-500
  negative: '#EF4444', // Red-500
  neutral: '#F59E0B', // Amber-500
  primary: '#3B82F6', // Blue-500
  secondary: '#8B5CF6', // Violet-500
  accent: '#06B6D4', // Cyan-500
  warning: '#F59E0B', // Amber-500
  success: '#059669', // Emerald-600
  info: '#0EA5E9', // Sky-500
  dark: '#1F2937', // Gray-800
  light: '#F9FAFB', // Gray-50
  border: '#E5E7EB' // Gray-200
};

const JOURNAL_COLORS = {
  'Haacklee Herald': '#8B5CF6', // Violet-500
  'Lomark Daily': '#F59E0B', // Amber-500
  'The News Buoy': '#10B981' // Emerald-500
};

const GRADIENT_COLORS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  warning: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  danger: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  dark: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'
};

const ArticleBias = ({ networkData, articles = [], sentimentAnalysis = [], mc1Data }) => {
  const [selectedJournal, setSelectedJournal] = useState('All');
  const [selectedSentiment, setSelectedSentiment] = useState('All');

  // Extract journal from filename
  const extractJournal = (filename) => {
    if (filename.includes('Haacklee Herald')) return 'Haacklee Herald';
    if (filename.includes('Lomark Daily')) return 'Lomark Daily';
    if (filename.includes('The News Buoy')) return 'The News Buoy';
    return 'Unknown';
  };

  // 1) Article distribution by journal
  const journalDistribution = useMemo(() => {
    const distribution = {};
    articles.forEach(article => {
      const journal = extractJournal(article.filename);
      distribution[journal] = (distribution[journal] || 0) + 1;
    });
    return Object.entries(distribution).map(([journal, count]) => ({
      journal,
      count,
      fill: JOURNAL_COLORS[journal] || COLORS.primary
    }));
  }, [articles]);

  // 2) Sentiment analysis by journal
  const sentimentByJournal = useMemo(() => {
    const data = {};
    articles.forEach(article => {
      const journal = extractJournal(article.filename);
      if (!data[journal]) {
        data[journal] = { journal, positive: 0, negative: 0, neutral: 0 };
      }
      data[journal][article.sentiment]++;
    });
    return Object.values(data);
  }, [articles]);

  // 3) Entity mention frequency
  const entityMentions = useMemo(() => {
    const mentions = {};
    articles.forEach(article => {
      article.entities.forEach(entity => {
        mentions[entity] = (mentions[entity] || 0) + 1;
      });
    });
    return Object.entries(mentions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([entity, count]) => ({ entity, count }));
  }, [articles]);

  // 4) Sentiment distribution pie chart
  const sentimentDistribution = useMemo(() => {
    const distribution = { positive: 0, negative: 0, neutral: 0 };
    articles.forEach(article => {
      distribution[article.sentiment]++;
    });
    return Object.entries(distribution).map(([sentiment, count]) => ({
      name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
      value: count,
      fill: COLORS[sentiment]
    }));
  }, [articles]);

  // 5) Company sentiment analysis (generated from article data)
  const companySentimentData = useMemo(() => {
    const companyStats = {};
    
    articles.forEach(article => {
      article.entities.forEach(entity => {
        if (!companyStats[entity]) {
          companyStats[entity] = { positive: 0, negative: 0, neutral: 0, total: 0 };
        }
        companyStats[entity][article.sentiment]++;
        companyStats[entity].total++;
      });
    });
    
    return Object.entries(companyStats)
      .filter(([, stats]) => stats.total >= 3) // Only companies with 3+ mentions
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 15)
      .map(([entity, stats]) => ({
        company: entity.length > 20 ? entity.substring(0, 20) + '...' : entity,
        fullName: entity,
        positive: stats.positive,
        negative: stats.negative,
        neutral: stats.neutral,
        total: stats.total,
        positiveRatio: (stats.positive / stats.total * 100).toFixed(1),
        negativeRatio: (stats.negative / stats.total * 100).toFixed(1)
      }));
  }, [articles]);

  // 6) Temporal analysis by date
  const temporalData = useMemo(() => {
    const dateStats = {};
    articles.forEach(article => {
      const date = article.processed_date;
      if (!dateStats[date]) {
        dateStats[date] = { date, positive: 0, negative: 0, neutral: 0, total: 0 };
      }
      dateStats[date][article.sentiment]++;
      dateStats[date].total++;
    });
    return Object.values(dateStats).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [articles]);

  // 7) Entity co-occurrence analysis
  const entityCooccurrence = useMemo(() => {
    const cooccurrence = {};
    articles.forEach(article => {
      const entities = article.entities;
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const pair = [entities[i], entities[j]].sort().join(' + ');
          cooccurrence[pair] = (cooccurrence[pair] || 0) + 1;
        }
      }
    });
    return Object.entries(cooccurrence)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([pair, count]) => ({ pair, count }));
  }, [articles]);

  // 8) Sentiment intensity analysis
  const sentimentIntensity = useMemo(() => {
    const journals = ['Haacklee Herald', 'Lomark Daily', 'The News Buoy'];
    return journals.map(journal => {
      const journalArticles = articles.filter(a => extractJournal(a.filename) === journal);
      const total = journalArticles.length;
      const positive = journalArticles.filter(a => a.sentiment === 'positive').length;
      const negative = journalArticles.filter(a => a.sentiment === 'negative').length;
      
      return {
        journal,
        positiveIntensity: total > 0 ? (positive / total * 100) : 0,
        negativeIntensity: total > 0 ? (negative / total * 100) : 0,
        neutralIntensity: total > 0 ? ((total - positive - negative) / total * 100) : 0,
        totalArticles: total
      };
    });
  }, [articles]);

  // 9) Bias detection radar chart
  const biasRadarData = useMemo(() => {
    const journals = ['Haacklee Herald', 'Lomark Daily', 'The News Buoy'];
    return journals.map(journal => {
      const journalArticles = articles.filter(a => extractJournal(a.filename) === journal);
      const total = journalArticles.length;
      const positive = journalArticles.filter(a => a.sentiment === 'positive').length;
      const negative = journalArticles.filter(a => a.sentiment === 'negative').length;
      const neutral = journalArticles.filter(a => a.sentiment === 'neutral').length;
      
      return {
        journal,
        positivity: total > 0 ? (positive / total) * 100 : 0,
        negativity: total > 0 ? (negative / total) * 100 : 0,
        neutrality: total > 0 ? (neutral / total) * 100 : 0,
        coverage: total,
        diversity: new Set(journalArticles.flatMap(a => a.entities)).size
      };
    });
  }, [articles]);

  // 10) Filtered articles based on selection
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const journal = extractJournal(article.filename);
      const journalMatch = selectedJournal === 'All' || journal === selectedJournal;
      const sentimentMatch = selectedSentiment === 'All' || article.sentiment === selectedSentiment;
      return journalMatch && sentimentMatch;
    });
  }, [articles, selectedJournal, selectedSentiment]);

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Professional Header */}
      <div style={{ 
        background: 'white', 
        padding: '32px', 
        borderRadius: '16px', 
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: `1px solid ${COLORS.border}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ 
              color: COLORS.dark, 
              fontSize: '2rem', 
              fontWeight: '700', 
              margin: '0 0 8px 0',
              letterSpacing: '-0.025em'
            }}>📊 Article Bias Analysis Dashboard</h1>
            <p style={{ 
              color: '#6B7280', 
              fontSize: '1.125rem', 
              margin: 0,
              fontWeight: '400'
            }}>Comprehensive analysis of media sentiment and bias patterns across {articles.length} articles</p>
          </div>
          <div style={{
            background: GRADIENT_COLORS.primary,
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', lineHeight: '1' }}>{articles.length}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Articles</div>
          </div>
        </div>
        
        {/* Advanced Filter Controls */}
        <div style={{ 
          background: COLORS.light, 
          padding: '20px', 
          borderRadius: '12px', 
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.125rem', fontWeight: '600' }}>🎛️ Analysis Filters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>News Source</label>
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
                <option value="All">All Sources</option>
                <option value="Haacklee Herald">Haacklee Herald</option>
                <option value="Lomark Daily">Lomark Daily</option>
                <option value="The News Buoy">The News Buoy</option>
              </select>
            </div>
            <div>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Sentiment Filter</label>
              <select 
                value={selectedSentiment} 
                onChange={(e) => setSelectedSentiment(e.target.value)}
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
                <option value="All">All Sentiments</option>
                <option value="positive">Positive Only</option>
                <option value="negative">Negative Only</option>
                <option value="neutral">Neutral Only</option>
              </select>
            </div>
            <div style={{ 
              background: GRADIENT_COLORS.info, 
              color: 'white', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontWeight: '600',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              📈 {filteredArticles.length} Articles Filtered
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.positive, marginBottom: '8px' }}>
            {Math.round((articles.filter(a => a.sentiment === 'positive').length / articles.length) * 100)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600', fontSize: '1rem' }}>Positive Coverage</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
            {articles.filter(a => a.sentiment === 'positive').length} articles
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
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.negative, marginBottom: '8px' }}>
            {Math.round((articles.filter(a => a.sentiment === 'negative').length / articles.length) * 100)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600', fontSize: '1rem' }}>Negative Coverage</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
            {articles.filter(a => a.sentiment === 'negative').length} articles
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
            {new Set(articles.flatMap(a => a.entities)).size}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600', fontSize: '1rem' }}>Unique Entities</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Mentioned across articles</div>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.secondary, marginBottom: '8px' }}>3</div>
          <div style={{ color: COLORS.dark, fontWeight: '600', fontSize: '1rem' }}>News Sources</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Media outlets analyzed</div>
        </div>
      </div>

      {/* Row 2: Article Distribution and Sentiment Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '20px', 
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>📰 Article Distribution by Journal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={journalDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({ journal, count }) => `${journal}: ${count}`}
              >
                {journalDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '20px', 
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>😊 Overall Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {sentimentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Sentiment by Journal and Entity Mentions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '20px', 
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>📊 Sentiment Analysis by Journal</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sentimentByJournal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="journal" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(255,255,255,0.95)', 
                  border: 'none', 
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="positive" stackId="a" fill={COLORS.positive} name="Positive" />
              <Bar dataKey="negative" stackId="a" fill={COLORS.negative} name="Negative" />
              <Bar dataKey="neutral" stackId="a" fill={COLORS.neutral} name="Neutral" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '20px', 
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>🏢 Top Entity Mentions</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {entityMentions.map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                  {item.entity.length > 20 ? item.entity.substring(0, 20) + '...' : item.entity}
                </span>
                <span style={{ 
                  background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Company Sentiment Analysis */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '20px', 
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>🏭 Company Sentiment Analysis</h3>
          <div style={{ marginBottom: '16px', color: '#6B7280', fontSize: '0.875rem' }}>
            Companies with 3+ mentions: {companySentimentData.length} total | Articles analyzed: {articles.length}
          </div>
          <ResponsiveContainer width="100%" height={400}>
            {companySentimentData.length > 0 ? (
              <ComposedChart data={companySentimentData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="company" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={10}
                />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(255,255,255,0.95)', 
                    border: 'none', 
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name, props) => [
                    `${value} articles`, 
                    name,
                    `${props.payload.fullName}: ${props.payload.total} total mentions`
                  ]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  fill={`url(#colorTotal)`} 
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fillOpacity={0.3}
                  name="Total Coverage"
                />
                <Bar dataKey="positive" fill={COLORS.positive} name="Positive" />
                <Bar dataKey="negative" fill={COLORS.negative} name="Negative" />
                <Line 
                  type="monotone" 
                  dataKey="neutral" 
                  stroke={COLORS.neutral} 
                  strokeWidth={3}
                  dot={{ fill: COLORS.neutral, strokeWidth: 2, r: 4 }}
                  name="Neutral Trend"
                />
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </ComposedChart>
            ) : (
              <div style={{ 
                width: '100%',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center', 
                color: '#6B7280',
                background: COLORS.light,
                borderRadius: '8px',
                position: 'relative'
              }}>
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
                  <div style={{ fontSize: '1rem', fontWeight: '500' }}>No company data available with minimum 3 mentions</div>
                  <div style={{ fontSize: '0.875rem', marginTop: '8px', opacity: 0.7 }}>
                    Try adjusting filters or check if articles contain entity data
                  </div>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Bias Detection Radar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '20px', 
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>🎯 Journal Bias Detection Radar</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={biasRadarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="journal" tick={{ fill: '#4a5568', fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#718096', fontSize: 12 }} />
              <Radar
                name="Positivity %"
                dataKey="positivity"
                stroke={COLORS.positive}
                fill={COLORS.positive}
                fillOpacity={0.3}
                strokeWidth={3}
              />
              <Radar
                name="Negativity %"
                dataKey="negativity"
                stroke={COLORS.negative}
                fill={COLORS.negative}
                fillOpacity={0.3}
                strokeWidth={3}
              />
              <Radar
                name="Neutrality %"
                dataKey="neutrality"
                stroke={COLORS.neutral}
                fill={COLORS.neutral}
                fillOpacity={0.3}
                strokeWidth={3}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(255,255,255,0.95)', 
                  border: 'none', 
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div style={{ 
        background: 'rgba(255,255,255,0.95)', 
        padding: '20px', 
        borderRadius: '15px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>📈 Analysis Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ 
            background: 'linear-gradient(45deg, #48bb78, #38a169)', 
            color: 'white', 
            padding: '15px', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{articles.length}</div>
            <div>Total Articles</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(45deg, #4299e1, #3182ce)', 
            color: 'white', 
            padding: '15px', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {new Set(articles.flatMap(a => a.entities)).size}
            </div>
            <div>Unique Entities</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(45deg, #9f7aea, #805ad5)', 
            color: 'white', 
            padding: '15px', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>3</div>
            <div>News Sources</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(45deg, #ed8936, #dd6b20)', 
            color: 'white', 
            padding: '15px', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {Math.round((articles.filter(a => a.sentiment === 'positive').length / articles.length) * 100)}%
            </div>
            <div>Positive Coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleBias;


