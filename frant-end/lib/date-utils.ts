/**
 * Utilitaires pour la gestion des dates
 * Évite les problèmes de fuseaux horaires avec toISOString()
 */

/**
 * Formate une date en string YYYY-MM-DD sans problème de fuseau horaire
 * @param date - La date à formater
 * @returns String au format YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth()+ 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Obtient la date actuelle formatée en YYYY-MM-DD
 * @returns String au format YYYY-MM-DD
 */
export function getCurrentDateKey(): string {
  return formatDateKey(new Date())
}

/**
 * Ajoute un nombre de jours à une date
 * @param date - Date de base
 * @param days - Nombre de jours à ajouter
 * @returns Nouvelle date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Obtient une date future formatée en YYYY-MM-DD
 * @param days - Nombre de jours dans le futur
 * @returns String au format YYYY-MM-DD
 */
export function getFutureDateKey(days: number): string {
  const futureDate = addDays(new Date(), days)
  return formatDateKey(futureDate)
}

/**
 * Parse une string de date YYYY-MM-DD en objet Date local
 * @param dateString - String au format YYYY-MM-DD
 * @returns Objet Date
 */
export function parseDateKey(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month - 1 car getMonth() retourne 0-11
}

/**
 * Vérifie si deux dates sont le même jour
 * @param date1 - Première date
 * @param date2 - Deuxième date
 * @returns true si c'est le même jour
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString()
}
