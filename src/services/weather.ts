export type Weather = { tempC: number; code: number };

const TIMEOUT_MS = 8000;

// Trust boundary: the network answer is checked field by field before it is used.
function isCurrent(value: unknown): value is { temperature_2m: number; weather_code: number } {
  if (typeof value !== "object" || value === null) return false;
  const current = value as Record<string, unknown>;
  return typeof current.temperature_2m === "number" && typeof current.weather_code === "number";
}

// Open-Meteo needs no key. Best effort: any failure returns undefined and the task is saved without weather.
export async function fetchWeather(lat: number, lon: number): Promise<Weather | undefined> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return undefined;
    const data: unknown = await response.json();
    const current = typeof data === "object" && data !== null ? (data as { current?: unknown }).current : undefined;
    if (!isCurrent(current)) return undefined;
    return { tempC: current.temperature_2m, code: current.weather_code };
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

// Short Spanish labels for the WMO weather codes Open-Meteo returns.
export function describeWeather(code: number): string {
  if (code === 0) return "Despejado";
  if (code <= 2) return "Poco nublado";
  if (code === 3) return "Nublado";
  if (code === 45 || code === 48) return "Niebla";
  if (code >= 51 && code <= 67) return "Lluvia";
  if (code >= 71 && code <= 77) return "Nieve";
  if (code >= 80 && code <= 82) return "Chubascos";
  if (code >= 85 && code <= 86) return "Nieve";
  if (code >= 95 && code <= 99) return "Tormenta";
  return "Clima variable";
}
