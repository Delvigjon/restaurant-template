class CreateReservations < ActiveRecord::Migration[7.1]
  def change
    create_table :reservations do |t|
      t.string :name
      t.string :email
      t.string :phone
      t.datetime :date
      t.integer :number_of_guests

      t.timestamps
    end
  end
end
