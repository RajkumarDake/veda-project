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


