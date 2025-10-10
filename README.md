# Gator Marketplace

## To install everything, run 
python -m venv venv

# Activate the venv using
windows: venv\Scripts\acivate
mac: source venv/bin/activate
# To install backend requirements
pip install -r requirements.txt

# Backend Summary:
We’re using Django as our backend web framework and MongoDB as our database, but instead of relying on Djongo (which caused version conflicts and ORM issues), we’re connecting directly to MongoDB using PyMongo.

No Django ORM:
We can’t define models in models.py or use MyModel.objects.all().
Instead, we handle data manually through PyMongo, MongoDB’s native Python driver.
APIs:
We still use Django REST Framework (DRF) to create endpoints (views.py, urls.py) that our React + Vite frontend can call.
DRF gives us serializers, request handling, and response formatting — just like a typical Django API project.

# Frontend setup
Make sure you have prereqs installed: node -v, npm -v

Note: already setup a dev proxy to django backend (so no CORS during dev)
Note: Vite requires environment variables to be prefixed with "VITE_" . Make sure to add a .env.local in frontend with the env vars


