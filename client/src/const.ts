export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Start the Cloudflare Access login flow and return to the protected owner route.
 * The Access application is configured for `studio-control*`, so the managed
 * `/cdn-cgi/access/login` endpoint can issue the CF_Authorization cookie before
 * the SPA loads the admin panel.
 */
export const startLogin = () => {
  const returnTo = `${window.location.origin}/studio-control`;
  const loginUrl = `/cdn-cgi/access/login?redirect_url=${encodeURIComponent(returnTo)}`;
  window.location.assign(loginUrl);
};
