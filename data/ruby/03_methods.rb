def greet(name, greeting = "Hello")
  "#{greeting}, #{name}!"
end

def factorial(n)
  return 1 if n <= 1
  n * factorial(n - 1)
end

puts greet("KeyZen")
puts "Fact 5: #{factorial(5)}"
