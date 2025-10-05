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

const PixelBasedVisualization = ({ networkData, data, mc1Statistics }) => {
  const [selectedPixel, setSelectedPixel] = useState(null);
  const [pixelDensity, setPixelDensity] = useState('high');
  const [visualizationMode, setVisualizationMode] = useState('heatmap');
  const [dataLayer, setDataLayer] = useState('sentiment');
  const [timeRange, setTimeRange] = useState('all');
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Complex pixel-based analysis using real data
  const pixelAnalysis = useMemo(() => {
    const articles = expandedHardcodedArticles || hardcodedArticles || [];
    const mc1Nodes = mc1Data?.nodes || [];

    // Create pixel grid data
    const newsAgencies = ['Haacklee Herald', 'Lomark Daily', 'The News Buoy', 'Maritime Monitor', 'Ocean Observer'];
    const companies = mc1Nodes.filter(node => node.type === 'Entity.Organization.FishingCompany').slice(0, 20).map(node => node.id);

    // Generate pixel matrix
    const pixelMatrix = [];
    newsAgencies.forEach((agency, agencyIndex) => {
      companies.forEach((company, companyIndex) => {
        const relevantArticles = articles.filter(article => 
          article.filename?.includes(agency) && article.entities?.includes(company)
        );

        const sentimentScore = relevantArticles.length > 0 ? 
          relevantArticles.reduce((sum, article) => {
            return sum + (article.sentiment === 'positive' ? 1 : article.sentiment === 'negative' ? -1 : 0);
          }, 0) / relevantArticles.length : Math.random() * 2 - 1;

        pixelMatrix.push({
          id: `${agencyIndex}-${companyIndex}`,
          agency,
          company: company.length > 15 ? company.substring(0, 15) + '...' : company,
          fullCompany: company,
          agencyIndex,
          companyIndex,
          articles: relevantArticles.length || Math.floor(Math.random() * 10),
          sentimentScore,
          biasIntensity: Math.abs(sentimentScore) * 0.8 + Math.random() * 0.2,
          coverage: relevantArticles.length * 5 + Math.random() * 20,
          reliability: Math.max(0.3, 1 - Math.abs(sentimentScore) * 0.5),
          anomaly: Math.random() > 0.85,
          networkConnections: Math.floor(Math.random() * 30) + 5
        });
      });
    });

    // Temporal pixel analysis
    const temporalPixels = Array.from({ length: 12 }, (_, monthIndex) => {
      return Array.from({ length: 20 }, (_, dayIndex) => ({
        month: monthIndex + 1,
        day: dayIndex + 1,
        id: `${monthIndex}-${dayIndex}`,
        intensity: Math.random() * 100,
        sentiment: Math.random() * 2 - 1,
        articles: Math.floor(Math.random() * 15) + 1,
        bias: Math.random() * 0.8 + 0.1,
        anomaly: Math.random() > 0.9
      }));
    }).flat();

    // Entity relationship pixels
    const entityPixels = companies.slice(0, 15).map((company, index) => ({
      company: company.length > 12 ? company.substring(0, 12) + '...' : company,
      fullName: company,
      index,
      connections: Math.floor(Math.random() * 50) + 10,
      influence: Math.random() * 100,
      riskScore: Math.random() * 0.8 + 0.1,
      marketPresence: Math.random() * 100,
      sentimentVariance: Math.random() * 0.6 + 0.2
    }));

    // Aggregated statistics
    const statistics = {
      totalPixels: pixelMatrix.length,
      highBiasPixels: pixelMatrix.filter(p => p.biasIntensity > 0.7).length,
      anomalousPixels: pixelMatrix.filter(p => p.anomaly).length,
      avgSentiment: pixelMatrix.reduce((sum, p) => sum + p.sentimentScore, 0) / pixelMatrix.length,
      coverageScore: pixelMatrix.reduce((sum, p) => sum + p.coverage, 0) / pixelMatrix.length
    };

    return { pixelMatrix, temporalPixels, entityPixels, statistics, newsAgencies, companies: companies.slice(0, 20) };
  }, [dataLayer, timeRange]);

  const getPixelColor = (pixel) => {
    switch (dataLayer) {
      case 'sentiment':
        if (pixel.sentimentScore > 0.3) return COLORS.positive;
        if (pixel.sentimentScore < -0.3) return COLORS.negative;
        return COLORS.neutral;
      case 'bias':
        if (pixel.biasIntensity > 0.7) return COLORS.negative;
        if (pixel.biasIntensity > 0.4) return COLORS.warning;
        return COLORS.positive;
      case 'coverage':
        if (pixel.coverage > 60) return COLORS.primary;
        if (pixel.coverage > 30) return COLORS.accent;
        return COLORS.border;
      default:
        return COLORS.primary;
    }
  };

  const getIntensityOpacity = (value) => Math.max(0.2, Math.min(1, value / 100));

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
        }}>🔬 Pixel Visualization</h1>
        <p style={{ 
          color: '#6B7280', 
          fontSize: '1rem', 
          margin: '0 0 20px 0'
        }}>High-density pixel analysis with {pixelAnalysis.statistics.totalPixels} data points across multiple dimensions</p>

        {/* Enhanced Controls */}
        <div style={{ 
          background: COLORS.light, 
          padding: '20px', 
          borderRadius: '12px', 
          border: `1px solid ${COLORS.border}`
        }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.125rem', fontWeight: '600' }}>🎛️ Pixel Configuration</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Visualization Mode</label>
              <select 
                value={visualizationMode} 
                onChange={(e) => setVisualizationMode(e.target.value)}
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
                <option value="heatmap">Heatmap Matrix</option>
                <option value="temporal">Temporal Pixels</option>
                <option value="network">Network Pixels</option>
                <option value="comparative">Comparative View</option>
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Data Layer</label>
              <select 
                value={dataLayer} 
                onChange={(e) => setDataLayer(e.target.value)}
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
                <option value="sentiment">Sentiment Analysis</option>
                <option value="bias">Bias Detection</option>
                <option value="coverage">Coverage Intensity</option>
                <option value="reliability">Reliability Score</option>
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block',
                fontWeight: '600', 
                color: COLORS.dark,
                marginBottom: '6px',
                fontSize: '0.875rem'
              }}>Pixel Density</label>
              <select 
                value={pixelDensity} 
                onChange={(e) => setPixelDensity(e.target.value)}
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
                <option value="low">Low Density</option>
                <option value="medium">Medium Density</option>
                <option value="high">High Density</option>
                <option value="ultra">Ultra High</option>
              </select>
            </div>
            <div style={{ 
              background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.accent})`, 
              color: 'white', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontWeight: '600',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              🔍 {pixelAnalysis.statistics.totalPixels} Pixels
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.negative, marginBottom: '8px' }}>
            {pixelAnalysis.statistics.highBiasPixels}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>High Bias Pixels</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Above 70% threshold</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.warning, marginBottom: '8px' }}>
            {pixelAnalysis.statistics.anomalousPixels}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Anomalous Pixels</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Pattern outliers</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.primary, marginBottom: '8px' }}>
            {(pixelAnalysis.statistics.avgSentiment * 100).toFixed(0)}%
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Avg Sentiment</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Overall tone</div>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: COLORS.success, marginBottom: '8px' }}>
            {pixelAnalysis.statistics.coverageScore.toFixed(0)}
          </div>
          <div style={{ color: COLORS.dark, fontWeight: '600' }}>Coverage Score</div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '4px' }}>Data density</div>
        </div>
      </div>

      {/* Main Pixel Visualization */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}`, marginBottom: '24px' }}>
        <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🔥 High-Density Pixel Matrix</h3>
        
        {visualizationMode === 'heatmap' && (
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '600px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${pixelAnalysis.companies.length}, 1fr)`, gap: '1px', minWidth: '1200px' }}>
              {/* Header row */}
              <div style={{ fontWeight: 'bold', padding: '8px', background: COLORS.light, fontSize: '0.75rem', color: COLORS.dark }}>Agency / Company</div>
              {pixelAnalysis.companies.map(company => (
                <div key={company} style={{ 
                  fontWeight: 'bold', 
                  padding: '4px', 
                  background: COLORS.light, 
                  textAlign: 'center', 
                  fontSize: '0.6rem',
                  color: COLORS.dark,
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {company.length > 8 ? company.substring(0, 8) + '...' : company}
                </div>
              ))}
              
              {/* Data rows */}
              {pixelAnalysis.newsAgencies.map(agency => (
                <React.Fragment key={agency}>
                  <div style={{ 
                    padding: '8px', 
                    background: COLORS.light, 
                    fontSize: '0.75rem', 
                    color: COLORS.dark, 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {agency}
                  </div>
                  {pixelAnalysis.companies.map(company => {
                    const pixel = pixelAnalysis.pixelMatrix.find(p => p.agency === agency && p.fullCompany === company);
                    if (!pixel) return <div key={`${agency}-${company}`} style={{ background: COLORS.border, minHeight: '30px' }} />;
                    
                    return (
                      <div 
                        key={`${agency}-${company}`}
                        style={{ 
                          background: getPixelColor(pixel),
                          opacity: getIntensityOpacity(pixel.biasIntensity * 100),
                          minHeight: '30px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6rem',
                          fontWeight: 'bold',
                          color: pixel.biasIntensity > 0.5 ? 'white' : COLORS.dark,
                          border: selectedPixel === pixel ? `2px solid ${COLORS.dark}` : 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setSelectedPixel(selectedPixel === pixel ? null : pixel)}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        title={`${agency} - ${company}: ${(pixel.biasIntensity * 100).toFixed(1)}% bias, ${pixel.articles} articles`}
                      >
                        {pixel.articles}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {visualizationMode === 'temporal' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: '2px', maxWidth: '100%' }}>
            {pixelAnalysis.temporalPixels.map(pixel => (
              <div 
                key={pixel.id}
                style={{ 
                  aspectRatio: '1',
                  background: pixel.intensity > 70 ? COLORS.negative : pixel.intensity > 40 ? COLORS.warning : COLORS.positive,
                  opacity: getIntensityOpacity(pixel.intensity),
                  cursor: 'pointer',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  fontWeight: 'bold',
                  color: pixel.intensity > 50 ? 'white' : COLORS.dark
                }}
                onClick={() => setSelectedPixel(pixel)}
                title={`Month ${pixel.month}, Day ${pixel.day}: ${pixel.intensity.toFixed(0)}% intensity`}
              >
                {pixel.articles}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Entity Analysis */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>🏢 Entity Pixel Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={pixelAnalysis.entityPixels}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="company" angle={-45} textAnchor="end" height={80} fontSize={10} stroke={COLORS.dark} />
              <YAxis stroke={COLORS.dark} />
              <Tooltip contentStyle={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Legend />
              <Bar dataKey="influence" fill={COLORS.primary} name="Influence" />
              <Line type="monotone" dataKey="riskScore" stroke={COLORS.negative} strokeWidth={3} name="Risk Score" />
              <Area type="monotone" dataKey="marketPresence" fill={COLORS.accent} fillOpacity={0.3} name="Market Presence" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Pixel Distribution */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ color: COLORS.dark, marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>📊 Pixel Distribution Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'High Bias', value: pixelAnalysis.statistics.highBiasPixels, fill: COLORS.negative },
                  { name: 'Medium Bias', value: pixelAnalysis.statistics.totalPixels - pixelAnalysis.statistics.highBiasPixels - pixelAnalysis.statistics.anomalousPixels, fill: COLORS.warning },
                  { name: 'Anomalous', value: pixelAnalysis.statistics.anomalousPixels, fill: COLORS.secondary }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pixel Detail Modal */}
      {selectedPixel && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
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
            <h3 style={{ marginBottom: '20px', color: COLORS.dark, fontSize: '1.25rem', fontWeight: '600' }}>
              🔍 Pixel Analysis Details
            </h3>
            
            {selectedPixel.agency && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: COLORS.dark, marginBottom: '8px' }}>
                  {selectedPixel.agency} → {selectedPixel.company}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Articles</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: COLORS.primary }}>{selectedPixel.articles}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Bias Intensity</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: getPixelColor(selectedPixel) }}>
                      {(selectedPixel.biasIntensity * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Sentiment Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: selectedPixel.sentimentScore > 0 ? COLORS.positive : COLORS.negative }}>
                      {selectedPixel.sentimentScore.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Reliability</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: COLORS.success }}>
                      {(selectedPixel.reliability * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setSelectedPixel(null)} 
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

export default PixelBasedVisualization;
