import * as Location from "expo-location";

import { describePlace, getCurrentLocation } from "@/services/location";

// The GPS is native: the tests replace it and check what the app does with its answers.
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

const permission = Location.requestForegroundPermissionsAsync as jest.Mock;
const position = Location.getCurrentPositionAsync as jest.Mock;
const geocode = Location.reverseGeocodeAsync as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("describePlace", () => {
  it("names the city and region", async () => {
    geocode.mockResolvedValue([{ city: "Santiago", region: "Metropolitana", district: null, subregion: null }]);
    expect(await describePlace(-33.4489, -70.6693)).toBe("Santiago, Metropolitana");
  });

  it("returns undefined when there is no address", async () => {
    geocode.mockResolvedValue([]);
    expect(await describePlace(0, 0)).toBeUndefined();
  });

  it("returns undefined when the lookup fails", async () => {
    geocode.mockRejectedValue(new Error("sin red"));
    expect(await describePlace(0, 0)).toBeUndefined();
  });
});

describe("getCurrentLocation", () => {
  it("returns the latitude and longitude of the fix", async () => {
    permission.mockResolvedValue({ granted: true, status: "granted", canAskAgain: true });
    position.mockResolvedValue({ coords: { latitude: -33.4489, longitude: -70.6693 } });

    expect(await getCurrentLocation()).toEqual({ status: "ok", lat: -33.4489, lon: -70.6693 });
  });

  it("reports denied without asking the GPS for a position", async () => {
    permission.mockResolvedValue({ granted: false, status: "denied", canAskAgain: false });

    expect(await getCurrentLocation()).toEqual({ status: "denied", canAskAgain: false });
    expect(position).not.toHaveBeenCalled();
  });

  it("reports unavailable when the GPS cannot give a position", async () => {
    permission.mockResolvedValue({ granted: true, status: "granted", canAskAgain: true });
    position.mockRejectedValue(new Error("location services off"));

    expect(await getCurrentLocation()).toEqual({ status: "unavailable" });
  });

  it("rejects coordinates outside the valid range", async () => {
    permission.mockResolvedValue({ granted: true, status: "granted", canAskAgain: true });
    position.mockResolvedValue({ coords: { latitude: 123, longitude: -70 } });

    expect(await getCurrentLocation()).toEqual({ status: "unavailable" });
  });
});
