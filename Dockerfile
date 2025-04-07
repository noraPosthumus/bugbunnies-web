FROM ruby:3.2

# Install required packages
RUN apt-get update && apt-get install -y \
  build-essential \
  libffi-dev \
  nodejs \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /srv/jekyll

# Install bundler
RUN gem install bundler

# Install the latest version of Jekyll
RUN gem install jekyll

# Optionally add this if you're using a Gemfile
COPY src/Gemfile* ./
RUN [ -f Gemfile ] && bundle install || echo "No Gemfile found. Skipping bundle install."
