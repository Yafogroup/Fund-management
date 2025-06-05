from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Portfolio
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class AddPortfolioAPI(MethodResource):

    @doc(
        description='Create Portfolio Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        uid = int(request.form.get('uid'))
        token_id = int(request.form.get('token_id'))
        token_name = request.form.get('token_name')
        position_type = int(request.form.get('position_type'))
        token_type = int(request.form.get('token_type'))
        leverage = request.form.get('leverage')
        entry_price = request.form.get('entry_price')
        quantity = request.form.get('quantity')
        trade_type = request.form.get('trade_type')
        status = request.form.get('status')
        oracle = request.form.get('oracle')

        # Get the user ID from the token
        user_uid = auth['user_uid']

        if uid == 0:
            pt = Portfolio(
                token_id=token_id,
                token_name=token_name,
                position_type=position_type,
                token_type=token_type,
                leverage=leverage,
                entry_price=entry_price,
                quantity=quantity,
                trade_type=trade_type,
                status=status,
                user_uid=user_uid
            )
            db.session.add(pt)
        else:
            pt = Portfolio.query.filter_by(uid=uid).first()
            if not pt:
                return response_message(404, 'error', 'Portfolio not found.')

            pt.token_id = token_id
            pt.token_name = token_name
            pt.position_type = position_type
            pt.token_type = token_type
            pt.leverage = leverage
            pt.entry_price = entry_price
            pt.quantity = quantity
            pt.trade_type = trade_type
            pt.status = status
            pt.oracle = oracle

        db.session.commit()
        return response_message(200, 'success', 'Portfolio saved successfully.')