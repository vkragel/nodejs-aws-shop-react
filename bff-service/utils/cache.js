export function getCachedData(cache, key) {
  const cachedData = cache.get(key);
  if (cachedData) {
    return { data: cachedData, hit: true };
  }
  return { data: null, hit: false };
}

export function setCacheData(cache, key, data) {
  cache.set(key, data);
}
