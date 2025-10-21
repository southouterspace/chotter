/**
 * Test data fixtures for E2E tests
 * These provide consistent test data across all test files
 */

import { format, addDays, addHours } from 'date-fns';

/**
 * Generate unique ID for test data to avoid conflicts
 */
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Test customer data
 */
export const TEST_CUSTOMERS = {
  new: {
    firstName: 'John',
    lastName: 'Doe',
    email: `john.doe.${generateTestId()}@test.com`,
    phone: '555-0100',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
  },
  existing: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@test.com',
    phone: '555-0101',
    address: '456 Oak Ave',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
  },
} as const;

/**
 * Generate new customer data with unique email
 */
export function generateCustomerData(overrides: Partial<typeof TEST_CUSTOMERS.new> = {}) {
  return {
    firstName: 'Test',
    lastName: 'Customer',
    email: `customer.${generateTestId()}@test.com`,
    phone: '555-0199',
    address: '789 Test St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94104',
    ...overrides,
  };
}

/**
 * Test technician data
 */
export const TEST_TECHNICIANS = {
  new: {
    firstName: 'Bob',
    lastName: 'Builder',
    email: `bob.builder.${generateTestId()}@test.com`,
    phone: '555-0200',
    skills: ['Plumbing', 'HVAC'],
    certifications: ['Licensed Plumber', 'HVAC Certified'],
  },
  existing: {
    firstName: 'Alice',
    lastName: 'Fixer',
    email: 'alice.fixer@test.com',
    phone: '555-0201',
    skills: ['Electrical', 'Carpentry'],
    certifications: ['Master Electrician'],
  },
} as const;

/**
 * Generate new technician data with unique email
 */
export function generateTechnicianData(overrides: Partial<typeof TEST_TECHNICIANS.new> = {}) {
  return {
    firstName: 'Test',
    lastName: 'Technician',
    email: `tech.${generateTestId()}@test.com`,
    phone: '555-0299',
    skills: ['General Maintenance'],
    certifications: [],
    ...overrides,
  };
}

/**
 * Test service types data
 */
export const TEST_SERVICES = {
  oilChange: {
    name: 'Oil Change',
    description: 'Standard oil change service',
    durationMinutes: 30,
    price: 49.99,
  },
  hvacInspection: {
    name: 'HVAC Inspection',
    description: 'Complete HVAC system inspection',
    durationMinutes: 60,
    price: 129.99,
  },
  plumbingRepair: {
    name: 'Plumbing Repair',
    description: 'General plumbing repair service',
    durationMinutes: 90,
    price: 149.99,
  },
} as const;

/**
 * Generate new service data
 */
export function generateServiceData(overrides: Partial<typeof TEST_SERVICES.oilChange> = {}) {
  return {
    name: `Test Service ${generateTestId()}`,
    description: 'Test service description',
    durationMinutes: 60,
    price: 99.99,
    ...overrides,
  };
}

/**
 * Test appointment data
 */
export const TEST_APPOINTMENTS = {
  tomorrow: {
    get scheduledDate() {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd');
    },
    scheduledTime: '10:00',
    get scheduledDateTime() {
      return `${this.scheduledDate}T${this.scheduledTime}:00`;
    },
    duration: 60,
    status: 'scheduled' as const,
    notes: 'Test appointment for tomorrow',
  },
  nextWeek: {
    get scheduledDate() {
      return format(addDays(new Date(), 7), 'yyyy-MM-dd');
    },
    scheduledTime: '14:00',
    get scheduledDateTime() {
      return `${this.scheduledDate}T${this.scheduledTime}:00`;
    },
    duration: 90,
    status: 'scheduled' as const,
    notes: 'Test appointment for next week',
  },
  today: {
    get scheduledDate() {
      return format(new Date(), 'yyyy-MM-dd');
    },
    get scheduledTime() {
      return format(addHours(new Date(), 2), 'HH:mm');
    },
    get scheduledDateTime() {
      return `${this.scheduledDate}T${this.scheduledTime}:00`;
    },
    duration: 30,
    status: 'scheduled' as const,
    notes: 'Test appointment for today',
  },
} as const;

/**
 * Generate new appointment data
 */
export function generateAppointmentData(overrides: Partial<typeof TEST_APPOINTMENTS.tomorrow> = {}) {
  const tomorrow = addDays(new Date(), 1);
  return {
    scheduledDate: format(tomorrow, 'yyyy-MM-dd'),
    scheduledTime: '10:00',
    duration: 60,
    status: 'scheduled' as const,
    notes: 'Test appointment',
    ...overrides,
  };
}

/**
 * Test user credentials
 */
export const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'testpassword123',
  },
  manager: {
    email: 'manager@test.com',
    password: 'testpassword123',
  },
  invalid: {
    email: 'invalid@test.com',
    password: 'wrongpassword',
  },
} as const;

/**
 * Test route data
 */
export const TEST_ROUTES = {
  morning: {
    name: 'Morning Route A',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '08:00',
    appointmentCount: 5,
  },
  afternoon: {
    name: 'Afternoon Route B',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '13:00',
    appointmentCount: 4,
  },
} as const;

/**
 * Test business settings
 */
export const TEST_BUSINESS_SETTINGS = {
  businessName: 'Test Service Company',
  businessPhone: '555-0300',
  businessEmail: 'info@testservicecompany.com',
  businessAddress: '100 Business Blvd, San Francisco, CA 94105',
  timezone: 'America/Los_Angeles',
  operatingHours: {
    monday: { open: '08:00', close: '17:00' },
    tuesday: { open: '08:00', close: '17:00' },
    wednesday: { open: '08:00', close: '17:00' },
    thursday: { open: '08:00', close: '17:00' },
    friday: { open: '08:00', close: '17:00' },
    saturday: { open: '09:00', close: '13:00' },
    sunday: { closed: true },
  },
} as const;

/**
 * Wait times for various operations (in milliseconds)
 */
export const WAIT_TIMES = {
  short: 1000,
  medium: 3000,
  long: 5000,
  veryLong: 10000,
} as const;

/**
 * Common selectors used across tests
 */
export const SELECTORS = {
  // Buttons
  newCustomerButton: 'button:has-text("New Customer")',
  newTechnicianButton: 'button:has-text("New Technician")',
  newAppointmentButton: 'button:has-text("New Appointment")',
  newServiceButton: 'button:has-text("New Service")',
  submitButton: 'button[type="submit"]',
  cancelButton: 'button:has-text("Cancel")',
  deleteButton: 'button:has-text("Delete")',
  saveButton: 'button:has-text("Save")',

  // Forms
  customerForm: 'form[data-testid="customer-form"], form:has(input[name="firstName"])',
  technicianForm: 'form[data-testid="technician-form"], form:has(input[name="firstName"])',
  appointmentForm: 'form[data-testid="appointment-form"]',
  serviceForm: 'form[data-testid="service-form"]',

  // Tables
  customersTable: 'table, [role="table"]',
  techniciansTable: 'table, [role="table"]',
  servicesTable: 'table, [role="table"]',

  // Navigation
  dashboardLink: 'a[href="/"], nav a:has-text("Dashboard")',
  scheduleLink: 'a[href="/schedule"], nav a:has-text("Schedule")',
  customersLink: 'a[href="/customers"], nav a:has-text("Customers")',
  techniciansLink: 'a[href="/technicians"], nav a:has-text("Technicians")',
  servicesLink: 'a[href="/services"], nav a:has-text("Services")',
  routesLink: 'a[href="/routes"], nav a:has-text("Routes")',
  settingsLink: 'a[href="/settings"], nav a:has-text("Settings")',

  // Modals/Dialogs
  modal: '[role="dialog"]',
  modalTitle: '[role="dialog"] h2, [role="dialog"] [data-testid="modal-title"]',
  modalCloseButton: '[role="dialog"] button[aria-label="Close"]',

  // Notifications
  successToast: '[role="status"]:has-text("Success")',
  errorToast: '[role="status"]:has-text("Error")',
  toast: '[role="status"]',

  // Search
  searchInput: 'input[type="search"], input[placeholder*="Search"]',
} as const;
