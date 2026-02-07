import urllib.request
import json
import time

def test_endpoint(url, data=None):
    try:
        url = f"http://localhost:8000{url}"
        method = "POST" if data else "GET"
        encoded_data = json.dumps(data).encode('utf-8') if data else None
        headers = {'Content-Type': 'application/json'} if data else {}
        
        req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return {"error": str(e)}

print("--- Backend Verification ---")

# 1. Health
health = test_endpoint("/health")
print(f"Health Check: {health}")

# 2. Analyze
print("\nTesting /analyze with 'alpine:latest'...")
analysis = test_endpoint("/analyze", {"image_name": "alpine:latest"})
if "error" in analysis:
    print(f"Analysis Failed: {analysis['error']}")
else:
    print(f"Analysis Success! Image: {analysis.get('image')}")
    print(f"Metadata OS/Arch: {analysis.get('metadata', {}).get('os')}/{analysis.get('metadata', {}).get('architecture')}")

# 3. Dockerfile
print("\nTesting /generate-dockerfile...")
dockerfile = test_endpoint("/generate-dockerfile", {"image_name": "alpine:latest"})
if "error" in dockerfile:
    print(f"Dockerfile Generation Failed: {dockerfile['error']}")
else:
    content = dockerfile.get('dockerfile', '')
    print(f"Dockerfile Generated! (First 50 chars): {content[:50].replace('\n', ' ')}...")

# 4. Chat
print("\nTesting /chat...")
chat = test_endpoint("/chat", {"image_name": "alpine:latest", "message": "What is the primary shell in this image?"})
if "error" in chat:
    print(f"Chat Failed: {chat['error']}")
else:
    print(f"Chat Success! Response: {chat.get('response')}")

print("\n--- Verification Complete ---")
