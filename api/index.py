from flask import Flask, request, jsonify
from http.server import BaseHTTPRequestHandler
import json

app = Flask(__name__)

@app.route('/', methods=['GET'])
def hello():
    return jsonify({'message': 'API is online'})

@app.route('/', methods=['POST'])
def process_request():
    data = request.json
    response = {'status': 'success', 'message': 'Received data'}
    return jsonify(response)

# Handler for Vercel serverless function
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'message': 'API is online'}).encode())
        return

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Process the data based on the endpoint
        response = {'status': 'success', 'message': 'Received data'}
        
        self.wfile.write(json.dumps(response).encode())
        return 