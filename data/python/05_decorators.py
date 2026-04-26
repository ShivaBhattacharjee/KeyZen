import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f}s")
        return result
    return wrapper

@timer
def heavy_computation(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

print("Starting computation...")
result = heavy_computation(1000000)
print(f"Result: {result}")
