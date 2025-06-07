import uuid
from datetime import datetime
from flask import url_for
from model import app, db, bcrypt


class Memo(db.Model):
    __tablename__ = "tbl_memo"

    uid = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text)
    image = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.now())
    user_uid = db.Column(db.Integer, nullable=False)

    def __init__(self, title, content, image, user_uid, created_at=datetime.now()):
        self.title = title
        self.content = content
        self.image = image
        self.user_uid = user_uid
        self.created_at = created_at

    def to_dict(self):
        return {
            "uid": self.uid,
            "title": self.title,
            "content": self.content,
            "image": url_for('static', filename=f'uploads/{self.image}', _external=True) if self.image else None,
            "created_at": self.created_at.strftime("%m/%d/%Y, %H:%M:%S"),
            "user_uid": self.user_uid,
        }
