Jekyll::Hooks.register :documents, :pre_render do |doc|
    if doc.collection.label == "writeups"
      # Get the folder name under _writeups/
      folder = File.dirname(doc.relative_path).split("/")[1]
  
      # Only assign if not manually set
      doc.data["event"] ||= folder
  
      # Set permalink to /:collections/:event/:title
      doc.data["permalink"] = "/#{doc.collection.label}/#{Jekyll::Utils.slugify(doc.data["event"])}/#{Jekyll::Utils.slugify(doc.data["title"])}"
    end
  end
  