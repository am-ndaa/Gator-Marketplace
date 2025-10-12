from unittest import TestCase
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from types import SimpleNamespace

class ListingsUnitTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('api.views.get_collection')
    @patch('api.views.get_db')
    def test_get_listings_mocked(self, mock_get_db, mock_get_collection):
        # fake listings collection that returns two documents
        fake_docs = [
            {"_id": "1", "title": "Red Bike", "category": "dorm", "seller_id": "someone"},
            {"_id": "2", "title": "Blue Jacket", "category": "clothing", "seller_id": "someone"}
        ]
        fake_cursor = MagicMock()
        fake_cursor.sort.return_value = fake_docs

        # mock get_collection().find() to return our fake cursor
        mock_get_collection.return_value.find.return_value = fake_cursor

        # --- mock get_db so users.find_one returns the authenticated user ---
        fake_db = MagicMock()
        fake_users_coll = MagicMock()
        fake_users_coll.find_one.return_value = {"_id": "buyer123", "email": "buyer@example.com"}
        def db_getitem(key):
            if key == "users":
                return fake_users_coll
            return MagicMock()
        fake_db.__getitem__.side_effect = db_getitem
        mock_get_db.return_value = fake_db

        # authenticate the test client (we're not testing auth itself)
        self.client.force_authenticate(user=SimpleNamespace(email="buyer@example.com"))

        # exercise: GET with a query parameter
        resp = self.client.get('/api/listings/', {'q': 'Red'})
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        items = body.get('items', [])
        # should contain the "Red Bike" and exclude none of the two since seller_id != me
        self.assertTrue(any('Red' in (it.get('title') or '') for it in items))
        # ensure _id was transformed to id
        self.assertIn('id', items[0])

    @patch('api.views.get_collection')
    @patch('api.views.get_db')
    def test_create_listing_mocked(self, mock_get_db, mock_get_collection):
        # payload for creating a listing
        payload = {
            "title": "Green Lamp",
            "price": 12.5,
            "description": "Desk lamp",
            "category": "dorm",
            "image_url": "http://example.com/lamp.png"
        }

        # --- mock DB so users.find_one returns the authenticated user ---
        fake_db = MagicMock()
        fake_users_coll = MagicMock()
        fake_users_coll.find_one.return_value = {"_id": "seller123", "email": "test@example.com"}
        def db_getitem(key):
            if key == "users":
                return fake_users_coll
            return MagicMock()
        fake_db.__getitem__.side_effect = db_getitem
        mock_get_db.return_value = fake_db

        # --- fake listings collection: insert_one and find_one ---
        fake_listings = MagicMock()
        fake_insert_result = MagicMock()
        fake_insert_result.inserted_id = "newid"
        fake_listings.insert_one.return_value = fake_insert_result

        created_doc = {"_id": "newid", **payload, "seller_id": "seller123", "created_at": "ts"}
        fake_listings.find_one.return_value = created_doc

        mock_get_collection.return_value = fake_listings

        # authenticate the test client (we're not testing auth)
        self.client.force_authenticate(user=SimpleNamespace(email="test@example.com"))

        # exercise: POST create
        resp = self.client.post('/api/listings/', payload, format='json')
        self.assertEqual(resp.status_code, 201, resp.content)
        body = resp.json()
        self.assertEqual(body.get('id'), 'newid')
        self.assertEqual(body.get('seller_id'), 'seller123')
        # ensure server-added fields present
        self.assertIn('created_at', body)
