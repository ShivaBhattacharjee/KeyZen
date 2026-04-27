numbers = [1, 2, 3, 4, 5]
numbers << 6

evens = numbers.select { |n| n.even? }
doubled = numbers.map { |n| n * 2 }

puts "Evens: #{evens.join(', ')}"
puts "Sum: #{numbers.sum}"
