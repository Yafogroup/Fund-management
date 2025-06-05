from datetime import datetime
from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Auth, RequestResponse, RequestPost
from model import Portfolio
from controller import bcrypt, db
from flask import jsonify, current_app

class ClosePortfolioPost(RequestPost):
    fields_ = RequestPost.fields_
    uid = fields_.Int(required=True, description="Portfolio uid")
    real_result = fields_.Float(required=False, description="Real Result of the Portfolio")


class ClosePortfolioAPI(MethodResource):

    @doc(
        description='Close Portfolio Endpoint.',
    )
    @use_kwargs(ClosePortfolioPost, location='json')
    @marshal_with(RequestResponse)
    def post(self, **kwargs):
        try:
            uid = kwargs.get('uid')
            real_result = kwargs.get('real_result')
            pt = Portfolio.query.filter_by(uid=uid).first()
            if not pt:
                return response_message(404, 'error', 'Portfolio not found.')
            else:
                pt.status = 1
                pt.real_result = real_result if real_result is not None else 0.0
                db.session.commit()

            return response_message(200, 'success', 'Close the portfolio')
        except Exception as e:
            return response_message(500, 'fail', f'Server Error. {e}')
    