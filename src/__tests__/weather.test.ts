import { describeWeather, fetchWeather } from "@/services/weather";

const fetchMock = jest.spyOn(globalThis, "fetch");

function jsonResponse(body: unknown, ok = true) {
  return Promise.resolve({ ok, json: () => Promise.resolve(body) } as Response);
}

beforeEach(() => fetchMock.mockReset());

describe("fetchWeather", () => {
  it("asks Open-Meteo for the current conditions at the place", async () => {
    fetchMock.mockReturnValue(jsonResponse({ current: { temperature_2m: 18.4, weather_code: 0 } }));

    await fetchWeather(-33.4489, -70.6693);

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toMatch(/^https:\/\/api\.open-meteo\.com\//);
    expect(url).toContain("latitude=-33.4489&longitude=-70.6693");
    expect(url).toContain("current=temperature_2m,weather_code");
  });

  it("returns the temperature and weather code", async () => {
    fetchMock.mockReturnValue(jsonResponse({ current: { temperature_2m: 18.4, weather_code: 3 } }));
    expect(await fetchWeather(0, 0)).toEqual({ tempC: 18.4, code: 3 });
  });

  it("returns undefined on an HTTP error", async () => {
    fetchMock.mockReturnValue(jsonResponse({}, false));
    expect(await fetchWeather(0, 0)).toBeUndefined();
  });

  it("drops a response whose fields are not numbers", async () => {
    fetchMock.mockReturnValue(jsonResponse({ current: { temperature_2m: "18", weather_code: 0 } }));
    expect(await fetchWeather(0, 0)).toBeUndefined();
  });

  it("returns undefined when the network fails", async () => {
    fetchMock.mockReturnValue(Promise.reject(new Error("sin red")));
    expect(await fetchWeather(0, 0)).toBeUndefined();
  });
});

describe("describeWeather", () => {
  it("turns WMO codes into short Spanish labels", () => {
    expect(describeWeather(0)).toBe("Despejado");
    expect(describeWeather(3)).toBe("Nublado");
    expect(describeWeather(63)).toBe("Lluvia");
    expect(describeWeather(95)).toBe("Tormenta");
    expect(describeWeather(999)).toBe("Clima variable");
  });
});
