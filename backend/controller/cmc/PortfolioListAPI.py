from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Portfolio
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired

class PortfolioListAPI(MethodResource):

    @doc(
        description='Portfolio List Endpoint.'
    )
    @marshal_with(RequestResponse)
    @TokenRequired
    def post(self, auth, **kwargs):
        offset = int(request.json["offset"])
        limit = int(request.json["limit"])
        search = request.json['search']
        start_date = request.json["start_date"]
        end_date = request.json["end_date"]
        toke_type = request.json["toke_type"]
        status = request.json["status"]

        query = Portfolio.query

        if search:
            query = query.filter(Portfolio.token_name.ilike(f"%{search}%"))

        if toke_type > 0:
            query = query.filter(Portfolio.token_type == toke_type)

        if status > -1:
            query = query.filter(Portfolio.status == status)

        if start_date:
            query = query.filter(Portfolio.date >= start_date)

        if end_date:
            query = query.filter(Portfolio.date <= end_date)

        portfolios = query.order_by(Portfolio.date.desc()).offset(offset).limit(limit).all()
        return response_message(200, 'success', '', {"portfolio_list": [portfolio.to_dict() for portfolio in portfolios]})