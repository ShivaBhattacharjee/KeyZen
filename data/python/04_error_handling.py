import json

def load_config(path):
    try:
        with open(path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Config not found: {path}")
        return {}
    except json.JSONDecodeError as e:
        print(f"Invalid JSON: {e}")
        return {}

def safe_divide(a, b):
    if b == 0:
        raise ValueError("division by zero")
    return a / b

try:
    result = safe_divide(10, 0)
except ValueError as e:
    print(f"Error: {e}")
finally:
    print("done")
