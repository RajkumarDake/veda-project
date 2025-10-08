import os
import json

try:
    from neo4j import GraphDatabase
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False


class Neo4jManager:
    def __init__(self, uri, user, password):
        self.uri = uri
        self.user = user
        self.password = password
        self.driver = None
        if NEO4J_AVAILABLE:
            try:
                self.driver = GraphDatabase.driver(uri, auth=(user, password))
                self.driver.verify_connectivity()
                print(f"✅ Neo4j connection established to {uri}")
            except Exception as e:
                # Do not print sensitive values; provide safe diagnostics only
                print(f"❌ Failed to connect to Neo4j: {e}")
                print("  Please verify NEO4J_URI/NEO4J_USER/NEO4J_PASSWORD environment variables.")
                self.driver = None
        else:
            print("Neo4j driver not available")

    def close(self):
        if self.driver:
            self.driver.close()

    def clear_database(self):
        if not self.driver:
            return False
        try:
            summary = self.driver.execute_query("MATCH (n) DETACH DELETE n").summary
            print(f"✅ Cleared {summary.counters.nodes_deleted} nodes, {summary.counters.relationships_deleted} relationships")
            return True
        except Exception as e:
            print(f"❌ Error clearing database: {e}")
            return False

    def create_node(self, node_id, node_type, properties=None):
        if not self.driver:
            return False
        properties = properties or {}
        properties['id'] = node_id
        properties['type'] = node_type
        try:
            label = node_type.split('.')[-1] if '.' in node_type else node_type
            query = f"MERGE (n:{label} {{id: $id}}) SET n += $properties"
            self.driver.execute_query(query, id=node_id, properties=properties)
            return True
        except Exception as e:
            print(f"Error creating node {node_id}: {e}")
            return False

    def create_relationship(self, source_id, target_id, rel_type, properties=None):
        if not self.driver:
            return False
        properties = properties or {}
        try:
            clean_rel_type = rel_type.replace('.', '_').replace('-', '_').replace(' ', '_')
            query = f"""
            MATCH (a {{id: $source_id}}), (b {{id: $target_id}})
            MERGE (a)-[r:{clean_rel_type}]->(b)
            SET r += $properties
            """
            self.driver.execute_query(query, source_id=source_id, target_id=target_id, properties=properties)
            return True
        except Exception as e:
            print(f"Error creating relationship {source_id} -> {target_id}: {e}")
            return False

    def load_mc1_data(self, mc1_file_path):
        if not self.driver:
            print("Neo4j driver not available")
            return False
        if not os.path.exists(mc1_file_path):
            print(f"MC1 file not found: {mc1_file_path}")
            return False
        try:
            print("Loading MC1 data into Neo4j...")
            with open(mc1_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.clear_database()
            nodes_loaded = 0
            for node in data.get('nodes', []):
                if self.create_node(
                    node_id=node['id'],
                    node_type=node.get('type', 'Unknown'),
                    properties={'country': node.get('country'), 'type': node.get('type')}
                ):
                    nodes_loaded += 1
                if nodes_loaded % 100 == 0:
                    print(f"Loaded {nodes_loaded} nodes...")
            links_loaded = 0
            for link in data.get('links', []):
                if self.create_relationship(
                    source_id=link['source'],
                    target_id=link['target'],
                    rel_type=link.get('type', 'RELATED'),
                    properties={
                        'type': link.get('type'),
                        'date_added': link.get('_date_added'),
                        'raw_source': link.get('_raw_source'),
                        'algorithm': link.get('_algorithm'),
                        'last_edited_by': link.get('_last_edited_by'),
                        'article_id': link.get('_articleid')
                    }
                ):
                    links_loaded += 1
                if links_loaded % 100 == 0:
                    print(f"Loaded {links_loaded} relationships...")
            print(f"Successfully loaded {nodes_loaded} nodes and {links_loaded} relationships")
            return True
        except Exception as e:
            print(f"Error loading MC1 data: {e}")
            return False

    def get_graph_stats(self):
        if not self.driver:
            return {}
        try:
            node_records, _, _ = self.driver.execute_query("""
                MATCH (n)
                RETURN labels(n)[0] as label, count(n) as count
                ORDER BY count DESC
            """)
            node_stats = [record.data() for record in node_records]
            rel_records, _, _ = self.driver.execute_query("""
                MATCH ()-[r]->()
                RETURN type(r) as type, count(r) as count
                ORDER BY count DESC
            """)
            rel_stats = [record.data() for record in rel_records]
            total_nodes_records, _, _ = self.driver.execute_query("MATCH (n) RETURN count(n) as count")
            total_nodes = total_nodes_records[0]['count'] if total_nodes_records else 0
            total_rels_records, _, _ = self.driver.execute_query("MATCH ()-[r]->() RETURN count(r) as count")
            total_rels = total_rels_records[0]['count'] if total_rels_records else 0
            return {
                'total_nodes': total_nodes,
                'total_relationships': total_rels,
                'node_types': node_stats,
                'relationship_types': rel_stats
            }
        except Exception as e:
            print(f"Error getting graph stats: {e}")
            return {}

    def get_subgraph(self, limit=100):
        if not self.driver:
            return {'nodes': [], 'links': []}
        try:
            records, _, _ = self.driver.execute_query(f"""
                MATCH (n)-[r]-(m)
                RETURN n, r, m
                LIMIT {limit}
            """)
            nodes = {}
            links = []
            for record in records:
                d = record.data()
                n = d['n']
                m = d['m']
                r = d['r']
                sid = n['id']
                if sid not in nodes:
                    nodes[sid] = {
                        'id': sid,
                        'type': n.get('type', 'Unknown'),
                        'country': n.get('country'),
                        'group': self._get_node_group(n.get('type', 'Unknown'))
                    }
                tid = m['id']
                if tid not in nodes:
                    nodes[tid] = {
                        'id': tid,
                        'type': m.get('type', 'Unknown'),
                        'country': m.get('country'),
                        'group': self._get_node_group(m.get('type', 'Unknown'))
                    }
                links.append({
                    'source': sid,
                    'target': tid,
                    'type': getattr(r, 'type', 'RELATED'),
                    'algorithm': getattr(r, 'algorithm', None),
                    'raw_source': getattr(r, 'raw_source', None),
                    'date_added': getattr(r, 'date_added', None),
                    'last_edited_by': getattr(r, 'last_edited_by', None)
                })
            return { 'nodes': list(nodes.values()), 'links': links }
        except Exception as e:
            print(f"Error getting subgraph: {e}")
            return {'nodes': [], 'links': []}

    def _get_node_group(self, node_type):
        type_groups = {
            'FishingCompany': 1,
            'LogisticsCompany': 2,
            'NewsSource': 3,
            'Person': 4,
            'Location': 5,
            'Organization': 6
        }
        for key, group in type_groups.items():
            if key in node_type:
                return group
        return 0

    def search_entities(self, query, limit=20):
        if not self.driver:
            return []
        try:
            records, _, _ = self.driver.execute_query("""
                MATCH (n)
                WHERE toLower(n.id) CONTAINS toLower($query)
                RETURN n
                LIMIT $limit
            """, query=query, limit=limit)
            entities = []
            for record in records:
                node = record.data()['n']
                entities.append({'id': node['id'], 'type': node.get('type', 'Unknown'), 'country': node.get('country')})
            return entities
        except Exception as e:
            print(f"Error searching entities: {e}")
            return []

    def get_node_labels(self):
        """Get all node labels in the database"""
        if not self.driver:
            return []
        try:
            records, _, _ = self.driver.execute_query("CALL db.labels()")
            return [record['label'] for record in records]
        except Exception as e:
            print(f"Error getting node labels: {e}")
            return []

    def get_relationship_types(self):
        """Get all relationship types in the database"""
        if not self.driver:
            return []
        try:
            records, _, _ = self.driver.execute_query("CALL db.relationshipTypes()")
            return [record['relationshipType'] for record in records]
        except Exception as e:
            print(f"Error getting relationship types: {e}")
            return []

    def get_sample_nodes(self, label, limit=20):
        """Get sample nodes for a given label"""
        if not self.driver:
            return []
        try:
            query = f"MATCH (n:{label}) RETURN n LIMIT $limit"
            records, _, _ = self.driver.execute_query(query, limit=limit)
            nodes = []
            for record in records:
                node_data = record['n']
                nodes.append({
                    'id': node_data.element_id,
                    'properties': dict(node_data)
                })
            return nodes
        except Exception as e:
            print(f"Error getting sample nodes for {label}: {e}")
            return []

    def execute_query(self, query):
        """Execute a custom Cypher query and return results"""
        if not self.driver:
            return {'records': [], 'summary': None}
        
        try:
            print(f"Executing query: {query}")
            records, summary, keys = self.driver.execute_query(query)
            
            print(f"Query returned {len(records)} records with keys: {keys}")
            
            result_records = []
            for i, record in enumerate(records):
                record_dict = {}
                for key in keys:
                    value = record[key]
                    # Debug: print the type of value before serialization
                    if i < 3:  # Only print first 3 to avoid spam
                        print(f"Record {i}, key '{key}': type={type(value)}, class={value.__class__.__name__ if hasattr(value, '__class__') else 'unknown'}")
                        if hasattr(value, '__dict__'):
                            print(f"  Object attributes: {[attr for attr in dir(value) if not attr.startswith('_')][:10]}")
                    
                    # Convert Neo4j objects to serializable format
                    serialized = self._serialize_neo4j_object(value)
                    
                    if i < 3:
                        print(f"  Serialized to: {type(serialized)}, keys={serialized.keys() if isinstance(serialized, dict) else 'not a dict'}")
                    
                    record_dict[key] = serialized
                result_records.append(record_dict)
            
            print(f"Successfully serialized {len(result_records)} records")
            
            return {
                'records': result_records,
                'summary': {
                    'query_type': summary.query_type if hasattr(summary, 'query_type') else None,
                    'counters': self._extract_counters(summary.counters) if hasattr(summary, 'counters') else {}
                }
            }
        except Exception as e:
            print(f"Error executing query: {e}")
            import traceback
            traceback.print_exc()
            return {'records': [], 'error': str(e)}

    def _serialize_neo4j_object(self, obj):
        """Convert Neo4j objects to serializable format"""
        try:
            def make_json_safe(value):
                # Recursively convert unknown/complex types to JSON-safe structures
                if value is None or isinstance(value, (str, int, float, bool)):
                    return value
                if isinstance(value, list):
                    return [make_json_safe(v) for v in value]
                if isinstance(value, dict):
                    return {k: make_json_safe(v) for k, v in value.items()}
                # Neo4j specific numeric wrappers
                if hasattr(value, 'toNumber') and callable(getattr(value, 'toNumber')):
                    try:
                        return value.toNumber()
                    except Exception:
                        return str(value)
                # Fallback to string for unknown types (e.g., abc.OverFishing)
                return str(value)

            # Handle None
            if obj is None:
                return None
            
            # Handle basic types
            if isinstance(obj, (str, int, float, bool)):
                return obj
            
            # Handle lists first to avoid recursion issues
            if isinstance(obj, list):
                return [self._serialize_neo4j_object(item) for item in obj]
            
            # Check if it's a Neo4j Path object by checking for common Path attributes
            # Neo4j Path objects have 'nodes' and 'relationships' attributes
            if hasattr(obj, '__class__') and 'Path' in obj.__class__.__name__:
                print(f"Serializing Neo4j Path object: {obj.__class__.__name__}")
                segments = []
                
                # Build segments from nodes and relationships
                if hasattr(obj, 'nodes') and hasattr(obj, 'relationships'):
                    nodes = list(obj.nodes)
                    relationships = list(obj.relationships)
                    
                    # Create segments from alternating nodes and relationships
                    for i in range(len(relationships)):
                        segments.append({
                            'start': self._serialize_node(nodes[i]),
                            'end': self._serialize_node(nodes[i + 1]),
                            'relationship': self._serialize_relationship(relationships[i])
                        })
                    
                    return {
                        'segments': segments,
                        'nodes': [self._serialize_node(node) for node in nodes],
                        'relationships': [self._serialize_relationship(rel) for rel in relationships]
                    }
            
            # Handle Neo4j Node objects
            if hasattr(obj, '__class__') and 'Node' in obj.__class__.__name__:
                return self._serialize_node(obj)
            
            # Handle Neo4j Relationship objects  
            if hasattr(obj, '__class__') and 'Relationship' in obj.__class__.__name__:
                return self._serialize_relationship(obj)
            
            # Handle dictionaries
            if isinstance(obj, dict):
                return {k: self._serialize_neo4j_object(v) for k, v in obj.items()}
            
            # Try to check for Path-like structure
            if hasattr(obj, 'segments'):
                print("Found object with segments attribute")
                return {
                    'segments': [
                        {
                            'start': self._serialize_node(segment.start) if hasattr(segment, 'start') else None,
                            'end': self._serialize_node(segment.end) if hasattr(segment, 'end') else None,
                            'relationship': self._serialize_relationship(segment.relationship) if hasattr(segment, 'relationship') else None
                        }
                        for segment in obj.segments
                    ] if hasattr(obj, 'segments') else [],
                    'nodes': [self._serialize_node(node) for node in obj.nodes] if hasattr(obj, 'nodes') else [],
                    'relationships': [self._serialize_relationship(rel) for rel in obj.relationships] if hasattr(obj, 'relationships') else []
                }
            
            # Fallback: stringify unknown types without noisy logging
            if hasattr(obj, '__dict__'):
                # Convert attributes to safe values
                return {k: make_json_safe(v) for k, v in obj.__dict__.items() if not k.startswith('_')}
            return make_json_safe(obj)
            
        except Exception as e:
            print(f"Error serializing Neo4j object: {e}, type: {type(obj)}")
            import traceback
            traceback.print_exc()
            return str(obj)
    
    def _serialize_node(self, node):
        """Serialize a Neo4j Node object (driver v5 safe)"""
        try:
            # Prefer element_id; fall back to identity or string
            identity = getattr(node, 'element_id', None)
            if identity is None and hasattr(node, 'identity'):
                ident = getattr(node, 'identity')
                identity = ident.toNumber() if hasattr(ident, 'toNumber') else str(ident)
            if identity is None:
                identity = str(node)

            # Extract labels and properties defensively
            labels = list(getattr(node, 'labels', [])) if hasattr(node, 'labels') else []
            def make_json_safe(value):
                if value is None or isinstance(value, (str, int, float, bool)):
                    return value
                if isinstance(value, list):
                    return [make_json_safe(v) for v in value]
                if isinstance(value, dict):
                    return {k: make_json_safe(v) for k, v in value.items()}
                if hasattr(value, 'toNumber') and callable(getattr(value, 'toNumber')):
                    try:
                        return value.toNumber()
                    except Exception:
                        return str(value)
                return str(value)

            try:
                properties = {k: make_json_safe(v) for k, v in dict(node).items()}
            except Exception:
                raw_props = dict(getattr(node, 'properties', {})) if hasattr(node, 'properties') else {}
                properties = {k: make_json_safe(v) for k, v in raw_props.items()}

            return {
                'identity': identity,
                'labels': labels,
                'properties': properties
            }
        except Exception as e:
            print(f"Error serializing node: {e}")
            return {'identity': str(node), 'labels': [], 'properties': {}}
    
    def _serialize_relationship(self, rel):
        """Serialize a Neo4j Relationship object (driver v5 safe)"""
        try:
            identity = getattr(rel, 'element_id', None)
            if identity is None and hasattr(rel, 'identity'):
                ident = getattr(rel, 'identity')
                identity = ident.toNumber() if hasattr(ident, 'toNumber') else str(ident)

            rel_type = getattr(rel, 'type', 'UNKNOWN')
            def make_json_safe(value):
                if value is None or isinstance(value, (str, int, float, bool)):
                    return value
                if isinstance(value, list):
                    return [make_json_safe(v) for v in value]
                if isinstance(value, dict):
                    return {k: make_json_safe(v) for k, v in value.items()}
                if hasattr(value, 'toNumber') and callable(getattr(value, 'toNumber')):
                    try:
                        return value.toNumber()
                    except Exception:
                        return str(value)
                return str(value)

            try:
                properties = {k: make_json_safe(v) for k, v in dict(rel).items()}
            except Exception:
                raw_props = dict(getattr(rel, 'properties', {})) if hasattr(rel, 'properties') else {}
                properties = {k: make_json_safe(v) for k, v in raw_props.items()}

            # Start/end node ids are not required by frontend, keep if available
            start_node = getattr(rel, 'start_node', None)
            end_node = getattr(rel, 'end_node', None)
            start_id = getattr(start_node, 'element_id', None) if start_node is not None else None
            end_id = getattr(end_node, 'element_id', None) if end_node is not None else None

            return {
                'identity': identity if identity is not None else str(rel),
                'type': rel_type,
                'properties': properties,
                'start_node': start_id,
                'end_node': end_id
            }
        except Exception as e:
            print(f"Error serializing relationship: {e}")
            return {'identity': str(rel), 'type': 'UNKNOWN', 'properties': {}}

    def _extract_counters(self, counters):
        """Safely extract counters from Neo4j SummaryCounters object"""
        try:
            if hasattr(counters, '__dict__'):
                return {k: v for k, v in counters.__dict__.items() if not k.startswith('_')}
            else:
                # Try to extract common counter attributes
                counter_dict = {}
                common_attrs = ['nodes_created', 'nodes_deleted', 'relationships_created', 
                               'relationships_deleted', 'properties_set', 'labels_added', 'labels_removed']
                for attr in common_attrs:
                    if hasattr(counters, attr):
                        counter_dict[attr] = getattr(counters, attr)
                return counter_dict
        except Exception as e:
            print(f"Error extracting counters: {e}")
            return {}

    def load_mc1_data_default(self):
        """Load MC1 data from the default file location"""
        mc1_file_path = os.path.join(os.path.dirname(__file__), '..', 'mc1.json')
        if self.load_mc1_data(mc1_file_path):
            stats = self.get_graph_stats()
            return {
                'success': True,
                'message': 'MC1 data loaded successfully',
                'stats': stats
            }
        else:
            return {
                'success': False,
                'message': 'Failed to load MC1 data'
            }

