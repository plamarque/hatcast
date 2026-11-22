/** Keep the success state visible on the auth page before navigating. */
export async function showAuthSuccess(showSuccess: () => void): Promise<void> {
  showSuccess()
  await new Promise<void>((resolve) => setTimeout(resolve, 1000))
}
