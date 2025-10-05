import os
import json
from neo4j import GraphDatabase
from flask import Blueprint, jsonify

neo4j_bp = Blueprint('neo4j', __name__)

# Neo4j connection details from your notebook
NEO4J_URI = 'neo4j+s://397603d1.databases.neo4j.io'
NEO4J_USER = 'neo4j'
NEO4J_PASSWORD = 'dQMr8EoOUknWQK7JNRD5Kd4UtXPlBoXuURrezQ38Tz8'

def get_neo4j_driver():
    """Get Neo4j driver connection"""
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        driver.verify_connectivity()
        return driver
    except Exception as e:
        print(f"Neo4j connection error: {e}")
        return None

@neo4j_bp.route('/neo4j-data', methods=['GET'])
def get_neo4j_data():
    """Fetch data from Neo4j cloud database"""
    try:
        driver = get_neo4j_driver()
        if not driver:
            return jsonify({'error': 'Failed to connect to Neo4j'}), 500
        
        with driver.session() as session:
            # Get nodes
            nodes_result = session.run("MATCH (n) RETURN n LIMIT 1000")
            nodes = []
            for record in nodes_result:
                node_data = dict(record['n'])
                nodes.append({
                    'id': node_data.get('id', ''),
                    'label': node_data.get('name', node_data.get('title', 'Unknown')),
                    'type': node_data.get('type', 'Unknown'),
                    'properties': node_data
                })
            
            # Get relationships
            edges_result = session.run("MATCH (a)-[r]->(b) RETURN a, r, b LIMIT 1000")
            edges = []
            for record in edges_result:
                source_id = dict(record['a']).get('id', '')
                target_id = dict(record['b']).get('id', '')
                rel_data = dict(record['r'])
                
                edges.append({
                    'source': source_id,
                    'target': target_id,
                    'type': rel_data.get('type', 'RELATED'),
                    'properties': rel_data
                })
            
            return jsonify({
                'nodes': nodes,
                'edges': edges,
                'total_nodes': len(nodes),
                'total_edges': len(edges)
            })
            
    except Exception as e:
        print(f"Error fetching Neo4j data: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if driver:
            driver.close()

@neo4j_bp.route('/neo4j-stats', methods=['GET'])
def get_neo4j_stats():
    """Get Neo4j database statistics"""
    try:
        driver = get_neo4j_driver()
        if not driver:
            return jsonify({'error': 'Failed to connect to Neo4j'}), 500
        
        with driver.session() as session:
            # Get node count
            node_count_result = session.run("MATCH (n) RETURN count(n) as count")
            node_count = node_count_result.single()['count']
            
            # Get relationship count
            rel_count_result = session.run("MATCH ()-[r]->() RETURN count(r) as count")
            rel_count = rel_count_result.single()['count']
            
            # Get node types
            node_types_result = session.run("MATCH (n) RETURN DISTINCT labels(n) as labels")
            node_types = [record['labels'][0] if record['labels'] else 'Unknown' for record in node_types_result]
            
            return jsonify({
                'node_count': node_count,
                'relationship_count': rel_count,
                'node_types': list(set(node_types)),
                'status': 'connected'
            })
            
    except Exception as e:
        print(f"Error getting Neo4j stats: {e}")
        return jsonify({'error': str(e), 'status': 'disconnected'}), 500
    finally:
        if driver:
            driver.close()
