import os
from google.oauth2 import id_token
from google.auth.transport import requests

def verify_google_token(token):
    try:
        client_id = os.environ.get('GOOGLE_CLIENT_ID')
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), client_id)
        return idinfo
    except ValueError as e:
        print(f"Google Token Verification Error: {e}")
        return None
