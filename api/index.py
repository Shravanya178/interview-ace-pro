import json

def handler(request, context):
    """
    Simple serverless function handler
    """
    if request.method == "GET":
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({"message": "API is online"})
        }
    elif request.method == "POST":
        try:
            body = json.loads(request.body)
        except:
            body = {}
            
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({"status": "success", "message": "Received data"})
        } 