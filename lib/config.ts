/**
 * Where the API lives — decided once, for the whole site.
 *
 * The packages list, the doctor-join form and the legal texts all come from
 * it, and proxy.ts names the same address in the Content-Security-Policy: the
 * one place the browser is allowed to send the form is the one place it is
 * sent. Imports nothing, so the proxy can read it too.
 *
 * Compiled in at build time. Development falls back to the port sinan-api
 * listens on locally; a production build has no fallback — next.config.ts
 * refuses to build without an https address — so the empty string below is
 * never what ships.
 */
export const PRODUCTION = process.env.NODE_ENV === 'production';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || (PRODUCTION ? '' : 'http://localhost:3300')).replace(/\/+$/, '');
