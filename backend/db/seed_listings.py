"""Seed the `listings` collection with two test documents.

Usage:
  python backend/db/seed_listings.py

This script uses the project's DB client (reads MONGO_URI and MONGO_DB from env).
It intentionally bypasses any application-level auth to create two sample listings for local testing.
"""
from datetime import datetime
from bson import ObjectId
import os
import sys
from pathlib import Path

# Ensure the backend package root is on sys.path so `import db` works regardless of
# how the script is invoked (from repo root, backend, or db folder).
THIS_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = THIS_DIR.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

try:
    from db.client import get_db
except Exception as exc:
    print("Failed to import db.client — make sure you're running the script from the project or backend folder.")
    print("sys.path:", sys.path[:5])
    raise


def make_listing(title, price, description, category, image_url=None):
    return {
        "title": title,
        "price": float(price),
        "description": description,
        "category": category,
        "image_url": image_url or "",
        "seller_id": ObjectId(),
        "created_at": datetime.utcnow(),
        "_seed": True,  # marker so these are easily identifiable/cleanable
    }


def main():
    db = get_db()
    listings = db["listings"]

    items = [
        make_listing(
            "Test - Apple AirPods",
            79.99,
            "Gently used AirPods. Works perfectly.",
            "electronics",
            "https://via.placeholder.com/400x300?text=AirPods",
        ),
        make_listing(
            "Test - Calculus Textbook",
            25.0,
            "Calculus 2 textbook, good condition.",
            "textbooks",
            "https://via.placeholder.com/400x300?text=Textbook",
        ),
    ]

    try:
        res = listings.insert_many(items)
    except Exception as e:
        print("Failed to insert listings:", e)
        # Provide a hint if MONGO_URI isn't configured
        if os.getenv('MONGO_URI') is None:
            print("Hint: MONGO_URI environment variable is not set. Put it in backend/.env or set it in the shell.")
        raise
    print(f"Inserted {len(res.inserted_ids)} seed listings:")
    for _id in res.inserted_ids:
        print(" -", str(_id))


if __name__ == "__main__":
    main()
