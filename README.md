# 🐟 FishEye Watcher: Visual Analytics System for Knowledge Graph Bias Detection

A comprehensive visual analytics system designed to detect bias in commercial fishing knowledge graphs, built for the IEEE VAST Challenge 2024 MC1. This system helps analysts identify potential bias in news sources, extraction algorithms, and human analysts working with commercial fishing data.

## 🌟 Features

- **📊 Interactive Dashboard**: Real-time overview of articles, sentiment analysis, and bias detection
- **🔍 Bias Detection**: Advanced sentiment and entropy analysis to identify potential bias
- **🕸️ Network Visualization**: Interactive knowledge graph exploration with D3.js
- **🌐 Neo4j Integration**: Load and visualize MC1 knowledge graph data with Neo4j
- **📄 Article Management**: Upload, process, and analyze news articles
- **🤖 Algorithm Comparison**: Compare bias between different LLM extraction algorithms
- **📈 Visual Analytics**: Rich visualizations using Recharts and D3.js
- **🔍 Entity Search**: Search and filter entities across the knowledge graph

## 🏗️ Architecture

The system follows a modern full-stack architecture:

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MC1.JSON      │    │   NEO4J      │    │   BACKEND       │    │   FRONTEND      │
│   KNOWLEDGE     │───▶│   GRAPH DB   │───▶│   (Flask)       │───▶│   (React.js)    │
│   GRAPH         │    │              │    │                 │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                    │                       │
        ▼                       ▼                    ▼                       ▼
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • Entities      │    │ • Nodes      │    │ • REST APIs     │    │ • Interactive   │
│ • Relationships │    │ • Edges      │    │ • Graph Queries │    │   Graph Viz     │
│ • Metadata      │    │ • Properties │    │ • Bias Analysis │    │ • D3.js Charts  │
└─────────────────┘    └──────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                    │                       │
        ▼                       ▼                    ▼                       ▼
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ARTICLES      │    │   SQLITE     │    │ • Data Process. │    │ • Search &      │
│   DATA          │───▶│   DATABASE   │    │ • Sentiment     │    │   Filter        │
│   ANALYSIS      │    │              │    │ • Statistics    │    │ • Node Details  │
└─────────────────┘    └──────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Neo4j Desktop or Neo4j Community Server (for knowledge graph visualization)

### Quick Installation

Run the automated installation script:
```bash
python install_neo4j_deps.py
```

Or follow the manual setup below:

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Flask server:**
   ```bash
   python app.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
veda-project/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── veda_analytics.db     # SQLite database (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Dashboard.js
│   │   │   ├── BiasDetection.js
│   │   │   ├── NetworkView.js
│   │   │   └── ArticleManager.js
│   │   ├── App.js           # Main React app
│   │   └── index.js         # React entry point
│   ├── public/
│   └── package.json         # Node.js dependencies
├── data/
│   └── articles/            # Article text files (.txt)
│       ├── README.md
│       └── sample_article_*.txt
└── README.md
```

## 📊 Usage

### 1. Adding Articles

1. Place your `.txt` article files in the `data/articles/` folder
2. Navigate to the "Articles" tab in the web interface
3. Click "Process Articles" to analyze sentiment and extract entities

### 2. Bias Detection

1. Go to the "Bias Detection" tab
2. Switch between "Sentiment View" and "Entropy View"
3. Use the search bar to filter entities
4. Click on entity cards to see detailed information

### 3. Network Visualization

1. Visit the "Network View" tab
2. Explore the interactive knowledge graph
3. Filter by entity types (Companies, NGOs, Media, People)
4. Click and drag nodes to explore relationships

### 4. Dashboard Overview

1. The "Dashboard" tab provides an overview of:
   - Total articles processed
   - Sentiment distribution
   - Top potentially biased entities
   - Algorithm performance comparison

## 🔍 Bias Detection Methods

### Sentiment Analysis
- Uses TextBlob for sentiment polarity analysis
- Categorizes articles as positive, negative, or neutral
- Identifies entities with consistently skewed sentiment coverage

### Entropy Analysis
- Calculates information entropy for entity-sentiment distributions
- Low entropy indicates potential bias (limited perspective diversity)
- High entropy suggests balanced coverage

### Algorithm Comparison
- Compares bias between different LLM extraction algorithms
- Measures accuracy, bias scores, and entity extraction performance
- Helps identify the most reliable extraction methods

## 🛠️ Technical Stack

### Backend
- **Flask**: Web framework
- **SQLite**: Database
- **pandas**: Data manipulation
- **TextBlob**: Sentiment analysis
- **scikit-learn**: Machine learning utilities
- **NetworkX**: Graph analysis

### Frontend
- **React.js**: UI framework
- **D3.js**: Network visualizations
- **Recharts**: Charts and graphs
- **Axios**: HTTP client
- **Styled Components**: Styling

## 📈 API Endpoints

### Core Analytics
- `GET /api/health` - Health check
- `POST /api/process-articles` - Process article files
- `GET /api/sentiment-analysis` - Get sentiment analysis results
- `GET /api/entropy-analysis` - Get entropy analysis results
- `GET /api/network-data` - Get network graph data
- `GET /api/bias-comparison` - Get algorithm comparison data
- `GET /api/articles` - Get processed articles

### Neo4j Knowledge Graph
- `POST /api/neo4j/load-mc1` - Load MC1 JSON data into Neo4j
- `GET /api/neo4j/graph-stats` - Get graph statistics
- `GET /api/neo4j/subgraph?limit=100` - Get subgraph for visualization
- `GET /api/neo4j/search?q=query` - Search entities by name
- `GET /api/neo4j/status` - Check Neo4j connection status

## 🎯 Key Features

### Interactive Visualizations
- **Sentiment Heatmaps**: Color-coded entity sentiment analysis
- **Entropy Scatter Plots**: Identify low-entropy (potentially biased) entities
- **Force-Directed Graphs**: Explore entity relationships and clusters
- **Comparison Charts**: Algorithm performance metrics

### Bias Detection Capabilities
- **Source Bias**: Identify biased news sources
- **Algorithm Bias**: Compare LLM extraction algorithms
- **Analyst Bias**: Detect human analyst inconsistencies
- **Temporal Bias**: Track bias changes over time

### User Experience
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Dynamic data processing
- **Interactive Filtering**: Search and filter capabilities
- **Detailed Views**: Drill-down into specific entities and articles

## 🔬 Research Applications

This system supports research in:
- Media bias detection in commercial fishing coverage
- Knowledge graph quality assessment
- LLM extraction algorithm evaluation
- Visual analytics for bias identification
- Sustainable fishing policy analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is developed for academic and research purposes as part of the IEEE VAST Challenge 2024.

## 🙏 Acknowledgments

- IEEE VAST Challenge 2024 organizers
- FishEye International (fictional organization)
- Fudan University School of Data Science (inspiration from winning solution)
- Open source community for the excellent tools and libraries

## 📞 Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for sustainable fishing and marine conservation**
