export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  created_at: string;
};

export type EventType = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
};

export type EventBooking = {
  id: string;
  customer_id: string;
  event_type_id: string;
  title: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  total_price: number;
  payment_status: boolean;
  images?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  customer?: Customer;
  event_type?: EventType;
};

export type EventBookingInsert = Omit<
  EventBooking,
  "id" | "created_at" | "updated_at" | "customer" | "event_type"
>;

export type EventBookingUpdate = Partial<EventBookingInsert>;

export type Setting = {
  id: string;
  key: string;
  value: string;
  description?: string;
  created_at: string;
  updated_at: string;
};
