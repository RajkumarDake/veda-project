#!/usr/bin/env python3
"""
Simple test server to verify Flask is working
"""

from flask import Flask, jsonify
from flask_cors import CORS

# Create a minimal Flask app
test_app = Flask(__name__)
CORS(test_app)

@test_app.route('/')
def home():
    return jsonify({'message': 'Test server is working!', 'status': 'ok'})

@test_app.route('/api/health')
def health():
    return jsonify({'status': 'healthy', 'server': 'test'})

@test_app.route('/test')
def test():
    return "Simple test endpoint working!"

if __name__ == '__main__':
    print("Starting test Flask server on port 5002...")
    test_app.run(debug=True, host='127.0.0.1', port=5002)
