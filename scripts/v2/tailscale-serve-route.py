#!/usr/bin/env python3
"""Conditionally manage one node-level Tailscale Serve route via LocalAPI."""
import argparse
import base64
import copy
import http.client
import json
import os
from pathlib import Path
import re
import sys

class Refused(Exception): pass

class MacLocalAPI:
    def __init__(self):
        # macOS system-extension variant. Do not print either the token or its path.
        try: port = os.readlink('/Library/Tailscale/ipnport')
        except OSError as e: raise Refused('cannot read macOS LocalAPI endpoint (' + type(e).__name__ + ')') from e
        if not port.isdecimal() or not 1 <= int(port) <= 65535: raise Refused('invalid LocalAPI endpoint')
        try: token = Path('/Library/Tailscale/sameuserproof-' + port).read_text().strip()
        except OSError as e: raise Refused('cannot read macOS LocalAPI authentication (' + type(e).__name__ + ')') from e
        if not 16 <= len(token) <= 1024 or any(ord(c) < 33 or ord(c) > 126 for c in token): raise Refused('invalid LocalAPI credentials')
        self.port = int(port)
        self.auth = 'Basic ' + base64.b64encode((':' + token).encode()).decode()

    def request(self, method, body=None, etag=None):
        headers = {'Host': 'local-tailscaled.sock', 'Authorization': self.auth}
        if method == 'POST':
            if not etag: raise Refused('missing conditional version')
            headers.update({'If-Match': etag, 'Content-Type': 'application/json'})
        connection = http.client.HTTPConnection('127.0.0.1', self.port, timeout=5)
        try:
            connection.request(method, '/localapi/v0/serve-config', body=body, headers=headers)
            response = connection.getresponse()
            payload = response.read(1024 * 1024 + 1)
            if len(payload) > 1024 * 1024: raise Refused('LocalAPI response too large')
            if response.status == 412: raise Refused('Serve configuration changed concurrently')
            if response.status != 200: raise Refused('LocalAPI HTTP status ' + str(response.status))
            return payload, response.getheader('ETag')
        finally: connection.close()

    def get(self):
        payload, etag = self.request('GET')
        if not etag: raise Refused('LocalAPI does not provide a conditional version')
        data = json.loads(payload)
        if data is None: data = {}
        if not isinstance(data, dict): raise Refused('invalid Serve configuration')
        return data, etag

    def put(self, config, etag):
        self.request('POST', json.dumps(config).encode(), etag)

def update(client, action, host, port):
    if not re.fullmatch(r'[a-zA-Z0-9.-]+\.ts\.net', host) or not 1024 <= port <= 65535:
        raise Refused('invalid route identity')
    hostport, portkey = f'{host}:{port}', str(port)
    target = f'https+insecure://127.0.0.1:{port}'
    config, etag = client.get()
    if not etag: raise Refused('missing conditional version')
    result = copy.deepcopy(config)
    for key in ('TCP', 'Web', 'Foreground', 'AllowFunnel'):
        if key in result and result[key] is not None and not isinstance(result[key], dict):
            raise Refused('invalid Serve configuration')
    tcp = result.get('TCP') or {}
    web = result.get('Web') or {}
    foreground = result.get('Foreground') or {}
    funnel = result.get('AllowFunnel') or {}
    def matching_hosts(mapping): return [key for key in mapping if isinstance(key, str) and key.endswith(':' + portkey)]
    for child in foreground.values():
        if not isinstance(child, dict): raise Refused('invalid foreground configuration')
        for key in ('TCP', 'Web', 'AllowFunnel'):
            if child.get(key) is not None and not isinstance(child.get(key), dict): raise Refused('invalid foreground configuration')
        if portkey in (child.get('TCP') or {}) or matching_hosts(child.get('Web') or {}) or matching_hosts(child.get('AllowFunnel') or {}):
            raise Refused('port used by a foreground route')
    if matching_hosts(funnel): raise Refused('port has a Funnel configuration')
    existing = matching_hosts(web)
    expected = {'Handlers': {'/': {'Proxy': target}}}
    if action == 'create':
        if portkey in tcp or existing: raise Refused('port already has a Serve route')
        tcp[portkey] = {'HTTPS': True}
        web[hostport] = expected
    elif action == 'remove':
        if existing != [hostport] or web.get(hostport) != expected or tcp.get(portkey) != {'HTTPS': True}:
            raise Refused('route changed or is not owned by this stack')
        del tcp[portkey]
        del web[hostport]
    else: raise Refused('invalid operation')
    if tcp: result['TCP'] = tcp
    else: result.pop('TCP', None)
    if web: result['Web'] = web
    else: result.pop('Web', None)
    client.put(result, etag)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=('create', 'remove', 'probe'))
    parser.add_argument('host', nargs='?')
    parser.add_argument('port', type=int, nargs='?')
    args = parser.parse_args()
    try:
        client = MacLocalAPI()
        if args.action == 'probe':
            if args.host is not None or args.port is not None: raise Refused('invalid probe')
            client.get()
            print('SERVE_LOCALAPI=available-with-etag')
            return 0
        if args.host is None or args.port is None: raise Refused('missing route identity')
        update(client, args.action, args.host, args.port)
    except Refused as error:
        # Only controlled, non-secret diagnostics are displayed.
        print('Tailscale LocalAPI: ' + str(error) + '; route preserved.', file=sys.stderr)
        return 1
    except (OSError, ValueError, TypeError, http.client.HTTPException) as error:
        print('Tailscale LocalAPI: request unavailable (' + type(error).__name__ + '); route preserved.', file=sys.stderr)
        return 1
    print('SERVE_ROUTE=' + ('created' if args.action == 'create' else 'removed'))
    return 0

if __name__ == '__main__': sys.exit(main())
