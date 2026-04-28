user = {
  name: "Alice",
  age: 30,
  roles: [:admin, :editor]
}

puts user[:name]
user[:active] = true

user.each do |key, value|
  puts "#{key}: #{value}"
end
