import uuid
from datetime import datetime
from model import app, db, bcrypt


class TokenType(db.Model):
    __tablename__ = "tbl_token_type"

    uid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=True)

    def __init__(self, name):
        self.name = name

    def to_dict(self):
        return {
            "uid": self.uid,
            "name": self.name,
        }
