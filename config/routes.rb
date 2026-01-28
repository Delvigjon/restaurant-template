Rails.application.routes.draw do
  devise_for :users

  # =========================
  # Pages principales
  # =========================
  root "pages#home"

  get "menu",        to: "pages#menu"
  get "reservation", to: "pages#reservation"
  post "reservation", to: "pages#create_reservation", as: :create_reservation
  get "contact",     to: "pages#contact"
  get "about",       to: "pages#about"

  # =========================
  # Pages légales (footer)
  # =========================
  get "mentions-legales",        to: "pages#mentions_legales",        as: :mentions_legales
  get "politique-confidentialite", to: "pages#politique_confidentialite", as: :politique_confidentialite
  get "cookies",                to: "pages#cookies",                as: :cookies
end
