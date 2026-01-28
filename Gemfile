source "https://rubygems.org"
ruby "3.4.8"
gem "rails"

# Assets / Front
gem "sprockets-rails"
gem "importmap-rails"
gem "turbo-rails"
gem "stimulus-rails"

# CSS (Sass moderne, compatible Ruby récent)
gem "dartsass-rails"
gem "autoprefixer-rails"

# UI
gem "bootstrap"
gem "font-awesome-sass"

# Backend
gem "pg"
gem "puma"
gem "jbuilder"

# Auth / Forms (à garder seulement si nécessaire)
gem "devise"
gem "simple_form"

# Perf
gem "bootsnap", require: false

# Windows timezone fix
gem "tzinfo-data", platforms: %i[ mswin mswin64 mingw x64_mingw jruby ]

group :development, :test do
  gem "dotenv-rails"
  gem "debug"
end

group :development do
  gem "web-console"
  gem "error_highlight"
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
end
