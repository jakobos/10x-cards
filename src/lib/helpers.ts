/**
 * Formats a date string to Polish locale format (DD.MM.YYYY, HH:MM)
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Error message if validation fails, null if password is valid
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Hasło musi mieć minimum 8 znaków";
  }
  if (!/[A-Z]/.test(password)) {
    return "Hasło musi zawierać co najmniej jedną wielką literę";
  }
  if (!/[0-9]/.test(password)) {
    return "Hasło musi zawierać co najmniej jedną cyfrę";
  }
  return null;
}
