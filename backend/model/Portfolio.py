import uuid
from datetime import datetime
from flask import url_for
from model import app, db, bcrypt


class Portfolio(db.Model):
    __tablename__ = "tbl_portfolio"

    uid = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.now())
    token_id = db.Column(db.Integer, nullable=False)
    token_name = db.Column(db.String, nullable=True)
    token_symbol = db.Column(db.String, nullable=True)
    position_type = db.Column(db.Integer, nullable=False)
    token_type = db.Column(db.Integer, nullable=True)
    leverage = db.Column(db.Float, nullable=True)
    entry_price = db.Column(db.Float, nullable=True)
    quantity = db.Column(db.Float, nullable=True)
    trade_type = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Integer, nullable=False)
    oracle = db.Column(db.Float, nullable=True)
    real_result = db.Column(db.Float, nullable=True)
    user_uid = db.Column(db.String, nullable=False)
    closed_date = db.Column(db.DateTime, nullable=True)

    def __init__(self, token_id, token_name, token_symbol, position_type, token_type, leverage, entry_price, quantity, trade_type, status,user_uid):
        self.date = datetime.now()
        self.token_id = token_id
        self.token_name = token_name
        self.token_symbol = token_symbol
        self.position_type = position_type
        self.token_type = token_type
        self.leverage = leverage
        self.entry_price = entry_price
        self.quantity = quantity
        self.trade_type = trade_type
        self.status = status
        self.user_uid = user_uid

    def to_dict(self):
        return {
            "uid": self.uid,
            "date": self.date.strftime("%m/%d/%Y"),
            "token_id": self.token_id,
            "token_name": self.token_name,
            "token_symbol": self.token_symbol,
            "position_type": self.position_type,
            "token_type": self.token_type,
            "leverage": self.leverage,
            "entry_price": self.entry_price,
            "quantity": self.quantity,
            "trade_type": self.trade_type,
            "status": self.status,
            "oracle": self.oracle,
            "real_result": self.real_result,
            "closed_date": self.closed_date,
        }
