from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Portfolio, TokenType
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os, math
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
        position_type = request.json["position_type"]
        sort_column = request.json["sort_column"]
        sort_direction = request.json["sort_direction"]

        query = Portfolio.query.join(TokenType, Portfolio.token_type == TokenType.uid).with_entities(
            Portfolio.uid,
            Portfolio.date,
            Portfolio.token_id,
            Portfolio.position_type,
            Portfolio.token_type,
            Portfolio.leverage,
            Portfolio.entry_price,
            Portfolio.quantity,
            Portfolio.trade_type,
            Portfolio.status,
            Portfolio.oracle,
            Portfolio.real_result,
            Portfolio.token_name,
            Portfolio.token_symbol,
            TokenType.name.label('token_type_name'),
            Portfolio.closed_date,
        )        

        if search:
            query = query.filter(Portfolio.token_name.ilike(f"%{search}%"))

        if toke_type > 0:
            query = query.filter(Portfolio.token_type == toke_type)

        if status > -1:
            query = query.filter(Portfolio.status == status)

        if position_type > -1:
            if position_type < 2:
                query = query.filter(Portfolio.position_type == position_type)
            else:
                query = query.filter(Portfolio.trade_type == position_type - 2)

        if start_date:
            query = query.filter(Portfolio.date >= start_date)

        if end_date:
            query = query.filter(Portfolio.date <= end_date)

        if sort_column == "Date":
            if sort_direction == 0:
                portfolios = query.order_by(Portfolio.date.desc()).all()
            else:
                portfolios = query.order_by(Portfolio.date.asc()).all()
        elif sort_column == "Result":
            if sort_direction == 0:
                portfolios = query.order_by(Portfolio.real_result.desc()).all()
            else:
                portfolios = query.order_by(Portfolio.real_result.asc()).all()
        else:
            portfolios = query.all()

        total_count = query.count()

        temp = [{
            "uid": portfolio[0],
            "date": portfolio[1].strftime("%m.%d.%Y"),
            "closed_date": '' if portfolio[15] == None else portfolio[15].strftime("%m.%d.%Y"),
            "token_id": portfolio[2],
            "position_type": portfolio[3],
            "token_type": portfolio[4],
            "leverage": portfolio[5],
            "entry_price": portfolio[6],
            "quantity": portfolio[7],
            "trade_type": portfolio[8],
            "status": portfolio[9],
            "oracle": portfolio[10],
            "real_result": portfolio[11],
            "token_name": portfolio[12],
            "token_symbol": portfolio[13],
            "token_type_name": portfolio[14],
        } for portfolio in portfolios]

        symbols = [portfolio['token_symbol'] for portfolio in temp]

        latest_prices = current_app.tracker.get_latest_price(list(set(symbols)))
        total_order = 0
        
        for portfolio in temp:
            portfolio['oracle'] = latest_prices[portfolio['token_symbol']]['price']
            portfolio['logo'] = latest_prices[portfolio['token_symbol']]['logo']
            portfolio['order_value'] = portfolio['entry_price'] * portfolio['quantity']
            
            if portfolio['status'] == 0:
                total_order = total_order + portfolio['order_value']

            if (portfolio['trade_type']) == 0:
                if portfolio['position_type'] == 0:
                    portfolio['est_val'] = (portfolio['oracle'] - portfolio['entry_price']) * portfolio['quantity'] 
                else:
                    portfolio['est_val'] = (portfolio['oracle'] - portfolio['entry_price']) * portfolio['quantity'] * portfolio['leverage'] 
            else:
                if portfolio['position_type'] == 0:
                    portfolio['est_val'] = (portfolio['entry_price'] - portfolio['oracle']) * portfolio['quantity'] 
                else:
                    portfolio['est_val'] = (portfolio['entry_price'] - portfolio['oracle']) * portfolio['quantity'] * portfolio['leverage']     

        if sort_column == "Est.P&L":
            if sort_direction == 0:
                temp.sort(key=lambda x: x['est_val'], reverse=True)
            else:
                temp.sort(key=lambda x: x['est_val'])
            
        if sort_column == "Order Value":
            if sort_direction == 0:
                temp.sort(key=lambda x: x['order_value'], reverse=True)
            else:
                temp.sort(key=lambda x: x['order_value'])
            
        temp = temp[offset:offset+limit]
        
        return response_message(200, 'success', '', {"portfolio_list": temp, 'total_order': total_order, "page_count": math.ceil(total_count / limit)})