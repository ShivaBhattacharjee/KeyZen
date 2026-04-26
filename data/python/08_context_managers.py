class DatabaseConnection:
    def __init__(self, db_name):
        self.db_name = db_name

    def __enter__(self):
        print(f"Connecting to database '{self.db_name}'...")
        self.connected = True
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"Closing connection to '{self.db_name}'...")
        self.connected = False
        if exc_type:
            print(f"An error occurred: {exc_val}")
        return True

    def query(self, sql):
        if hasattr(self, 'connected') and self.connected:
            print(f"Executing: {sql}")
            return [{"id": 1, "data": "Sample"}]

with DatabaseConnection("production_db") as db:
    results = db.query("SELECT * FROM users")
    print(f"Results: {results}")
    raise ValueError("Oops! Something went wrong")
