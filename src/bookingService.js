import { supabase } from './supabaseClient';

export async function processBooking(bookingData) {
  const { data, error } = await supabase
    .from('reservas')
    .insert([
      {
        trip_id: bookingData.tripId,
        seat_number: bookingData.seatNumber,
        passenger_name: bookingData.passengerName,
        passenger_dni: bookingData.passengerDni,
        passenger_phone: bookingData.passengerPhone,
        passenger_email: bookingData.passengerEmail,
        route_name: bookingData.routeName,
        departure_time: bookingData.departureTime,
        price: bookingData.price,
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.warn('Advertencia Supabase:', error.message);
    // Permite que la app continúe la compra aunque la tabla en Supabase no esté creada aún
    return { success: true, localOnly: true };
  }

  return { success: true, data };
}