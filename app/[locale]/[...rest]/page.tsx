import { notFound } from 'next/navigation';

/**
 * Every address under a language that no page claims.
 *
 * Without this, Next answers such an address with a "not found" page it built
 * ahead of time. That page was made before any request existed, so its scripts
 * carry no nonce — and the Content-Security-Policy (proxy.ts) blocks every one
 * of them: a mistyped link would fill the console, and any report endpoint,
 * with violations that are not attacks. Catching the address here makes the
 * same 404 be rendered for the request, with the nonce like any other page.
 */
export default function UnknownPage() {
  notFound();
}
