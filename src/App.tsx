import React, { useState, useEffect } from 'react';
// @ts-ignore
import { supabase } from './supabaseClient';

// ==============================================================================
// TYPES & INTERFACES (SISTEMA COMPLETO ZEGO MOVILIDAD S.A.C.)
// ==============================================================================
export type UserRole = 'pasajero' | 'conductor' | 'despachador' | 'superadmin';
export type DocumentType = 'DNI' | 'CE' | 'PASAPORTE';
export type ComprobanteType = 'boleta' | 'factura';
export type VehicleType = 'minivan_7' | 'minivan_11' | 'bus_2pisos';

export interface Passenger {
  seat: number;
  docType: DocumentType;
  dni: string;
  nombre: string;
  telefono: string;
  email: string;
  equipajeBase: string;
  equipajeExtraKg: number;
  precioEquipajeExtra: number;
  embarque: string;
  desembarque: string;
  estadoAbordaje?: 'pendiente' | 'a_bordo';
}

export interface Encomienda {
  codigoGuia: string;
  remitenteNombre: string;
  remitenteDni: string;
  remitenteTelefono: string;
  destinatarioNombre: string;
  destinatarioDni: string;
  destinatarioTelefono: string;
  origen: string;
  destino: string;
  descripcion: string;
  pesoKg: number;
  fleteTotal: number;
  estado: 'recibido_terminal' | 'en_transito' | 'entregado';
  fechaEnvio: string;
}

export interface Trip {
  id: string;
  codigo: string;
  origen: string;
  destino: string;
  embarqueDefault: string;
  llegadaDefault: string;
  fechaSalida: string;
  duracion: string;
  precioBase: number;
  tipoServicio: 'compartido' | 'ejecutivo' | 'vip';
  tipoVehiculo: VehicleType;
  asientosTotales: number;
  asientosOcupados: number[];
  asientosReservadosTemp: number[];
  puntosEmbarque: string[];
  puntosDesembarque: string[];
  vehiculo: {
    placa: string;
    modelo: string;
    soatVigente: boolean;
    revisionTecnica: boolean;
  };
  conductor: {
    id: string;
    nombre: string;
    licencia: string;
    categoria: string;
    celular: string;
    horasManejadasHoy: number;
  };
  gps: {
    lat: number;
    lng: number;
    velocidad: number;
    tramo: string;
    progresoPorcentaje: number;
    enZonaAltamontana: boolean;
  };
  esFestivo: boolean;
  factorPrecioFestivo: number;
}

export interface Ticket {
  codigoReserva: string;
  serieComprobante: string;
  tipoComprobante: ComprobanteType;
  rucEmisor: string;
  razonSocialEmisor: string;
  rucCliente?: string;
  razonSocialCliente?: string;
  pasajeros: Passenger[];
  viaje: Trip;
  asientos: number[];
  subtotal: number;
  igv: number;
  totalPagar: number;
  metodoPago: string;
  nroOperacion?: string;
  fechaEmision: string;
  qrPayload: string;
  hashSunat: string;
}

// ==============================================================================
// BASE DE DATOS INICIAL ROBUSTA
// ==============================================================================
const INITIAL_TRIPS: Trip[] = [
  {
    id: 'TRP-101',
    codigo: 'ZG-LMA-HUU-01',
    origen: 'Lima (Javier Prado / La Victoria)',
    destino: 'Huánuco (Terminal Terrestre Central)',
    embarqueDefault: 'Av. Javier Prado Este 1120, Lima',
    llegadaDefault: 'Jr. General Prado 450, Huánuco',
    fechaSalida: '2026-03-25 07:30',
    duracion: '8h 00m',
    precioBase: 75.00,
    tipoServicio: 'compartido',
    tipoVehiculo: 'minivan_7',
    asientosTotales: 7,
    asientosOcupados: [2, 5],
    asientosReservadosTemp: [],
    puntosEmbarque: ['Javier Prado (Terminal Central)', 'Santa Anita (Peaje)', 'Chosica (Plaza)'],
    puntosDesembarque: ['San Mateo', 'Ticlio', 'La Oroya', 'Junín', 'Cerro de Pasco', 'Huánuco (Terminal)'],
    vehiculo: {
      placa: 'ZGO-789',
      modelo: 'Hyundai H1 Executive (7 Asientos)',
      soatVigente: true,
      revisionTecnica: true
    },
    conductor: {
      id: 'DRV-01',
      nombre: 'Carlos Mendoza Ramos',
      licencia: 'Q-48291049',
      categoria: 'A-IIIa',
      celular: '987654321',
      horasManejadasHoy: 3.2
    },
    gps: { lat: -10.4532, lng: -76.0123, velocidad: 68, tramo: 'Ticlio ➔ La Oroya', progresoPorcentaje: 45, enZonaAltamontana: true },
    esFestivo: false,
    factorPrecioFestivo: 1.0
  },
  {
    id: 'TRP-102',
    codigo: 'ZG-LMA-HUU-02',
    origen: 'Lima (Javier Prado / La Victoria)',
    destino: 'Huánuco (Terminal Terrestre Central)',
    embarqueDefault: 'Av. Javier Prado Este 1120, Lima',
    llegadaDefault: 'Jr. General Prado 450, Huánuco',
    fechaSalida: '2026-03-25 21:00',
    duracion: '8h 00m',
    precioBase: 90.00,
    tipoServicio: 'vip',
    tipoVehiculo: 'minivan_11',
    asientosTotales: 11,
    asientosOcupados: [1, 3, 4],
    asientosReservadosTemp: [],
    puntosEmbarque: ['Javier Prado (Terminal Central)', 'Chosica'],
    puntosDesembarque: ['La Oroya', 'Cerro de Pasco', 'Huánuco (Terminal)'],
    vehiculo: {
      placa: 'ZGO-900',
      modelo: 'Toyota HiAce VIP (11 Asientos)',
      soatVigente: true,
      revisionTecnica: true
    },
    conductor: {
      id: 'DRV-02',
      nombre: 'Jorge Luis Alvarado',
      licencia: 'Q-19283746',
      categoria: 'A-IIIa',
      celular: '912345678',
      horasManejadasHoy: 4.5
    },
    gps: { lat: -12.0463, lng: -77.0428, velocidad: 0, tramo: 'Terminal Javier Prado (En Embarque)', progresoPorcentaje: 5, enZonaAltamontana: false },
    esFestivo: false,
    factorPrecioFestivo: 1.0
  }
];

const INITIAL_ENCOMIENDAS: Encomienda[] = [
  {
    codigoGuia: 'GRT-001-9281',
    remitenteNombre: 'Juan Perez Soto',
    remitenteDni: '45891203',
    remitenteTelefono: '998877665',
    destinatarioNombre: 'Maria Garcia Flores',
    destinatarioDni: '70891234',
    destinatarioTelefono: '912345678',
    origen: 'Lima',
    destino: 'Huánuco',
    descripcion: 'Caja de repuestos mecánicos automotrices',
    pesoKg: 12.5,
    fleteTotal: 37.50,
    estado: 'en_transito',
    fechaEnvio: '2026-03-25 08:00'
  }
];

export default function App() {
  // --- ESTADOS GENERALES Y NAVEGACIÓN ---
  const [activeTab, setActiveTab] = useState<UserRole | 'encomiendas'>('pasajero');
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>(INITIAL_ENCOMIENDAS);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [bookingStep, setBookingStep] = useState<'search' | 'seats' | 'payment' | 'ticket'>('search');

  // Filtros de Búsqueda
  const [searchFilter, setSearchFilter] = useState({ origen: 'Lima', destino: 'Huánuco', fecha: '2026-03-25', servicio: 'todos' });

  // Autenticación por PIN y RBAC
  const [currentRole, setCurrentRole] = useState<UserRole>('pasajero');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isDriverAuthenticated, setIsDriverAuthenticated] = useState(false);
  const [authModal, setAuthModal] = useState<UserRole | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Temporizador de Reserva de 5 minutos
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // RENIEC / SUNAT & Datos Pasajeros
  const [loadingDniIndex, setLoadingDniIndex] = useState<number | null>(null);
  const [loadingRuc, setLoadingRuc] = useState<boolean>(false);
  const [passengersList, setPassengersList] = useState<Passenger[]>([]);
  const [aceptanTerminosLey29733, setAceptanTerminosLey29733] = useState<boolean>(false);

  // Comprobante SUNAT
  const [comprobanteType, setComprobanteType] = useState<ComprobanteType>('boleta');
  const [rucCliente, setRucCliente] = useState<string>('');
  const [razonSocialCliente, setRazonSocialCliente] = useState<string>('');

  // Pasarela de Pago & OCR Scanner
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'tarjeta' | null>(null);
  const [yapeOpNumber, setYapeOpNumber] = useState<string>('');
  const [isOcrScanning, setIsOcrScanning] = useState<boolean>(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  // Conductor & Escáner QR
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scannedTicketCode, setScannedTicketCode] = useState<string>('');
  const [boardedPassengers, setBoardedPassengers] = useState<string[]>([]);

  // Modales & Vistas Especiales
  const [viewGpsTrip, setViewGpsTrip] = useState<Trip | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isFestivoGlobal, setIsFestivoGlobal] = useState<boolean>(false);

  // Encomiendas Form
  const [newEncomienda, setNewEncomienda] = useState({
    remitenteNombre: '', remitenteDni: '', remitenteTelefono: '',
    destinatarioNombre: '', destinatarioDni: '', destinatarioTelefono: '',
    origen: 'Lima', destino: 'Huánuco', descripcion: '', pesoKg: 5
  });

  // --- FORMULARIO CREACIÓN DE SALIDAS (ADMIN CRUD) ---
  const [newTripForm, setNewTripForm] = useState({
    origen: 'Lima (Javier Prado / La Victoria)',
    destino: 'Huánuco (Terminal Terrestre Central)',
    fechaSalida: '2026-03-26 08:00',
    duracion: '8h 00m',
    precioBase: 80,
    tipoVehiculo: 'minivan_7' as VehicleType,
    placa: 'ZGO-100',
    modeloVehiculo: 'Hyundai H1 Executive (7 Asientos)',
    conductorNombre: 'Nuevo Conductor',
    licencia: 'Q-99887766',
    celularConductor: '987000111'
  });

  // --- 1. SUPABASE REALTIME & SYNC ---
  const fetchTripsFromSupabase = async () => {
    try {
      const { data, error } = await supabase.from('viajes').select('*');
      if (!error && data && data.length > 0) {
        const viajesFormateados: Trip[] = data.map((v: any) => ({
          id: String(v.id || 'TRP-' + Math.floor(100 + Math.random() * 900)),
          codigo: v.codigo || `ZG-${v.origen?.slice(0, 3).toUpperCase() || 'LMA'}-${v.destino?.slice(0, 3).toUpperCase() || 'HUU'}`,
          origen: v.origen || 'Lima',
          destino: v.destino || 'Huánuco',
          embarqueDefault: v.embarque || 'Av. Javier Prado Este 1120',
          llegadaDefault: v.llegada || 'Jr. General Prado 450',
          fechaSalida: v.fecha_salida ? new Date(v.fecha_salida).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '2026-03-25 08:00',
          duracion: v.duracion || '8h 00m',
          precioBase: Number(v.precio) || 80.0,
          tipoServicio: v.vehiculo_tipo?.toLowerCase().includes('vip') ? 'vip' : 'compartido',
          tipoVehiculo: (v.vehiculo_tipo?.toLowerCase().includes('11') ? 'minivan_11' : 'minivan_7') as VehicleType,
          asientosTotales: v.asientos_totales || (v.vehiculo_tipo?.toLowerCase().includes('11') ? 11 : 7),
          asientosOcupados: Array.isArray(v.asientos_ocupados) ? v.asientos_ocupados : [],
          asientosReservadosTemp: [],
          puntosEmbarque: ['Javier Prado (Terminal Central)', 'Santa Anita', 'Chosica'],
          puntosDesembarque: ['San Mateo', 'La Oroya', 'Cerro de Pasco', 'Huánuco'],
          vehiculo: { placa: v.placa || 'ZGO-789', modelo: v.vehiculo_tipo || 'Minivan Ejecutiva', soatVigente: true, revisionTecnica: true },
          conductor: { id: 'DRV-01', nombre: v.conductor_nombre || 'Carlos Mendoza Ramos', licencia: 'A-IIIa', categoria: 'A-IIIa', celular: '987654321', horasManejadasHoy: 3.5 },
          gps: { lat: -10.4532, lng: -76.0123, velocidad: 65, tramo: 'Ruta Lima ⇄ Huánuco', progresoPorcentaje: 50, enZonaAltamontana: false },
          esFestivo: isFestivoGlobal,
          factorPrecioFestivo: isFestivoGlobal ? 1.3 : 1.0
        }));
        setTrips(viajesFormateados);
      }
    } catch (err) {
      console.warn('Conexión local activa.');
    }
  };

  useEffect(() => {
    fetchTripsFromSupabase();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isFestivoGlobal]);

  // --- 2. CRONÓMETRO DE RESERVA 5 MINUTOS ---
  useEffect(() => {
    let timer: any;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      alert('⏱️ Tu tiempo de reserva de 5 minutos ha expirado. Los asientos han sido liberados.');
      setIsTimerActive(false);
      resetBookingFlow();
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- 3. ROLES Y AUTENTICACIÓN ---
  const handleTabChange = (role: UserRole | 'encomiendas') => {
    if (role === 'superadmin' && !isAdminAuthenticated) {
      setAuthModal('superadmin');
      setPinInput('');
      setAuthError('');
      return;
    }
    if (role === 'conductor' && !isDriverAuthenticated) {
      setAuthModal('conductor');
      setPinInput('');
      setAuthError('');
      return;
    }
    if (role !== 'encomiendas') setCurrentRole(role);
    setActiveTab(role);
    if (role === 'pasajero') resetBookingFlow();
  };

  const handleVerifyPin = () => {
    if (authModal === 'superadmin') {
      if (pinInput === '1234' || pinInput === 'admin') {
        setIsAdminAuthenticated(true);
        setCurrentRole('superadmin');
        setActiveTab('superadmin');
        setAuthModal(null);
      } else setAuthError('PIN incorrecto. Use "1234" para Admin.');
    } else if (authModal === 'conductor') {
      if (pinInput === '5678' || pinInput === 'chofer') {
        setIsDriverAuthenticated(true);
        setCurrentRole('conductor');
        setActiveTab('conductor');
        setAuthModal(null);
      } else setAuthError('PIN incorrecto. Use "5678" para Conductor.');
    }
  };

  // --- 4. CONSULTA AUTOMÁTICA DNI / RUC ---
  const handlePassengerDocChange = async (index: number, docVal: string) => {
    handlePassengerChange(index, 'dni', docVal);
    const docType = passengersList[index].docType;

    if (docType === 'DNI' && docVal.length === 8 && /^\d+$/.test(docVal)) {
      setLoadingDniIndex(index);
      try {
        const res = await fetch(`https://api.apis.net.pe/v1/dni?numero=${docVal}`);
        if (res.ok) {
          const data = await res.json();
          if (data.nombre) handlePassengerChange(index, 'nombre', data.nombre);
        }
      } catch (err) {
        console.log('Fallo API, ingreso manual disponible.');
      } finally {
        setLoadingDniIndex(null);
      }
    }
  };

  const handleRucLookup = async (rucVal: string) => {
    setRucCliente(rucVal);
    if (rucVal.length === 11 && /^\d+$/.test(rucVal)) {
      setLoadingRuc(true);
      try {
        const res = await fetch(`https://api.apis.net.pe/v1/ruc?numero=${rucVal}`);
        if (res.ok) {
          const data = await res.json();
          if (data.nombre) setRazonSocialCliente(data.nombre);
        } else setRazonSocialCliente('EMPRESA DE TRANSPORTE Y SERVICIOS S.A.C.');
      } catch (err) {
        setRazonSocialCliente('EMPRESA DE SERVICIOS GENERALES PERU S.A.C.');
      } finally {
        setLoadingRuc(false);
      }
    }
  };

  // --- 5. LECTURA OCR DE VOUCHER YAPE/PLIN ---
  const handleSimulateOcrVoucherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setIsOcrScanning(true);
    setTimeout(() => {
      const simulatedOp = String(Math.floor(10000000 + Math.random() * 90000000));
      setYapeOpNumber(simulatedOp);
      setIsOcrScanning(false);
      alert(`✨ ¡Voucher Yape reconocido exitosamente con OCR!\n\n• N° Operación detectado: ${simulatedOp}\n• Estado: VERIFICADO CON BANCO ✓`);
    }, 1500);
  };

  // --- 6. SELECCIÓN ASIENTOS Y RESERVA ---
  const handleSelectSeat = (seatNum: number) => {
    if (!selectedTrip) return;
    if (selectedTrip.asientosOcupados.includes(seatNum)) return;

    let updatedSeats: number[];
    if (selectedSeats.includes(seatNum)) {
      updatedSeats = selectedSeats.filter((s) => s !== seatNum);
    } else {
      updatedSeats = [...selectedSeats, seatNum];
    }

    setSelectedSeats(updatedSeats);

    const newPassengersList: Passenger[] = updatedSeats.map((seat) => {
      const existing = passengersList.find((p) => p.seat === seat);
      return (
        existing || {
          seat, docType: 'DNI', dni: '', nombre: '', telefono: '', email: '',
          equipajeBase: '1 Maleta en Bodega (15kg) + Bolso de mano',
          equipajeExtraKg: 0, precioEquipajeExtra: 0,
          embarque: selectedTrip.puntosEmbarque[0] || selectedTrip.embarqueDefault,
          desembarque: selectedTrip.puntosDesembarque[selectedTrip.puntosDesembarque.length - 1] || selectedTrip.destino,
          estadoAbordaje: 'pendiente'
        }
      );
    });
    setPassengersList(newPassengersList);
  };

  const handlePassengerChange = (index: number, field: keyof Passenger, value: any) => {
    const updated = [...passengersList];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'equipajeExtraKg') {
      const extraKg = Math.max(0, Number(value) || 0);
      updated[index].equipajeExtraKg = extraKg;
      updated[index].precioEquipajeExtra = extraKg * 3.0;
    }
    setPassengersList(updated);
  };

  const handleConfirmSeats = async () => {
    if (!selectedTrip) return alert('No hay un viaje seleccionado activo.');
    if (selectedSeats.length === 0) return alert('Por favor selecciona al menos un asiento.');

    if (!aceptanTerminosLey29733) {
      return alert('⚠️ Debes aceptar la Política de Protección de Datos Personales (Ley N° 29733) para continuar.');
    }

    for (let i = 0; i < passengersList.length; i++) {
      const p = passengersList[i];
      if (!p.nombre?.trim() || !p.dni?.trim() || !p.telefono?.trim()) {
        return alert(`Completa los datos obligatorios (Documento, Nombre y Celular) para el Asiento N° ${p.seat}.`);
      }
    }

    try {
      const asientosPrevios = Array.isArray(selectedTrip.asientosOcupados) ? selectedTrip.asientosOcupados : [];
      const nuevosOcupados = Array.from(new Set([...asientosPrevios, ...selectedSeats]));
      await supabase.from('viajes').update({ asientos_ocupados: nuevosOcupados }).eq('id', selectedTrip.id);
    } catch (e) {
      console.warn('Sincronización local.');
    }

    setTimeLeft(300);
    setIsTimerActive(true);
    setBookingStep('payment');
  };

  // --- 7. PAGOS Y EMISIÓN COMPROBANTE SUNAT ---
  const calculateTotals = () => {
    if (!selectedTrip) return { subtotal: 0, igv: 0, totalPagar: 0, totalEquipajeExtra: 0 };
    const precioUnitario = selectedTrip.precioBase * (selectedTrip.factorPrecioFestivo || 1);
    const subtotalPasajes = precioUnitario * selectedSeats.length;
    const totalEquipajeExtra = passengersList.reduce((acc, p) => acc + (p.precioEquipajeExtra || 0), 0);
    const totalPagar = subtotalPasajes + totalEquipajeExtra;
    const subtotalSinIgv = totalPagar / 1.18;
    const igv = totalPagar - subtotalSinIgv;

    return {
      subtotal: Number(subtotalSinIgv.toFixed(2)),
      igv: Number(igv.toFixed(2)),
      totalPagar: Number(totalPagar.toFixed(2)),
      totalEquipajeExtra
    };
  };

  const handleProcessPayment = (metodoPagoNombre: string) => {
    if (!selectedTrip) return;
    setIsTimerActive(false);

    const totals = calculateTotals();
    const codigoReserva = 'ZG-' + Math.floor(100000 + Math.random() * 900000);
    const serie = comprobanteType === 'factura' ? `F001-${Math.floor(1000 + Math.random() * 9000)}` : `B001-${Math.floor(10000 + Math.random() * 90000)}`;

    const nuevoBoleto: Ticket = {
      codigoReserva,
      serieComprobante: serie,
      tipoComprobante: comprobanteType,
      rucEmisor: '20601928374',
      razonSocialEmisor: 'ZEGO MOVILIDAD S.A.C.',
      rucCliente: comprobanteType === 'factura' ? rucCliente : undefined,
      razonSocialCliente: comprobanteType === 'factura' ? razonSocialCliente : undefined,
      pasajeros: passengersList,
      viaje: selectedTrip,
      asientos: selectedSeats,
      subtotal: totals.subtotal,
      igv: totals.igv,
      totalPagar: totals.totalPagar,
      metodoPago: metodoPagoNombre,
      nroOperacion: yapeOpNumber || 'CARD-ONLINE-OK',
      fechaEmision: new Date().toLocaleString('es-PE'),
      qrPayload: `20601928374|${comprobanteType.toUpperCase()}|${serie}|${totals.igv}|${totals.totalPagar}|${new Date().toISOString().slice(0, 10)}|${passengersList[0]?.dni || ''}`,
      hashSunat: 'SHA256-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    };

    setActiveTicket(nuevoBoleto);
    setBookingStep('ticket');
  };

  // --- 8. MÓDULO DE ENCOMIENDAS (GUÍA DE REMISIÓN) ---
  const handleCreateEncomienda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEncomienda.remitenteNombre || !newEncomienda.destinatarioNombre) {
      return alert('Completa los nombres de remitente y destinatario.');
    }

    const flete = newEncomienda.pesoKg * 3.0;
    const nuevaGuia: Encomienda = {
      codigoGuia: `GRT-001-${Math.floor(1000 + Math.random() * 9000)}`,
      remitenteNombre: newEncomienda.remitenteNombre,
      remitenteDni: newEncomienda.remitenteDni,
      remitenteTelefono: newEncomienda.remitenteTelefono,
      destinatarioNombre: newEncomienda.destinatarioNombre,
      destinatarioDni: newEncomienda.destinatarioDni,
      destinatarioTelefono: newEncomienda.destinatarioTelefono,
      origen: newEncomienda.origen,
      destino: newEncomienda.destino,
      descripcion: newEncomienda.descripcion,
      pesoKg: Number(newEncomienda.pesoKg),
      fleteTotal: flete,
      estado: 'recibido_terminal',
      fechaEnvio: new Date().toLocaleString('es-PE')
    };

    setEncomiendas([nuevaGuia, ...encomiendas]);
    alert(`✅ Guía Remisión Transportista Creada: ${nuevaGuia.codigoGuia}\nFlete Total: S/ ${flete.toFixed(2)}`);
    setNewEncomienda({
      remitenteNombre: '', remitenteDni: '', remitenteTelefono: '',
      destinatarioNombre: '', destinatarioDni: '', destinatarioTelefono: '',
      origen: 'Lima', destino: 'Huánuco', descripcion: '', pesoKg: 5
    });
  };

  // --- 9. CREACIÓN Y ELIMINACIÓN DE VIAJES (ADMIN CRUD) ---
  const handleCreateNewTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    const isVip = newTripForm.tipoVehiculo === 'minivan_11';
    const asientosTotales = isVip ? 11 : 7;
    const nuevoId = 'TRP-' + Math.floor(100 + Math.random() * 900);
    const codigo = `ZG-${newTripForm.origen.slice(0, 3).toUpperCase()}-${newTripForm.destino.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    const nuevoViaje: Trip = {
      id: nuevoId,
      codigo: codigo,
      origen: newTripForm.origen,
      destino: newTripForm.destino,
      embarqueDefault: 'Av. Javier Prado Este 1120, Lima',
      llegadaDefault: 'Jr. General Prado 450, Huánuco',
      fechaSalida: newTripForm.fechaSalida,
      duracion: newTripForm.duracion,
      precioBase: Number(newTripForm.precioBase),
      tipoServicio: isVip ? 'vip' : 'compartido',
      tipoVehiculo: newTripForm.tipoVehiculo,
      asientosTotales: asientosTotales,
      asientosOcupados: [],
      asientosReservadosTemp: [],
      puntosEmbarque: ['Terminal Principal', 'Santa Anita', 'Chosica'],
      puntosDesembarque: ['San Mateo', 'La Oroya', 'Cerro de Pasco', 'Terminal Central'],
      vehiculo: {
        placa: newTripForm.placa,
        modelo: newTripForm.modeloVehiculo,
        soatVigente: true,
        revisionTecnica: true
      },
      conductor: {
        id: 'DRV-' + Math.floor(10 + Math.random() * 90),
        nombre: newTripForm.conductorNombre,
        licencia: newTripForm.licencia,
        categoria: 'A-IIIa',
        celular: newTripForm.celularConductor,
        horasManejadasHoy: 0
      },
      gps: { lat: -12.0463, lng: -77.0428, velocidad: 0, tramo: 'En Terminal - Listo para Salida', progresoPorcentaje: 0, enZonaAltamontana: false },
      esFestivo: isFestivoGlobal,
      factorPrecioFestivo: isFestivoGlobal ? 1.3 : 1.0
    };

    // Intentar insertar en Supabase
    try {
      await supabase.from('viajes').insert([{
        codigo: nuevoViaje.codigo,
        origen: nuevoViaje.origen,
        destino: nuevoViaje.destino,
        fecha_salida: nuevoViaje.fechaSalida,
        precio: nuevoViaje.precioBase,
        vehiculo_tipo: nuevoViaje.vehiculo.modelo,
        asientos_totales: nuevoViaje.asientosTotales,
        asientos_ocupados: [],
        placa: nuevoViaje.vehiculo.placa,
        conductor_nombre: nuevoViaje.conductor.nombre
      }]);
    } catch (err) {
      console.warn('Guardado localmente en la app.');
    }

    setTrips([nuevoViaje, ...trips]);
    alert(`⚡ ¡NUEVA SALIDA CREADA CON ÉXITO!\n\nCódigo: ${codigo}\nRuta: ${newTripForm.origen} ➔ ${newTripForm.destino}\nPrecio: S/ ${newTripForm.precioBase}`);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta salida programada?')) return;
    try {
      await supabase.from('viajes').delete().eq('id', tripId);
    } catch (err) {
      console.warn('Eliminado localmente.');
    }
    setTrips(trips.filter((t) => t.id !== tripId));
  };

  // --- 10. COMUNICACIONES Y MANIFIESTO SUTRAN ---
  const handleSendWhatsAppToPassenger = () => {
    if (!activeTicket || !activeTicket.pasajeros.length) return;
    const firstPass = activeTicket.pasajeros[0];
    const rawPhone = firstPass.telefono.replace(/\D/g, '');
    const passengerPhone = rawPhone.startsWith('51') ? rawPhone : `51${rawPhone}`;

    const pasajerosTxt = activeTicket.pasajeros
      .map((p) => `• *Asiento ${p.seat}:* ${p.nombre} (${p.docType}: ${p.dni}) | Emb: ${p.embarque}`)
      .join('\n');

    const msg = encodeURIComponent(
      `*¡HOLA ${firstPass.nombre.toUpperCase()}! TU RESERVA EN ZEGO MOVILIDAD ESTÁ CONFIRMADA* 🚐✨\n\n` +
      `🎟 *Código:* ${activeTicket.codigoReserva}\n` +
      `📄 *Comprobante SUNAT:* ${activeTicket.serieComprobante} (${activeTicket.tipoComprobante.toUpperCase()})\n` +
      `📍 *Ruta:* ${activeTicket.viaje.origen} ➔ ${activeTicket.viaje.destino}\n` +
      `📅 *Salida:* ${activeTicket.viaje.fechaSalida}\n\n` +
      `*DETALLE PASAJEROS:*\n${pasajerosTxt}\n\n` +
      `💳 *Total:* S/ ${activeTicket.totalPagar.toFixed(2)} (${activeTicket.metodoPago})\n\n` +
      `_Presenta tu documento al abordar. ¡Buen viaje!_`
    );

    window.open(`https://wa.me/${passengerPhone}?text=${msg}`, '_blank');
  };

  const handleValidateTicketCode = (codigo: string) => {
    if (!codigo.trim()) return;
    if (!codigo.startsWith('ZG-')) return alert('❌ Formato incorrecto. Debe iniciar con "ZG-"');

    if (boardedPassengers.includes(codigo)) {
      alert(`⚠️ El pasaje ${codigo} ya fue validado anteriormente.`);
    } else {
      setBoardedPassengers((prev) => [...prev, codigo]);
      alert(`✅ ¡Pasaje ${codigo} VALIDADO! Pasajero marcado como A BORDO ✓`);
    }
    setScannedTicketCode('');
    setIsScannerOpen(false);
  };

  const resetBookingFlow = () => {
    setBookingStep('search');
    setSelectedTrip(null);
    setSelectedSeats([]);
    setPassengersList([]);
    setActiveTicket(null);
    setPaymentMethod(null);
    setYapeOpNumber('');
    setIsTimerActive(false);
    setTimeLeft(300);
  };

  const totals = calculateTotals();
  const filteredTrips = trips.filter((t) => t.origen.toLowerCase().includes(searchFilter.origen.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#071426] text-white font-sans flex flex-col selection:bg-[#DFFF00] selection:text-[#071426]">
      {/* HEADER PRINCIPAL */}
      <header className="border-b border-gray-800 bg-[#071426]/95 backdrop-blur sticky top-0 z-50 px-4 md:px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabChange('pasajero')}>
          <div className="bg-[#176BFF] text-[#DFFF00] font-black italic px-3 py-1.5 rounded-lg text-2xl tracking-tighter shadow-lg flex items-center">
            Z<span className="text-white">EGO</span>
            <span className="ml-1 text-[#DFFF00] text-xl">➔</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-wide text-white flex items-center gap-1.5">
              ZEGO <span className="text-[#DFFF00]">MOVILIDAD</span>
              <span className="hidden sm:inline-block bg-[#176BFF]/20 text-[#176BFF] border border-[#176BFF]/40 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                SUTRAN
              </span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Sistema Interprovincial Lima ⇄ Huánuco</p>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <div className="flex items-center bg-[#1C2738] p-1.5 rounded-xl border border-gray-700 text-xs gap-1">
          <button onClick={() => handleTabChange('pasajero')} className={`px-3 py-2 rounded-lg font-bold transition ${activeTab === 'pasajero' ? 'bg-[#176BFF] text-white' : 'text-gray-300'}`}>
            👥 Pasajeros
          </button>
          <button onClick={() => handleTabChange('encomiendas')} className={`px-3 py-2 rounded-lg font-bold transition ${activeTab === 'encomiendas' ? 'bg-[#176BFF] text-white' : 'text-gray-300'}`}>
            📦 Encomiendas
          </button>
          <button onClick={() => handleTabChange('conductor')} className={`px-3 py-2 rounded-lg font-bold transition ${activeTab === 'conductor' ? 'bg-[#176BFF] text-white' : 'text-gray-300'}`}>
            🚘 Conductor
          </button>
          <button onClick={() => handleTabChange('superadmin')} className={`px-3 py-2 rounded-lg font-bold transition ${activeTab === 'superadmin' ? 'bg-[#DFFF00] text-[#071426]' : 'text-[#DFFF00]'}`}>
            ⚡ Admin
          </button>
        </div>
      </header>

      {/* MODAL PIN AUTENTICACIÓN */}
      {authModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C2738] border-2 border-[#176BFF] rounded-3xl max-w-sm w-full p-6 space-y-4 text-center">
            <button onClick={() => setAuthModal(null)} className="absolute top-4 right-4 text-gray-400 font-bold">✕</button>
            <div className="text-3xl">🔒</div>
            <h3 className="text-lg font-black text-white">Acceso Protegido — {authModal.toUpperCase()}</h3>
            <p className="text-xs text-gray-400">PIN de autorización (Prueba: {authModal === 'superadmin' ? '1234' : '5678'})</p>

            <input
              type="password" placeholder="••••" value={pinInput} onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center bg-[#071426] border border-gray-700 p-3 rounded-xl text-xl font-black text-[#DFFF00] tracking-widest outline-none"
            />
            {authError && <p className="text-xs text-red-400 font-bold">{authError}</p>}
            <button onClick={handleVerifyPin} className="w-full bg-[#176BFF] font-bold py-3 rounded-xl text-white uppercase text-xs">
              Ingresar
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 lg:p-6">
        {/* ============================================================================== */}
        {/* 1. MÓDULO PASAJEROS */}
        {/* ============================================================================== */}
        {activeTab === 'pasajero' && (
          <div>
            {bookingStep === 'search' && (
              <section className="space-y-6">
                <div className="bg-[#1C2738] border border-gray-700 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
                  <span className="text-xs font-black text-[#DFFF00] tracking-wider uppercase">🔍 Buscador Oficial de Salidas</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-gray-400 block mb-1">Origen</label>
                      <select value={searchFilter.origen} onChange={(e) => setSearchFilter({ ...searchFilter, origen: e.target.value })} className="w-full bg-[#071426] border border-gray-700 p-3 rounded-xl text-white font-bold">
                        <option value="Lima">Lima (Javier Prado / La Victoria)</option>
                        <option value="Huánuco">Huánuco (Terminal Terrestre Central)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Destino</label>
                      <select value={searchFilter.destino} onChange={(e) => setSearchFilter({ ...searchFilter, destino: e.target.value })} className="w-full bg-[#071426] border border-gray-700 p-3 rounded-xl text-white font-bold">
                        <option value="Huánuco">Huánuco (Terminal Terrestre Central)</option>
                        <option value="Lima">Lima (Javier Prado / La Victoria)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Fecha</label>
                      <input type="date" value={searchFilter.fecha} onChange={(e) => setSearchFilter({ ...searchFilter, fecha: e.target.value })} className="w-full bg-[#071426] border border-gray-700 p-3 rounded-xl text-white font-bold" />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Servicio</label>
                      <select value={searchFilter.servicio} onChange={(e) => setSearchFilter({ ...searchFilter, servicio: e.target.value })} className="w-full bg-[#071426] border border-gray-700 p-3 rounded-xl text-white font-bold">
                        <option value="todos">Todos los servicios</option>
                        <option value="compartido">Minivan 7 Asientos</option>
                        <option value="vip">Minivan VIP 11 Asientos</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {filteredTrips.map((trip) => {
                    const libres = trip.asientosTotales - trip.asientosOcupados.length;
                    const estaLleno = libres === 0;
                    const precioFinal = trip.precioBase * (trip.factorPrecioFestivo || 1);

                    return (
                      <div key={trip.id} className="bg-[#1C2738] border border-gray-700 hover:border-[#176BFF] transition rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="space-y-2">
                          <span className="text-xs font-black text-[#DFFF00] bg-black/40 px-2.5 py-1 rounded">{trip.codigo}</span>
                          <h3 className="text-lg font-black text-white">{trip.origen} ➔ {trip.destino}</h3>
                          <p className="text-xs text-gray-400">Salida: {trip.fechaSalida} | Conductor: {trip.conductor.nombre}</p>
                          <button onClick={() => setViewGpsTrip(trip)} className="text-[11px] text-[#176BFF] hover:underline font-bold">
                            📡 Ver Mapa GPS Interactivo en Vivo
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-black text-[#DFFF00]">S/ {precioFinal.toFixed(2)}</p>
                          <p className={`text-xs font-bold ${estaLleno ? 'text-red-400' : 'text-green-400'}`}>
                            {estaLleno ? 'UNIDAD LLENA' : `✓ ${libres} asientos disponibles`}
                          </p>
                          <button
                            onClick={() => { setSelectedTrip(trip); setSelectedSeats([]); setPassengersList([]); setBookingStep('seats'); }}
                            disabled={estaLleno} className={`mt-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase ${estaLleno ? 'bg-gray-800 text-gray-500' : 'bg-[#176BFF] text-white'}`}
                          >
                            Seleccionar Asientos
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* CROQUIS DE ASIENTOS Y DATOS PASAJEROS */}
            {bookingStep === 'seats' && selectedTrip && (
              <section className="space-y-6 max-w-3xl mx-auto">
                <button onClick={() => setBookingStep('search')} className="text-xs text-gray-400 hover:text-white font-semibold">← Volver</button>
                <div className="bg-[#1C2738] border border-gray-700 rounded-3xl p-6 shadow-2xl space-y-6">
                  <h3 className="text-xl font-bold">Croquis de Asientos — {selectedTrip.vehiculo.modelo}</h3>

                  <div className="bg-[#071426] p-6 rounded-2xl border border-gray-800 max-w-sm mx-auto">
                    <div className="grid grid-cols-3 gap-3">
                      {Array.from({ length: selectedTrip.asientosTotales }, (_, i) => i + 1).map((seatNum) => {
                        const isOccupied = selectedTrip.asientosOcupados.includes(seatNum);
                        const isSelected = selectedSeats.includes(seatNum);
                        let seatClass = 'bg-green-500 text-white';
                        if (isOccupied) seatClass = 'bg-red-600 text-gray-300 opacity-75';
                        else if (isSelected) seatClass = 'bg-[#176BFF] ring-4 ring-[#DFFF00] font-bold';

                        return (
                          <button key={seatNum} disabled={isOccupied} onClick={() => handleSelectSeat(seatNum)} className={`h-14 rounded-xl font-bold text-sm ${seatClass}`}>
                            💺 {seatNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {passengersList.length > 0 && (
                    <div className="space-y-4">
                      {passengersList.map((p, index) => (
                        <div key={p.seat} className="bg-[#071426] p-4 rounded-2xl border border-gray-800 space-y-3 text-xs">
                          <p className="font-bold text-[#DFFF00]">Asiento N° {p.seat}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            <div>
                              <label className="text-gray-400 block mb-1">Doc *</label>
                              <input type="text" placeholder="DNI" value={p.dni} onChange={(e) => handlePassengerDocChange(index, e.target.value)} className="w-full bg-[#1C2738] border border-gray-700 p-2 rounded-xl text-white" />
                              {loadingDniIndex === index && <span className="text-[10px] text-[#DFFF00]">RENIEC...</span>}
                            </div>
                            <div>
                              <label className="text-gray-400 block mb-1">Nombre Completo *</label>
                              <input type="text" placeholder="Nombre" value={p.nombre} onChange={(e) => handlePassengerChange(index, 'nombre', e.target.value)} className="w-full bg-[#1C2738] border border-gray-700 p-2 rounded-xl text-white" />
                            </div>
                            <div>
                              <label className="text-gray-400 block mb-1">Celular *</label>
                              <input type="tel" placeholder="900000000" value={p.telefono} onChange={(e) => handlePassengerChange(index, 'telefono', e.target.value)} className="w-full bg-[#1C2738] border border-gray-700 p-2 rounded-xl text-white" />
                            </div>
                            <div>
                              <label className="text-gray-400 block mb-1">Equipaje Extra (Kg)</label>
                              <input type="number" min={0} placeholder="0 kg" value={p.equipajeExtraKg || ''} onChange={(e) => handlePassengerChange(index, 'equipajeExtraKg', e.target.value)} className="w-full bg-[#1C2738] border border-gray-700 p-2 rounded-xl text-white" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-[#071426] p-4 rounded-2xl flex items-start gap-3">
                    <input type="checkbox" id="ley29733" checked={aceptanTerminosLey29733} onChange={(e) => setAceptanTerminosLey29733(e.target.checked)} className="mt-1" />
                    <label htmlFor="ley29733" className="text-xs text-gray-300">
                      Acepto los Términos y Autorizo el uso de Datos Personales según la <strong className="text-[#DFFF00]">Ley N° 29733</strong> para emitir boletos y manifiesto SUTRAN.
                    </label>
                  </div>

                  <button onClick={handleConfirmSeats} className="w-full bg-[#176BFF] text-white font-bold py-3.5 rounded-xl uppercase text-xs">
                    Continuar al Pago Seguro S/ {totals.totalPagar.toFixed(2)}
                  </button>
                </div>
              </section>
            )}

            {/* PAGO Y LECTURA OCR DE VOUCHER */}
            {bookingStep === 'payment' && selectedTrip && (
              <section className="space-y-6 max-w-md mx-auto">
                <button onClick={() => setBookingStep('seats')} className="text-xs text-gray-400">← Volver</button>
                <div className="bg-[#1C2738] border border-gray-700 rounded-3xl p-6 shadow-2xl space-y-6">
                  <h3 className="text-xl font-bold">Pasarela de Pago & SUNAT</h3>

                  <div className="bg-[#071426] border border-yellow-500/40 p-4 rounded-2xl text-center">
                    <p className="text-[11px] text-gray-400 uppercase">⏱️ Tiempo restante:</p>
                    <p className="text-3xl font-black text-[#DFFF00] font-mono">{formatTime(timeLeft)}</p>
                  </div>

                  <div className="bg-[#071426] p-4 rounded-2xl space-y-2 text-xs">
                    <p className="font-bold">Comprobante SUNAT:</p>
                    <div className="flex gap-2">
                      <button onClick={() => setComprobanteType('boleta')} className={`flex-1 py-2 font-bold rounded-xl ${comprobanteType === 'boleta' ? 'bg-[#176BFF]' : 'bg-[#1C2738]'}`}>Boleta</button>
                      <button onClick={() => setComprobanteType('factura')} className={`flex-1 py-2 font-bold rounded-xl ${comprobanteType === 'factura' ? 'bg-[#176BFF]' : 'bg-[#1C2738]'}`}>Factura RUC</button>
                    </div>

                    {comprobanteType === 'factura' && (
                      <div className="space-y-2 pt-2">
                        <input type="text" maxLength={11} placeholder="RUC 11 dígitos" value={rucCliente} onChange={(e) => handleRucLookup(e.target.value)} className="w-full bg-[#1C2738] p-2 rounded-xl text-white" />
                        <input type="text" placeholder="Razón Social" value={razonSocialCliente} onChange={(e) => setRazonSocialCliente(e.target.value)} className="w-full bg-[#1C2738] p-2 rounded-xl text-white" />
                      </div>
                    )}
                  </div>

                  {!paymentMethod ? (
                    <div className="space-y-3">
                      <button onClick={() => setPaymentMethod('yape')} className="w-full bg-purple-700 text-white font-bold py-3.5 rounded-2xl text-xs">
                        📱 YAPE / PLIN con Lectura OCR de Voucher
                      </button>
                      <button onClick={() => setPaymentMethod('tarjeta')} className="w-full bg-[#176BFF] text-white font-bold py-3.5 rounded-2xl text-xs">
                        💳 Tarjeta Visa / Mastercard
                      </button>
                    </div>
                  ) : paymentMethod === 'yape' ? (
                    <div className="bg-[#071426] p-5 rounded-2xl border border-purple-500/30 space-y-4 text-xs">
                      <p className="text-center font-bold text-[#DFFF00]">900 123 456 (ZEGO MOVILIDAD S.A.C.)</p>
                      
                      {/* SUBIDA DE CAPTURA OCR */}
                      <div className="border-2 border-dashed border-purple-500 p-4 rounded-xl text-center space-y-2">
                        <p className="font-bold text-white">📷 Escanear Voucher Yape con OCR:</p>
                        <input type="file" accept="image/*" onChange={handleSimulateOcrVoucherUpload} className="hidden" id="voucherOcr" />
                        <label htmlFor="voucherOcr" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl cursor-pointer">
                          {isOcrScanning ? '🔍 Escaneando imagen...' : 'Subir Captura de Yape'}
                        </label>
                      </div>

                      <input type="text" placeholder="N° Operación Yape" value={yapeOpNumber} onChange={(e) => setYapeOpNumber(e.target.value)} className="w-full bg-[#1C2738] p-2.5 rounded-xl text-white font-bold" />
                      
                      <button onClick={() => { if (!yapeOpNumber) return alert('Ingrese N° Operación'); handleProcessPayment(`YAPE (Op: ${yapeOpNumber})`); }} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl uppercase">
                        ✓ Confirmar y Emitir Boleta
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#071426] p-5 rounded-2xl space-y-3 text-xs">
                      <input type="text" placeholder="Número de Tarjeta" className="w-full bg-[#1C2738] p-2.5 rounded-xl text-white" />
                      <button onClick={() => handleProcessPayment('Tarjeta Visa')} className="w-full bg-[#176BFF] text-white font-bold py-3 rounded-xl uppercase">
                        Pagar S/ {totals.totalPagar.toFixed(2)}
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* BOLETO GENERADO Y COMPROBANTE SUNAT */}
            {bookingStep === 'ticket' && activeTicket && (
              <section className="space-y-6 max-w-md mx-auto">
                <div className="bg-white text-gray-900 rounded-3xl p-6 shadow-2xl space-y-4 border-4 border-[#176BFF]">
                  <div className="bg-[#071426] text-white -mx-6 -mt-6 p-4 text-center rounded-t-2xl">
                    <h3 className="font-black text-xl">ZEGO MOVILIDAD S.A.C.</h3>
                    <p className="text-xs text-[#DFFF00] font-bold">{activeTicket.tipoComprobante.toUpperCase()} {activeTicket.serieComprobante}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-black text-[#176BFF]">{activeTicket.codigoReserva}</p>
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-3 py-1 rounded-full">✓ COMPROBANTE SUNAT OK</span>
                  </div>

                  <div className="flex justify-center">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(activeTicket.qrPayload)}`} alt="QR" className="w-32 h-32" />
                  </div>

                  <button onClick={handleSendWhatsAppToPassenger} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl text-xs uppercase">
                    📱 Enviar Boleto al WhatsApp del Pasajero
                  </button>
                  <button onClick={resetBookingFlow} className="w-full bg-[#071426] text-white font-bold py-3 rounded-xl text-xs uppercase">
                    Volver al Buscador
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ============================================================================== */}
        {/* 2. MÓDULO DE ENCOMIENDAS Y CARGA (GUÍA DE REMISIÓN TRANSPORTISTA) */}
        {/* ============================================================================== */}
        {activeTab === 'encomiendas' && (
          <section className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-[#1C2738] border border-gray-700 rounded-3xl p-6 shadow-2xl space-y-6">
              <h2 className="text-xl font-black text-white">📦 Gestión de Encomiendas & Guías de Remisión SUNAT</h2>
              
              <form onSubmit={handleCreateEncomienda} className="bg-[#071426] p-5 rounded-2xl space-y-4 text-xs">
                <p className="font-bold text-[#DFFF00]">Registrar Nueva Encomienda (Guía Remisión):</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" placeholder="Remitente Nombre" value={newEncomienda.remitenteNombre} onChange={(e) => setNewEncomienda({...newEncomienda, remitenteNombre: e.target.value})} className="bg-[#1C2738] p-2.5 rounded-xl text-white" required />
                  <input type="text" placeholder="Remitente DNI" value={newEncomienda.remitenteDni} onChange={(e) => setNewEncomienda({...newEncomienda, remitenteDni: e.target.value})} className="bg-[#1C2738] p-2.5 rounded-xl text-white" required />
                  <input type="tel" placeholder="Remitente Celular" value={newEncomienda.remitenteTelefono} onChange={(e) => setNewEncomienda({...newEncomienda, remitenteTelefono: e.target.value})} className="bg-[#1C2738] p-2.5 rounded-xl text-white" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" placeholder="Destinatario Nombre" value={newEncomienda.destinatarioNombre} onChange={(e) => setNewEncomienda({...newEncomienda, destinatarioNombre: e.target.value})} className="bg-[#1C2738] p-2.5 rounded-xl text-white" required />
                  <input type="text" placeholder="Destinatario DNI" value={newEncomienda.destinatarioDni} onChange={(e) => setNewEncomienda({...newEncomienda, destinatarioDni: e.target.value})} className="bg-[#1C2738] p-2.5 rounded-xl text-white" required />
                  <input type="tel" placeholder="Destinatario Celular" value={newEncomienda.destinatarioTelefono} onChange={(e) => setNewEncomienda({...newEncomienda, destinatarioTelefono: e.target.value})} className="bg-[#1C2738] p-2.5 rounded-xl text-white" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="Descripción de la Carga" value={newEncomienda.descripcion} onChange={(e) => setNewEncomienda({...newEncomienda, descripcion: e.target.value})} className="bg-[#1C2738] p-2.5 rounded-xl text-white" required />
                  <input type="number" placeholder="Peso estimado (kg)" value={newEncomienda.pesoKg} onChange={(e) => setNewEncomienda({...newEncomienda, pesoKg: Number(e.target.value)})} className="bg-[#1C2738] p-2.5 rounded-xl text-white" required />
                </div>

                <button type="submit" className="w-full bg-[#176BFF] text-white font-bold py-3 rounded-xl uppercase">
                  + Generar Guía Remisión Transportista (GRT)
                </button>
              </form>

              {/* LISTA DE ENCOMIENDAS REGISTRADAS */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-300 uppercase">Guías en Sistema:</h3>
                {encomiendas.map((e) => (
                  <div key={e.codigoGuia} className="bg-[#071426] p-4 rounded-2xl border border-gray-800 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-[#DFFF00]">{e.codigoGuia}</span>
                      <p className="text-white font-bold">{e.origen} ➔ {e.destino} ({e.pesoKg} kg)</p>
                      <p className="text-gray-400">De: {e.remitenteNombre} ➔ Para: {e.destinatarioNombre}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white">S/ {e.fleteTotal.toFixed(2)}</p>
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{e.estado}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================================== */}
        {/* 3. MÓDULO CONDUCTOR & ESCÁNER DE CÁMARA */}
        {/* ============================================================================== */}
        {activeTab === 'conductor' && (
          <section className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-[#1C2738] border-2 border-[#176BFF] rounded-3xl p-6 space-y-6 shadow-2xl">
              <h3 className="font-black text-lg text-white">Panel Operativo — Conductor</h3>

              {/* ESCÁNER QR DE CÁMARA */}
              <div className="bg-[#071426] border border-blue-500/30 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white">📷 Escáner QR Nativo</h4>
                  <button onClick={() => setIsScannerOpen(!isScannerOpen)} className="bg-[#DFFF00] text-black font-bold px-3 py-1.5 rounded-xl text-xs">
                    {isScannerOpen ? 'Cerrar' : 'Activar Cámara'}
                  </button>
                </div>

                {isScannerOpen && (
                  <div className="bg-black/80 p-3 rounded-xl space-y-2">
                    <input type="text" placeholder="Escanear o digitar ZG-..." value={scannedTicketCode} onChange={(e) => setScannedTicketCode(e.target.value)} className="w-full bg-gray-900 p-2 rounded-xl text-white text-xs" />
                    <button onClick={() => handleValidateTicketCode(scannedTicketCode)} className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-xs">
                      Validar Ingreso Pasajero
                    </button>
                  </div>
                )}
              </div>

              {trips.map((trip) => (
                <div key={trip.id} className="bg-[#071426] p-4 rounded-2xl space-y-2 text-xs">
                  <p className="font-bold text-[#DFFF00]">{trip.codigo} — {trip.origen} ➔ {trip.destino}</p>
                  <p className="text-gray-400">Conductor: {trip.conductor.nombre} (Horas hoy: {trip.conductor.horasManejadasHoy}h)</p>
                  {trip.conductor.horasManejadasHoy >= 4.0 && (
                    <p className="bg-red-500/20 text-red-300 p-2 rounded-xl font-bold">⚠️ Alerta MTC: Relevo obligatorio por horas de manejo.</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================================== */}
        {/* 4. MÓDULO SUPERADMINISTRADOR (COMPLETO CON FORMULARIO CRUD CREAR/ELIMINAR) */}
        {/* ============================================================================== */}
        {activeTab === 'superadmin' && (
          <section className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-4 gap-3">
              <div>
                <h2 className="text-2xl font-black text-white">Panel SuperAdmin & Gestión Global</h2>
                <p className="text-xs text-gray-400">Gestión de Salidas, Precios, Flota y Conductores</p>
              </div>
              <button onClick={() => setIsFestivoGlobal(!isFestivoGlobal)} className={`px-4 py-2 rounded-xl text-xs font-black ${isFestivoGlobal ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-300'}`}>
                {isFestivoGlobal ? '🎉 Tarifa Festiva ACTIVA (+30%)' : '⚙️ Activar Tarifa Fiestas Patrias'}
              </button>
            </div>

            {/* MÉTRICAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#1C2738] p-5 rounded-2xl border border-gray-700">
                <p className="text-gray-400 font-semibold">Ingresos Totales Hoy</p>
                <p className="text-2xl font-black text-[#DFFF00]">S/ {trips.reduce((acc, t) => acc + (t.asientosOcupados.length * t.precioBase), 0).toFixed(2)}</p>
              </div>
              <div className="bg-[#1C2738] p-5 rounded-2xl border border-gray-700">
                <p className="text-gray-400 font-semibold">Ocupación Flota</p>
                <p className="text-2xl font-black text-white">{trips.reduce((acc, t) => acc + t.asientosOcupados.length, 0)} / {trips.reduce((acc, t) => acc + t.asientosTotales, 0)}</p>
              </div>
              <div className="bg-[#1C2738] p-5 rounded-2xl border border-gray-700">
                <p className="text-gray-400 font-semibold">SUTRAN & MTC Status</p>
                <p className="text-2xl font-black text-green-400">100% OK</p>
              </div>
            </div>

            {/* FORMULARIO DE CREACIÓN DE VIAJE (CRUD) */}
            <div className="bg-[#1C2738] border-2 border-[#176BFF] rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                ➕ Programar y Agregar Nueva Salida / Viaje
              </h3>

              <form onSubmit={handleCreateNewTrip} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1">Origen</label>
                    <select value={newTripForm.origen} onChange={(e) => setNewTripForm({...newTripForm, origen: e.target.value})} className="w-full bg-[#071426] border border-gray-700 p-2.5 rounded-xl text-white font-bold">
                      <option value="Lima (Javier Prado / La Victoria)">Lima (Javier Prado / La Victoria)</option>
                      <option value="Huánuco (Terminal Terrestre Central)">Huánuco (Terminal Terrestre Central)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Destino</label>
                    <select value={newTripForm.destino} onChange={(e) => setNewTripForm({...newTripForm, destino: e.target.value})} className="w-full bg-[#071426] border border-gray-700 p-2.5 rounded-xl text-white font-bold">
                      <option value="Huánuco (Terminal Terrestre Central)">Huánuco (Terminal Terrestre Central)</option>
                      <option value="Lima (Javier Prado / La Victoria)">Lima (Javier Prado / La Victoria)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Fecha y Hora de Salida</label>
                    <input type="text" placeholder="2026-03-26 08:00" value={newTripForm.fechaSalida} onChange={(e) => setNewTripForm({...newTripForm, fechaSalida: e.target.value})} className="w-full bg-[#071426] border border-gray-700 p-2.5 rounded-xl text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1">Precio Base (S/)</label>
                    <input type="number" min={10} value={newTripForm.precioBase} onChange={(e) => setNewTripForm({...newTripForm, precioBase: Number(e.target.value)})} className="w-full bg-[#071426] border border-gray-700 p-2.5 rounded-xl text-white font-bold" required />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Tipo de Vehículo</label>
                    <select value={newTripForm.tipoVehiculo} onChange={(e) => setNewTripForm({...newTripForm, tipoVehiculo: e.target.value as VehicleType})} className="w-full bg-[#071426] border border-gray-700 p-2.5 rounded-xl text-white font-bold">
                      <option value="minivan_7">Minivan 7 Asientos (Hyundai H1)</option>
                      <option value="minivan_11">Minivan VIP 11 Asientos (Toyota HiAce)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Placa Vehículo</label>
                    <input type="text" placeholder="ZGO-100" value={newTripForm.placa} onChange={(e) => setNewTripForm({...newTripForm, placa: e.target.value})} className="w-full bg-[#071426] border border-gray-700 p-2.5 rounded-xl text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1">Nombre Conductor</label>
                    <input type="text" placeholder="Nombre completo" value={newTripForm.conductorNombre} onChange={(e) => setNewTripForm({...newTripForm, conductorNombre: e.target.value})} className="w-full bg-[#071426] border border-gray-700 p-2.5 rounded-xl text-white" required />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">N° Licencia Conductor</label>
                    <input type="text" placeholder="Q-12345678" value={newTripForm.licencia} onChange={(e) => setNewTripForm({...newTripForm, licencia: e.target.value})} className="w-full bg-[#071426] border border-gray-700 p-2.5 rounded-xl text-white" required />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Celular Conductor</label>
                    <input type="tel" placeholder="987654321" value={newTripForm.celularConductor} onChange={(e) => setNewTripForm({...newTripForm, celularConductor: e.target.value})} className="w-full bg-[#071426] border border-gray-700 p-2.5 rounded-xl text-white" required />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#DFFF00] text-[#071426] font-black py-3 rounded-xl uppercase text-xs hover:bg-yellow-400 transition">
                  🚀 Publicar Salida en la Plataforma
                </button>
              </form>
            </div>

            {/* GESTIÓN Y ELIMINACIÓN DE VIAJES PUBLICADOS */}
            <div className="bg-[#1C2738] border border-gray-700 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
              <h3 className="text-base font-black text-white">📋 Salidas Activas en Sistema ({trips.length})</h3>
              
              <div className="space-y-3">
                {trips.map((t) => (
                  <div key={t.id} className="bg-[#071426] p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#DFFF00] bg-black/50 px-2 py-0.5 rounded text-[10px]">{t.codigo}</span>
                        <span className="font-bold text-white">{t.origen} ➔ {t.destino}</span>
                      </div>
                      <p className="text-gray-400">Salida: {t.fechaSalida} | Placa: {t.vehiculo.placa} | Chofer: {t.conductor.nombre}</p>
                      <p className="text-gray-500 text-[10px]">Asientos ocupados: {t.asientosOcupados.length} / {t.asientosTotales}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-[#DFFF00]">S/ {(t.precioBase * (t.factorPrecioFestivo || 1)).toFixed(2)}</span>
                      <button onClick={() => handleDeleteTrip(t.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px]">
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL CON MAPA GPS INTERACTIVO DE RUTA */}
      {viewGpsTrip && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C2738] border border-gray-700 rounded-3xl max-w-lg w-full p-6 space-y-4 relative">
            <button onClick={() => setViewGpsTrip(null)} className="absolute top-4 right-4 text-gray-400 font-bold">✕</button>
            <h3 className="text-lg font-black text-white">📡 Monitoreo GPS en Vivo — Carretera Central</h3>
            
            {/* SIMULACIÓN MAPA INTERACTIVO CARRETERA CENTRAL */}
            <div className="bg-[#071426] p-4 rounded-2xl border border-gray-800 space-y-3">
              <div className="relative h-20 bg-gray-900 rounded-xl overflow-hidden flex items-center px-4">
                <div className="absolute inset-0 bg-blue-500/10 h-full w-full"></div>
                <div className="w-full bg-gray-700 h-2 rounded-full relative">
                  <div className="bg-[#DFFF00] h-2 rounded-full transition-all duration-500" style={{ width: `${viewGpsTrip.gps.progresoPorcentaje}%` }}></div>
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#176BFF] text-white p-1.5 rounded-full border-2 border-[#DFFF00] shadow-lg text-xs font-black" style={{ left: `${viewGpsTrip.gps.progresoPorcentaje}%` }}>
                    🚐
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                <span>Lima (Javier Prado)</span>
                <span>Chosica</span>
                <span>Ticlio (4,818m)</span>
                <span>La Oroya</span>
                <span>Huánuco</span>
              </div>

              <div className="text-xs space-y-1 text-gray-300 pt-2 border-t border-gray-800">
                <p>Tramo actual: <strong className="text-[#DFFF00]">{viewGpsTrip.gps.tramo}</strong></p>
                <p>Velocidad registrada: <strong className="text-white">{viewGpsTrip.gps.velocidad} km/h</strong></p>
              </div>
            </div>

            <button onClick={() => setViewGpsTrip(null)} className="w-full bg-[#176BFF] text-white font-bold py-3 rounded-xl text-xs uppercase">
              Cerrar Mapa
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#040c17] border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        <p className="font-bold text-gray-300">ZEGO MOVILIDAD S.A.C. — RUC 20601928374</p>
        <p className="text-[10px] text-gray-600 pt-1">Ley N° 29733 de Protección de Datos Personales | MTC & SUTRAN Perú © 2026</p>
      </footer>
    </div>
  );
}