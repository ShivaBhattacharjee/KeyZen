def clamp(value, lo, hi):
    return max(lo, min(value, hi))

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def make_adder(n):
    def adder(x):
        return x + n
    return adder

add5 = make_adder(5)
print(add5(10))
print(factorial(6))
print(clamp(15, 0, 10))
