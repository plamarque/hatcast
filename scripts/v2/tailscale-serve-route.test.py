#!/usr/bin/env python3
import copy
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('route', Path(__file__).with_name('tailscale-serve-route.py'))
route = importlib.util.module_from_spec(spec)
spec.loader.exec_module(route)
HOST = 'machine.tailnet.ts.net'
PORT = 23456

class Client:
    def __init__(self, config=None, etag='v1'):
        self.config = copy.deepcopy(config or {})
        self.etag = etag
        self.writes = []
    def get(self): return copy.deepcopy(self.config), self.etag
    def put(self, value, etag):
        if etag != self.etag: raise route.Refused('concurrent change')
        self.writes.append(copy.deepcopy(value))
        self.config = copy.deepcopy(value)
        self.etag = 'v2'

class RouteTests(unittest.TestCase):
    def test_create_and_remove_preserve_other_routes(self):
        other = {'TCP': {'443': {'HTTPS': True}}, 'Web': {f'{HOST}:443': {'Handlers': {'/': {'Proxy': 'http://localhost:8080'}}}}, 'Services': {'svc:foo': {'Tun': True}}}
        c = Client(other)
        route.update(c, 'create', HOST, PORT)
        self.assertEqual(c.config['TCP']['443'], other['TCP']['443'])
        self.assertEqual(c.config['Web'][f'{HOST}:443'], other['Web'][f'{HOST}:443'])
        self.assertEqual(c.config['Services'], other['Services'])
        route.update(c, 'remove', HOST, PORT)
        self.assertEqual(c.config, other)
    def test_busy_foreground_and_modified_routes_refused(self):
        for config in ({'TCP': {str(PORT): {'HTTPS': True}}},
                       {'Foreground': {'session': {'TCP': {str(PORT): {'HTTPS': True}}}}},
                       {'AllowFunnel': {f'{HOST}:{PORT}': True}}):
            c = Client(config)
            with self.assertRaises(route.Refused): route.update(c, 'create', HOST, PORT)
            self.assertEqual(c.writes, [])
        c = Client(); route.update(c, 'create', HOST, PORT)
        c.config['Web'][f'{HOST}:{PORT}']['Handlers']['/']['Proxy'] = 'http://foreign'
        c.writes.clear()
        with self.assertRaises(route.Refused): route.update(c, 'remove', HOST, PORT)
        self.assertEqual(c.writes, [])
    def test_http_transport_requires_if_match(self):
        class Response:
            status = 200
            def read(self, limit): return b'{}'
            def getheader(self, key): return 'etag-v1' if key == 'ETag' else None
        class Connection:
            calls = []
            def __init__(self, *args, **kwargs): pass
            def request(self, method, path, body=None, headers=None): self.calls.append((method, path, headers))
            def getresponse(self): return Response()
            def close(self): pass
        client = route.MacLocalAPI.__new__(route.MacLocalAPI)
        client.port = 1234; client.auth = 'test'
        with patch.object(route.http.client, 'HTTPConnection', Connection):
            self.assertEqual(client.get(), ({}, 'etag-v1'))
            client.put({}, 'etag-v1')
            self.assertEqual(Connection.calls[-1][2]['If-Match'], 'etag-v1')
            with self.assertRaises(route.Refused): client.put({}, '')
        self.assertEqual(len(Connection.calls), 2)

    def test_conditional_version_mandatory_and_conflict_refused(self):
        c = Client(etag='')
        with self.assertRaises(route.Refused): route.update(c, 'create', HOST, PORT)
        class Race(Client):
            def get(self):
                config, etag = super().get(); self.etag = 'changed'; return config, etag
        c = Race()
        with self.assertRaises(route.Refused): route.update(c, 'create', HOST, PORT)
        self.assertEqual(c.writes, [])

if __name__ == '__main__': unittest.main()
