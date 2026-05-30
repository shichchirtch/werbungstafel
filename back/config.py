from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    BOT_TOKEN: str

    DATABASE_URL: str

    REDIS_HOST: str
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    BASE_URL: str

    WEBAPP_HOST: str = "0.0.0.0"
    WEBAPP_PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file="main.env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings()