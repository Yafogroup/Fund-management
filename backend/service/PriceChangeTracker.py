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
        self.last_prices = {}
        
    def get_tokens(self):
        """Fetch current prices and maintain history of interval"""
        current_prices = self.cmc.get_current_prices()
        timestamp = datetime.utcnow()
        result = {}
        change_log = {}
        
        if self.last_prices:
            for symbol, data in current_prices.items():
                old_price = self.last_prices[symbol]['price']
                new_price = data['price']
                change = self.calculate_interval_change(old_price, new_price)

                change_log[symbol] = {
                        'name': data['name'],
                        'old_price': old_price,
                        'price': new_price,
                        'percent_change': change,
                        'timestamp': timestamp.strftime("%m/%d/%Y, %H:%M:%S")
                    }
                
                if self.min_change <= abs(change) <= self.max_change:
                    result[symbol] = {
                        'name': data['name'],
                        'old_price': old_price,
                        'price': new_price,
                        'percent_change': change,
                        'timestamp': timestamp.strftime("%m/%d/%Y, %H:%M:%S")
                    }
        
        print("***Last Prices***")
        print(self.last_prices)
        print("***Current Prices***")
        print(current_prices)
        print(f"***Change Log***")
        print(change_log)
        print(f"***Tokens in range ({self.min_change}, {self.max_change})***")
        print(result)
        print("\n***************************")

        self.last_prices = current_prices
    
    def calculate_interval_change(self, old_price, new_price):
        """Calculate percentage change over interval for all tracked tokens"""
        if old_price == 0:
            return 0    
        return ((new_price - old_price) / old_price) * 100
    
    def background_updater(self):
        """Background thread to periodically update prices"""
        while True:
            try:
                self.get_tokens()
            except Exception as e:
                print(f"Error in background updater: {e}")
            time.sleep(self.interval)

    def start_tracking(self):
        # updater = threading.Thread(target=self.background_updater, daemon=True)
        # updater.start()
        while True:
            try:
                self.get_tokens()
            except Exception as e:
                print(f"Error in background updater: {e}")
            time.sleep(self.interval)