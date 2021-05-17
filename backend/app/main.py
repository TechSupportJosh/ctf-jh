from app.settings import get_settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from . import models
from .database import engine
from authlib.integrations.starlette_client import OAuth
import urllib

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

oauth = OAuth()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SessionMiddleware, secret_key="some-random-string")

from .routers import auth, challenges, admin
app.include_router(auth.router)
app.include_router(challenges.router)
app.include_router(admin.router)

settings = get_settings()

oauth.register(
    name="warwick", 
    client_id=settings.oauth_consumer_key,
    client_secret=settings.oauth_consumer_secret,
    request_token_url="https://websignon.warwick.ac.uk/oauth/requestToken?scope=" + urllib.parse.quote("urn:websignon.warwick.ac.uk:sso:service"),
    access_token_url="https://websignon.warwick.ac.uk/oauth/accessToken",
    authorize_url="https://websignon.warwick.ac.uk/oauth/authorise",
    client_kwargs={
        "signature_method": "HMAC-SHA1" 
    }
)

@app.get("/")
async def root():
    return {"hello": "world"}