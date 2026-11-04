import React, { useState } from 'react';
import { processBooking } from '../bookingService';

// Distribución física de la Minivan (12 espacios)
const SEATS = [
  { id: 'driver', label: 'Chofer', isDriver: true },
  { id: 1, label: 'Copiloto' },
  { id: 2, label: 'A1' },
  { id: 3, label: 'A2' },
  { id: 4, label: 'A3' },
  { id: 5, label: 'B1' },
  { id: 6, label: 'B2' },
  { id: 7, label: 'B3' },
  { id: 8, label: 'C1' },
  { id: 9, label: 'C2' },
  { id: 10, label: 'C3' },
  { id: 11, label: 'C4' },
];

export default function SeatPicker({ trip, onClose }) {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [passenger, setPassenger] = useState({ name: '', dni: '', phone: '' });
  const [loading, setLoading] = useState(false);

  // Lista de asientos ya ocupados (ejemplo dinámico)
  const occupiedSeats = trip?.asientos_ocupados || []; 

  const handleSeatClick = (seatId) => {
    if (seatId === 'driver' || occupiedSeats.includes(seatId)) return;
    setSelectedSeat(seatId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeat) return alert('Por favor selecciona un asiento.');

    setLoading(true);
    try {
      await processBooking({
        tripId: trip.id,
        seatNumber: selectedSeat,
        passengerName: passenger.name,
        passengerDni: passenger.dni,
        passengerPhone: passenger.phone,
        routeName: `${trip.origen} ➔ ${trip.destino}`,
        departureTime: new Date(trip.fecha_salida).toLocaleString('es-PE'),
        price: trip.precio
      });
      if (onClose) onClose();
    } catch (err) {
      alert('Ocurrió un error al registrar tu reserva. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-2xl max-w-md mx-auto shadow-2xl border border-slate-800">
      <h3 className="text-xl font-bold mb-2 text-yellow-400 text-center">
        Selecciona tu Asiento
      </h3>
      <p className="text-sm text-slate-400 text-center mb-6">
        Ruta: {trip?.origen} ➔ {trip?.destino} | S/ {trip?.precio}
      </p>

      {/* Mapa visual de la minivan */}
      <div className="bg-slate-800 p-4 rounded-xl mb-6 grid grid-cols-3 gap-3 text-center border border-slate-700">
        {SEATS.map((seat) => {
          const isOccupied = occupiedSeats.includes(seat.id);
          const isSelected = selectedSeat === seat.id;

          let btnStyle = 'bg-emerald-600 hover:bg-emerald-500 text-white'; // Disponible
          if (seat.isDriver) btnStyle = 'bg-slate-700 text-slate-500 cursor-not-allowed';
          else if (isOccupied) btnStyle = 'bg-red-900 text-red-400 cursor-not-allowed';
          else if (isSelected) btnStyle = 'bg-yellow-500 text-slate-950 font-bold scale-105 ring-2 ring-yellow-300';

          return (
            <button
              key={seat.id}
              disabled={seat.isDriver || isOccupied}
              onClick={() => handleSeatClick(seat.id)}
              className={`p-3 rounded-lg text-xs font-semibold transition-all flex flex-col items-center justify-center ${btnStyle}`}
            >
              <span>💺</span>
              <span>{seat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Formulario de datos */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Nombre y Apellido</label>
          <input
            type="text"
            required
            placeholder="Ej: Juan Pérez"
            value={passenger.name}
            onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">DNI / Pasaporte</label>
            <input
              type="text"
              required
              placeholder="76543210"
              value={passenger.dni}
              onChange={(e) => setPassenger({ ...passenger, dni: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Celular (WhatsApp)</label>
            <input
              type="tel"
              required
              placeholder="987654321"
              value={passenger.phone}
              onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedSeat}
          className="w-full mt-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? 'Procesando...' : `Reservar Asiento ${selectedSeat ? `(${selectedSeat})` : ''} por WhatsApp`}
        </button>
      </form>
    </div>
  );
}