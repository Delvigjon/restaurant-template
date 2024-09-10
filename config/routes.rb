Rails.application.routes.draw do
  devise_for :users

  root 'pages#home'
  get 'menu', to: 'pages#menu'
  get 'contact', to: 'pages#contact'
  get 'about', to: 'pages#about'
  get 'reservation', to: 'pages#reservation'
  post 'create_reservation', to: 'pages#create_reservation'
end
