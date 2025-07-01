// Role validation utilities for VetCare Pro

export const VALID_ROLES = ['Customer', 'Vet', 'Admin'] as const;
export type ValidRole = typeof VALID_ROLES[number];

/**
 * Validates if a role is one of the standard roles
 */
export function isValidRole(role: string): role is ValidRole {
  return VALID_ROLES.includes(role as ValidRole);
}

/**
 * Standardizes a role string to match our standard format
 */
export function standardizeRole(role: string): ValidRole {
  const normalizedRole = role.trim();
  
  // Handle common variations
  const roleMappings: Record<string, ValidRole> = {
    // Vet variations
    'veterinarian': 'Vet',
    'vet': 'Vet',
    'VET': 'Vet',
    'Veterinarian': 'Vet',
    'doctor': 'Vet',
    'Doctor': 'Vet',
    'clinicmanager': 'Vet',
    'ClinicManager': 'Vet',
    'manager': 'Vet',
    'Manager': 'Vet',
    
    // Customer variations
    'customer': 'Customer',
    'CUSTOMER': 'Customer',
    'user': 'Customer',
    'User': 'Customer',
    'client': 'Customer',
    'Client': 'Customer',
    
    // Admin variations
    'admin': 'Admin',
    'ADMIN': 'Admin',
    'administrator': 'Admin',
    'Administrator': 'Admin',
    'superuser': 'Admin',
    'SuperUser': 'Admin'
  };

  // Return mapped role or default to original if already valid
  return roleMappings[normalizedRole] || 
         (isValidRole(normalizedRole) ? normalizedRole as ValidRole : 'Customer');
}

/**
 * Validates user role and throws error if invalid
 */
export function validateUserRole(role: string): ValidRole {
  if (!role || typeof role !== 'string') {
    throw new Error('Role is required and must be a string');
  }

  const standardized = standardizeRole(role);
  
  if (!isValidRole(standardized)) {
    throw new Error(`Invalid role: ${role}. Must be one of: ${VALID_ROLES.join(', ')}`);
  }

  return standardized;
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(role: string): boolean {
  return standardizeRole(role) === 'Admin';
}

/**
 * Check if user is a veterinarian
 */
export function isVet(role: string): boolean {
  return standardizeRole(role) === 'Vet';
}

/**
 * Check if user is a customer
 */
export function isCustomer(role: string): boolean {
  return standardizeRole(role) === 'Customer';
}

/**
 * Get role display name with proper formatting
 */
export function getRoleDisplayName(role: string): string {
  const standardized = standardizeRole(role);
  
  const displayNames: Record<ValidRole, string> = {
    'Admin': 'Administrator',
    'Vet': 'Veterinarian',
    'Customer': 'Customer'
  };

  return displayNames[standardized] || standardized;
}

/**
 * Get role permissions
 */
export function getRolePermissions(role: string): {
  canViewAdmin: boolean;
  canManageUsers: boolean;
  canManageVets: boolean;
  canManageAppointments: boolean;
  canViewReports: boolean;
  canManageSystem: boolean;
} {
  const standardized = standardizeRole(role);

  switch (standardized) {
    case 'Admin':
      return {
        canViewAdmin: true,
        canManageUsers: true,
        canManageVets: true,
        canManageAppointments: true,
        canViewReports: true,
        canManageSystem: true
      };
    
    case 'Vet':
      return {
        canViewAdmin: false,
        canManageUsers: false,
        canManageVets: false,
        canManageAppointments: true,
        canViewReports: true,
        canManageSystem: false
      };
    
    case 'Customer':
    default:
      return {
        canViewAdmin: false,
        canManageUsers: false,
        canManageVets: false,
        canManageAppointments: false,
        canViewReports: false,
        canManageSystem: false
      };
  }
}
