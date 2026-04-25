scores = {"alice": 92, "bob": 85, "eve": 97}

passed = [name for name, s in scores.items() if s >= 90]
print(passed)

nums = [3, 1, 4, 1, 5, 9, 2, 6]
evens = list(filter(lambda x: x % 2 == 0, nums))
doubled = list(map(lambda x: x * 2, evens))
print(doubled)

total = sum(scores.values())
avg = total / len(scores)
print(f"avg: {avg:.1f}")
