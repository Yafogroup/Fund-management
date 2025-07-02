import os
from datetime import datetime, timedelta
import time
from service import CoinMarketCapAPI
import threading

class PriceChangeTracker:
    def __init__(self):
        self.interval = int(os.getenv('TIME_INTERVAL', 30)) * 60  # Default to 30 min
        self.min_change = float(os.getenv('MIN_CHANGE', 15))  # Default to 15%
        self.max_change = float(os.getenv('MAX_CHANGE', 20))  # Default to 20%
        self.cmc = CoinMarketCapAPI()
        self.last_prices = []
        self.change_log = []
        self.token_list = []
        self.token_all_list = []
        self.stop_event = threading.Event()
        self.thread = threading.Thread(target=self.background_task, daemon=True)
        self._lock = threading.Lock()
        
        with open("time.inf", "w") as f:
            f.write(str(self.interval))

        self.get_all_tokens()
        
    def get_all_tokens(self):
        self.token_all_list = self.cmc.get_all_tokens()

    def get_filtered_tokens(self, search = ""):
        if search == "":
            return self.token_all_list
        else:
            return [token for token in self.token_all_list if search.lower() in token['name'].lower() or search.lower() in token['symbol'].lower()]
    
    def get_latest_price(self, symbols):
        """Fetch latest price for a list of symbols"""
        result = self.cmc.get_latest_price(','.join(symbols))
        return result
    
    def get_multiple_historical_prices(self, assets, start_date, end_date):
        all_prices = {}

        for token in assets:
            token_id = token['token_id']
            token_symbol = token['token_symbol']
            historical_data = self.cmc.get_historical_prices(token_id, start_date, end_date)
            all_prices[token_symbol] = {
                'id': token_id,
                'data': historical_data
            }

        return all_prices

    def get_tokens(self):
        """Fetch current prices and maintain history of interval"""     

        current_prices = self.cmc.get_current_prices()
        timestamp = datetime.now()
        self.token_list = []
        self.change_log = []
        
        if self.last_prices:
            for symbol, data in current_prices.items():
                new_price = data['price']
                old_price = self.last_prices[symbol]['price'] if symbol in self.last_prices.keys() else new_price
                change = self.calculate_interval_change(old_price, new_price)

                self.change_log.append({
                        'id': data['id'],
                        'symbol': data['symbol'],
                        'name': data['name'],
                        'old_price': old_price,
                        'price': new_price,
                        'percent_change': change,
                        'percent_change_24h': data['percent_change_24h'],
                        'percent_change_7d': data['percent_change_7d'],
                        'percent_change_30d': data['percent_change_30d'],
                        'timestamp': timestamp.strftime("%m/%d/%Y, %H:%M:%S"),
                        'logo': f"https://s2.coinmarketcap.com/static/img/coins/64x64/{data['id']}.png"
                    })
                
                if self.min_change <= abs(change) <= self.max_change:
                    self.token_list.append({
                        'id': data['id'],
                        'symbol': data['symbol'],
                        'name': data['name'],
                        'old_price': old_price,
                        'price': new_price,
                        'percent_change': change,
                        'percent_change_24h': data['percent_change_24h'],
                        'percent_change_7d': data['percent_change_7d'],
                        'percent_change_30d': data['percent_change_30d'],
                        'timestamp': timestamp.strftime("%m/%d/%Y, %H:%M:%S"),
                        'logo': f"https://s2.coinmarketcap.com/static/img/coins/64x64/{data['id']}.png"
                    })
        else:
            for symbol, data in current_prices.items():
                self.change_log.append({
                        'id': data['id'],
                        'symbol': data['symbol'],
                        'name': data['name'],
                        'price': data['price'],
                        'percent_change': 0,
                        'percent_change_24h': data['percent_change_24h'],
                        'percent_change_7d': data['percent_change_7d'],
                        'percent_change_30d': data['percent_change_30d'],
                        'timestamp': timestamp.strftime("%m/%d/%Y, %H:%M:%S"),
                        'logo': f"https://s2.coinmarketcap.com/static/img/coins/64x64/{data['id']}.png"
                    })
        self.last_prices = current_prices

        # print("***Last Prices***")
        # print(self.last_prices)
        # print("***Current Prices***")
        # print(current_prices)            

        # print(f"***Change Log***")
        # print(self.change_log)
        print(timestamp.strftime("%m/%d/%Y, %H:%M:%S"))
        print(f"***Tokens in range ({self.min_change}, {self.max_change})***")
        print(self.token_list)
        print("\n***************************")
        
        
    
    def calculate_interval_change(self, old_price, new_price):
        """Calculate percentage change over interval for all tracked tokens"""
        if old_price == 0:
            return 0    
        return ((new_price - old_price) / old_price) * 100

    def background_task(self):
        while not self.stop_event.is_set():
            try:
                self.get_tokens()
            except Exception as e:
                print(f"Error in background updater: {e}")

            with self._lock:
                with open("time.inf", "r") as f:
                    current_interval = int(f.read())

            time.sleep(current_interval)
    
    def start(self):
        if not self.thread or not self.thread.is_alive():
            self.thread.start()
        else:
            self.stop_event.set()
            self.thread.join()
            self.thread.start()

    def get_token_list(self):
        """Get the list of tokens that have changed within the specified range"""
        t_list = self.token_list
        result = [item for item in t_list if self.min_change <= abs(item['percent_change']) <= self.max_change]
        return [self.change_log, result]
    
    def get_current_token_list(self):
        current_prices = self.cmc.get_current_prices()
        timestamp = datetime.now()
        result = []
        for symbol, data in current_prices.items():
            result.append({
                    'id': data['id'],
                    'symbol': data['symbol'],
                    'name': data['name'],
                    'price': data['price'],
                    'percent_change_24h': data['percent_change_24h'],
                    'percent_change_7d': data['percent_change_7d'],
                    'percent_change_30d': data['percent_change_30d'],
                    'timestamp': timestamp.strftime("%m/%d/%Y, %H:%M:%S"),
                    'logo': f"https://s2.coinmarketcap.com/static/img/coins/64x64/{data['id']}.png"
                })
        return result

    def update_param(self, interval=None, min_change=None, max_change=None):
        """Update the parameters for tracking"""
        if interval:
            with self._lock:
                self.interval = interval * 60
                with open("time.inf", "w") as f:
                    f.write(str(self.interval))
        if min_change: 
            self.min_change = min_change
        if max_change:
            self.max_change = max_change
        print(f"Updated parameters: interval={self.interval}, min_change={self.min_change}, max_change={self.max_change}")