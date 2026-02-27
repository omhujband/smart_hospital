import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

# 1. Load environment variables from the .env file
load_dotenv()

# 2. Get the database URL from the .env file
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# A little safety check to make sure the .env file was read correctly
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL is missing from .env file!")

# 3. Create the SQLAlchemy engine 
# Notice we removed connect_args={"check_same_thread": False} because that is only for SQLite
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()