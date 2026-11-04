// src/services/bookingService.js
import { supabase } from './supabaseClient';

const ZEGO_WHATSAPP_NUMBER = '51999999999'; // Reemplaza con tu número de teléfono corporativo

export async function processBooking(bookingData) {
  const { 
    tripId, 
    seatNumber, 
    passengerName, 
    passengerDni, 
    passengerPhone, 
    routeName, 
    departureTime, 
    price 
  } = bookingData;

  // 1. Guardar la reserva en Supabase
  const { data, error } = await supabase
    .from('reservas')
    .insert([
      {
        viaje_id: tripId,
        asiento: seatNumber,
        pasajero_nombre: passengerName,
        pasajero_dni: passengerDni,
        pasajero_telefono: passengerPhone,
        estado: 'pendiente'
      }
    ])
    .select();

  if (error) {
    console.error('Error al registrar reserva en Supabase:', error);
    throw error;
  }

  // 2. Construir el mensaje formateado para WhatsApp
  const message = 
    `*¡Hola ZEGO MOVILIDAD! Quiero solicitar un pasaje:* 🚐💨\n\n` +
    `📍 *Ruta:* ${routeName}\n` +
    `🕒 *Salida:* ${departureTime}\n` +
    `💺 *Asiento N°:* ${seatNumber}\n` +
    `👤 *Pasajero:* ${passengerName}\n` +
    `🪪 *DNI:* ${passengerDni}\n` +
    `📱 *Contacto:* ${passengerPhone}\n` +
    `💵 *Precio:* S/ ${price}\n\n` +
    `_Por favor enviarme las cuentas de Yape/Plin/Banco para completar el pago._`;

  // 3. Redirigir a WhatsApp
  const whatsappUrl = `https://wa.me/${ZEGO_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');

  return data;
}