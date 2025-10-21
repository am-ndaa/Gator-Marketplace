#!/usr/bin/env python3
"""
Script to create MongoDB indexes for better query performance.
Run this once after setting up your database.
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.client import get_db

def create_indexes():
    """Create indexes for better query performance."""
    try:
        db = get_db()
        listings = db["listings"]
        
        # Index for title search (case-insensitive)
        listings.create_index([("title", "text")])
        print("Created text index on 'title'")
        
        # Index for category filtering
        listings.create_index([("category", 1)])
        print("Created index on 'category'")
        
        # Index for created_at (for sorting)
        listings.create_index([("created_at", -1)])
        print("Created index on 'created_at'")
        
        # Index for seller_id
        listings.create_index([("seller_id", 1)])
        print("Created index on 'seller_id'")
        
        print("\nAll indexes created successfully!")
        
    except Exception as e:
        print(f"Error creating indexes: {e}")

if __name__ == "__main__":
    create_indexes()