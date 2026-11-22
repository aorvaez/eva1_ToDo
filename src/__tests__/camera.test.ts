import * as ImagePicker from "expo-image-picker";

import { takePhoto } from "@/services/camera";

// Camera and file copy are native: the tests replace them and check our decisions only.
jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

const mockCopy = jest.fn(() => Promise.resolve());
jest.mock("expo-file-system", () => ({
  File: class {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = parts.map((p) => (typeof p === "string" ? p : (p as { uri: string }).uri)).join("/");
    }
    copy = mockCopy;
  },
  Paths: { document: { uri: "file:///docs" } },
}));

const permission = ImagePicker.requestCameraPermissionsAsync as jest.Mock;
const launch = ImagePicker.launchCameraAsync as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("takePhoto", () => {
  it("returns the photo copied into the app's documents folder", async () => {
    permission.mockResolvedValue({ granted: true, status: "granted", canAskAgain: true });
    launch.mockResolvedValue({ canceled: false, assets: [{ uri: "file:///cache/foto.jpg" }] });

    const result = await takePhoto();

    expect(result.status).toBe("ok");
    if (result.status === "ok") expect(result.uri).toMatch(/^file:\/\/\/docs\/.+\.jpg$/);
    expect(mockCopy).toHaveBeenCalledTimes(1);
  });

  it("reports denied without opening the camera", async () => {
    permission.mockResolvedValue({ granted: false, status: "denied", canAskAgain: false });

    expect(await takePhoto()).toEqual({ status: "denied", canAskAgain: false });
    expect(launch).not.toHaveBeenCalled();
  });

  it("reports cancelled when the person leaves the camera", async () => {
    permission.mockResolvedValue({ granted: true, status: "granted", canAskAgain: true });
    launch.mockResolvedValue({ canceled: true, assets: null });

    expect(await takePhoto()).toEqual({ status: "cancelled" });
    expect(mockCopy).not.toHaveBeenCalled();
  });
});
