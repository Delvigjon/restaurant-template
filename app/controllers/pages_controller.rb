class PagesController < ApplicationController
  before_action :authenticate_user!, except: [:home, :menu, :contact, :reservation, :create_reservation]

  def home; end

  def menu
    @entrees  = Dish.where(category: "Entrée")
    @plats    = Dish.where(category: "Plat")
    @desserts = Dish.where(category: "Dessert")
  end

  def contact; end
  def about; end

  def reservation
    @reservation = Reservation.new
  end

  def create_reservation
    @reservation = Reservation.new(reservation_params)

    if @reservation.save
      redirect_to reservation_path, notice: "Réservation réussie !"
    else
      render :reservation, status: :unprocessable_entity
    end
  end

  private

  def reservation_params
    params.require(:reservation).permit(:name, :email, :phone, :date, :number_of_guests)
  end
end
