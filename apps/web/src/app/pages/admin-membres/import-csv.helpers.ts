import type {
  MemberImportErrorCode,
  MemberImportRowOutcome,
  UserImportRowOutcome,
} from '../../core/troupes/troupe-api.service'

export function importOutcomeLabel(
  outcome: MemberImportRowOutcome | UserImportRowOutcome,
): string {
  switch (outcome) {
    case 'SUCCESS':
      return 'Succès'
    case 'SKIPPED':
      return 'Ignorée'
    case 'ERROR':
      return 'Erreur'
  }
}

export function importErrorLabel(code: MemberImportErrorCode | null): string {
  switch (code) {
    case 'USER_NOT_FOUND':
      return "Utilisateur non importé — importez d'abord le CSV utilisateurs."
    case 'INVALID_EMAIL':
      return 'Email invalide.'
    case 'LAST_ADMIN_VIOLATION':
      return 'Dernier administrateur actif.'
    default:
      return ''
  }
}
