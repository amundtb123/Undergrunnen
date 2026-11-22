import type { GameErrorCode } from './types.ts'

export const ERROR_MESSAGES: Record<GameErrorCode, string> = {
  GAME_NOT_ACTIVE: 'Spillet er over.',
  EVENT_PENDING: 'Du må håndtere situasjonen først.',
  NO_EVENT: 'Ingenting å svare på.',
  INVALID_CHOICE: 'Ugyldig valg.',
  INVALID_QUANTITY: 'Ugyldig antall.',
  INVALID_AMOUNT: 'Ugyldig beløp.',
  ITEM_NOT_AVAILABLE: 'Ingen handler den varen her i dag.',
  INSUFFICIENT_FUNDS: 'Du har ikke nok kontanter.',
  INSUFFICIENT_CAPACITY: 'Ikke nok plass på lageret.',
  INSUFFICIENT_INVENTORY: 'Du har ikke så mange.',
  UNKNOWN_CITY: 'Ukjent by.',
  ALREADY_THERE: 'Du er allerede her.',
  NOT_ENOUGH_DAYS: 'Du rekker ikke frem før tiden er ute.',
  NO_BANK_HERE: 'Banken og Kjell holder til i Hamar.',
  CREDIT_LIMIT: 'Kjell låner ikke ut mer til deg.',
}
