/** Compare the browser origin to the actual Host header, including local preview aliases. */
export function isSameOrigin(request: Request) {
  try {
    const origin = new URL(request.headers.get('origin') ?? '');
    const target = new URL(request.url);
    const host = request.headers.get('host') ?? target.host;
    return (
      origin.host === host &&
      origin.protocol === target.protocol &&
      ['http:', 'https:'].includes(origin.protocol)
    );
  } catch {
    return false;
  }
}
