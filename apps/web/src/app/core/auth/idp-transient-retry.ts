/** Total attempts for signup IdP exchange (initial + 2 retries). */
export const IDP_SIGNUP_RETRY_MAX_ATTEMPTS = 3

/** Exponential backoff delays (ms) between retry attempts after failures 1 and 2. */
export const IDP_SIGNUP_RETRY_BACKOFF_MS: readonly number[] = [300, 900]

export function isTransientIdpFailure(status: number): boolean {
  return status === 0 || status === 500 || status === 503
}

export function delayMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
