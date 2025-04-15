from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "API is online"})

@app.route('/', methods=['POST'])
def process():
    data = request.json
    return jsonify({"status": "success", "message": "Received data"})

# Handler for Vercel
def handler(request, context):
    with app.test_client() as client:
        response = client.get('/')
        return {
            "statusCode": 200,
            "body": response.get_data(as_text=True),
            "headers": {
                "Content-Type": "application/json"
            }
        } 