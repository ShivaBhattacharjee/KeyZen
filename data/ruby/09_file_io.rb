File.open("test.txt", "w") do |f|
  f.write("Hello\nWorld")
end

if File.exist?("test.txt")
  lines = File.readlines("test.txt")
  puts "Lines: #{lines.length}"
end

File.delete("test.txt")
