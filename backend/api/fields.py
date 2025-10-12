from bson import ObjectId
from rest_framework import serializers

class ObjectIdStrField(serializers.Field):
    def to_representation(self, value):
        # value is an ObjectId from Mongo → string for JSON
        return str(value) if value is not None else None

    def to_internal_value(self, data):
        # string from client → ObjectId for Mongo
        try:
            return ObjectId(str(data))
        except Exception:
            raise serializers.ValidationError("Invalid ObjectId.")