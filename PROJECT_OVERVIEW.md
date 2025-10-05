# 🐟 FishEye Watcher - Project Overview

## 📋 Project Summary

**FishEye Watcher** is a comprehensive visual analytics system designed to detect bias in commercial fishing knowledge graphs. Built for the IEEE VAST Challenge 2024 MC1, this system helps analysts identify potential bias in news sources, extraction algorithms, and human analysts working with commercial fishing data.

## 🎯 Key Objectives

1. **Detect Source Bias**: Identify biased perspectives in news articles about commercial fishing
2. **Algorithm Comparison**: Compare bias between different LLM extraction algorithms (ShadGPT vs BassLine)
3. **Analyst Reliability**: Examine potential human analyst bias in data curation
4. **Visual Analytics**: Provide interactive visualizations for bias exploration
5. **Evidence Tracking**: Enable analysts to trace and document bias sources

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FishEye Watcher System                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   FRONTEND  │    │   BACKEND   │    │  DATABASE   │         │
│  │  (React.js) │◄──►│   (Flask)   │◄──►│  (SQLite)   │         │
│  │             │    │             │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                   │                   │              │
│         ▼                   ▼                   ▼              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │• Dashboard  │    │• REST APIs  │    │• Articles   │         │
│  │• Bias Views │    │• Analysis   │    │• Entities   │         │
│  │• Network    │    │• Processing │    │• Analysis   │         │
│  │• Articles   │    │• Utils      │    │• Results    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔍 Core Features

### 1. Interactive Dashboard
- **Real-time Statistics**: Article counts, entity analysis, bias metrics
- **Sentiment Distribution**: Pie charts showing positive/negative/neutral coverage
- **Top Biased Entities**: Bar charts highlighting potentially biased entities
- **Algorithm Comparison**: Side-by-side performance metrics

### 2. Bias Detection System
- **Sentiment Analysis**: Using TextBlob for polarity detection
- **Entropy Analysis**: Information entropy calculation for bias identification
- **Entity Extraction**: Regex-based extraction of companies, organizations, people
- **Interactive Filtering**: Search and filter entities by various criteria

### 3. Network Visualization
- **Force-Directed Graph**: D3.js-powered interactive network exploration
- **Entity Relationships**: Visual representation of connections between entities
- **Color Coding**: Different colors for entity types (Companies, NGOs, Media, People)
- **Zoom & Pan**: Interactive exploration with detailed node information

### 4. Article Management
- **File Processing**: Automatic processing of .txt article files
- **Sentiment Classification**: Automatic categorization of article sentiment
- **Entity Highlighting**: Visual indication of extracted entities
- **Detailed Views**: Full article content with metadata

## 🛠️ Technical Stack

### Backend Technologies
- **Flask**: Lightweight web framework for API development
- **SQLite**: Embedded database for data storage
- **pandas**: Data manipulation and analysis
- **TextBlob**: Natural language processing for sentiment analysis
- **scikit-learn**: Machine learning utilities
- **NetworkX**: Graph analysis and manipulation

### Frontend Technologies
- **React.js**: Modern UI framework with component-based architecture
- **D3.js**: Data-driven visualizations for network graphs
- **Recharts**: Chart library for statistical visualizations
- **Axios**: HTTP client for API communication
- **CSS3**: Modern styling with responsive design

### Development Tools
- **Python 3.8+**: Backend development
- **Node.js 16+**: Frontend development and build tools
- **npm**: Package management
- **Git**: Version control

## 📊 Bias Detection Algorithms

### 1. Sentiment Bias Detection
```python
def detect_sentiment_bias(articles):
    # Analyze sentiment distribution per entity
    # Calculate positive/negative ratios
    # Identify entities with skewed coverage
    # Return bias scores and evidence
```

### 2. Entropy Analysis
```python
def calculate_entropy(sentiments):
    # Calculate information entropy
    # Lower entropy = potential bias
    # Higher entropy = diverse perspectives
    # Return entropy scores
```

### 3. Algorithm Comparison
```python
def compare_algorithms(shadgpt_results, bassline_results):
    # Compare accuracy metrics
    # Analyze bias scores
    # Evaluate entity extraction performance
    # Return comparative analysis
```

## 🎨 User Interface Design

### Color Scheme
- **Primary**: #667eea (Blue gradient)
- **Success**: #48bb78 (Green - positive sentiment)
- **Warning**: #ed8936 (Orange - neutral sentiment)
- **Danger**: #f56565 (Red - negative sentiment)

### Layout Structure
1. **Header**: Navigation and branding
2. **Tabs**: Dashboard, Bias Detection, Network View, Articles
3. **Main Content**: Dynamic content based on selected tab
4. **Interactive Elements**: Search bars, filters, modals

### Responsive Design
- **Desktop**: Full-featured layout with side-by-side panels
- **Tablet**: Stacked layout with touch-friendly controls
- **Mobile**: Single-column layout with collapsible sections

## 📈 Data Flow

### 1. Data Ingestion
```
Article Files (.txt) → File Reader → Content Extraction → Database Storage
```

### 2. Analysis Pipeline
```
Raw Articles → Entity Extraction → Sentiment Analysis → Bias Detection → Results Storage
```

### 3. Visualization Pipeline
```
Database Queries → API Endpoints → Frontend Components → Interactive Visualizations
```

## 🔬 Research Applications

### Academic Research
- **Media Bias Studies**: Analyze bias in fishing industry coverage
- **Knowledge Graph Quality**: Assess extraction algorithm reliability
- **Visual Analytics**: Develop new bias detection methodologies

### Industry Applications
- **Regulatory Compliance**: Monitor industry coverage for compliance issues
- **Public Relations**: Track sentiment trends for fishing companies
- **Policy Analysis**: Understand media influence on fishing regulations

## 📁 Project Structure

```
veda-project/
├── backend/                 # Flask API server
│   ├── app.py              # Main application
│   ├── config.py           # Configuration settings
│   ├── utils.py            # Utility functions
│   └── requirements.txt    # Python dependencies
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/          # Helper functions
│   │   └── App.js          # Main application
│   └── package.json        # Node.js dependencies
├── data/
│   └── articles/           # Article text files
├── setup.py               # Automated setup script
├── run.bat/.sh            # Start scripts
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Quick Start (5 minutes)
1. **Download** the project files
2. **Run** `python setup.py` for automatic setup
3. **Execute** `run.bat` (Windows) or `./run.sh` (Mac/Linux)
4. **Open** http://localhost:3000 in your browser
5. **Add** your article files to `data/articles/`
6. **Click** "Process Articles" to begin analysis

### Manual Setup
1. **Backend**: `cd backend && pip install -r requirements.txt && python app.py`
2. **Frontend**: `cd frontend && npm install && npm start`
3. **Access**: Open http://localhost:3000

## 📊 Sample Data

The project includes sample articles demonstrating:
- **SouthSeafood Express Corp scandal**: Negative coverage example
- **FishEye International recognition**: Positive coverage example
- **Oka Seafood Shipping controversy**: Mixed coverage with bias indicators

## 🔍 Analysis Capabilities

### Bias Metrics
- **Sentiment Ratios**: Positive/negative/neutral distribution
- **Entropy Scores**: Information diversity measurement
- **Coverage Patterns**: Temporal and source-based analysis
- **Entity Relationships**: Network-based bias detection

### Visualization Types
- **Scatter Plots**: Entity bias distribution
- **Bar Charts**: Top biased entities
- **Pie Charts**: Sentiment distribution
- **Network Graphs**: Entity relationships
- **Heatmaps**: Temporal bias patterns

## 🎯 Future Enhancements

### Planned Features
- **Real-time Processing**: Live article ingestion and analysis
- **Advanced NLP**: Integration with modern language models
- **Export Capabilities**: PDF reports and data export
- **User Management**: Multi-user support with role-based access
- **API Extensions**: RESTful API for external integrations

### Research Directions
- **Deep Learning**: Neural network-based bias detection
- **Temporal Analysis**: Time-series bias pattern recognition
- **Multi-modal Analysis**: Integration of text, image, and video data
- **Cross-domain Applications**: Extension to other industries

## 🤝 Contributing

The project is designed for:
- **Researchers**: Studying media bias and visual analytics
- **Developers**: Extending functionality and adding features
- **Analysts**: Using the system for bias detection tasks
- **Students**: Learning about visual analytics and bias detection

## 📄 License & Usage

This project is developed for:
- **Academic Research**: IEEE VAST Challenge 2024 submission
- **Educational Purposes**: Teaching visual analytics concepts
- **Open Source Community**: Collaborative development and improvement

## 🏆 Achievements

Based on the IEEE VAST Challenge 2024 winning solution:
- **Honorable Mention**: Effective Use of Coordinated Views to Interrogate Bias
- **Innovation**: Novel approach to bias detection in knowledge graphs
- **Impact**: Practical tool for media bias analysis in commercial fishing

---

**Built with ❤️ for sustainable fishing and unbiased journalism**

*For detailed installation instructions, see [INSTALL.md](INSTALL.md)*  
*For usage guidelines, see [README.md](README.md)*
