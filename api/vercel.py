from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "API is online"})

@app.route('/', methods=['POST'])
def handle_request():
    data = request.json
    return jsonify({"status": "success", "message": "Received data"}) 