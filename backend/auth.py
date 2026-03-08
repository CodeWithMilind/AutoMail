import os
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

config = Config('.env')
oauth = OAuth(config)

oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile https://www.googleapis.com/auth/gmail.readonly'
    }
)
