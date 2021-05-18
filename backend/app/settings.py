from functools import lru_cache
from pydantic import BaseSettings
import os


class Settings(BaseSettings):
    db_uri: str = "sqlite:///./sql_app.db"
    oauth_consumer_key: str = None
    oauth_consumer_secret: str = None
    login_url: str = "http://localhost:3000/login"
    successful_login_url = "http://localhost:3000/"
    admin_url = "http://localhost:3000/admin"
    challenge_file_directory: str = os.path.join(os.getcwd(), "static")

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
