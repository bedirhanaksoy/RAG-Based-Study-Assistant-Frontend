let cachedApiUrl = "http://192.168.1.101:8000";

export async function getApiUrl() {
  return cachedApiUrl;
}

let cachedConfig = {
  apiUrl: cachedApiUrl,
  dbStatus: "online"
};

export async function getConfig() {
  return cachedConfig;
}

export function resetConfig() {
  return;
}
