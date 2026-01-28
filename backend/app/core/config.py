from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    # 🔐 Core
    SECRET_KEY: str

    # 🔑 JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # 🗄️ Database
    DATABASE_URL: str

    model_config = ConfigDict(
        env_file=".env",
        extra="forbid",  # strict on purpose
    )

settings = Settings()