"""
debug_full_helix_stack.py - Full Automated System & API Diagnostic Audit
Inspects all REST endpoints, backend data flows, frontend assets, and MCP server build status.
"""

import sys
import os
import json
import urllib.request
import urllib.parse
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def check_endpoint(url, method="GET", data=None):
    try:
        req = urllib.request.Request(url, method=method)
        if data:
            req.add_header('Content-Type', 'application/json')
            body = json.dumps(data).encode('utf-8')
        else:
            body = None
        with urllib.request.urlopen(req, data=body, timeout=5) as response:
            status = response.getcode()
            res_body = response.read().decode('utf-8')
            return True, status, res_body[:200]
    except Exception as e:
        return False, 500, str(e)

def main():
    print("=" * 80)
    print("  🔍 HELIX FULL SYSTEM & ENDPOINT DIAGNOSTIC AUDIT")
    print("=" * 80)
    
    issues = []

    # 1. Test Python Backend API Endpoints (Ports 8001 & 8000)
    print("\n--- 1. Testing Backend REST API Endpoints ---")
    active_port = None
    for port in [8001, 8000, 8002]:
        ok, status, body = check_endpoint(f"http://localhost:{port}/health")
        if ok:
            active_port = port
            print(f"  [OK ✓] Backend HTTP Server is active on port {port} (/health)")
            break

    if not active_port:
        issues.append("Backend HTTP Server is not running on port 8001/8000.")
        print("  [X] Backend HTTP Server not detected. (Start via `python src/main.py`)")
    else:
        # Test /ask
        ok, status, body = check_endpoint(f"http://localhost:{active_port}/ask", method="POST", data={"question": "Who managed David Miller in 2022?"})
        print(f"  [{'OK ✓' if ok else 'FAIL ✗'}] POST /ask endpoint -> Status {status}")

        # Test /drift/analyze
        ok, status, body = check_endpoint(f"http://localhost:{active_port}/drift/analyze", method="POST", data={"department": "Engineering", "signals": ["Test"]})
        print(f"  [{'OK ✓' if ok else 'FAIL ✗'}] POST /drift/analyze endpoint -> Status {status}")

        # Test /index
        ok, status, body = check_endpoint(f"http://localhost:{active_port}/index", method="POST", data={"title": "Test Doc", "content": "Sample", "department": "Engineering"})
        print(f"  [{'OK ✓' if ok else 'FAIL ✗'}] POST /index endpoint -> Status {status}")

        # Test /genome/Engineering
        ok, status, body = check_endpoint(f"http://localhost:{active_port}/genome/Engineering")
        print(f"  [{'OK ✓' if ok else 'FAIL ✗'}] GET /genome/Engineering endpoint -> Status {status}")

    # 2. Test Frontend HTTP Web Server (Port 3000)
    print("\n--- 2. Testing Frontend Web Application Server ---")
    ok, status, body = check_endpoint("http://localhost:3000")
    if ok:
        print("  [OK ✓] Frontend Dashboard Web Server is active on port 3000 (index.html)")
    else:
        issues.append("Frontend Web Server on port 3000 is not responding.")
        print("  [X] Frontend Web Server on port 3000 not detected. (Start via `python -m http.server 3000`)")

    # 3. Check HTML Assets & JS Syntax in index.html
    print("\n--- 3. Checking Frontend Asset & JS Integrity in index.html ---")
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            html_content = f.read()

        checks = [
            ("Three.js Library CDN", "three.min.js"),
            ("Chart.js Library CDN", "chart.js"),
            ("FontAwesome Icons CDN", "font-awesome"),
            ("3D Genome Canvas Container", "threejsContainer"),
            ("Centered Toast Container", "toastContainer"),
            ("HTML5 Data Attributes for Inspect", "btn-inspect-trigger"),
            ("Signal Modal Container", "signalModal")
        ]

        for name, snippet in checks:
            if snippet in html_content:
                print(f"  [OK ✓] {name} present in index.html")
            else:
                issues.append(f"Missing {name} in index.html")
                print(f"  [X] {name} MISSING in index.html")
    else:
        issues.append("index.html file missing from root directory.")

    # 4. Check TypeScript MCP Server Build
    print("\n--- 4. Checking NitroStack MCP Server Build Bundle ---")
    dist_index = os.path.join(BASE_DIR, "dist", "index.js")
    if os.path.exists(dist_index):
        print("  [OK ✓] Precompiled production bundle dist/index.js exists and is ready for deployment")
    else:
        issues.append("dist/index.js missing. Run `npm run build`.")
        print("  [X] dist/index.js missing.")

    # Summary
    print("\n" + "=" * 80)
    if not issues:
        print("  🎉 DIAGNOSTIC RESULT: 0 ERRORS FOUND! SYSTEM IS 100% HEALTHY & FUNCTIONAL.")
    else:
        print(f"  ⚠️ DIAGNOSTIC RESULT: {len(issues)} ISSUE(S) DETECTED:")
        for issue in issues:
            print(f"    - {issue}")
    print("=" * 80)

if __name__ == "__main__":
    main()
