from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Portfolio, TokenType
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired
from datetime import datetime, timedelta

class DashboardDataAPI(MethodResource):

    @doc(
        description='Dashboard Data Endpoint.'
    )
    @marshal_with(RequestResponse)
    #@TokenRequired
    def post(self, **kwargs):
        start_date = request.json["start_date"]
        end_date = request.json["end_date"]
        period_type = request.json["period_type"]
        pl = request.json["pl"]
        status = request.json["status"]

        if period_type == "-1":
            period_list = self.split_period(start_date, end_date)
        else:
            period_list = self.make_period(period_type)

        bar_chart_info = {}

        closed_profit_list = []
        closed_loss_list = []
        open_profit_list = []
        open_loss_list = []
        total_profit_list = []
        
        chart_categories = []

        count = 1

        for period in period_list:
            query = Portfolio.query
            query = query.filter(Portfolio.date >= period[0], Portfolio.date <= period[1])
            tt = query.all()
            portfolios = [p.to_dict() for p in tt]
            info = self.get_detail_info(portfolios)
            closed_profit_list.append(round(info[0], 2))
            closed_loss_list.append(round(info[1], 2))
            open_profit_list.append(round(info[2], 2))
            open_loss_list.append(round(info[3], 2))
            
            if pl == "-1":
                if status == "-1":
                    total_profit_list.append(round(info[4], 2))
                elif status == "0":
                    total_profit_list.append(round(info[2] + info[3], 2))
                else:
                    total_profit_list.append(round(info[0] + info[1], 2))
            elif pl == "0":
                if status == "-1":
                    total_profit_list.append(round(info[0] + info[2], 2))
                elif status == "0":
                    total_profit_list.append(round(info[2], 2))
                else:
                    total_profit_list.append(round(info[0], 2))
            else:
                if status == "-1":
                    total_profit_list.append(round(info[1] + info[3], 2))
                elif status == "0":
                    total_profit_list.append(round(info[3], 2))
                else:
                    total_profit_list.append(round(info[1], 2))

            if period_type == "0":
                chart_categories.append(period[0].strftime('%Y-%m'))
            elif period_type == "1":
                chart_categories.append(str(count) + "week")
            elif period_type == "2":
                chart_categories.append(period[0].strftime('%Y'))
            else:
                chart_categories.append(period[0].strftime('%Y-%m-%d'))

            count = count + 1

        bar_chart_info['closed_profit'] = closed_profit_list
        bar_chart_info['closed_loss'] = closed_loss_list
        bar_chart_info['open_profit'] = open_profit_list    
        bar_chart_info['open_loss'] = open_loss_list
        bar_chart_info['total_profit'] = total_profit_list
        bar_chart_info['chart_categories'] = chart_categories

        pie_chart_info = self.get_pie_info(start_date, end_date)
        t_info = self.get_today_info()
        y_info = self.get_year_info()


        response_data = {
            'bar_chart_info': bar_chart_info,
            'pie_chart_info': pie_chart_info,
            'today_info': t_info,
            'year_info': y_info
        }      

        
        return response_message(200, 'success', '', response_data)
    
    def split_period(self, start, end, isMonth=False):

        start_date = datetime.strptime(start, '%Y-%m-%d')
        end_date = datetime.strptime(end, '%Y-%m-%d')

        result = []
        delta = (end_date - start_date).days

        if isMonth == True:
            # Split by month
            current = start_date
            while current <= end_date:
                # calculate first day of next month
                if current.month == 12:
                    next_month = datetime(current.year + 1, 1, 1)
                else:
                    next_month = datetime(current.year, current.month + 1, 1)

                period_end = min(next_month - timedelta(days=1), end_date)
                result.append((current, period_end))
                current = next_month
        else:
            if delta >= 60:
                # Split by month manually
                current = start_date
                while current <= end_date:
                    # calculate first day of next month
                    if current.month == 12:
                        next_month = datetime(current.year + 1, 1, 1)
                    else:
                        next_month = datetime(current.year, current.month + 1, 1)

                    period_end = min(next_month - timedelta(days=1), end_date)
                    result.append((current, period_end))
                    current = next_month

            elif delta > 14:
                # Split by week (7 days)
                current = start_date
                while current <= end_date:
                    period_end = min(current + timedelta(days=6), end_date)
                    result.append((current, period_end))
                    current += timedelta(days=7)

            else:
                # Split by day
                current = start_date
                while current <= end_date:
                    result.append((current, current))
                    current += timedelta(days=1)

        return result
    
    def make_period(self, type):
        today = datetime.now()
        result = []

        if type == "0":
            start_date = datetime(today.year, 1, 1)
            end_date = datetime(today.year, 12, 31)
            current = start_date
            while current <= end_date:
                # calculate first day of next month
                if current.month == 12:
                    next_month = datetime(current.year + 1, 1, 1)
                else:
                    next_month = datetime(current.year, current.month + 1, 1)

                period_end = min(next_month - timedelta(days=1), end_date)
                result.append((current, period_end))
                current = next_month
        elif type == "1":
            start_date = datetime(today.year, today.month, 1)
            end_date = datetime(today.year, today.month + 1, 1)
            current = start_date
            while current < end_date:
                period_end = min(current + timedelta(days=6), end_date)
                result.append((current, period_end))
                current += timedelta(days=7)
        elif type == "2":
            start_date = datetime(2025, 1, 1)
            end_date = datetime(today.year, 12, 31)
            current = start_date
            while current < end_date:
                period_end = min(current + timedelta(days=365), end_date)
                result.append((current, period_end))
                current += timedelta(days=365)
        else:
            start_date = datetime(today.year, today.month, 1)
            end_date = today
            current = start_date
            while current <= end_date:
                result.append((current, current))
                current += timedelta(days=1)
        
        return result
    
    def get_detail_info(self, p_list):
        result = []
        symbols = [portfolio['token_symbol'] for portfolio in p_list]

        if len(symbols) > 0:
            latest_prices = current_app.tracker.get_latest_price(list(set(symbols)))

        closed_profit = 0
        open_profit = 0
        closed_loss = 0
        open_loss = 0
        total_profit = 0
        
        for portfolio in p_list:
            portfolio['oracle'] = latest_prices[portfolio['token_symbol']]['price']
            portfolio['logo'] = latest_prices[portfolio['token_symbol']]['logo']
            portfolio['order_value'] = portfolio['entry_price'] * portfolio['quantity']
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
            if portfolio['status'] == 0:
                if portfolio['est_val'] > 0:
                    open_profit += portfolio['est_val']
                else:
                    open_loss += portfolio['est_val']
            else:
                if portfolio['real_result'] > 0:
                    closed_profit += portfolio['real_result']
                else:
                    closed_loss += portfolio['real_result']
        
        total_profit = open_profit + open_loss + closed_profit + closed_loss

        return [closed_profit, closed_loss, open_profit, open_loss, total_profit]
    
    def get_pie_info(self, start, end):
        token_list = TokenType.query.all()

        total_spot = 0
        total_margin = 0
        list_spot = {}
        list_margin = {}
        list_margin_short = {}
        list_margin_long = {}

        for token_type in token_list:
            list_spot[token_type.name] = 0
            list_margin[token_type.name] = 0
            list_margin_short[token_type.name] = 0
            list_margin_long[token_type.name] = 0

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
            TokenType.name.label('token_type_name')
        )        
        query = query.filter(Portfolio.date >= start, Portfolio.date <= end)
        tt = query.all()
        temp = [{
            "uid": portfolio[0],
            "date": portfolio[1].strftime("%m/%d/%Y"),
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
        } for portfolio in tt]

        symbols = [portfolio['token_symbol'] for portfolio in temp]

        if len(symbols) > 0:
            latest_prices = current_app.tracker.get_latest_price(list(set(symbols)))


        real_profit = 0
        real_profit_total = 0
        unreal_profit = 0
        unreal_profit_total = 0        

        for portfolio in temp:
            portfolio['oracle'] = latest_prices[portfolio['token_symbol']]['price']
            portfolio['logo'] = latest_prices[portfolio['token_symbol']]['logo']
            portfolio['order_value'] = portfolio['entry_price'] * portfolio['quantity']
            
            if portfolio['trade_type'] == 0:
                if portfolio['position_type'] == 0:
                    portfolio['est_val'] = round((portfolio['oracle'] - portfolio['entry_price']) * portfolio['quantity'], 2)
                else:
                    portfolio['est_val'] = round((portfolio['oracle'] - portfolio['entry_price']) * portfolio['quantity'] * portfolio['leverage'], 2) 
            else:
                if portfolio['position_type'] == 0:
                    portfolio['est_val'] = round((portfolio['entry_price'] - portfolio['oracle']) * portfolio['quantity'], 2)
                else:
                    portfolio['est_val'] = round((portfolio['entry_price'] - portfolio['oracle']) * portfolio['quantity'] * portfolio['leverage'], 2)


            if portfolio['position_type'] == 0:
                if portfolio['status'] == 0:
                    total_spot += portfolio['est_val']
                    list_spot[portfolio['token_type_name']] += portfolio['est_val']
                else:
                    total_spot += portfolio['real_result']
                    list_spot[portfolio['token_type_name']] += portfolio['real_result']
            else:
                if portfolio['status'] == 0:
                    total_margin += portfolio['est_val']
                    list_margin[portfolio['token_type_name']] += portfolio['est_val']
                    if portfolio['trade_type'] == 0:
                        list_margin_long[portfolio['token_type_name']] += portfolio['est_val']
                    else:
                        list_margin_short[portfolio['token_type_name']] += portfolio['est_val']
                else:
                    total_margin += portfolio['real_result']
                    list_margin[portfolio['token_type_name']] += portfolio['real_result']
                    if portfolio['trade_type'] == 0:
                        list_margin_long[portfolio['token_type_name']] += portfolio['real_result']
                    else:
                        list_margin_short[portfolio['token_type_name']] += portfolio['real_result']
            
            if portfolio['status'] == 1:
                real_profit_total += portfolio['real_result']
                if portfolio['real_result'] > 0:
                    real_profit += portfolio['real_result']
            else:
                unreal_profit_total += portfolio['est_val']
                if portfolio['est_val'] > 0:
                    unreal_profit += portfolio['est_val']
            

        pie_info = {
            'total_spot': round(total_spot, 2),
            'total_margin': round(total_margin, 2),
            'list_spot': list_spot,
            'list_margin': list_margin,
            'list_margin_short': list_margin_short,
            'list_margin_long': list_margin_long,
            'real_profit': real_profit,
            'real_profit_total': real_profit_total,
            'unreal_profit': unreal_profit,
            'unreal_profit_total': unreal_profit_total
        }

        return pie_info
        
    def get_today_info(self):
        
        today = datetime.strptime(datetime.now().strftime("%Y-%m-%d"), "%Y-%m-%d")
        tomorrow = today + timedelta(days=1)
        yesterday = today + timedelta(days=-1)

        query = Portfolio.query
        query = query.filter(Portfolio.date >= today, Portfolio.date < tomorrow)
        tt = query.all()
        portfolios = [p.to_dict() for p in tt]
        today_info = self.get_detail_info(portfolios)

        query = Portfolio.query
        query = query.filter(Portfolio.date >= yesterday, Portfolio.date < today)
        tt = query.all()
        portfolios = [p.to_dict() for p in tt]
        yesterday_info = self.get_detail_info(portfolios)

        t_info = {
            'real_profit': round(today_info[0], 2),
            'real_total_profit': round(today_info[0] + today_info[1], 2),
            'unreal_profit': round(today_info[2], 2),
            'unreal_total_profit': round(today_info[2] + today_info[3], 2),
            'percent_real_profit': round((today_info[0] - yesterday_info[0]) / yesterday_info[0] * 100 if yesterday_info[0] != 0 else 100, 2),
            'percent_real_total_profit': round((today_info[0] + today_info[1] - yesterday_info[0] - yesterday_info[1]) / (yesterday_info[0] + yesterday_info[1]) * 100 if (yesterday_info[0] + yesterday_info[1]) != 0 else 100, 2),
            'percent_unreal_profit': round((today_info[2] - yesterday_info[2]) / yesterday_info[2] * 100 if yesterday_info[2] != 0 else 100, 2),
            'percent_unreal_total_profit': round((today_info[2] + today_info[3] - yesterday_info[2] - yesterday_info[3]) / (yesterday_info[2] + yesterday_info[3]) * 100 if (yesterday_info[2] + yesterday_info[3]) != 0 else 100, 2),
        }

        return t_info

    def get_year_info(self):

        today = datetime.now()
        past = datetime.strptime('2025-06-01', '%Y-%m-%d')

        period_list = self.split_period(past.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d'), isMonth=True)

        year_info = []
        past_val = None

        for period in period_list:
            query = Portfolio.query
            query = query.filter(Portfolio.date >= period[0], Portfolio.date <= period[1])
            tt = query.all()
            portfolios = [p.to_dict() for p in tt]
            info = self.get_detail_info(portfolios)

            if past_val is None:
                past_val = round(info[0] + info[1] + info[2] + info[3], 2)

            year_info.append({
                'month' : period[0].strftime('%Y-%m'),
                'percent': round((round(info[0] + info[1] + info[2] + info[3], 2) - past_val) / past_val * 100 if past_val != 0 else 100, 2),
                'profit': round(info[0] + info[1], 2),
                'is_positive': (round(info[0] + info[1] + info[2] + info[3], 2) - past_val) >= 0
            })
            past_val = round(info[0] + info[1] + info[2] + info[3], 2)

            
        return year_info
            
            




       