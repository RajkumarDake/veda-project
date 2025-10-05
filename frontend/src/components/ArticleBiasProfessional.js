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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area
} from 'recharts';

// Professional color palette
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

const JOURNAL_COLORS = {
  'Haacklee Herald': '#8B5CF6', // Violet-500
  'Lomark Daily': '#F59E0B', // Amber-500
  'The News Buoy': '#10B981' // Emerald-500
};

const ArticleBiasProfessional = ({ articles = [] }) => {
  const [selectedJournal, setSelectedJournal] = useState('All');
  const [selectedSentiment, setSelectedSentiment] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');

  // Define journals array at the top
  const journals = ['Haacklee Herald', 'Lomark Daily', 'The News Buoy'];

  // Extract journal from filename
  const extractJournal = (filename) => {
    if (filename.includes('Haacklee Herald')) return 'Haacklee Herald';
    if (filename.includes('Lomark Daily')) return 'Lomark Daily';
    if (filename.includes('The News Buoy')) return 'The News Buoy';
    return 'Unknown';
  };

  // Company sentiment analysis (fixed version)
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
      .filter(([, stats]) => stats.total >= 3)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 15)
      .map(([entity, stats]) => ({
        company: entity.length > 18 ? entity.substring(0, 18) + '...' : entity,
        fullName: entity,
        positive: stats.positive,
        negative: stats.negative,
        neutral: stats.neutral,
        total: stats.total
      }));
  }, [articles]);

  // Journal distribution
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

  // Sentiment by journal
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

  // Temporal analysis
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

  // Get unique companies for filtering
  const uniqueCompanies = useMemo(() => {
    const companies = new Set();
    articles.forEach(article => {
      article.entities.forEach(entity => companies.add(entity));
    });
    return Array.from(companies).sort();
  }, [articles]);

  // Filtered articles based on all selections
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const journal = extractJournal(article.filename);
      const journalMatch = selectedJournal === 'All' || journal === selectedJournal;
      const sentimentMatch = selectedSentiment === 'All' || article.sentiment === selectedSentiment;
      const companyMatch = selectedCompany === 'All' || article.entities.includes(selectedCompany);
      return journalMatch && sentimentMatch && companyMatch;
    });
  }, [articles, selectedJournal, selectedSentiment, selectedCompany]);

  // Enhanced bias detection metrics
  const biasMetrics = useMemo(() => {
    const journalBias = {};
    journals.forEach(journal => {
      const journalArticles = articles.filter(a => extractJournal(a.filename) === journal);
      const total = journalArticles.length;
      const positive = journalArticles.filter(a => a.sentiment === 'positive').length;
      const negative = journalArticles.filter(a => a.sentiment === 'negative').length;
      
      journalBias[journal] = {
        total,
        positiveRatio: total > 0 ? (positive / total) : 0,
        negativeRatio: total > 0 ? (negative / total) : 0,
        biasScore: total > 0 ? Math.abs((positive - negative) / total) : 0
      };
    });
    return journalBias;
  }, [articles]);

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
        }}>📊 Professional Article Bias Analysis</h1>
        <p style={{ 
          color: '#6B7280', 
          fontSize: '1.125rem', 
          margin: 0
        }}>Comprehensive analysis across {articles.length} articles</p>
        
        {/* Enhanced Filter Controls */}
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
            <div>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Company Filter</label>
              <select 
                value={selectedCompany} 
                onChange={(e) => setSelectedCompany(e.target.value)}
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
                <option value="All">All Companies</option>
                {uniqueCompanies.slice(0, 20).map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
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
              📈 {filteredArticles.length} Articles Filtered
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
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.positive, marginBottom: '8px' }}>
            {filteredArticles.length > 0 ? Math.round((filteredArticles.filter(a => a.sentiment === 'positive').length / filteredArticles.length) * 100) : 0}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Positive Coverage</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
            {filteredArticles.filter(a => a.sentiment === 'positive').length} articles
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
            {filteredArticles.length > 0 ? Math.round((filteredArticles.filter(a => a.sentiment === 'negative').length / filteredArticles.length) * 100) : 0}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Negative Coverage</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
            {filteredArticles.filter(a => a.sentiment === 'negative').length} articles
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
            {new Set(filteredArticles.flatMap(a => a.entities)).size}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Unique Entities</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
            In filtered results
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
            {Object.values(biasMetrics).reduce((max, journal) => Math.max(max, journal.biasScore), 0).toFixed(2)}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Max Bias Score</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>
            Across all journals
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Journal Distribution */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📰 Article Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={journalDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
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

        {/* Sentiment by Journal */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📊 Sentiment by Journal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sentimentByJournal}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="journal" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="positive" fill={COLORS.positive} name="Positive" />
              <Bar dataKey="negative" fill={COLORS.negative} name="Negative" />
              <Bar dataKey="neutral" fill={COLORS.neutral} name="Neutral" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Company Sentiment Analysis - FIXED */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🏢 Company Sentiment Analysis</h3>
          <div style={{ marginBottom: '16px', color: '#6B7280', fontSize: '0.875rem' }}>
            Companies with 3+ mentions: {companySentimentData.length} total
          </div>
          {companySentimentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={450}>
              <ComposedChart data={companySentimentData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
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
                    background: 'white', 
                    border: `1px solid ${COLORS.border}`, 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#6B7280',
              background: COLORS.light,
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
              <div>No company data available with minimum 3 mentions</div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Temporal Analysis */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📈 Temporal Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temporalData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="positive" stroke={COLORS.positive} strokeWidth={3} />
              <Line type="monotone" dataKey="negative" stroke={COLORS.negative} strokeWidth={3} />
              <Line type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bias Detection Radar */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🎯 Journal Bias Detection</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={journals.map(journal => ({
              journal,
              positiveRatio: (biasMetrics[journal]?.positiveRatio || 0) * 100,
              negativeRatio: (biasMetrics[journal]?.negativeRatio || 0) * 100,
              biasScore: (biasMetrics[journal]?.biasScore || 0) * 100,
              coverage: biasMetrics[journal]?.total || 0
            }))}>
              <PolarGrid stroke={COLORS.border} />
              <PolarAngleAxis dataKey="journal" tick={{ fill: COLORS.dark, fontWeight: 'bold', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} />
              <Radar
                name="Positive %"
                dataKey="positiveRatio"
                stroke={COLORS.positive}
                fill={COLORS.positive}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Negative %"
                dataKey="negativeRatio"
                stroke={COLORS.negative}
                fill={COLORS.negative}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Bias Score"
                dataKey="biasScore"
                stroke={COLORS.secondary}
                fill={COLORS.secondary}
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analysis Insights Summary */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${COLORS.border}`,
        marginBottom: '24px'
      }}>
        <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🔍 Key Insights</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {/* Most Biased Journal */}
          <div style={{ 
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #F59E0B'
          }}>
            <div style={{ fontWeight: '600', color: '#92400E', marginBottom: '8px' }}>📊 Most Biased Journal</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#92400E' }}>
              {Object.entries(biasMetrics).reduce((max, [journal, metrics]) => 
                metrics.biasScore > (biasMetrics[max]?.biasScore || 0) ? journal : max, 
                'Haacklee Herald'
              )}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#92400E', marginTop: '4px' }}>
              Bias Score: {Math.max(...Object.values(biasMetrics).map(m => m.biasScore)).toFixed(3)}
            </div>
          </div>

          {/* Most Positive Coverage */}
          <div style={{ 
            background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #10B981'
          }}>
            <div style={{ fontWeight: '600', color: '#065F46', marginBottom: '8px' }}>✅ Most Positive Coverage</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#065F46' }}>
              {Object.entries(biasMetrics).reduce((max, [journal, metrics]) => 
                metrics.positiveRatio > (biasMetrics[max]?.positiveRatio || 0) ? journal : max, 
                'Haacklee Herald'
              )}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#065F46', marginTop: '4px' }}>
              {Math.round(Math.max(...Object.values(biasMetrics).map(m => m.positiveRatio)) * 100)}% positive articles
            </div>
          </div>

          {/* Coverage Distribution */}
          <div style={{ 
            background: 'linear-gradient(135deg, #E0E7FF, #C7D2FE)', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #3B82F6'
          }}>
            <div style={{ fontWeight: '600', color: '#1E40AF', marginBottom: '8px' }}>📈 Coverage Analysis</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E40AF' }}>
              {filteredArticles.length} Articles
            </div>
            <div style={{ fontSize: '0.875rem', color: '#1E40AF', marginTop: '4px' }}>
              {new Set(filteredArticles.flatMap(a => a.entities)).size} unique entities mentioned
            </div>
          </div>

          {/* Sentiment Balance */}
          <div style={{ 
            background: 'linear-gradient(135deg, #F3E8FF, #E9D5FF)', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #8B5CF6'
          }}>
            <div style={{ fontWeight: '600', color: '#5B21B6', marginBottom: '8px' }}>⚖️ Sentiment Balance</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5B21B6' }}>
              {filteredArticles.length > 0 ? 
                Math.abs(
                  filteredArticles.filter(a => a.sentiment === 'positive').length - 
                  filteredArticles.filter(a => a.sentiment === 'negative').length
                ) : 0
              } Article Gap
            </div>
            <div style={{ fontSize: '0.875rem', color: '#5B21B6', marginTop: '4px' }}>
              Between positive and negative coverage
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleBiasProfessional;
