import os
import requests
import pandas as pd
from datetime import timedelta
from time import sleep

class CoinMarketCapAPI:
    def __init__(self):
        self.api_key = os.getenv('CMC_API_KEY')
        self.api_key_free = os.getenv('CMC_API_KEY_FREE')
        self.base_url = "https://pro-api.coinmarketcap.com/v1"
        self.session = requests.Session()

        self.headers = {
            'Accepts': 'application/json',
            'X-CMC_PRO_API_KEY': self.api_key
        }
        
        self.session.headers.update(self.headers)

    def set_api_key(self, isFree=False):
        """Set the API key for the session"""
        if isFree:
            self.session.headers.update({'X-CMC_PRO_API_KEY': self.api_key_free})
        else:
            self.session.headers.update({'X-CMC_PRO_API_KEY': self.api_key})
    
    def get_current_prices(self, limit=3000):
        """Get current prices for top cryptocurrencies"""
        try:
            url = f"{self.base_url}/cryptocurrency/listings/latest"
            params = {
                'start': '1',
                'limit': str(limit),
                'sort': 'volume_24h',
                'convert': 'USD'
            }
            self.set_api_key(True)
            response = self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            result = {}
            for item in data['data']:
                result[item['symbol']] = {
                    'symbol': item['symbol'],
                    'price': item['quote']['USD']['price'],
                    'name': item['name'],
                    'id': item['id'],
                    'percent_change_1h': item['quote']['USD']['percent_change_1h'],
                    'percent_change_24h': item['quote']['USD']['percent_change_24h'],
                    'percent_change_7d': item['quote']['USD']['percent_change_7d'],
                    'percent_change_30d': item['quote']['USD']['percent_change_30d'],
                    'percent_change_60d': item['quote']['USD']['percent_change_60d'],
                    'percent_change_90d': item['quote']['USD']['percent_change_90d'],
                }
            return result
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching prices: {e}")
            return {}
        
    def get_all_tokens(self):
        """Get current prices for top cryptocurrencies"""
        try:
            url = f"{self.base_url}/cryptocurrency/map"
            params = {
                'sort': 'cmc_rank',
            }
            self.set_api_key(True)
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            result = []
            for item in data['data']:
                result.append({
                    'symbol': item['symbol'],
                    'name': item['name'],
                    'id': item['id'],
                    'logo': f"https://s2.coinmarketcap.com/static/img/coins/64x64/{item['id']}.png"
                }); 
            return result
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching prices: {e}")
            return {}
        
    def get_latest_price(self, symbols):
        """Get current prices for top cryptocurrencies"""
        try:
            url = f"{self.base_url}/cryptocurrency/quotes/latest"
            params = {
                'symbol': symbols,
            }
            self.set_api_key(True)

            response = self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            result = {}
            for symbol, item in data['data'].items():
                result[symbol] = {
                    'symbol': item['symbol'],
                    'name': item['name'],
                    'id': item['id'],
                    'price': item['quote']['USD']['price'],
                    'logo': f"https://s2.coinmarketcap.com/static/img/coins/64x64/{item['id']}.png"
                }; 
            return result
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching prices: {e}")
            return {}
        
    def get_historical_prices(self, coin_id, start_date, end_date):
        url = f'{self.base_url}/cryptocurrency/quotes/historical'

        params = {
            'id': str(coin_id),
            'time_start': start_date.strftime('%Y-%m-%d'),
            'time_end': end_date.strftime('%Y-%m-%d'),
            'interval': 'daily',
            'convert': 'USD'
        }

        self.set_api_key(False)
        
        response = self.session.get(url, params=params)
        data = response.json()

        print(f"\nFetching historical prices for {coin_id} from {start_date} to {end_date} is {data}")
        
        # Process the data into a DataFrame
        prices = []
        for item in data['data']['quotes']:
            prices.append({
                'date': item['timestamp'][:10],
                'price': item['quote']['USD']['price']
            })
        
        return pd.DataFrame(prices)