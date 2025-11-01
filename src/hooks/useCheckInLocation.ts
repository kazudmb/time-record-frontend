import { useCallback, useEffect, useState } from "react";

export type LocationStatus = "idle" | "loading" | "allowed" | "out_of_range" | "error";

export type LocationRequestResult =
  | { kind: "allowed"; distance: number }
  | { kind: "out_of_range"; distance: number }
  | { kind: "error"; message: string };

export const OFFICE_COORDINATE = {
  latitude: 35.8115739,
  longitude: 139.162354,
};

export const ALLOWED_RADIUS_METERS = 200;

// NOTE: 開発環境で位置情報が取得できない場合の一時的なモック設定
// const USE_MOCK_LOCATION = false; // ← 本番運用はこちらを使用
const USE_MOCK_LOCATION = true;

function getDistanceInMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371e3;

  const deltaLat = toRadians(latitudeB - latitudeA);
  const deltaLon = toRadians(longitudeB - longitudeA);
  const lat1 = toRadians(latitudeA);
  const lat2 = toRadians(latitudeB);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

export function useCheckInLocation() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [distanceFromOffice, setDistanceFromOffice] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const evaluateLocation = useCallback((position: GeolocationPosition): LocationRequestResult => {
    const { latitude, longitude } = position.coords;
    const distance = getDistanceInMeters(
      latitude,
      longitude,
      OFFICE_COORDINATE.latitude,
      OFFICE_COORDINATE.longitude,
    );
    setDistanceFromOffice(distance);

    if (distance <= ALLOWED_RADIUS_METERS) {
      setStatus("allowed");
      setErrorMessage(null);
      return { kind: "allowed", distance };
    }

    setStatus("out_of_range");
    setErrorMessage("出勤可能エリア外にいるため、出勤登録できません。");
    return { kind: "out_of_range", distance };
  }, []);

  const requestLocation = useCallback(async (): Promise<LocationRequestResult> => {
    // NOTE: 開発環境で位置情報が取得できない場合の一時的なモック設定
    if (USE_MOCK_LOCATION) {
      setStatus("allowed");
      setErrorMessage(null);
      setDistanceFromOffice(0);
      return { kind: "allowed", distance: 0 };
    }
    // NOTE: 開発環境で位置情報が取得できない場合の一時的なモック設定

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      const message = "位置情報取得に対応していないブラウザです。";
      setStatus("error");
      setErrorMessage(message);
      setDistanceFromOffice(null);
      return { kind: "error", message };
    }

    setStatus("loading");
    setDistanceFromOffice(null);
    setErrorMessage(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      return evaluateLocation(position);
    } catch (error) {
      const geolocationError = error as GeolocationPositionError;
      const permissionDeniedCode =
        typeof geolocationError?.PERMISSION_DENIED === "number"
          ? geolocationError.PERMISSION_DENIED
          : 1;

      const message =
        geolocationError?.code === permissionDeniedCode
          ? "位置情報の利用が許可されていません。ブラウザの設定をご確認ください。"
          : "位置情報の取得に失敗しました。通信状況をご確認のうえ、再度お試しください。";

      setStatus("error");
      setDistanceFromOffice(null);
      setErrorMessage(message);

      return { kind: "error", message };
    }
  }, [evaluateLocation]);

  useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  return {
    status,
    distanceFromOffice,
    errorMessage,
    requestLocation,
  };
}
