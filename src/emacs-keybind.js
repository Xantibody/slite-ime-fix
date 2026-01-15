// Emacs Keybind - Core Logic

const KEY_MAP = {
  f: "ArrowRight",
  b: "ArrowLeft",
  n: "ArrowDown",
  p: "ArrowUp",
  a: "Home",
  e: "End",
};

export function shouldIntercept(event, enabled) {
  if (!enabled) return false;
  if (!event.ctrlKey) return false;
  if (event.altKey || event.metaKey) return false;

  return event.key in KEY_MAP;
}

export function mapToKey(key) {
  return KEY_MAP[key] ?? null;
}
