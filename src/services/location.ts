import * as Location from "expo-location";

export type LocationResult =
  | { status: "ok"; lat: number; lon: number }
  | { status: "denied"; canAskAgain: boolean }
  | { status: "unavailable" };

// Trust boundary: a sensor value is checked before it is stored.
function isCoordinate(value: number, limit: number) {
  return Number.isFinite(value) && Math.abs(value) <= limit;
}

// Foreground only, balanced accuracy: a task is tagged once, at creation, not tracked.
export async function getCurrentLocation(): Promise<LocationResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return { status: "denied", canAskAgain: permission.canAskAgain };

    const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    if (!isCoordinate(coords.latitude, 90) || !isCoordinate(coords.longitude, 180)) {
      return { status: "unavailable" };
    }
    return { status: "ok", lat: coords.latitude, lon: coords.longitude };
  } catch {
    // Services turned off, no fix, or a native error: the task is saved without a place.
    return { status: "unavailable" };
  }
}

// Turns coordinates into "Ciudad, Región". Best effort: undefined means show the coordinates instead.
export async function describePlace(lat: number, lon: number): Promise<string | undefined> {
  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    const name = [address?.city ?? address?.district ?? address?.subregion, address?.region].filter(Boolean).join(", ");
    return name || undefined;
  } catch {
    return undefined;
  }
}
