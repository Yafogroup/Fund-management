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
        self.stop_event = threading.Event()
        self.thread = threading.Thread(target=self.background_task, daemon=True)
        self._lock = threading.Lock()
        
        with open("time.inf", "w") as f:
            f.write(str(self.interval))
        
    def get_tokens(self):
        """Fetch current prices and maintain history of interval"""     

        current_prices = self.cmc.get_current_prices()
        timestamp = datetime.now()
        self.token_list = []
        self.change_log = []
        
        if self.last_prices:
            for idx, data in enumerate(current_prices):
                old_price = self.last_prices[idx]['price']
                new_price = data['price']
                change = self.calculate_interval_change(old_price, new_price)

                self.change_log.append({
                        'symbol': data['symbol'],
                        'name': data['name'],
                        'old_price': old_price,
                        'price': new_price,
                        'percent_change': change,
                        'timestamp': timestamp.strftime("%m/%d/%Y, %H:%M:%S")
                    })
                
                if self.min_change <= abs(change) <= self.max_change:
                    self.token_list.append({
                        'symbol': data['symbol'],
                        'name': data['name'],
                        'old_price': old_price,
                        'price': new_price,
                        'percent_change': change,
                        'timestamp': timestamp.strftime("%m/%d/%Y, %H:%M:%S")
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