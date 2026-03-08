import os
import base64
import json
import logging
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

TOKEN_FILE = 'token.json'

def get_gmail_service():
    creds = None
    if os.path.exists(TOKEN_FILE):
        logger.info("Loading credentials from token.json")
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                logger.info("Refreshing expired Gmail token")
                creds.refresh(Request())
                with open(TOKEN_FILE, 'w') as token:
                    token.write(creds.to_json())
            except Exception as e:
                logger.error(f"Error refreshing token: {e}")
                return None, "gmail_auth_required"
        else:
            logger.warning("No valid credentials found, Gmail auth required")
            return None, "gmail_auth_required"

    try:
        service = build('gmail', 'v1', credentials=creds)
        return service, None
    except Exception as e:
        logger.error(f"Error building Gmail service: {e}")
        return None, str(e)

def fetch_latest_emails(limit=10):
    logger.info(f"Fetching latest {limit} emails from Gmail")
    service, error = get_gmail_service()
    if error:
        return None, error

    try:
        results = service.users().messages().list(userId='me', maxResults=limit).execute()
        messages = results.get('messages', [])

        if not messages:
            logger.info("No messages found in inbox")
            return [], None

        email_list = []
        for message in messages:
            msg = service.users().messages().get(userId='me', id=message['id']).execute()
            
            payload = msg.get('payload', {})
            headers = payload.get('headers', [])
            
            sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), 'Unknown Sender')
            subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
            date = next((h['value'] for h in headers if h['name'].lower() == 'date'), 'Unknown Date')
            
            body = ""
            if 'parts' in payload:
                for part in payload['parts']:
                    if part['mimeType'] == 'text/plain':
                        data = part['body'].get('data', '')
                        body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                        break
            elif 'body' in payload:
                data = payload['body'].get('data', '')
                body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')

            if not body:
                body = msg.get('snippet', '')

            email_list.append({
                "id": message['id'],
                "sender": sender,
                "subject": subject,
                "body": body,
                "timestamp": date
            })

        logger.info(f"Successfully fetched {len(email_list)} emails")
        return email_list, None

    except HttpError as error:
        logger.error(f"Gmail API error occurred: {error}")
        return None, str(error)
    except Exception as e:
        logger.error(f"Unexpected error in fetch_latest_emails: {e}")
        return None, str(e)
