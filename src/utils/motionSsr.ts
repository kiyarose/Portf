/** Framer Motion props that stay visible in SSR HTML until the client hydrates. */
export function motionEntrance(
  hydrated: boolean,
  prefersReducedMotion: boolean | null,
  animatedInitial: false | Record<string, number> | string,
): false | Record<string, number> | string {
  if (!hydrated || prefersReducedMotion) {
    return false;
  }
  return animatedInitial;
}
