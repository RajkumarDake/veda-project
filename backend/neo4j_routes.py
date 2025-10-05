import os
import json
from flask import Blueprint, jsonify, request, current_app

neo4j_bp = Blueprint('neo4j', __name__)

def get_neo4j_manager():
    """Get Neo4j manager from app context"""
    try:
        # Get from current_app
        if hasattr(current_app, 'neo4j_manager'):
            return current_app.neo4j_manager
            
        return None
    except Exception as e:
        print(f"Error getting Neo4j manager: {e}")
        return None

# Neo4j API Endpoints for NetworkView
@neo4j_bp.route('/neo4j/status', methods=['GET'])
def neo4j_status():
    """Check Neo4j connection status"""
    try:
        neo4j_manager = get_neo4j_manager()
        if neo4j_manager and neo4j_manager.driver:
            # Test connection
            with neo4j_manager.driver.session() as session:
                result = session.run("RETURN 1 as test")
                result.single()
            
            # Get basic stats
            stats = neo4j_manager.get_graph_stats()
            return jsonify({
                'connected': True,
                'message': 'Connected to Neo4j',
                'stats': stats
            })
        else:
            return jsonify({
                'connected': False,
                'message': 'Neo4j not configured'
            })
    except Exception as e:
        return jsonify({
            'connected': False,
            'message': f'Connection failed: {str(e)}'
        })

@neo4j_bp.route('/neo4j/graph-data', methods=['GET'])
def get_graph_data():
    """Get graph data for NetworkView"""
    try:
        neo4j_manager = get_neo4j_manager()
        if not neo4j_manager:
            return jsonify({'error': 'Neo4j not configured'}), 500
        
        # Get labels (node types)
        labels = neo4j_manager.get_node_labels()
        
        # Get relationship types
        relationship_types = neo4j_manager.get_relationship_types()
        
        # Get sample nodes for each label
        nodes = {}
        for label in labels:
            sample_nodes = neo4j_manager.get_sample_nodes(label, limit=20)
            nodes[label] = sample_nodes
        
        return jsonify({
            'labels': labels,
            'relationshipTypes': relationship_types,
            'nodes': nodes
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@neo4j_bp.route('/neo4j/execute-query', methods=['POST'])
def execute_neo4j_query():
    """Execute custom Cypher query"""
    try:
        neo4j_manager = get_neo4j_manager()
        if not neo4j_manager:
            return jsonify({'error': 'Neo4j not configured'}), 500
        
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'No query provided'}), 400
        
        # Execute query
        results = neo4j_manager.execute_query(query)
        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@neo4j_bp.route('/neo4j/load-mc1', methods=['POST'])
def load_mc1_data():
    """Load MC1 data into Neo4j"""
    try:
        neo4j_manager = get_neo4j_manager()
        if not neo4j_manager:
            return jsonify({'error': 'Neo4j not configured'}), 500
        
        # Load MC1 data into Neo4j
        result = neo4j_manager.load_mc1_data_default()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@neo4j_bp.route('/neo4j/search', methods=['GET'])
def search_neo4j_entities():
    """Search Neo4j entities"""
    try:
        neo4j_manager = get_neo4j_manager()
        if not neo4j_manager:
            return jsonify({'error': 'Neo4j not configured'}), 500
        
        query_param = request.args.get('q', '')
        limit = int(request.args.get('limit', 10))
        
        if not query_param:
            return jsonify([])
        
        # Search entities
        results = neo4j_manager.search_entities(query_param, limit)
        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Legacy routes for backward compatibility
@neo4j_bp.route('/neo4j-data', methods=['GET'])
def get_neo4j_data():
    """Legacy route - fetch data from Neo4j"""
    try:
        neo4j_manager = get_neo4j_manager()
        if not neo4j_manager:
            return jsonify({'error': 'Failed to connect to Neo4j'}), 500
        
        # Get subgraph data
        subgraph = neo4j_manager.get_subgraph(limit=1000)
        
        return jsonify({
            'nodes': subgraph['nodes'],
            'edges': subgraph['links'],
            'total_nodes': len(subgraph['nodes']),
            'total_edges': len(subgraph['links'])
        })
        
    except Exception as e:
        print(f"Error fetching Neo4j data: {e}")
        return jsonify({'error': str(e)}), 500

@neo4j_bp.route('/neo4j-stats', methods=['GET'])
def get_neo4j_stats():
    """Legacy route - get Neo4j database statistics"""
    try:
        neo4j_manager = get_neo4j_manager()
        if not neo4j_manager:
            return jsonify({'error': 'Failed to connect to Neo4j', 'status': 'disconnected'}), 500
        
        stats = neo4j_manager.get_graph_stats()
        
        return jsonify({
            'node_count': stats.get('total_nodes', 0),
            'relationship_count': stats.get('total_relationships', 0),
            'node_types': [nt.get('label', 'Unknown') for nt in stats.get('node_types', [])],
            'status': 'connected'
        })
        
    except Exception as e:
        print(f"Error getting Neo4j stats: {e}")
        return jsonify({'error': str(e), 'status': 'disconnected'}), 500
