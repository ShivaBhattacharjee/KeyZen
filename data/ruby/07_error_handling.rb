def safe_read(file)
  begin
    content = File.read(file)
    puts content
  rescue Errno::ENOENT
    puts "File not found!"
  rescue => e
    puts "Error: #{e.message}"
  ensure
    puts "Read attempt finished."
  end
end

safe_read("missing.txt")
