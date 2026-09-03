export function toWebSocketUrl(url) {
  return url.replace(/^http/, 'ws');
}