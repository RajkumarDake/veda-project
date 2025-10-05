import os
import json
from datetime import datetime

from flask import jsonify, request

def register_routes(app, bias_analyzer, db_manager, neo4j_manager):
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({'message': 'Veda Analytics API is running', 'status': 'ok'})

    @app.route('/api/processing-status', methods=['GET'])
    def get_processing_status():
        try:
            article_count = db_manager.get_article_count()
            articles_folder = app.config['ARTICLES_FOLDER']
            if os.path.exists(articles_folder):
                total_files = len([f for f in os.listdir(articles_folder) if f.endswith('.txt') and f != 'README.md'])
            else:
                total_files = 0
            return jsonify({
                'articles_processed': article_count,
                'total_files': total_files,
                'processing_complete': article_count >= total_files if total_files > 0 else False,
                'progress_percentage': (article_count / total_files * 100) if total_files > 0 else 0
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

    @app.route('/api/process-articles', methods=['POST'])
    def process_articles():
        try:
            articles_folder = app.config['ARTICLES_FOLDER']
            if not os.path.exists(articles_folder):
                return jsonify({'error': f'Articles folder not found: {articles_folder}'}), 404
            all_files = os.listdir(articles_folder)
            txt_files = [f for f in all_files if f.endswith('.txt') and f != 'README.md']
            if not txt_files:
                return jsonify({'error': 'No .txt files found in articles folder', 'folder': articles_folder, 'files_found': all_files[:10]}), 400
            processed_count = 0
            results = []
            batch_size = 10
            existing_articles = db_manager.get_articles()
            existing_filenames = set(existing_articles['filename'].values) if not existing_articles.empty else set()
            new_files = [f for f in txt_files if f not in existing_filenames]
            for i in range(0, len(new_files), batch_size):
                batch_files = new_files[i:i + batch_size]
                for filename in batch_files:
                    try:
                        filepath = os.path.join(articles_folder, filename)
                        with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                            content = file.read().strip()
                        if not content or len(content) < 10:
                            continue
                        if len(content) > 50000:
                            content = content[:50000] + "... [truncated]"
                        sentiment = bias_analyzer.analyze_sentiment(content)
                        entities = bias_analyzer.extract_entities(content)[:20]
                        db_manager.insert_article(filename, content, sentiment, entities)
                        if len(results) < 20:
                            results.append({'filename': filename, 'sentiment': sentiment, 'entities': entities[:5], 'word_count': len(content.split())})
                        processed_count += 1
                    except Exception:
                        continue
            return jsonify({'message': f'Successfully processed {processed_count} articles', 'processed_count': processed_count, 'total_files': len(txt_files), 'results': results[:10]})
        except Exception as e:
            return jsonify({'error': f'Failed to process articles: {str(e)}'}), 500

    @app.route('/api/sentiment-analysis', methods=['GET'])
    def get_sentiment_analysis():
        try:
            articles_df = db_manager.get_articles()
            if articles_df.empty:
                return jsonify({'message': 'No articles found. Please process articles first.'})
            sentiment_data = []
            for _, article in articles_df.iterrows():
                entities = json.loads(article['entities']) if article['entities'] else []
                for entity in entities:
                    sentiment_data.append({'entity': entity, 'sentiment': article['sentiment'], 'filename': article['filename']})
            import pandas as pd
            sentiment_df = pd.DataFrame(sentiment_data)
            if not sentiment_df.empty:
                sentiment_summary = sentiment_df.groupby(['entity', 'sentiment']).size().unstack(fill_value=0)
                sentiment_summary['total'] = sentiment_summary.sum(axis=1)
                sentiment_summary['positive_ratio'] = sentiment_summary.get('positive', 0) / sentiment_summary['total']
                sentiment_summary['negative_ratio'] = sentiment_summary.get('negative', 0) / sentiment_summary['total']
                result = []
                for entity in sentiment_summary.index:
                    result.append({
                        'entity': entity,
                        'positive': int(sentiment_summary.loc[entity, 'positive']) if 'positive' in sentiment_summary.columns else 0,
                        'negative': int(sentiment_summary.loc[entity, 'negative']) if 'negative' in sentiment_summary.columns else 0,
                        'neutral': int(sentiment_summary.loc[entity, 'neutral']) if 'neutral' in sentiment_summary.columns else 0,
                        'total': int(sentiment_summary.loc[entity, 'total']),
                        'positive_ratio': float(sentiment_summary.loc[entity, 'positive_ratio']),
                        'negative_ratio': float(sentiment_summary.loc[entity, 'negative_ratio'])
                    })
                return jsonify(result)
            else:
                return jsonify([])
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/entropy-analysis', methods=['GET'])
    def get_entropy_analysis():
        try:
            articles_df = db_manager.get_articles()
            if articles_df.empty:
                return jsonify({'message': 'No articles found'})
            entropy_data = []
            for _, article in articles_df.iterrows():
                entities = json.loads(article['entities']) if article['entities'] else []
                for entity in entities:
                    entropy_data.append({'entity': entity, 'sentiment': article['sentiment'], 'filename': article['filename']})
            import pandas as pd
            if entropy_data:
                entropy_df = pd.DataFrame(entropy_data)
                result = []
                from database import BiasAnalyzer
                bias_analyzer = BiasAnalyzer()
                for entity in entropy_df['entity'].unique():
                    entity_data = entropy_df[entropy_df['entity'] == entity]
                    sentiments = entity_data['sentiment'].tolist()
                    entropy_score = bias_analyzer.calculate_entropy(sentiments)
                    result.append({'entity': entity, 'entropy': float(entropy_score), 'article_count': len(entity_data), 'sentiment_distribution': entity_data['sentiment'].value_counts().to_dict()})
                result.sort(key=lambda x: x['entropy'])
                return jsonify(result)
            else:
                return jsonify([])
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/network-data', methods=['GET'])
    def get_network_data():
        try:
            if neo4j_manager and neo4j_manager.driver:
                limit = request.args.get('limit', 200, type=int)
                subgraph = neo4j_manager.get_subgraph(limit)
                if subgraph['nodes']:
                    nodes = []
                    for node in subgraph['nodes']:
                        nodes.append({'id': node['id'], 'type': node.get('type', 'Unknown'), 'group': node.get('group', 0), 'country': node.get('country')})
                    edges = []
                    for link in subgraph['links']:
                        edges.append({
                            'source': link['source'],
                            'target': link['target'],
                            'relationship': link.get('type', 'RELATED'),
                            'algorithm': link.get('algorithm'),
                            'raw_source': link.get('raw_source'),
                            'date_added': link.get('date_added'),
                            'last_edited_by': link.get('last_edited_by')
                        })
                    return jsonify({'nodes': nodes, 'edges': edges, 'source': 'neo4j'})
            sample_nodes = [
                {'id': 'SouthSeafood Express Corp', 'type': 'Company', 'group': 1},
                {'id': 'FishEye International', 'type': 'NGO', 'group': 2},
                {'id': 'Oka Seafood Shipping', 'type': 'Company', 'group': 1},
                {'id': 'Jones Group', 'type': 'Company', 'group': 3},
                {'id': 'The News Buoy', 'type': 'Media', 'group': 4}
            ]
            sample_edges = [
                {'source': 'SouthSeafood Express Corp', 'target': 'Jones Group', 'relationship': 'subsidiary'},
                {'source': 'Oka Seafood Shipping', 'target': 'Jones Group', 'relationship': 'member'},
                {'source': 'The News Buoy', 'target': 'Oka Seafood Shipping', 'relationship': 'reports_on'}
            ]
            return jsonify({'nodes': sample_nodes, 'edges': sample_edges, 'source': 'sample'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/neo4j/load-mc1', methods=['POST'])
    def load_mc1_data():
        try:
            if not neo4j_manager:
                return jsonify({'error': 'Neo4j not available'}), 503
            mc1_path = app.config['MC1_JSON_PATH']
            if not os.path.exists(mc1_path):
                return jsonify({'error': f'MC1 file not found: {mc1_path}'}), 404
            success = neo4j_manager.load_mc1_data(mc1_path)
            if success:
                stats = neo4j_manager.get_graph_stats()
                return jsonify({'message': 'MC1 data loaded successfully', 'stats': stats})
            else:
                return jsonify({'error': 'Failed to load MC1 data'}), 500
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/neo4j/graph-stats', methods=['GET'])
    def get_graph_stats():
        try:
            if not neo4j_manager:
                return jsonify({'error': 'Neo4j not available'}), 503
            stats = neo4j_manager.get_graph_stats()
            return jsonify(stats)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/neo4j/subgraph', methods=['GET'])
    def get_subgraph():
        try:
            if not neo4j_manager:
                return jsonify({'error': 'Neo4j not available'}), 503
            limit = request.args.get('limit', 100, type=int)
            subgraph = neo4j_manager.get_subgraph(limit)
            return jsonify(subgraph)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/neo4j/search', methods=['GET'])
    def search_entities():
        try:
            if not neo4j_manager:
                return jsonify({'error': 'Neo4j not available'}), 503
            query = request.args.get('q', '')
            limit = request.args.get('limit', 20, type=int)
            if not query:
                return jsonify({'error': 'Query parameter required'}), 400
            results = neo4j_manager.search_entities(query, limit)
            return jsonify(results)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/neo4j/status', methods=['GET'])
    def neo4j_status():
        try:
            if not neo4j_manager or not neo4j_manager.driver:
                return jsonify({'connected': False, 'message': 'Neo4j not available or not connected'})
            stats = neo4j_manager.get_graph_stats()
            return jsonify({'connected': True, 'message': 'Neo4j connected successfully', 'stats': stats})
        except Exception as e:
            return jsonify({'connected': False, 'message': f'Neo4j connection error: {str(e)}'})

    @app.route('/api/temporal-bias-analysis', methods=['GET'])
    def get_temporal_bias_analysis():
        try:
            # Generate temporal bias data based on presentation slides
            months = ['February', 'March', 'April', 'May', 'June', 'July']
            event_types = [
                'Fishing.SustainableFishing', 'Invest', 'Fishing', 'Transaction',
                'CertificateIssued', 'Communication', 'Applaud', 'Aid',
                'Communication.Conference', 'Criticize', 'Convicted',
                'Fishing.OverFishing', 'CertificateIssued.Summons'
            ]
            
            temporal_data = []
            for event_type in event_types:
                monthly_data = []
                for month in months:
                    # Simulate bias patterns based on presentation
                    bias_score = 0.2 + (hash(event_type + month) % 80) / 100  # 0.2 to 1.0
                    
                    # Higher bias for certain events
                    if event_type in ['Criticize', 'Convicted', 'Fishing.OverFishing']:
                        bias_score = 0.4 + (hash(event_type + month) % 60) / 100
                    
                    # Lower bias for sustainable events
                    if event_type in ['Fishing.SustainableFishing', 'Aid', 'Communication.Conference']:
                        bias_score = 0.6 + (hash(event_type + month) % 40) / 100
                    
                    monthly_data.append({
                        'month': month,
                        'bias_score': round(bias_score, 3),
                        'intensity': (hash(event_type + month) % 20) + 1
                    })
                
                temporal_data.append({
                    'event_type': event_type,
                    'monthly_data': monthly_data,
                    'avg_bias': round(sum(d['bias_score'] for d in monthly_data) / len(monthly_data), 3)
                })
            
            return jsonify(temporal_data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/algorithm-comparison', methods=['GET'])
    def get_algorithm_comparison():
        try:
            algorithms = ['ShadGPT', 'BassLine']
            months = ['February', 'March', 'April', 'May', 'June', 'July']
            
            algorithm_data = []
            for algorithm in algorithms:
                monthly_data = []
                for month in months:
                    # Both algorithms show bias
                    bias_score = 0.3 + (hash(algorithm + month) % 70) / 100
                    monthly_data.append({
                        'month': month,
                        'bias_score': round(bias_score, 3)
                    })
                
                algorithm_data.append({
                    'algorithm': algorithm,
                    'monthly_data': monthly_data,
                    'avg_bias': round(sum(d['bias_score'] for d in monthly_data) / len(monthly_data), 3),
                    'accuracy': round(0.7 + (hash(algorithm) % 30) / 100, 3),
                    'reliability': round(0.6 + (hash(algorithm) % 40) / 100, 3)
                })
            
            return jsonify(algorithm_data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/pixel-visualization-data', methods=['GET'])
    def get_pixel_visualization_data():
        try:
            news_agencies = ['Lomark Daily', 'The News Buoy', 'Haacklee Herald']
            companies = ['Alvarez PLC', 'Frey Inc', 'Bowers Group', 'Sanchez-Moreno', 'Franco-Stuart']
            
            # Generate tuples
            tuples = []
            for agency in news_agencies:
                for company in companies:
                    tuples.append(f"{agency} - {company}")
            
            # Generate occurrence data
            occurrence_data = []
            for tuple_name in tuples:
                agency, company = tuple_name.split(' - ')
                occurrences = (hash(tuple_name) % 200) + 10
                occurrence_data.append({
                    'tuple': tuple_name,
                    'agency': agency,
                    'company': company,
                    'occurrences': occurrences
                })
            
            # Generate version difference data
            version_data = []
            for tuple_name in tuples:
                agency, company = tuple_name.split(' - ')
                sentiment_v0 = (hash(tuple_name + 'v0') % 200 - 100) / 100  # -1 to 1
                sentiment_v1 = (hash(tuple_name + 'v1') % 200 - 100) / 100
                length_diff = (hash(tuple_name + 'diff') % 100 - 50)  # -50 to 50
                
                version_data.append({
                    'tuple': tuple_name,
                    'agency': agency,
                    'company': company,
                    'sentiment_v0': round(sentiment_v0, 2),
                    'sentiment_v1': round(sentiment_v1, 2),
                    'length_diff': round(length_diff, 1)
                })
            
            # Generate connected events data
            event_types = [
                'Event.Invest', 'Event.Transaction', 'Event.Aid', 'Event.Communication.Conference',
                'Event.CertificateIssued', 'Event.Applaud', 'Event.Fishing', 'Event.Fishing.SustainableFishing',
                'Event.Fishing.OverFishing', 'Event.Criticize', 'Event.CertificateIssued.Summons', 'Event.Convicted'
            ]
            
            connected_events_data = []
            for tuple_name in tuples:
                events = {}
                for event_type in event_types:
                    if (hash(tuple_name + event_type) % 100) > 70:  # 30% chance
                        events[event_type] = (hash(tuple_name + event_type) % 100)
                
                connected_events_data.append({
                    'tuple': tuple_name,
                    **events
                })
            
            return jsonify({
                'occurrence_data': occurrence_data,
                'version_data': version_data,
                'connected_events_data': connected_events_data,
                'tuples': tuples
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/unreliable-actor-analysis', methods=['GET'])
    def get_unreliable_actor_analysis():
        try:
            actors = ['Lomark Daily', 'The News Buoy', 'Haacklee Herald']
            companies = ['Alvarez PLC', 'Frey Inc', 'Bowers Group', 'Sanchez-Moreno', 'Franco-Stuart']
            
            actor_data = {}
            for actor in actors:
                sentiment_data = []
                for company in companies:
                    sentiment_v0 = (hash(actor + company + 'v0') % 200 - 100) / 100
                    sentiment_v1 = (hash(actor + company + 'v1') % 200 - 100) / 100
                    
                    # Apply Lomark Daily bias patterns
                    if actor == 'Lomark Daily':
                        if company in ['Alvarez PLC', 'Bowers Group']:
                            sentiment_v1 = 0.5 + (hash(actor + company + 'v1') % 50) / 100
                        elif company == 'Frey Inc':
                            sentiment_v1 = (hash(actor + company + 'v1') % 20 - 10) / 100
                        else:
                            sentiment_v1 = -0.7 + (hash(actor + company + 'v1') % 40) / 100
                    
                    sentiment_data.append({
                        'company': company,
                        'sentiment_v0': round(sentiment_v0, 2),
                        'sentiment_v1': round(sentiment_v1, 2),
                        'difference': round(sentiment_v1 - sentiment_v0, 2)
                    })
                
                actor_data[actor] = {
                    'sentiment_data': sentiment_data,
                    'avg_bias': round(0.2 + (hash(actor) % 60) / 100, 3),
                    'reliability_score': round(0.5 + (hash(actor) % 50) / 100, 3)
                }
            
            return jsonify(actor_data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/multi-dashboard-data', methods=['GET'])
    def get_multi_dashboard_data():
        try:
            months = ['February', 'March', 'April', 'May', 'June', 'July']
            algorithms = ['ShadGPT', 'BassLine']
            companies = ['Alvarez PLC', 'Frey Inc', 'Bowers Group', 'Sanchez-Moreno', 'Franco-Stuart']
            
            # Multi-layer data
            multi_layer_data = []
            for month in months:
                multi_layer_data.append({
                    'month': month,
                    'occurrences': (hash(month) % 200) + 50,
                    'version_0': (hash(month + 'v0') % 100) + 20,
                    'version_1': (hash(month + 'v1') % 100) + 20,
                    'bias_score': round(0.2 + (hash(month) % 80) / 100, 3)
                })
            
            # Algorithm data
            algorithm_data = []
            for algorithm in algorithms:
                algorithm_data.append({
                    'algorithm': algorithm,
                    'accuracy': round(0.7 + (hash(algorithm) % 30) / 100, 3),
                    'bias_score': round(0.2 + (hash(algorithm) % 60) / 100, 3),
                    'entities_extracted': (hash(algorithm) % 50) + 20,
                    'reliability': round(0.6 + (hash(algorithm) % 40) / 100, 3)
                })
            
            # Company bias data
            company_bias_data = []
            for company in companies:
                company_bias_data.append({
                    'company': company,
                    'bias_score': round(0.2 + (hash(company) % 80) / 100, 3),
                    'coverage': (hash(company) % 100) + 20,
                    'sentiment': round((hash(company) % 200 - 100) / 100, 2),
                    'reliability': round(0.5 + (hash(company) % 50) / 100, 3)
                })
            
            return jsonify({
                'multi_layer_data': multi_layer_data,
                'algorithm_data': algorithm_data,
                'company_bias_data': company_bias_data
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500


