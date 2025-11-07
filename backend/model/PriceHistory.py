import uuid
from datetime import datetime
from flask import url_for
from model import app, db, bcrypt


class PriceHistory(db.Model):
    __tablename__ = "tbl_history"

    uid = db.Column(db.Integer, primary_key=True)
    token_id = db.Column(db.Integer, nullable=False)
    data = db.Column(db.Text)

    def __init__(self, token_id, data, created_at=datetime.now()):
        self.token_id = token_id
        self.data = data
        self.created_at = created_at

    def __eq__(self, other):
        return isinstance(other, PriceHistory) and self.token_id == other.token_id and self.data == other.data

    def to_dict(self):
        return {
            "uid": self.uid,
            "token_id": self.token_id,
            "data": self.data,
            "created_at": self.created_at.strftime("%m/%d/%Y, %H:%M:%S"),
        }
