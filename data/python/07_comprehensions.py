numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

even_squares = [n * n for n in numbers if n % 2 == 0]
print(f"Even squares: {even_squares}")

cubes = {n: n ** 3 for n in range(1, 6)}
print(f"Cubes dict: {cubes}")

sentence = "the quick brown fox jumps over the lazy dog"
vowels = {char for char in sentence if char in 'aeiou'}
print(f"Unique vowels: {vowels}")

matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
print(f"Flattened matrix: {flattened}")

words = ["apple", "banana", "cherry", "date"]
lengths = {word: len(word) for word in words}
print(f"Word lengths: {lengths}")

gen_exp = (x * x for x in range(5))
print(f"Generator: {list(gen_exp)}")
