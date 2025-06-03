import uuid
from datetime import datetime
from model import app, db, bcrypt


class UserToken(db.Model):
    __tablename__ = "tbl_user_token"

    uid = db.Column(db.Integer, primary_key=True)
    user_uid = db.Column(db.String(255), nullable=True)
    token_uid = db.Column(db.String(255), nullable=False)

    def __init__(self, user_uid, token_uid):
        self.token_uid = token_uid
        self.user_uid = user_uid
