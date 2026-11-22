import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system";

export type PhotoResult =
  | { status: "ok"; uri: string }
  | { status: "denied"; canAskAgain: boolean }
  | { status: "cancelled" };

// The picker writes to the cache, which the system may clear, so the photo is copied to documents.
export async function takePhoto(): Promise<PhotoResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return { status: "denied", canAskAgain: permission.canAskAgain };

  const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
  if (result.canceled) return { status: "cancelled" };

  const target = new File(Paths.document, `${Date.now()}.jpg`);
  await new File(result.assets[0].uri).copy(target);
  return { status: "ok", uri: target.uri };
}
