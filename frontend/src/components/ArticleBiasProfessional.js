import React, { useMemo, useState, useEffect } from 'react';
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
  const [articleBiasData, setArticleBiasData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load article bias data from notebook analysis
  useEffect(() => {
    const loadArticleBiasData = async () => {
      try {
        const response = await fetch('/results/article_bias.json');
        if (response.ok) {
          const data = await response.json();
          setArticleBiasData(data);
        } else {
          console.warn('Article bias data not found, using fallback data');
          setArticleBiasData(generateFallbackArticleData());
        }
      } catch (error) {
        console.error('Error loading article bias data:', error);
        setArticleBiasData(generateFallbackArticleData());
      } finally {
        setLoading(false);
      }
    };

    loadArticleBiasData();
  }, []);

  // Generate fallback data if real data is not available
  const generateFallbackArticleData = () => {
    return {
      summary: { total_articles: 14, total_mentions: 8000, average_bias: 0.4, high_bias_articles: 3 },
      article_comparison: [],
      top_articles: { most_mentioned: [], most_biased: [], most_confident: [], most_diverse: [] },
      article_type_statistics: {},
      risk_assessment: { high_risk: 2, medium_risk: 4, low_risk: 8 },
      recommendations: [],
      chart_data: {}
    };
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article bias analysis...</p>
        </div>
      </div>
    );
  }

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
              🎛️ Advanced Filters
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
                Advanced Filters
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Sophisticated filtering controls for article analysis including sentiment, journal, and temporal filters.
              </div>
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(59, 130, 246, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#3b82f6', marginBottom: '4px' }}>
                  🔍 FILTER OPTIONS
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                  Sentiment Analysis • Journal Sources • Date Ranges • Entity Mentions
                </div>
              </div>
            </div>
          </div>
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
              📰 Article Distribution
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
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>📰</span>
                Article Distribution
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Pie chart visualization showing the distribution of articles across different sentiment categories.
              </div>
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(245, 158, 11, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#f59e0b', marginBottom: '4px' }}>
                  📊 SENTIMENT CATEGORIES
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                  Positive • Negative • Neutral sentiment classifications with percentage breakdown
                </div>
              </div>
            </div>
          </div>
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
              📊 Sentiment by Journal
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
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>📊</span>
                Sentiment by Journal
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Bar chart comparing sentiment distributions across different news journals and publications.
              </div>
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#10b981', marginBottom: '4px' }}>
                  📰 JOURNAL COMPARISON
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                  Haacklee Herald • Lomark Daily • The News Buoy sentiment analysis
                </div>
              </div>
            </div>
          </div>
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
              🏢 Company Sentiment Analysis
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
                Company Sentiment Analysis
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Detailed sentiment analysis for companies with significant media coverage and mention frequency.
              </div>
              <div style={{ 
                background: 'rgba(139, 92, 246, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(139, 92, 246, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#8b5cf6', marginBottom: '4px' }}>
                  🎯 ANALYSIS CRITERIA
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                  Companies with 3+ mentions • Sentiment scoring • Coverage frequency analysis
                </div>
              </div>
            </div>
          </div>
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
              📈 Temporal Analysis
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
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>📈</span>
                Temporal Analysis
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Time-series analysis showing sentiment trends and article publication patterns over time.
              </div>
              <div style={{ 
                background: 'rgba(14, 165, 233, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(14, 165, 233, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0ea5e9', marginBottom: '4px' }}>
                  📅 TIME TRENDS
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                  Monthly sentiment evolution • Publication frequency • Trend analysis
                </div>
              </div>
            </div>
          </div>
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
              🎯 Journal Bias Detection
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
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>🎯</span>
                Journal Bias Detection
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
                Radar chart analysis detecting potential bias patterns across different news journals and publications.
              </div>
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.05)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                border: '1px solid rgba(239, 68, 68, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>
                  🔍 BIAS METRICS
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                  Sentiment bias • Coverage patterns • Entity focus • Reporting frequency
                </div>
              </div>
            </div>
          </div>
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

      {/* Parallel Coordinates Plot */}
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
            📊 Parallel Coordinates Analysis
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
              Parallel Coordinates Analysis
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
              Multi-dimensional visualization showing relationships between different bias metrics across journals simultaneously.
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
                Positive Ratio • Negative Ratio • Bias Score • Coverage • Entity Focus
              </div>
            </div>
            <div style={{ 
              background: 'rgba(139, 92, 246, 0.05)', 
              padding: '8px 12px', 
              borderRadius: '6px',
              border: '1px solid rgba(139, 92, 246, 0.1)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#8b5cf6', marginBottom: '4px' }}>
                🎯 ANALYSIS GOAL
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
                Identify patterns and correlations between multiple bias indicators across different journals
              </div>
            </div>
          </div>
        </div>
        <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '0.9rem' }}>
          Multi-dimensional view of bias metrics across journals showing relationships between different bias indicators
        </p>
        
        <div style={{ height: '450px', width: '100%', overflowX: 'auto', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 1200 450" style={{ minWidth: '1200px' }}>
            {/* Background */}
            <rect width="100%" height="100%" fill="white" />
            
            {/* Tooltip */}
            <g id="tooltip" style={{ display: 'none', pointerEvents: 'none' }}>
              <rect x="0" y="0" width="200" height="80" fill="rgba(0,0,0,0.9)" rx="8" />
              <text x="10" y="20" fill="white" fontSize="12" fontWeight="600" id="tooltip-title"></text>
              <text x="10" y="40" fill="white" fontSize="11" id="tooltip-dimension"></text>
              <text x="10" y="55" fill="white" fontSize="11" id="tooltip-value"></text>
              <text x="10" y="70" fill="white" fontSize="11" id="tooltip-total"></text>
            </g>
            
            {/* Custom parallel coordinates lines */}
            {Object.entries(biasMetrics).map(([journal, metrics], index) => {
              const colors = ['#ef4444', '#3b82f6', '#10b981'];
              const color = colors[index % colors.length];
              
              const coordinates = [
                { x: 0, y: metrics.biasScore * 100, label: 'Bias Score', value: (metrics.biasScore * 100).toFixed(1) + '%' },
                { x: 1, y: metrics.positiveRatio * 100, label: 'Positive %', value: (metrics.positiveRatio * 100).toFixed(1) + '%' },
                { x: 2, y: metrics.negativeRatio * 100, label: 'Negative %', value: (metrics.negativeRatio * 100).toFixed(1) + '%' },
                { x: 3, y: Math.min(metrics.total, 100), label: 'Articles', value: metrics.total + ' articles' },
                { x: 4, y: Math.abs(metrics.positiveRatio - metrics.negativeRatio) * 100, label: 'Balance', value: (Math.abs(metrics.positiveRatio - metrics.negativeRatio) * 100).toFixed(1) + '%' }
              ];
              
              return (
                <g key={journal}>
                  {/* Draw connecting lines with hover */}
                  {coordinates.slice(0, -1).map((coord, i) => {
                    const nextCoord = coordinates[i + 1];
                    const x1 = 120 + (coord.x * 240);
                    const y1 = 350 - (coord.y * 2.5);
                    const x2 = 120 + (nextCoord.x * 240);
                    const y2 = 350 - (nextCoord.y * 2.5);
                    
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={color}
                        strokeWidth={4}
                        opacity={0.8}
                        style={{ 
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.strokeWidth = '6';
                          e.target.style.opacity = '1';
                          const tooltip = document.getElementById('tooltip');
                          const tooltipTitle = document.getElementById('tooltip-title');
                          const tooltipDimension = document.getElementById('tooltip-dimension');
                          const tooltipValue = document.getElementById('tooltip-value');
                          const tooltipTotal = document.getElementById('tooltip-total');
                          
                          tooltipTitle.textContent = journal;
                          tooltipDimension.textContent = `${coord.label} → ${nextCoord.label}`;
                          tooltipValue.textContent = `${coord.value} → ${nextCoord.value}`;
                          tooltipTotal.textContent = `Total Articles: ${metrics.total}`;
                          
                          tooltip.style.display = 'block';
                          tooltip.setAttribute('transform', `translate(${Math.min(e.clientX - 100, 1000)}, ${Math.max(e.clientY - 100, 10)})`);
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.strokeWidth = '4';
                          e.target.style.opacity = '0.8';
                          document.getElementById('tooltip').style.display = 'none';
                        }}
                      />
                    );
                  })}
                  
                  {/* Draw points with hover */}
                  {coordinates.map((coord, i) => {
                    const x = 120 + (coord.x * 240);
                    const y = 350 - (coord.y * 2.5);
                    
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={8}
                        fill={color}
                        stroke="white"
                        strokeWidth={3}
                        style={{ 
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.r = '12';
                          e.target.style.strokeWidth = '4';
                          const tooltip = document.getElementById('tooltip');
                          const tooltipTitle = document.getElementById('tooltip-title');
                          const tooltipDimension = document.getElementById('tooltip-dimension');
                          const tooltipValue = document.getElementById('tooltip-value');
                          const tooltipTotal = document.getElementById('tooltip-total');
                          
                          tooltipTitle.textContent = journal;
                          tooltipDimension.textContent = coord.label;
                          tooltipValue.textContent = coord.value;
                          tooltipTotal.textContent = `Total Articles: ${metrics.total}`;
                          
                          tooltip.style.display = 'block';
                          tooltip.setAttribute('transform', `translate(${Math.min(x + 20, 1000)}, ${Math.max(y - 90, 10)})`);
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.r = '8';
                          e.target.style.strokeWidth = '3';
                          document.getElementById('tooltip').style.display = 'none';
                        }}
                      />
                    );
                  })}
                </g>
              );
            })}
            
            {/* Axis lines and labels */}
            <g>
              {['Bias Score', 'Positive %', 'Negative %', 'Articles', 'Balance'].map((label, i) => (
                <g key={label}>
                  {/* Vertical axis lines */}
                  <line
                    x1={120 + (i * 240)}
                    y1={60}
                    x2={120 + (i * 240)}
                    y2={350}
                    stroke="#e5e7eb"
                    strokeWidth={3}
                  />
                  
                  {/* Axis labels */}
                  <text
                    x={120 + (i * 240)}
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
                        x1={110 + (i * 240)}
                        y1={350 - (value * 2.5)}
                        x2={130 + (i * 240)}
                        y2={350 - (value * 2.5)}
                        stroke="#9ca3af"
                        strokeWidth={2}
                      />
                      <text
                        x={100 + (i * 240)}
                        y={355 - (value * 2.5)}
                        textAnchor="end"
                        fill="#6b7280"
                        fontSize="12"
                        fontWeight="500"
                      >
                        {value}
                      </text>
                      
                      {/* Grid lines */}
                      <line
                        x1={120 + (i * 240)}
                        y1={350 - (value * 2.5)}
                        x2={120 + ((i + 1) * 240)}
                        y2={350 - (value * 2.5)}
                        stroke="#f3f4f6"
                        strokeWidth={1}
                        opacity={0.5}
                        style={{ display: i < 4 ? 'block' : 'none' }}
                      />
                    </g>
                  ))}
                </g>
              ))}
            </g>
            
            {/* Legend */}
            <g transform="translate(120, 390)">
              <rect x="-10" y="-10" width="960" height="50" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" rx="8" />
              {Object.keys(biasMetrics).map((journal, index) => {
                const colors = ['#ef4444', '#3b82f6', '#10b981'];
                const color = colors[index % colors.length];
                
                return (
                  <g key={journal} transform={`translate(${index * 320}, 15)`}>
                    <circle cx={0} cy={0} r={8} fill={color} stroke="white" strokeWidth={2} />
                    <text x={20} y={6} fill="#374151" fontSize="14" fontWeight="600">
                      {journal}
                    </text>
                  </g>
                );
              })}
            </g>
            
            {/* Title overlay */}
            <text x="600" y="25" textAnchor="middle" fill="#1f2937" fontSize="18" fontWeight="700">
              Multi-Dimensional Bias Analysis Across Journals
            </text>
          </svg>
        </div>
        
        {/* Interpretation Guide */}
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ color: COLORS.dark, marginBottom: '12px', fontSize: '1rem', fontWeight: '600' }}>
            📖 How to Read This Chart
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
              <strong>Bias Score:</strong> Overall bias intensity (0-100)
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
              <strong>Positive %:</strong> Percentage of positive articles
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
              <strong>Negative %:</strong> Percentage of negative articles
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
              <strong>Articles:</strong> Total article count (normalized)
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
              <strong>Balance:</strong> Sentiment balance difference
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ArticleBiasProfessional;
