from app.settings import get_settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from . import models
from .database import engine
from authlib.integrations.starlette_client import OAuth
import urllib
import os

models.Base.metadata.create_all(bind=engine)

settings = get_settings()

if not os.path.exists(settings.challenge_file_directory):
    os.mkdir(settings.challenge_file_directory)

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

app.mount(
    "/static",
    StaticFiles(directory=settings.challenge_file_directory),
    name="challenge files",
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from .routers import auth, challenges, admin, me

app.include_router(auth.router)
app.include_router(challenges.router)
app.include_router(admin.router)
app.include_router(me.router)

oauth.register(
    name="warwick",
    client_id=settings.oauth_consumer_key,
    client_secret=settings.oauth_consumer_secret,
    request_token_url="https://websignon.warwick.ac.uk/oauth/requestToken?scope="
    + urllib.parse.quote("urn:websignon.warwick.ac.uk:sso:service"),
    access_token_url="https://websignon.warwick.ac.uk/oauth/accessToken",
    authorize_url="https://websignon.warwick.ac.uk/oauth/authorise",
    client_kwargs={"signature_method": "HMAC-SHA1"},
)


@app.get("/")
async def root():
    return {"hello": "world"}
