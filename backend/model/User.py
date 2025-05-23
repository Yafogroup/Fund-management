import uuid
import datetime

from model import app, db, bcrypt


class User(db.Model):
    __tablename__ = "users"

    uid = db.Column(db.String, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    referral_code = db.Column(db.String, nullable=False, unique=True)
    registered_on = db.Column(db.DateTime, nullable=False)
    redeemed_referral_code = db.Column(db.String, nullable=True)
    last_logged_in = db.Column(db.DateTime, nullable=True)
    last_logged_out = db.Column(db.DateTime, nullable=True)
    is_admin = db.Column(db.Integer, nullable=False)
    is_delete = db.Column(db.Integer, nullable=False)

    def __init__(self, password, email):
        self.uid = uuid.uuid4()
        self.email = email
        self.password = bcrypt.generate_password_hash(
            password, app.config.get('BCRYPT_LOG_ROUNDS')
        ).decode('utf-8')
        self.referral_code = uuid.uuid4()
        self.registered_on = datetime.datetime.now()
        self.is_admin = 0
        self.is_delete = 0

    def to_dict(self):
        return {
            "uid": self.uid,
            "email": self.email,
            "registered_on": self.registered_on,
            "last_logged_in": self.last_logged_in,
            "is_admin": self.is_admin,
        }