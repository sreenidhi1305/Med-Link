export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number; // in km
  rating: number;
  isOpen: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  hours: {
    [key: string]: string; // e.g., { monday: '9:00 AM - 9:00 PM', ... }
  };
  trustScore: number;
}

export interface MedicationStock {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  form: string;
  price: number;
  inStock: boolean;
  lastUpdated: string;
  quantity: number;
  manufacturer: string;
  alternatives: {
    id: string;
    name: string;
    price: number;
    inStock: boolean;
  }[];
}

export interface PrescriptionTransferRequest {
  id: string;
  fromPharmacyId: string;
  toPharmacyId: string;
  medications: Array<{
    id: string;
    name: string;
    quantity: number;
    transferStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
  }>;
  status: 'requested' | 'processing' | 'ready' | 'completed' | 'cancelled';
  requestedAt: string;
  estimatedReadyAt?: string;
  notes?: string;
}

export interface PriceAlert {
  id: string;
  medicationId: string;
  medicationName: string;
  targetPrice: number;
  currentLowestPrice: number;
  isActive: boolean;
  createdAt: string;
  lastNotified?: string;
}
