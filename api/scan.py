# api/scan.py – Vercel serverless function
from http.server import BaseHTTPRequestHandler
import urllib.parse, json, socket, ssl

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        url = query.get('url', [''])[0]
        result = {"status": "unknown", "detail": ""}
        if url:
            try:
                p = urllib.parse.urlparse(url)
                host, path = p.hostname, p.path + "?" + p.query
                payload = path.replace("=", "=1'--%20-")
                port = 443 if url.startswith("https") else 80
                sock = socket.socket()
                if url.startswith("https"):
                    sock = ssl.create_default_context().wrap_socket(sock, server_hostname=host)
                sock.settimeout(5)
                sock.connect((host, port))
                sock.send(f"GET {payload} HTTP/1.1\r\nHost: {host}\r\n\r\n".encode())
                resp = sock.recv(4096).decode(errors='ignore')
                sock.close()
                if any(k in resp.lower() for k in ["mysql", "syntax", "error"]):
                    result = {"status": "vuln", "detail": "Error-based SQL injection detected"}
                else:
                    result = {"status": "safe", "detail": "No obvious SQLi error"}
            except Exception as e:
                result = {"status": "error", "detail": str(e)}
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
