import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { toast } from "sonner";

type Employee = {
  id: string;
  name: string;
};

const employees: Employee[] = [
  { id: "emp-1", name: "山田 太郎" },
  { id: "emp-2", name: "佐藤 花子" },
  { id: "emp-3", name: "田中 翔" },
];

// const OFFICE_COORDINATE = {
//   latitude: 35.6947771,
//   longitude: 139.7000869,
// };

// テスト用: 川井キャンプ場
const OFFICE_COORDINATE = {
  latitude: 35.8115739,
  longitude: 139.162354,
};

// テスト用: 自宅
const HOUSE_COORDINATE = {
  latitude: 35.7066736,
  longitude: 139.6848338,
};

const ALLOWED_RADIUS_METERS = 200;

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

async function requestCheckIn(employee: Employee) {
  // TODO: 実際の API エンドポイントが整備されたら fetch で置き換える
  // const response = await fetch("/api/checkins", { method: "POST", body: JSON.stringify({ employeeId: employee.id }) });
  // if (!response.ok) throw new Error("Failed to register check-in");
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { ok: true as const };
}

export function App() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "allowed" | "out_of_range" | "error"
  >("idle");
  const [distanceFromOffice, setDistanceFromOffice] = useState<number | null>(null);
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId) ?? null,
    [selectedEmployeeId],
  );

  const handleSelectChange = useCallback((value: string) => {
    setSelectedEmployeeId(value);
  }, []);

  const evaluateLocation = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    const distance = getDistanceInMeters(
      latitude,
      longitude,
      OFFICE_COORDINATE.latitude,
      OFFICE_COORDINATE.longitude,
    );
    setDistanceFromOffice(distance);

    if (distance <= ALLOWED_RADIUS_METERS) {
      setLocationStatus("allowed");
      setLocationErrorMessage(null);
      return;
    }

    setLocationStatus("out_of_range");
    setLocationErrorMessage("出勤可能エリア外にいるため、出勤登録できません。");
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("error");
      setLocationErrorMessage("位置情報取得に対応していないブラウザです。");
      setDistanceFromOffice(null);
      return;
    }

    setLocationStatus("loading");
    setDistanceFromOffice(null);
    setLocationErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      evaluateLocation,
      (error) => {
        setLocationStatus("error");
        setDistanceFromOffice(null);
        setLocationErrorMessage(
          error.code === error.PERMISSION_DENIED
            ? "位置情報の利用が許可されていません。ブラウザの設定をご確認ください。"
            : "位置情報の取得に失敗しました。通信状況をご確認のうえ、再度お試しください。",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [evaluateLocation]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handleCheckIn = useCallback(async () => {
    if (!selectedEmployee || isSubmitting || locationStatus !== "allowed") return;

    const now = new Date();
    const timestamp = now.toLocaleString("ja-JP", { hour12: false });

    setIsSubmitting(true);
    try {
      const response = await requestCheckIn(selectedEmployee);
      if (!response.ok) {
        throw new Error("Check-in failed");
      }

      toast.success("出勤登録が完了しました。", {
        description: `${timestamp}`,
      });
    } catch (error) {
      console.error("check-in error", error);
      toast.error("出勤登録に失敗しました。", {
        description: "時間をおいて再度お試しください。",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, locationStatus, selectedEmployee]);

  const isCheckInDisabled =
    !selectedEmployee || isSubmitting || locationStatus !== "allowed";

  return (
    <AppShell
      title="出勤記録"
      primaryAction={null}
    >
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="mt-2">
          <Select
            value={selectedEmployeeId || undefined}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          disabled={isCheckInDisabled}
          onClick={handleCheckIn}
          className={[
            "w-full rounded-full px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            !isCheckInDisabled
              ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-900 focus-visible:outline-slate-900"
              : "cursor-not-allowed bg-slate-200 text-slate-500",
          ].join(" ")}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "送信中..." : "出勤"}
        </Button>

        <div className="space-y-2 rounded-2xl border border-dashed border-slate-200 p-4 text-sm">
          {locationStatus === "loading" && (
            <p className="text-slate-600">位置情報を取得しています...</p>
          )}
          {locationStatus === "allowed" && distanceFromOffice !== null && (
            <p className="text-emerald-600">
              出勤可能エリア内です（目標地点から約
              {Math.round(distanceFromOffice)}
              m）。
            </p>
          )}
          {locationStatus === "out_of_range" && distanceFromOffice !== null && (
            <p className="text-amber-600">
              出勤可能エリア外です（目標地点から約
              {Math.round(distanceFromOffice)}
              m）。現地に移動してから再取得してください。
            </p>
          )}
          {locationStatus === "error" && locationErrorMessage && (
            <p className="text-red-600">{locationErrorMessage}</p>
          )}
          {locationStatus === "allowed" &&
            distanceFromOffice === null &&
            !locationErrorMessage && (
              <p className="text-slate-600">位置情報の取得に成功しました。</p>
            )}

          <Button
            type="button"
            variant="outline"
            onClick={requestLocation}
            disabled={locationStatus === "loading"}
            className="w-full rounded-full"
          >
            {locationStatus === "loading" ? "再取得中..." : "位置情報を再取得"}
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
