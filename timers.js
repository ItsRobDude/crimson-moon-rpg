const scheduledTimeouts = new Set();

export function scheduleTrackedTimeout(callback, delay = 0, ...args) {
  let handle = null;
  const wrappedCallback = (...callbackArgs) => {
    scheduledTimeouts.delete(handle);
    callback(...callbackArgs);
  };

  handle = globalThis.setTimeout(wrappedCallback, delay, ...args);
  scheduledTimeouts.add(handle);
  return handle;
}

export function clearTrackedTimeout(handle) {
  if (handle == null) {
    return;
  }
  globalThis.clearTimeout(handle);
  scheduledTimeouts.delete(handle);
}

export function clearAllScheduledTimeouts() {
  for (const handle of scheduledTimeouts) {
    globalThis.clearTimeout(handle);
  }
  scheduledTimeouts.clear();
}
