/** localStorage — epoch ms when user dismissed the push opt-in dialog. */
export const PUSH_OPT_IN_PROMPT_DISMISSED_KEY = 'hatcast-push-opt-in-prompt-dismissed';

/** Cooldown after « Plus tard » / backdrop dismiss on the post-install trigger (AC5). */
export const PUSH_OPT_IN_PROMPT_DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** sessionStorage — set on `appinstalled`; consumed when prompt is shown or dismissed. */
export const PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY = 'hatcast-push-opt-in-after-install';

/**
 * localStorage `'1'` after the first standalone-mode offer (AC3 — once per browser profile).
 * Standalone trigger does not re-prompt after dismiss; post-install may re-fire via `AFTER_INSTALL_KEY`.
 */
export const PUSH_OPT_IN_PROMPT_STANDALONE_SEEN_KEY = 'hatcast-push-opt-in-standalone-offered';

/** Minimum delay after install before showing the opt-in dialog (AC2). */
export const PUSH_OPT_IN_PROMPT_AFTER_INSTALL_DELAY_MS = 1_000;
