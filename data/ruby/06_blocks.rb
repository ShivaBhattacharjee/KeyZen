def repeat(n)
  n.times { yield } if block_given?
end

repeat(3) { puts "Again!" }

my_proc = Proc.new { |x| x * x }
puts my_proc.call(5)

my_lambda = ->(x) { x + 1 }
puts my_lambda.call(10)
