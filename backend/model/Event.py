import uuid
from datetime import datetime
from flask import url_for
from model import app, db, bcrypt


class Event(db.Model):
    __tablename__ = "tbl_event"

    uid = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text)
    image = db.Column(db.Text)
    happen_time = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.now())
    user_uid = db.Column(db.Integer, nullable=False)

    def __init__(self, title, content, image, user_uid, happen_time, created_at=datetime.now()):
        self.title = title
        self.content = content
        self.image = image
        self.user_uid = user_uid
        self.happen_time = happen_time
        self.created_at = created_at

    def __eq__(self, other):
        return isinstance(other, Event) and self.title == other.title and self.content == other.content

    def to_dict(self):
        return {
            "uid": self.uid,
            "title": self.title,
            "content": self.content,
            "image": url_for('static', filename=f'uploads/{self.image}', _external=True) if self.image else None,
            "happen_time": self.happen_time.strftime("%m/%d/%Y, %H:%M:%S"),
            "created_at": self.created_at.strftime("%m/%d/%Y, %H:%M:%S"),
            "user_uid": self.user_uid,
        }
