from flask_apispec import MethodResource, marshal_with, doc, use_kwargs
from helper import response_message, Serializers, RequestResponse, RequestPost, Auth
from model import Portfolio, TokenType
from controller import db
from flask import request, current_app
from werkzeug.utils import secure_filename
import os
from middleware import TokenRequired
from datetime import datetime, timedelta
import calendar
import pandas as pd

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

        start = datetime.strptime(start_date, '%Y-%m-%d') + timedelta(days=-1)
        end = datetime.strptime(end_date, '%Y-%m-%d')
        today = datetime.now()

        if period_type == "0":
            start = datetime(today.year, 1, 1) + timedelta(days=-1)
            end = datetime(today.year, today.month, today.day)
        elif period_type == "1":
            start = datetime(today.year, 1, 1) + timedelta(days=-1)
            end = datetime(today.year, today.month, today.day)
        elif period_type == "2":
            start = datetime(2025, 1, 1) + timedelta(days=-1)
            end = datetime(today.year, today.month, today.day)
        elif period_type == "3":
            start = datetime(today.year, today.month, 1) + timedelta(days=-2)
            end = datetime(today.year, today.month, today.day)
        
        y_info = self.get_year_info()

        daily_pnl, pie_info = self.get_daily_pnl(start, end)
        weekly_pnl = self.get_weekly_pnl(daily_pnl)
        monthly_pnl = self.get_monthly_pnl(daily_pnl)
        yearly_pnl = self.get_yearly_pnl(daily_pnl)


        if period_type == "0":
            chart_info = self.get_sum_data(monthly_pnl, pl, status)
            current_info = list(monthly_pnl.values())[-1]
            past_info = list(monthly_pnl.values())[-2]
        elif period_type == "1":
            chart_info = self.get_sum_data(weekly_pnl, pl, status)
            current_info = list(weekly_pnl.values())[-1]
            past_info = list(weekly_pnl.values())[-2]
        elif period_type == "2":
            chart_info = self.get_sum_data(yearly_pnl, pl, status)
            current_info = list(yearly_pnl.values())[-1]
            if (len(yearly_pnl) > 1):
                past_info = list(yearly_pnl.values())[-2]
            else:
                past_info = {
                    'closed_profit': 0,
                    'closed_loss': 0,
                    'open_profit': 0,
                    'open_loss': 0
                }
        elif period_type == "3":
            chart_info = self.get_sum_data(daily_pnl, pl, status)
            current_info = list(daily_pnl.values())[-1]
            past_info = list(daily_pnl.values())[-2]
        else:
            chart_info = self.get_sum_data(daily_pnl, pl, status)
            current_info = list(daily_pnl.values())[-1]
            past_info = list(daily_pnl.values())[-2]

        
        bar_chart_info = {}
        
        bar_chart_info['closed_profit'] = chart_info['closed_profit']
        bar_chart_info['closed_loss'] = chart_info['closed_profit']
        bar_chart_info['open_profit'] = chart_info['open_profit']    
        bar_chart_info['open_loss'] = chart_info['open_loss']
        bar_chart_info['total_profit'] = chart_info['total_profit']
        bar_chart_info['chart_categories'] = chart_info['labels']

        t_info = {
            'real_profit': round(current_info['closed_profit'], 2),
            'real_total_profit': round(current_info['closed_profit'] + current_info['closed_loss'], 2),
            'unreal_profit': round(current_info['open_profit'], 2),
            'unreal_total_profit': round(current_info['open_profit'] + current_info['open_loss'], 2),
            'percent_real_profit': 0 if (current_info['closed_profit'] - past_info['closed_profit']) == 0 else round((current_info['closed_profit'] - past_info['closed_profit']) / past_info['closed_profit'] * 100 if past_info['closed_profit'] != 0 else 100, 2),
            'percent_real_total_profit': 0 if (current_info['closed_profit'] + current_info['closed_loss'] - past_info['closed_profit'] - past_info['closed_loss']) == 0 else round((current_info['closed_profit'] + current_info['closed_loss'] - past_info['closed_profit'] - past_info['closed_loss']) / (past_info['closed_profit'] + past_info['closed_loss']) * 100 if (past_info['closed_profit'] + past_info['closed_loss']) != 0 else 100, 2),
            'percent_unreal_profit': 0 if (current_info['open_profit'] - past_info['open_profit']) == 0 else round((current_info['open_profit'] - past_info['open_profit']) / past_info['open_profit'] * 100 if past_info['open_profit'] != 0 else 100, 2),
            'percent_unreal_total_profit': 0 if (current_info['open_profit'] + current_info['open_loss'] - past_info['open_profit'] - past_info['open_loss']) == 0 else round((current_info['open_profit'] + current_info['open_loss'] - past_info['open_profit'] - past_info['open_loss']) / (past_info['open_profit'] + past_info['open_loss']) * 100 if (past_info['open_profit'] + past_info['open_loss']) != 0 else 100, 2),
        }


        response_data = {
            'bar_chart_info': bar_chart_info,
            'pie_chart_info': pie_info,
            'today_info': t_info,
            'year_info': y_info
        }      
        
        return response_message(200, 'success', '', response_data)
    
    
    def get_daily_pnl(self, start_date, end_date):

        total_spot = 0
        total_margin = 0
        list_spot = {}
        list_margin = {}
        list_margin_short = {}
        list_margin_long = {}

        token_list = db.session.query(
            TokenType.uid, 
            TokenType.name
        ).all()


        for token_type in token_list:
            list_spot[token_type['name']] = 0
            list_margin[token_type['name']] = 0
            list_margin_short[token_type['name']] = 0
            list_margin_long[token_type['name']] = 0
        
        
        query = Portfolio.query
        portfolios = query.all()

        assets = db.session.query(
            Portfolio.token_id, 
            Portfolio.token_symbol
        ).distinct().all()

        history_prices = current_app.tracker.get_multiple_historical_prices(assets, start_date, end_date)

        daily_pnl = {}

        current = start_date + timedelta(days=1)
        while current <= end_date:
            closed_profit = 0
            open_profit = 0
            closed_loss = 0
            open_loss = 0
            
            for portfolio in portfolios:
                oracle = history_prices[portfolio.token_symbol]['data'][history_prices[portfolio.token_symbol]['data']['date'] == current.strftime('%Y-%m-%d')]['price'].values[0]
                
                if (portfolio.trade_type) == 0:
                    if portfolio.position_type == 0:
                        est_val = (oracle - portfolio.entry_price) * portfolio.quantity 
                    else:
                        est_val = (oracle - portfolio.entry_price) * portfolio.quantity * portfolio.leverage 
                else:
                    if portfolio.position_type == 0:
                        est_val = (portfolio.entry_price - oracle) * portfolio.quantity 
                    else:
                        est_val = (portfolio.entry_price - oracle) * portfolio.quantity  * portfolio.leverage

                est_val = round(est_val, 2)
                
                if portfolio.status == 0:
                    if est_val > 0:
                        open_profit += est_val
                    else:
                        open_loss += est_val
                else:
                    if portfolio.closed_date != None and portfolio.closed_date.strftime('%Y-%m-%d') == current.strftime('%Y-%m-%d'):
                        if portfolio.real_result > 0:
                            closed_profit += portfolio.real_result
                        else:
                            closed_loss += portfolio.real_result

                # For pie chart
                if portfolio.position_type == 0:
                    if portfolio.status == 0:
                        total_spot += est_val
                        list_spot[list(filter(lambda e: e['uid'] == portfolio.token_type, token_list))[0].name] += est_val
                    else:
                        total_spot += portfolio.real_result
                        list_spot[list(filter(lambda e: e['uid'] == portfolio.token_type, token_list))[0].name] += portfolio.real_result
                else:
                    if portfolio.status == 0:
                        total_margin += est_val
                        list_margin[list(filter(lambda e: e['uid'] == portfolio.token_type, token_list))[0].name] += est_val
                        if portfolio.trade_type == 0:
                            list_margin_long[list(filter(lambda e: e['uid'] == portfolio.token_type, token_list))[0].name] += est_val
                        else:
                            list_margin_short[list(filter(lambda e: e['uid'] == portfolio.token_type, token_list))[0].name] += est_val
                    else:
                        total_margin += portfolio.real_result
                        list_margin[list(filter(lambda e: e['uid'] == portfolio.token_type, token_list))[0].name] += portfolio.real_result
                        if portfolio.trade_type == 0:
                            list_margin_long[list(filter(lambda e: e['uid'] == portfolio.token_type, token_list))[0].name] += portfolio.real_result
                        else:
                            list_margin_short[list(filter(lambda e: e['uid'] == portfolio.token_type, token_list))[0].name] += portfolio.real_result

            
            daily_pnl[current.strftime('%Y-%m-%d')] = {
                'open_profit': round(open_profit, 2),
                'open_loss': round(open_loss, 2),
                'closed_profit': round(closed_profit, 2),
                'closed_loss': round(closed_loss, 2)
            }

            current = current + timedelta(days=1)
        
        pie_info = {
            'all': {'spot': total_spot, 'margin': total_margin},
            'list_spot': list_spot,
            'list_margin': list_margin,
            'list_margin_long': list_margin_long,
            'list_margin_short': list_margin_short
        }

        return daily_pnl, pie_info
        
    def get_weekly_pnl(self, daily_pnl):
        df = pd.DataFrame.from_dict(daily_pnl, orient='index')
        df.index = pd.to_datetime(df.index)
        
        # Add time period columns
        df['week'] = df.index.isocalendar().year.astype(str) + '-W' + df.index.isocalendar().week.astype(str)
        
        # Weekly aggregation
        weekly = df.groupby('week').agg({
            'open_profit': 'sum',
            'open_loss': 'sum',
            'closed_profit': 'sum',
            'closed_loss': 'sum'
        })

        pnl_columns = ['open_profit', 'open_loss', 'closed_profit', 'closed_loss']
        cols_to_round = [col for col in pnl_columns if col in weekly.columns]
        weekly[cols_to_round] = weekly[cols_to_round].round(2)

        weekly_results = weekly.to_dict('index')

        return weekly_results
    
    def get_monthly_pnl(self, daily_pnl):
        df = pd.DataFrame.from_dict(daily_pnl, orient='index')
        df.index = pd.to_datetime(df.index)
        
        # Add time period columns
        df['month'] = df.index.to_period('M')

        # Monthly aggregation
        monthly = df.groupby('month').agg({
            'open_profit': 'sum',
            'open_loss': 'sum',
            'closed_profit': 'sum',
            'closed_loss': 'sum'
        })

        pnl_columns = ['open_profit', 'open_loss', 'closed_profit', 'closed_loss']
        cols_to_round = [col for col in pnl_columns if col in monthly.columns]
        monthly[cols_to_round] = monthly[cols_to_round].round(2)

        monthly.index = monthly.index.strftime('%Y-%m')
        monthly_result = monthly.to_dict('index')

        return monthly_result
    
    def get_yearly_pnl(self, daily_pnl):
        df = pd.DataFrame.from_dict(daily_pnl, orient='index')
        df.index = pd.to_datetime(df.index)
        
        # Add time period columns
        df['year'] = df.index.to_period('Y')

        # Monthly aggregation
        yearly = df.groupby('year').agg({
            'open_profit': 'sum',
            'open_loss': 'sum',
            'closed_profit': 'sum',
            'closed_loss': 'sum'
        })
        
        pnl_columns = ['open_profit', 'open_loss', 'closed_profit', 'closed_loss']
        cols_to_round = [col for col in pnl_columns if col in yearly.columns]
        yearly[cols_to_round] = yearly[cols_to_round].round(2)

        yearly.index = yearly.index.strftime('%Y')
        yearly_result = yearly.to_dict('index')

        return yearly_result
    
    def get_sum_data(self, data_pnl, pl, status):
        df = pd.DataFrame.from_dict(data_pnl, orient='index')

        if pl == "-1":
            if status == "-1":
                df['total_profit'] = df['closed_profit'] + df['open_profit'] + df['closed_loss'] + df['open_loss']
            elif status == "0":
                df['total_profit'] = df['open_profit'] + df['open_loss']
            else:
                df['total_profit'] = df['closed_profit'] + df['closed_loss']
        elif pl == "0":
            if status == "-1":
                df['total_profit'] = df['closed_profit'] + df['open_profit']
            elif status == "0":
                df['total_profit'] = df['open_profit']
            else:
                df['total_profit'] = df['closed_profit']
        else:
            if status == "-1":
                df['total_profit'] = df['closed_loss'] + df['open_loss']
            elif status == "0":
                df['total_profit'] = df['open_loss']
            else:
                df['total_profit'] = df['closed_loss']
        
        return {
            'labels': df.index.tolist(),
            'closed_profit': df['closed_profit'].tolist(),
            'closed_loss': df['closed_loss'].tolist(),
            'open_profit': df['open_profit'].tolist(),
            'open_loss': df['open_loss'].tolist(),
            'total_profit': df['total_profit'].tolist()
        }
    
    def get_year_info(self):
        today = datetime.now()
        start = datetime(2025, 5, 1) + timedelta(days=-1)
        end = datetime(today.year, today.month, today.day)
        daily_pnl, _ = self.get_daily_pnl(start, end)
        monthly_pnl = self.get_monthly_pnl(daily_pnl)
        chart_info = self.get_sum_data(monthly_pnl, "-1", "-1")

        result = []
        for index in range(0, len(chart_info['labels'])):
            
            if index == 0:
                percent = 0
            else:
                percent = round((chart_info['total_profit'][index] - chart_info['total_profit'][index - 1]) / chart_info['total_profit'][index - 1] * 100 if chart_info['total_profit'][index - 1] != 0 else 100, 2)
            
            result.append({
                'month': chart_info['labels'][index],
                'percent': percent,
                'profit': chart_info['total_profit'][index]
            })
       
        return result