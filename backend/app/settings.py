from functools import lru_cache
from pydantic import BaseSettings

class Settings(BaseSettings):
    db_uri: str = "sqlite:///./sql_app.db"
    oauth_consumer_key: str = None
    oauth_consumer_secret: str = None

    class Config:
        env_file = ".env"
    
@lru_cache()
def get_settings():
    return Settings()
