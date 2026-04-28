module Loggable
  def log(msg)
    puts "[LOG] #{msg}"
  end
end

class Service
  include Loggable

  def perform
    log "Starting service..."
    # logic
  end
end

Service.new.perform
