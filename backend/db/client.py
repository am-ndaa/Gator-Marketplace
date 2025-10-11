'''
This file contains the database client setup and connection logic. (Manages and initializes the database connection.)
--> Door to the database client setup and connection logic.
 It hides all connection details so other files never have to worry about how the database works.
'''

import os
from dotenv import load_dotenv, find_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

_client = None
_db = None

load_dotenv(find_dotenv())  # read .env file, if it exists, LOAD THEN FIND

def get_db():
    # Returns reference to the database, initializing connection if needed.
    global _client, _db
    if _db:
        return _db
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("MONGO_DB", "gator_marketplace")
    _client = MongoClient(mongo_uri)
    _db = _client[db_name]
    return _db

def get_collection(name: str):
    """Shortcut to get a collection from the DB."""
    return get_db()[name]

def ping():
    """Check connection health by pinging the database."""
    return get_db().command("ping")

if __name__ == "__main__":
    print(ping())