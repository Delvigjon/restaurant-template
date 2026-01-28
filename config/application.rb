require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module RestaurantTemplate
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    # IMPORTANT: tu es en Rails 8.1.x => on passe à 8.1
    config.load_defaults 8.1

    # Si tu veux garder tes préférences de génération (recommandé)
    config.generators do |generate|
      generate.assets false
      generate.helper false
      generate.test_framework :test_unit, fixture: false
    end

    # Autoload lib (nouvelle syntaxe proposée par Rails)
    config.autoload_lib(ignore: %w[assets tasks])

    # (Optionnel) tu peux supprimer cette ligne : elle n’est plus utile en Rails 8
    # config.action_controller.raise_on_missing_callback_actions = false if Rails.version >= "7.1.0"
  end
end
