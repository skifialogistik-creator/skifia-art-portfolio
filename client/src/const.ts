export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Cloudflare Access enforces authentication at the protected owner route.
 * Keeping this helper preserves the existing UI call sites without retaining
 * a dependency on the former Manus OAuth portal.
 */
export const startLogin = () => {
  window.location.assign("/studio-control");
};
