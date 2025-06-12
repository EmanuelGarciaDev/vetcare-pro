// Utility functions for appointment booking

export const formatAppointmentDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatTimeRange = (startTime: string, duration: number = 30): string => {
  const start = formatTime12Hour(startTime);
  const [hours, minutes] = startTime.split(':').map(Number);
  const endMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  const end = formatTime12Hour(endTime);
  return `${start} - ${end}`;
};

export const isTimeSlotInPast = (date: string, time: string): boolean => {
  const slotDateTime = new Date(`${date}T${time}`);
  return slotDateTime < new Date();
};

export const getNextAvailableSlot = (slots: Array<{ isAvailable: boolean; time: string }>): string | null => {
  const availableSlot = slots.find(slot => slot.isAvailable);
  return availableSlot ? availableSlot.time : null;
};

interface AppointmentValidationData {
  veterinarianId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  reason?: string;
}

export const validateAppointmentData = (data: AppointmentValidationData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.veterinarianId) errors.push('Please select a veterinarian');
  if (!data.appointmentDate) errors.push('Please select a date');
  if (!data.appointmentTime) errors.push('Please select a time');
  if (!data.reason || typeof data.reason === 'string' && data.reason.trim().length < 3) {
    errors.push('Please provide a reason for your visit (minimum 3 characters)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
