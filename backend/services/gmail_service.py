import os
import base64
import json
import time
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from app.config import settings

class GmailService:
    SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

    def __init__(self, access_token=None):
        self.access_token = access_token
        self.service = None
        if access_token:
            creds = Credentials(token=access_token)
            self.service = build('gmail', 'v1', credentials=creds)
        self.settings_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "settings.json")

    def _get_connection_timestamp(self):
        """
        Get or set the gmail_connected_at timestamp in settings.json
        """
        if not os.path.exists(self.settings_file):
            data = {"gmail_connected_at": int(time.time())}
            with open(self.settings_file, "w") as f:
                json.dump(data, f, indent=4)
            return data["gmail_connected_at"]
        
        with open(self.settings_file, "r") as f:
            data = json.load(f)
        
        if "gmail_connected_at" not in data:
            data["gmail_connected_at"] = int(time.time())
            with open(self.settings_file, "w") as f:
                json.dump(data, f, indent=4)
        
        return data["gmail_connected_at"]

    def fetch_latest_emails(self, limit=25):
        if not self.service:
            return [], "gmail_auth_required"
        
        try:
            # Demo Mode: Only fetch emails after connection timestamp
            connected_at = self._get_connection_timestamp()
            query = f"after:{connected_at}"
            print(f"--- Demo Mode Active: Fetching emails with query: {query} ---")
            
            results = self.service.users().messages().list(userId='me', q=query, maxResults=limit).execute()
            messages = results.get('messages', [])
            
            emails = []
            for msg in messages:
                # Fetch only metadata for now
                m = self.service.users().messages().get(userId='me', id=msg['id'], format='metadata').execute()
                
                payload = m.get('payload', {})
                headers = payload.get('headers', [])
                
                subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
                sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), 'Unknown Sender')
                date = next((h['value'] for h in headers if h['name'].lower() == 'date'), 'Unknown Date')
                snippet = m.get('snippet', '')
                
                emails.append({
                    "id": msg['id'],
                    "gmail_id": msg['id'],
                    "subject": subject,
                    "sender": sender,
                    "date": date,
                    "snippet": snippet
                })
            return emails, None
        except Exception as e:
            print(f"Gmail Fetch Error: {e}")
            return [], str(e)

    def fetch_email_body(self, email_id):
        if not self.service:
            return None
        
        try:
            m = self.service.users().messages().get(userId='me', id=email_id, format='full').execute()
            payload = m.get('payload', {})
            
            def get_body(payload):
                if payload.get('body', {}).get('data'):
                    return base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8', errors='ignore')
                
                if 'parts' in payload:
                    for part in payload['parts']:
                        if part['mimeType'] == 'text/plain':
                            return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                        if part['mimeType'] == 'text/html':
                            return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                return ""
            
            return get_body(payload)
        except Exception as e:
            print(f"Gmail Body Fetch Error: {e}")
            return None

gmail_service = GmailService()
