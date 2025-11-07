export interface Client {
  id: number;
  company_name: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  role: 'Client';
  created_at: string;
  updated_at: string;
  address: string | null;
  password: string | null;
}

export interface Manager {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'Manager';
  client_id: number;
  created_at: string;
  updated_at: string;
  client?: Client;
  address: string | null;
}

export interface Rh {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'RH';
  client_id: number;
  created_at: string;
  updated_at: string;
  client?: Client;
  address: string | null;
}

export interface Comptable {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'Comptable';
  client_id: number;
  created_at: string;
  updated_at: string;
  client?: Client;
  address: string | null;
}

export interface Consultant {
  id: number;
  first_name: string;
  last_name: string;
  name: string; // Accesseur virtuel pour compatibilité
  email: string;
  phone: string | null;
  role: 'Consultant';
  skills: string | null;
  daily_rate: number | null;
  status: 'active' | 'inactive';
  client_id: number;
  created_at: string;
  updated_at: string;
  client?: Client;
  address: string | null;
  password: string | null;
  project_id: number | null;
  project?: Project;
  workSchedules?: WorkSchedule[];
  assignments?: Assignment[];
}

export interface Project {
  id: number;
  client_id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  consultants?: Consultant[];
}

export interface Assignment {
  id: number;
  consultant_id: number;
  project_id: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  consultant?: Consultant;
  project?: Project;
}

export interface Quote {
  id: number;
  client_id: number;
  project_id: number | null;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  client?: Client;
  project?: Project;
}

export interface Facture {
  id: number;
  client_id: number;
  consultant_id: number | null;
  quote_id: number | null;
  created_by_manager: number | null;
  facture_date: string;
  due_date: string | null;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  total: number | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  consultant?: Consultant;
  quote?: Quote;
  manager?: Manager;
  items?: FactureItem[];
}

export interface FactureItem {
  id: number;
  facture_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export interface WorkType {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  multiplier: number;
  requires_approval: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveType {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  is_paid: boolean;
  requires_approval: boolean;
  max_days_per_year: number | null;
  requires_medical_certificate: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkSchedule {
  id: number;
  consultant_id: number;
  date: string;
  type: 'workday' | 'weekend' | 'vacation';
  notes: string | null;
  days_worked: number;
  work_type_days: number;
  weekend_worked: number; // Nombre de jours de week-end travaillés
  absence_type: string;
  absence_days: number;
  month: number | null;
  year: number | null;
  work_type_id: number | null;
  leave_type_id: number | null;
  created_at: string;
  updated_at: string;
  consultant?: Consultant;
  work_type?: WorkType;
  leave_type?: LeaveType;
}

