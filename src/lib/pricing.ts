// Utility functions for pricing and validation

// Validate CPF
export function validateCPF(cpf: string): boolean {
  // Remove non-digits
  const cleanCPF = cpf.replace(/\D/g, '');

  // Check length
  if (cleanCPF.length !== 11) return false;

  // Check if all digits are the same
  if (/^(\d)\1+$/.test(cleanCPF)) return false;

  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF[10])) return false;

  return true;
}

// Format CPF with mask
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

// Format phone number with mask
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// Get time remaining until a target date
export function getTimeRemaining(targetDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = Math.max(0, targetDate.getTime() - new Date().getTime());

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
}

// Generate unique transaction ID
export function generateTransactionId(): string {
  return `XD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// Clean CPF for API (remove formatting)
export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}
