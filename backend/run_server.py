from app_factory import create_app

app = create_app()

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Available routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.endpoint}: {rule.rule} [{', '.join(rule.methods)}]")
    print("\nServer starting on http://localhost:5000")
    try:
        app.run(debug=True, use_reloader=False, host='127.0.0.1', port=5000, threaded=True)
    except Exception as e:
        print(f"Failed to start server: {e}")
        print("Trying port 5001...")
        app.run(debug=True, use_reloader=False, host='127.0.0.1', port=5001, threaded=True)


