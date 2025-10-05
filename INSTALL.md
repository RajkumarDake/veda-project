# 🚀 Installation Guide - FishEye Watcher

This guide will help you set up the FishEye Watcher visual analytics system on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning) - [Download Git](https://git-scm.com/)

### Verify Installation
Open your terminal/command prompt and run:

```bash
python --version    # Should show Python 3.8+
node --version      # Should show Node.js 16+
npm --version       # Should show npm version
```

## 🔧 Installation Methods

### Method 1: Automatic Setup (Recommended)

1. **Download/Clone the project:**
   ```bash
   # If using Git
   git clone <repository-url>
   cd veda-project
   
   # Or download and extract the ZIP file
   ```

2. **Run the setup script:**
   ```bash
   # On Windows
   python setup.py
   
   # On macOS/Linux
   python3 setup.py
   ```

3. **Start the application:**
   ```bash
   # On Windows
   run.bat
   
   # On macOS/Linux
   chmod +x run.sh
   ./run.sh
   ```

### Method 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   # On Windows
   python -m venv venv
   venv\Scripts\activate
   
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment file:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env file if needed (optional for development)
   ```

5. **Start the backend server:**
   ```bash
   python app.py
   ```

#### Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   
   # Or if using yarn
   yarn install
   ```

3. **Start the frontend development server:**
   ```bash
   npm start
   
   # Or if using yarn
   yarn start
   ```

## 🌐 Accessing the Application

Once both servers are running:

- **Frontend (Web Interface):** http://localhost:3000
- **Backend (API):** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## 📁 Adding Your Data

1. **Navigate to the data folder:**
   ```
   veda-project/data/articles/
   ```

2. **Add your article files:**
   - Place your `.txt` article files in this folder
   - Each file should contain the full text of one news article
   - Use descriptive filenames (e.g., `fishing_scandal_2024.txt`)

3. **Process the articles:**
   - Open the web interface at http://localhost:3000
   - Go to the "Articles" tab
   - Click "Process Articles" button
   - Wait for processing to complete

## 🔍 Verification

To verify everything is working correctly:

1. **Check the Dashboard:**
   - Visit http://localhost:3000
   - You should see the FishEye Watcher dashboard
   - Statistics should show "0" initially (until you process articles)

2. **Test Article Processing:**
   - Sample articles are included in `data/articles/`
   - Click "Process Articles" in the web interface
   - Check that articles appear in the Articles tab

3. **Explore Features:**
   - **Dashboard:** Overview of statistics and charts
   - **Bias Detection:** Sentiment and entropy analysis
   - **Network View:** Interactive knowledge graph
   - **Articles:** Article management and viewing

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use
If you get port errors:
```bash
# Find and kill processes using the ports
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# macOS/Linux
lsof -ti:3000 | xargs kill
lsof -ti:5000 | xargs kill
```

#### Python Module Not Found
```bash
# Make sure you're in the backend directory and virtual environment is activated
cd backend
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### Node Modules Issues
```bash
# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Permission Errors (macOS/Linux)
```bash
# Make run script executable
chmod +x run.sh

# If you get permission errors with npm
sudo chown -R $(whoami) ~/.npm
```

### Database Issues

If you encounter database errors:
```bash
# Delete the database file to reset
cd backend
rm veda_analytics.db

# Restart the backend server
python app.py
```

### Frontend Build Issues

If the frontend won't start:
```bash
cd frontend

# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start development server
npm start
```

## 📊 Performance Tips

### For Large Datasets
- Process articles in batches (max 100 files at once)
- Monitor memory usage during processing
- Consider using a more powerful database for production

### For Development
- Use the development servers (they auto-reload on changes)
- Keep browser developer tools open to monitor network requests
- Check console logs for any JavaScript errors

## 🔧 Configuration

### Backend Configuration
Edit `backend/.env` to customize:
- Database path
- API host and port
- CORS origins
- Data folder paths

### Frontend Configuration
Edit `frontend/.env` (create if needed) to customize:
- API URL
- Build settings

## 📦 Production Deployment

For production deployment:

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure production settings:**
   - Update `backend/.env` with production values
   - Set `FLASK_ENV=production`
   - Use a production database (PostgreSQL recommended)

3. **Use a production server:**
   - Consider using Gunicorn for the backend
   - Serve frontend build files with Nginx

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs:**
   - Backend: Check terminal output where you ran `python app.py`
   - Frontend: Check browser console (F12 → Console tab)

2. **Verify prerequisites:**
   - Ensure all required software is installed and up to date
   - Check that all dependencies installed successfully

3. **Reset everything:**
   ```bash
   # Stop all servers
   # Delete database file
   rm backend/veda_analytics.db
   # Clear frontend cache
   cd frontend && rm -rf node_modules package-lock.json
   # Run setup again
   python setup.py
   ```

4. **Create an issue:**
   - Include your operating system
   - Include error messages
   - Include steps to reproduce the problem

## ✅ Next Steps

Once installation is complete:

1. **Read the README.md** for usage instructions
2. **Add your article data** to `data/articles/`
3. **Explore the different views** in the web interface
4. **Check out the API documentation** at http://localhost:5000/api/health

Happy analyzing! 🐟📊
