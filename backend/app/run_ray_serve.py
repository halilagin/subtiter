#!/usr/bin/env python3
# flake8: noqa: E501
"""
Script to run Subtiter API with Ray Serve
"""

import sys
import os
import argparse

print("RUN_RAY_SERVE: Script starting...")

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("RUN_RAY_SERVE: About to import app.main...")
try:
    from app.main import main
    print("RUN_RAY_SERVE: Successfully imported app.main")
except Exception as e:
    print(f"RUN_RAY_SERVE: ERROR importing app.main: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

if __name__ == "__main__":
    print("RUN_RAY_SERVE: Parsing arguments...")
    parser = argparse.ArgumentParser(description='Run Subtiter API with Ray Serve')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Host to bind to (default: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=22081, help='Port to bind to (default: 22081)')
    
    args = parser.parse_args()
    print(f"RUN_RAY_SERVE: Starting main with host={args.host}, port={args.port}")
    main(host=args.host, port=args.port)
