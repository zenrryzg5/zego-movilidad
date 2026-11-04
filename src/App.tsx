import React, { useState, useEffect } from 'react';

// --- ESTADOS Y DATOS DE DEMOSTRACIÓN ---
const INITIAL_TRIPS = [
  {
    id: 'TRP-101',
    codigo: 'ZG-LMA-HUU-01',
    origen: 'Lima (Javier Prado / La Victoria)',
    destino: 'Huánuco (Terminal Terrestre Central)',
    embarque: 'Av. Javier Prado Este 1120, Lima',
    llegada: 'Jr. General Prado 450, Huánuco',
    fechaSalida: '2026-03-25 07:30',
    fechaLlegadaEstimada: '2026-03-25 15:30',
    duracion: '8h 00m',
    precio: 75.00,
    tipoServicio: 'compartido',
    asientosTotales: 7,
    asientosOcupados: [2, 5],
    asientosReservadosTemp: [4],
    asientosDeshabilitados: [],
    vehiculo: {
      id: 'VEH-01',
      marca: 'Hyundai',
      modelo: 'H1 Executive',
      placa: 'ZGO-789',
      color: 'Azul Noche Premium',
      capacidad: 7,
      tipo: 'Minivan'
    },
    conductor: {
      id: 'DRV-01',
      nombre: 'Carlos Mendoza Ramos',
      licencia: 'Q-48291049',
      categoria: 'A-IIIa',
      celular: '987 654 321',
      foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
      valoracion: 4.9
    },
    estado: 'en_ruta',
    gps: { lat: -10.4532, lng: -76.0123, velocidad: 68, ultimaActualizacion: 'Hace 1 min', tramo: 'Cerro de Pasco - Huánuco' }
  },
  {
    id: 'TRP-102',
    codigo: 'ZG-HUU-LMA-02',
    origen: 'Huánuco (Terminal Terrestre Central)',
    destino: 'Lima (Javier Prado / La Victoria)',
    embarque: 'Jr. General Prado 450, Huánuco',
    llegada: 'Av. Javier Prado Este 1120, Lima',
    fechaSalida: '2026-03-25 09:00',
    fechaLlegadaEstimada: '2026-03-25 17:00',
    duracion: '8h 00m',
    precio: 85.00,
    tipoServicio: 'privado',
    asientosTotales: 4,
    asientosOcupados: [1],
    asientosReservadosTemp: [],
    asientosDeshabilitados: [],
    vehiculo: {
      id: 'VEH-02',
      marca: 'Ford',
      modelo: 'Explorer VIP',
      placa: 'ZGO-999',
      color: 'Negro Azabache',
      capacidad: 4,
      tipo: 'SUV'
    },
    conductor: {
      id: 'DRV-02',
      nombre: 'Miguel Ángel Torres',
      licencia: 'Q-19284012',
      categoria: 'A-IIb',
      celular: '912 345 678',
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      valoracion: 5.0
    },
    estado: 'proximo_salir',
    gps: { lat: -9.9306, lng: -76.2422, velocidad: 0, ultimaActualizacion: 'En paradero', tramo: 'Huánuco Centro' }
  },
  {
    id: 'TRP-103',
    codigo: 'ZG-LMA-HUU-03',
    origen: 'Lima (Javier Prado / La Victoria)',
    destino: 'Huánuco (Terminal Terrestre Central)',
    embarque: 'Av. Javier Prado Este 1120, Lima',
    llegada: 'Jr. General Prado 450, Huánuco',
    fechaSalida: '2026-03-25 21:00',
    fechaLlegadaEstimada: '2026-03-26 05:00',
    duracion: '8h 00m',
    precio: 65.00,
    tipoServicio: 'compartido',
    asientosTotales: 9,
    asientosOcupados: [1, 3, 4, 8],
    asientosReservadosTemp: [],
    asientosDeshabilitados: [9],
    vehiculo: {
      id: 'VEH-03',
      marca: 'Toyota',
      modelo: 'HiAce Royal',
      placa: 'ZGO-333',
      color: 'Blanco Plata',
      capacidad: 9,
      tipo: 'Minivan XL'
    },
    conductor: {
      id: 'DRV-03',
      nombre: 'Juan Pablo Morales',
      licencia: 'Q-77291022',
      categoria: 'A-IIIa',
      celular: '976 112 334',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      valoracion: 4.8
    },
    estado: 'programado',
    gps: { lat: -12.0463, lng: -77.0428, velocidad: 0, ultimaActualizacion: 'Programado', tramo: 'Cochera Lima' }
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('pasajero'); // pasajero | admin | conductor | corporativo
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingStep, setBookingStep] = useState('search'); // search | seats | payment | ticket
  const [searchFilter, setSearchFilter] = useState({ origen: 'Lima', destino: 'Huánuco', fecha: '2026-03-25', pasajeros: 1, servicio: 'todos' });
  
  // Datos del boleto generado
  const [activeTicket, setActiveTicket] = useState(null);

  // Formulario Corporativo
  const [corpForm, setCorpForm] = useState({ ruc: '', empresa: '', contacto: '', telefono: '', correo: '', origen: 'Lima', destino: 'Huánuco', fecha: '', pasajeros: 10, descripcion: '' });
  const [corpSubmitted, setCorpSubmitted] = useState(false);

  // Filtro de viajes para pasajero
  const filteredTrips = trips.filter(t => {
    const matchOrigen = t.origen.toLowerCase().includes(searchFilter.origen.toLowerCase());
    const matchDestino = t.destino.toLowerCase().includes(searchFilter.destino.toLowerCase());
    const matchServicio = searchFilter.servicio === 'todos' || t.tipoServicio === searchFilter.servicio;
    return matchOrigen && matchDestino && matchServicio;
  });

  const handleSelectSeat = (seatNum) => {
    if (!selectedTrip) return;
    if (selectedTrip.asientosOcupados.includes(seatNum) || selectedTrip.asientosDeshabilitados.includes(seatNum)) return;

    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNum));
    } else {
      setSelectedSeats([...selectedSeats, seatNum]);
    }
  };

  const handleConfirmSeats = () => {
    if (selectedSeats.length === 0) return alert('Por favor selecciona al menos un asiento.');
    setBookingStep('payment');
  };

  const handleProcessPayment = (method) => {
    const ticketCode = 'ZG-' + Math.floor(100000 + Math.random() * 900000);
    const newTicket = {
      codigoReserva: ticketCode,
      viaje: selectedTrip,
      asientos: selectedSeats,
      pasajeroNombre: 'Juan Carlos Pérez',
      pasajeroDNI: '74839201',
      total: selectedTrip.precio * selectedSeats.length,
      metodoPago: method,
      estadoPago: 'PAGADO',
      fechaEmision: new Date().toLocaleString()
    };
    
    // Actualizar asientos ocupados en el viaje
    setTrips(trips.map(t => {
      if (t.id === selectedTrip.id) {
        return {
          ...t,
          asientosOcupados: [...t.asientosOcupados, ...selectedSeats]
        };
      }
      return t;
    }));

    setActiveTicket(newTicket);
    setBookingStep('ticket');
  };

  return (
    <div className="min-h-screen bg-[#071426] text-white font-sans flex flex-col">
      {/* --- BARRA DE NAVEGACIÓN PRINCIPAL --- */}
      <header className="border-b border-gray-800 bg-[#071426]/90 backdrop-blur sticky top-0 z-50 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setActiveTab('pasajero'); setBookingStep('search'); }}>
          <div className="bg-[#176BFF] text-[#DFFF00] font-black italic px-3 py-1.5 rounded-lg text-2xl tracking-tighter shadow-lg flex items-center">
            Z<span className="text-white">EGO</span>
            <span className="ml-1 text-[#DFFF00] text-xl">➔</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-wide text-white">ZEGO <span className="text-[#DFFF00]">MOVILIDAD</span></h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Conectando tu destino</p>
          </div>
        </div>

        {/* Selector de Módulos (Navegación del Demo) */}
        <div className="hidden md:flex items-center bg-[#1C2738] p-1 rounded-xl border border-gray-700">
          <button 
            onClick={() => { setActiveTab('pasajero'); setBookingStep('search'); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'pasajero' ? 'bg-[#176BFF] text-white shadow' : 'text-gray-300 hover:text-white'}`}>
            👥 App Pasajeros
          </button>
          <button 
            onClick={() => setActiveTab('corporativo')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'corporativo' ? 'bg-[#176BFF] text-white shadow' : 'text-gray-300 hover:text-white'}`}>
            🏢 ZEGO Empresas
          </button>
          <button 
            onClick={() => setActiveTab('conductor')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'conductor' ? 'bg-[#176BFF] text-white shadow' : 'text-gray-300 hover:text-white'}`}>
            🚘 App Conductor
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'admin' ? 'bg-[#DFFF00] text-[#071426] shadow font-bold' : 'text-[#DFFF00] hover:brightness-110'}`}>
            ⚡ Panel Admin
          </button>
        </div>

        <button 
          onClick={() => { setActiveTab('pasajero'); setBookingStep('search'); }}
          className="bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md flex items-center gap-2">
          <span>Reservar Ahora</span>
          <span className="text-[#DFFF00]">→</span>
        </button>
      </header>

      {/* Selector Móvil de Módulos */}
      <div className="md:hidden flex overflow-x-auto bg-[#1C2738] p-2 border-b border-gray-800 text-xs gap-2">
        <button onClick={() => { setActiveTab('pasajero'); setBookingStep('search'); }} className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'pasajero' ? 'bg-[#176BFF]' : 'bg-gray-800'}`}>👥 Pasajero</button>
        <button onClick={() => setActiveTab('corporativo')} className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'corporativo' ? 'bg-[#176BFF]' : 'bg-gray-800'}`}>🏢 Empresas</button>
        <button onClick={() => setActiveTab('conductor')} className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'conductor' ? 'bg-[#176BFF]' : 'bg-gray-800'}`}>🚘 Conductor</button>
        <button onClick={() => setActiveTab('admin')} className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'admin' ? 'bg-[#DFFF00] text-[#071426] font-bold' : 'bg-gray-800'}`}>⚡ Admin</button>
      </div>

      {/* --- CONTENIDO PRINCIPAL SEGÚN EL MÓDULO --- */}
      <main className="flex-1">
        {activeTab === 'pasajero' && (
          <div>
            {/* HERO SECTION */}
            {bookingStep === 'search' && (
              <>
                <section className="relative py-16 px-4 lg:px-8 bg-gradient-to-b from-[#071426] via-[#0c1f38] to-[#071426] overflow-hidden">
                  <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#176BFF]/20 border border-[#176BFF] text-[#DFFF00] rounded-full text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#DFFF00] animate-pulse"></span>
                        RUTA OFICIAL: LIMA — HUÁNUCO Y HUÁNUCO — LIMA
                      </div>
                      <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                        Tu próximo destino está <span className="text-[#176BFF]">más cerca.</span>
                      </h2>
                      <p className="text-gray-300 text-base lg:text-lg">
                        Viaja entre Lima y Huánuco con la máxima comodidad, seguridad en tiempo real y puntualidad garantizada de <strong>ZEGO MOVILIDAD</strong>.
                      </p>

                      {/* BUSCADOR DE VIAJES */}
                      <div className="bg-[#1C2738] p-6 rounded-2xl border border-gray-700 shadow-2xl space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 font-semibold mb-1 block">Origen</label>
                            <select 
                              value={searchFilter.origen}
                              onChange={(e) => setSearchFilter({...searchFilter, origen: e.target.value})}
                              className="w-full bg-[#071426] border border-gray-700 text-white rounded-lg p-2.5 text-sm focus:border-[#176BFF] outline-none">
                              <option value="Lima">Lima</option>
                              <option value="Huánuco">Huánuco</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 font-semibold mb-1 block">Destino</label>
                            <select 
                              value={searchFilter.destino}
                              onChange={(e) => setSearchFilter({...searchFilter, destino: e.target.value})}
                              className="w-full bg-[#071426] border border-gray-700 text-white rounded-lg p-2.5 text-sm focus:border-[#176BFF] outline-none">
                              <option value="Huánuco">Huánuco</option>
                              <option value="Lima">Lima</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 font-semibold mb-1 block">Fecha</label>
                            <input 
                              type="date" 
                              value={searchFilter.fecha}
                              onChange={(e) => setSearchFilter({...searchFilter, fecha: e.target.value})}
                              className="w-full bg-[#071426] border border-gray-700 text-white rounded-lg p-2.5 text-sm focus:border-[#176BFF] outline-none" 
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 font-semibold mb-1 block">Tipo de Servicio</label>
                            <select 
                              value={searchFilter.servicio}
                              onChange={(e) => setSearchFilter({...searchFilter, servicio: e.target.value})}
                              className="w-full bg-[#071426] border border-gray-700 text-white rounded-lg p-2.5 text-sm focus:border-[#176BFF] outline-none">
                              <option value="todos">Todos los servicios</option>
                              <option value="compartido">Compartido</option>
                              <option value="privado">Privado Exec</option>
                            </select>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            const element = document.getElementById('salidas-disponibles');
                            element?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full bg-[#176BFF] hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm tracking-wide uppercase flex items-center justify-center gap-2">
                          🔍 Buscar Viajes Disponibles
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-5 relative">
                      <div className="bg-[#1C2738] border border-gray-700 p-4 rounded-2xl shadow-2xl relative">
                        <img 
                          src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800" 
                          alt="Vehículo ZEGO Movilidad" 
                          className="w-full h-64 object-cover rounded-xl"
                        />
                        <div className="absolute bottom-6 left-6 right-6 bg-[#071426]/90 backdrop-blur p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                          <div>
                            <p className="text-xs text-[#DFFF00] font-bold">Flota Ejecutiva Monitoreada</p>
                            <p className="text-xs text-gray-300">Minivans y SUVs de alta gama</p>
                          </div>
                          <span className="text-xs bg-green-500/20 text-green-400 font-bold px-2 py-1 rounded">GPS ACTIVO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECCIÓN DE SEGUIMIENTO EN VIVO EN TIEMPO REAL */}
                <section className="py-12 px-4 lg:px-8 bg-[#0b1b30] border-y border-gray-800">
                  <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <span className="text-xs font-bold text-[#DFFF00] uppercase tracking-widest">Tecnología GPS ZEGO</span>
                        <h3 className="text-2xl font-bold text-white">Tu viaje, en tiempo real</h3>
                        <p className="text-xs text-gray-400">Monitoreo continuo de unidades en la ruta Carretera Central / Huánuco.</p>
                      </div>
                      <div className="flex items-center gap-2 bg-[#1C2738] px-3 py-1.5 rounded-lg border border-gray-700 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
                        <span>Demostración de Telemetría Activa</span>
                      </div>
                    </div>

                    {/* Simulador Visual de Mapa Interactivo */}
                    <div className="bg-[#1C2738] border border-gray-700 rounded-2xl p-6 relative overflow-hidden">
                      <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-[#071426] border border-gray-800 rounded-xl p-4 relative min-h-[260px] flex flex-col justify-between">
                          <div className="flex justify-between items-center text-xs text-gray-400 border-b border-gray-800 pb-2">
                            <span>RUTA: LIMA ➔ CANTA ➔ CERRO DE PASCO ➔ HUÁNUCO</span>
                            <span className="text-[#DFFF00]">Actualizado hace 15s</span>
                          </div>

                          {/* Render visual de la ruta */}
                          <div className="relative my-8 px-4">
                            <div className="h-2 bg-gray-800 rounded-full w-full relative">
                              <div className="h-2 bg-[#176BFF] rounded-full w-2/3"></div>
                              
                              {/* Icono del vehículo en ruta */}
                              <div className="absolute top-1/2 -translate-y-1/2 left-2/3 -translate-x-1/2 bg-[#DFFF00] text-[#071426] p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center animate-bounce">
                                🚘
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-xs mt-3 text-gray-300 font-semibold">
                              <span>📍 Lima (Salida)</span>
                              <span>📍 Canta</span>
                              <span className="text-[#DFFF00]">📍 Cerro de Pasco (En Tránsito)</span>
                              <span>📍 Huánuco (Llegada)</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-[#1C2738] p-3 rounded-lg text-center text-xs">
                            <div>
                              <p className="text-gray-400">Velocidad</p>
                              <p className="text-sm font-bold text-[#DFFF00]">68 km/h</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Tiempo Est. Llegada</p>
                              <p className="text-sm font-bold text-white">15:30 PM</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Unidad</p>
                              <p className="text-sm font-bold text-white">ZGO-789 (H1)</p>
                            </div>
                          </div>
                        </div>

                        {/* Detalle del Conductor y Estado */}
                        <div className="space-y-4">
                          <div className="bg-[#071426] p-4 rounded-xl border border-gray-800">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Conductor Asignado</h4>
                            <div className="flex items-center gap-3">
                              <img src={trips[0].conductor.foto} alt="Conductor" className="w-12 h-12 rounded-full object-cover border-2 border-[#176BFF]" />
                              <div>
                                <p className="font-bold text-sm text-white">{trips[0].conductor.nombre}</p>
                                <p className="text-xs text-gray-400">Licencia: {trips[0].conductor.licencia} ({trips[0].conductor.categoria})</p>
                                <p className="text-xs text-[#DFFF00] font-bold">★ {trips[0].conductor.valoracion} / 5.0</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#071426] p-4 rounded-xl border border-gray-800 space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Estado de Viaje:</span>
                              <span className="bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded">EN RUTA</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Pasajeros a Bordo:</span>
                              <span className="text-white font-bold">5 / 7 Asientos</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Siguiente Parada:</span>
                              <span className="text-white">La Unión</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* RESULTADOS DE SALIDAS DISPONIBLES */}
                <section id="salidas-disponibles" className="py-12 px-4 lg:px-8 max-w-6xl mx-auto space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <div>
                      <h3 className="text-2xl font-bold">Salidas Disponibles</h3>
                      <p className="text-xs text-gray-400">Selecciona tu horario preferido para viajar entre Lima y Huánuco</p>
                    </div>
                    <span className="text-xs bg-[#1C2738] text-[#DFFF00] px-3 py-1.5 rounded-lg border border-gray-700">
                      {filteredTrips.length} viajes encontrados
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {filteredTrips.map((trip) => {
                      const libres = trip.asientosTotales - trip.asientosOcupados.length;
                      return (
                        <div key={trip.id} className="bg-[#1C2738] border border-gray-700 rounded-2xl p-5 hover:border-[#176BFF] transition shadow-lg grid md:grid-cols-12 gap-4 items-center">
                          {/* Horario y Ruta */}
                          <div className="md:col-span-4 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#DFFF00] bg-black/40 px-2 py-0.5 rounded border border-yellow-500/30">{trip.codigo}</span>
                              <span className="text-xs text-gray-400 capitalize">{trip.tipoServicio}</span>
                            </div>
                            <div className="flex items-center gap-3 text-lg font-black text-white">
                              <span>{trip.fechaSalida.split(' ')[1]}</span>
                              <span className="text-xs text-gray-400">➔ ({trip.duracion}) ➔</span>
                              <span>{trip.fechaLlegadaEstimada.split(' ')[1]}</span>
                            </div>
                            <p className="text-xs text-gray-300"><strong>Origen:</strong> {trip.origen}</p>
                            <p className="text-xs text-gray-300"><strong>Destino:</strong> {trip.destino}</p>
                          </div>

                          {/* Vehículo y Conductor */}
                          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-gray-700 pt-3 md:pt-0 md:pl-4 space-y-1">
                            <div className="flex items-center gap-2">
                              <img src={trip.conductor.foto} alt="Conductor" className="w-8 h-8 rounded-full border border-[#176BFF] object-cover" />
                              <div>
                                <p className="text-xs font-bold text-white">{trip.conductor.nombre}</p>
                                <p className="text-[10px] text-gray-400">{trip.vehiculo.marca} {trip.vehiculo.modelo} ({trip.vehiculo.placa})</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400">Punto de Embarque: <span className="text-gray-200">{trip.embarque}</span></p>
                          </div>

                          {/* Precio y Selección */}
                          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-gray-700 pt-3 md:pt-0 md:pl-4 flex md:flex-col justify-between items-end gap-2">
                            <div className="text-right">
                              <p className="text-2xl font-black text-[#DFFF00]">S/ {trip.precio.toFixed(2)}</p>
                              <p className="text-[11px] text-gray-400">por asiento</p>
                              <p className={`text-xs font-bold mt-1 ${libres > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {libres > 0 ? `¡${libres} asientos disponibles!` : 'Agotado'}
                              </p>
                            </div>

                            <button 
                              onClick={() => {
                                setSelectedTrip(trip);
                                setSelectedSeats([]);
                                setBookingStep('seats');
                              }}
                              disabled={libres === 0}
                              className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                                libres > 0 ? 'bg-[#176BFF] hover:bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              }`}>
                              Seleccionar Asientos
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {/* MAPA DE ASIENTOS INTERACTIVO */}
            {bookingStep === 'seats' && selectedTrip && (
              <section className="py-12 px-4 max-w-4xl mx-auto space-y-6">
                <button 
                  onClick={() => setBookingStep('search')}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                  ← Volver a la búsqueda de viajes
                </button>

                <div className="bg-[#1C2738] border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-6">
                  <div className="flex flex-col md:flex-row justify-between border-b border-gray-700 pb-4 gap-2">
                    <div>
                      <h3 className="text-xl font-bold">Selección de Asientos</h3>
                      <p className="text-xs text-gray-400">Vehículo: {selectedTrip.vehiculo.marca} {selectedTrip.vehiculo.modelo} - Placa: {selectedTrip.vehiculo.placa}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Precio unitario:</p>
                      <p className="text-lg font-black text-[#DFFF00]">S/ {selectedTrip.precio.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Leyenda de Estados */}
                  <div className="flex flex-wrap gap-4 justify-center bg-[#071426] p-3 rounded-xl border border-gray-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-green-500 border border-green-400"></span>
                      <span>Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-red-600"></span>
                      <span>Ocupado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-[#176BFF] ring-2 ring-white"></span>
                      <span>Tu Selección</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-yellow-500"></span>
                      <span>Reservado Temp.</span>
                    </div>
                  </div>

                  {/* Croquis Interactivo del Vehículo */}
                  <div className="bg-[#071426] p-8 rounded-2xl border border-gray-800 max-w-md mx-auto space-y-6">
                    <div className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-800 pb-2">
                      <span>FRONTAL DEL VEHÍCULO</span>
                      <span>🚘 CHOFER</span>
                    </div>

                    {/* Cabina del Conductor */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700 text-center text-xs text-gray-400 font-bold">
                        🛞 Conductor
                      </div>
                      <div className="col-span-2 bg-gray-900 border border-dashed border-gray-800 rounded-lg flex items-center justify-center text-[10px] text-gray-600">
                        Consola / Pasillo
                      </div>
                    </div>

                    {/* Grilla de Asientos según capacidad */}
                    <div className="grid grid-cols-3 gap-4">
                      {Array.from({ length: selectedTrip.asientosTotales }, (_, i) => i + 1).map((seatNum) => {
                        const isOccupied = selectedTrip.asientosOcupados.includes(seatNum);
                        const isTempReserved = selectedTrip.asientosReservadosTemp.includes(seatNum);
                        const isSelected = selectedSeats.includes(seatNum);

                        let seatClass = "bg-green-500 hover:bg-green-600 text-white shadow-md cursor-pointer";
                        if (isOccupied) seatClass = "bg-red-600 text-gray-200 cursor-not-allowed opacity-80";
                        else if (isTempReserved) seatClass = "bg-yellow-500 text-black cursor-not-allowed";
                        else if (isSelected) seatClass = "bg-[#176BFF] text-white ring-4 ring-[#DFFF00] scale-105 font-bold";

                        return (
                          <button
                            key={seatNum}
                            disabled={isOccupied || isTempReserved}
                            onClick={() => handleSelectSeat(seatNum)}
                            className={`h-14 rounded-xl flex flex-col items-center justify-center font-bold text-sm transition ${seatClass}`}>
                            <span>💺 {seatNum}</span>
                            <span className="text-[9px] uppercase tracking-tighter">
                              {isOccupied ? 'Ocupado' : isSelected ? 'Elegido' : 'Libre'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resumen de Selección */}
                  <div className="bg-[#071426] p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Asientos seleccionados:</p>
                      <p className="text-base font-bold text-[#DFFF00]">
                        {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Ninguno'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total a pagar:</p>
                      <p className="text-2xl font-black text-white">
                        S/ {(selectedTrip.precio * selectedSeats.length).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleConfirmSeats}
                    className="w-full bg-[#176BFF] hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg uppercase tracking-wider text-sm">
                    Continuar al Pago
                  </button>
                </div>
              </section>
            )}

            {/* PASARELA DE PAGO SIMULADA */}
            {bookingStep === 'payment' && selectedTrip && (
              <section className="py-12 px-4 max-w-xl mx-auto space-y-6">
                <button onClick={() => setBookingStep('seats')} className="text-xs text-gray-400 hover:text-white">← Cambiar asientos</button>

                <div className="bg-[#1C2738] border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-6">
                  <h3 className="text-xl font-bold border-b border-gray-700 pb-3">Finalizar Reserva y Pago</h3>
                  
                  <div className="bg-[#071426] p-4 rounded-xl text-xs space-y-2 border border-gray-800">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ruta:</span>
                      <span className="font-bold">{selectedTrip.origen} ➔ {selectedTrip.destino}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fecha y Hora:</span>
                      <span>{selectedTrip.fechaSalida}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Asientos:</span>
                      <span className="text-[#DFFF00] font-bold">{selectedSeats.join(', ')}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-gray-800 pt-2 text-white">
                      <span>Monto Total:</span>
                      <span className="text-[#DFFF00]">S/ {(selectedTrip.precio * selectedSeats.length).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-300">Selecciona tu método de pago:</p>
                    
                    <button 
                      onClick={() => handleProcessPayment('Yape')}
                      className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl flex items-center justify-between px-4 transition text-sm">
                      <span>📱 Pagar con YAPE / PLIN</span>
                      <span className="bg-purple-900 px-2 py-0.5 rounded text-xs">Inmediato</span>
                    </button>

                    <button 
                      onClick={() => handleProcessPayment('Tarjeta Crédito/Débito')}
                      className="w-full bg-[#176BFF] hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-between px-4 transition text-sm">
                      <span>💳 Tarjeta de Débito / Crédito</span>
                      <span className="text-xs bg-blue-900 px-2 py-0.5 rounded">Niubiz / MercadoPago</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* BOLETO DIGITAL GENERADO */}
            {bookingStep === 'ticket' && activeTicket && (
              <section className="py-12 px-4 max-w-md mx-auto space-y-6">
                <div className="bg-white text-gray-900 rounded-3xl p-6 shadow-2xl space-y-6 border-4 border-[#176BFF] relative overflow-hidden">
                  <div className="bg-[#071426] text-white -mx-6 -mt-6 p-4 text-center border-b-4 border-[#DFFF00]">
                    <h3 className="font-black text-xl tracking-wider">ZEGO MOVILIDAD</h3>
                    <p className="text-[10px] text-[#DFFF00] font-bold uppercase tracking-widest">Boleto Digital de Viaje</p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-500">CÓDIGO DE RESERVA</p>
                    <p className="text-2xl font-black text-[#176BFF] tracking-widest">{activeTicket.codigoReserva}</p>
                    <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-3 py-1 rounded-full">✓ PAGO CONFIRMADO</span>
                  </div>

                  <div className="border-t border-b border-gray-200 py-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pasajero:</span>
                      <span className="font-bold">{activeTicket.pasajeroNombre} (DNI: {activeTicket.pasajeroDNI})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Origen:</span>
                      <span className="font-semibold">{activeTicket.viaje.origen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Destino:</span>
                      <span className="font-semibold">{activeTicket.viaje.destino}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha y Hora:</span>
                      <span className="font-bold">{activeTicket.viaje.fechaSalida}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Asiento(s):</span>
                      <span className="font-bold text-[#176BFF] text-sm">{activeTicket.asientos.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Conductor:</span>
                      <span>{activeTicket.viaje.conductor.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vehículo / Placa:</span>
                      <span>{activeTicket.viaje.vehiculo.modelo} ({activeTicket.viaje.vehiculo.placa})</span>
                    </div>
                  </div>

                  {/* Código QR Simulado */}
                  <div className="text-center space-y-2">
                    <div className="w-32 h-32 mx-auto bg-gray-900 rounded-xl p-2 flex items-center justify-center text-white text-xs font-mono">
                      [ CÓDIGO QR ]<br/>ZEGO-BOARDING
                    </div>
                    <p className="text-[10px] text-gray-500">Muestra este código al abordar la unidad.</p>
                  </div>

                  <button 
                    onClick={() => setBookingStep('search')}
                    className="w-full bg-[#071426] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-gray-800 transition">
                    Finalizar y Volver al Inicio
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* --- PANEL ADMINISTRATIVO (ZEGO ADMIN) --- */}
        {activeTab === 'admin' && (
          <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <span className="text-[#DFFF00]">⚡</span> ZEGO ADMIN DASHBOARD
                </h2>
                <p className="text-xs text-gray-400">Gestión centralizada de flota, conductores, reservas y finanzas.</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-[#176BFF] hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg">
                  + Programar Nuevo Viaje
                </button>
              </div>
            </div>

            {/* Tarjetas Estadísticas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1C2738] p-4 rounded-xl border border-gray-700">
                <p className="text-xs text-gray-400">Ingresos del Día</p>
                <p className="text-2xl font-black text-[#DFFF00] mt-1">S/ 2,450.00</p>
                <span className="text-[10px] text-green-400 font-bold">↑ +18% vs ayer</span>
              </div>
              <div className="bg-[#1C2738] p-4 rounded-xl border border-gray-700">
                <p className="text-xs text-gray-400">Viajes Activos Hoy</p>
                <p className="text-2xl font-black text-white mt-1">8 Viajes</p>
                <span className="text-[10px] text-blue-400 font-bold">3 En Ruta GPS</span>
              </div>
              <div className="bg-[#1C2738] p-4 rounded-xl border border-gray-700">
                <p className="text-xs text-gray-400">Ocupación Promedio</p>
                <p className="text-2xl font-black text-white mt-1">84%</p>
                <span className="text-[10px] text-green-400 font-bold">Alta demanda</span>
              </div>
              <div className="bg-[#1C2738] p-4 rounded-xl border border-gray-700">
                <p className="text-xs text-gray-400">Conductores Activos</p>
                <p className="text-2xl font-black text-white mt-1">5 Conductores</p>
                <span className="text-[10px] text-gray-400">100% Licencias al día</span>
              </div>
            </div>

            {/* Tabla de Gestión de Viajes */}
            <div className="bg-[#1C2738] rounded-2xl border border-gray-700 p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Programación de Viajes en Sistema</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#071426] text-gray-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Código</th>
                      <th className="p-3">Ruta</th>
                      <th className="p-3">Horario</th>
                      <th className="p-3">Vehículo</th>
                      <th className="p-3">Conductor</th>
                      <th className="p-3">Precio</th>
                      <th className="p-3">Asientos</th>
                      <th className="p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {trips.map((t) => (
                      <tr key={t.id} className="hover:bg-[#071426]/50 transition">
                        <td className="p-3 font-bold text-[#DFFF00]">{t.codigo}</td>
                        <td className="p-3">{t.origen} ➔ {t.destino}</td>
                        <td className="p-3">{t.fechaSalida}</td>
                        <td className="p-3">{t.vehiculo.modelo} ({t.vehiculo.placa})</td>
                        <td className="p-3">{t.conductor.nombre}</td>
                        <td className="p-3 font-bold">S/ {t.precio.toFixed(2)}</td>
                        <td className="p-3">{t.asientosOcupados.length} / {t.asientosTotales}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase">
                            {t.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- APP PARA CONDUCTORES --- */}
        {activeTab === 'conductor' && (
          <div className="py-12 px-4 max-w-md mx-auto space-y-6">
            <div className="bg-[#1C2738] border-2 border-[#176BFF] rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-gray-300">MODO CONDUCTOR ACTIVO</span>
                </div>
                <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400">GPS Conectado</span>
              </div>

              <div className="flex items-center gap-4 bg-[#071426] p-4 rounded-xl border border-gray-800">
                <img src={trips[0].conductor.foto} alt="Conductor" className="w-14 h-14 rounded-full border-2 border-[#DFFF00] object-cover" />
                <div>
                  <h3 className="font-bold text-white text-base">{trips[0].conductor.nombre}</h3>
                  <p className="text-xs text-gray-400">Licencia: {trips[0].conductor.licencia}</p>
                  <p className="text-xs text-[#DFFF00]">Vehículo Asignado: {trips[0].vehiculo.placa}</p>
                </div>
              </div>

              <div className="bg-[#071426] p-4 rounded-xl border border-gray-800 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Viaje Asignado Actual</h4>
                <p className="text-sm font-bold text-white">{trips[0].origen} ➔ {trips[0].destino}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <div className="bg-[#1C2738] p-2 rounded">
                    <p className="text-gray-500">Pasajeros Confirmados</p>
                    <p className="text-base font-bold text-[#DFFF00]">5 personas</p>
                  </div>
                  <div className="bg-[#1C2738] p-2 rounded">
                    <p className="text-gray-500">Salida Programada</p>
                    <p className="text-base font-bold text-white">07:30 AM</p>
                  </div>
                </div>
              </div>

              {/* Botones de Control en Ruta */}
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition">
                  ▶ Iniciar Transmisión GPS en Ruta
                </button>
                <button className="w-full bg-[#176BFF] hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition">
                  📋 Validar Embarque de Pasajeros (QR)
                </button>
                <button className="w-full bg-red-900/60 hover:bg-red-900 text-red-200 font-bold py-2 rounded-xl text-xs uppercase transition border border-red-700">
                  ⚠️ Reportar Incidencia en Ruta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- ZEGO EMPRESAS / SERVICIOS CORPORATIVOS --- */}
        {activeTab === 'corporativo' && (
          <div className="py-12 px-4 max-w-3xl mx-auto space-y-6">
            <div className="bg-[#1C2738] border border-gray-700 rounded-2xl p-8 shadow-2xl space-y-6">
              <div>
                <span className="text-xs font-bold text-[#DFFF00] uppercase tracking-widest">ZEGO MOVILIDAD CORPORATIVA</span>
                <h2 className="text-3xl font-black text-white mt-1">Servicios de Transporte para Empresas</h2>
                <p className="text-xs text-gray-400 mt-2">
                  Soluciones personalizadas de traslado de personal ejecutivo, viajes de trabajo y logística privada entre Lima y Huánuco.
                </p>
              </div>

              {corpSubmitted ? (
                <div className="bg-green-500/20 border border-green-500 text-green-300 p-6 rounded-xl text-center space-y-2">
                  <p className="text-lg font-bold">¡Solicitud Corporativa Enviada con Éxito!</p>
                  <p className="text-xs">Un ejecutivo comercial de ZEGO MOVILIDAD se pondrá en contacto al número proporcionado en breve.</p>
                  <button onClick={() => setCorpSubmitted(false)} className="mt-4 bg-[#176BFF] text-white text-xs px-4 py-2 rounded-lg font-bold">
                    Enviar otra solicitud
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setCorpSubmitted(true); }} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 font-semibold mb-1 block">RUC de la Empresa</label>
                      <input required type="text" placeholder="20123456789" className="w-full bg-[#071426] border border-gray-700 p-3 rounded-lg text-white outline-none focus:border-[#176BFF]" />
                    </div>
                    <div>
                      <label className="text-gray-300 font-semibold mb-1 block">Nombre Comercial / Razón Social</label>
                      <input required type="text" placeholder="Corporación Andina S.A.C." className="w-full bg-[#071426] border border-gray-700 p-3 rounded-lg text-white outline-none focus:border-[#176BFF]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-300 font-semibold mb-1 block">Nombre de Contacto</label>
                      <input required type="text" placeholder="Carlos Vega" className="w-full bg-[#071426] border border-gray-700 p-3 rounded-lg text-white outline-none focus:border-[#176BFF]" />
                    </div>
                    <div>
                      <label className="text-gray-300 font-semibold mb-1 block">Teléfono / Celular</label>
                      <input required type="tel" placeholder="999 888 777" className="w-full bg-[#071426] border border-gray-700 p-3 rounded-lg text-white outline-none focus:border-[#176BFF]" />
                    </div>
                    <div>
                      <label className="text-gray-300 font-semibold mb-1 block">Correo Corporativo</label>
                      <input required type="email" placeholder="contacto@empresa.pe" className="w-full bg-[#071426] border border-gray-700 p-3 rounded-lg text-white outline-none focus:border-[#176BFF]" />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300 font-semibold mb-1 block">Detalles del Servicio Requerido</label>
                    <textarea rows="3" placeholder="Indica fechas, cantidad de pasajeros, ruta y observaciones..." className="w-full bg-[#071426] border border-gray-700 p-3 rounded-lg text-white outline-none focus:border-[#176BFF]"></textarea>
                  </div>

                  <button type="submit" className="w-full bg-[#176BFF] hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-lg transition">
                    Solitar Cotización Corporativa
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- PIE DE PÁGINA --- */}
      <footer className="bg-[#040c17] border-t border-gray-800 py-8 px-4 lg:px-8 text-center md:text-left text-xs text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-bold text-gray-300">ZEGO MOVILIDAD S.A.C.</p>
            <p>Eslogan: <i>"ZEGO: Conectando tu destino."</i></p>
            <p className="text-[10px] mt-1">Ruta oficial inicial: Lima — Huánuco / Huánuco — Lima.</p>
          </div>
          <div className="flex gap-4 text-gray-400">
            <span className="hover:text-white cursor-pointer">Términos del Servicio</span>
            <span className="hover:text-white cursor-pointer">Políticas de Privacidad</span>
            <span className="hover:text-white cursor-pointer">Libro de Reclamaciones</span>
          </div>
        </div>
      </footer>
    </div>
  );
}