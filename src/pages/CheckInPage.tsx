import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useCheckInLocation } from "../hooks/useCheckInLocation";

type Employee = {
  id: string;
  name: string;
};

const employees: Employee[] = [
  { id: "emp-1", name: "山田 太郎" },
  { id: "emp-2", name: "佐藤 花子" },
  { id: "emp-3", name: "田中 翔" },
];

async function requestCheckIn(employee: Employee) {
  // TODO: 実際の API エンドポイントが整備されたら fetch で置き換える
  // const response = await fetch("/api/checkins", { method: "POST", body: JSON.stringify({ employeeId: employee.id }) });
  // if (!response.ok) throw new Error("Failed to register check-in");
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { ok: true as const };
}

export function CheckInPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { requestLocation } = useCheckInLocation();

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId) ?? null,
    [selectedEmployeeId],
  );

  const handleSelectChange = useCallback((value: string) => {
    setSelectedEmployeeId(value);
  }, []);

  const handleCheckIn = useCallback(async () => {
    if (!selectedEmployee || isSubmitting) return;

    const locationResult = await requestLocation();
    if (locationResult.kind === "error") {
      toast.error(locationResult.message);
      return;
    }

    if (locationResult.kind === "out_of_range") {
      toast.error("出勤可能エリア外です。", {
        description: `目標地点から約${Math.round(locationResult.distance)}m離れています。`,
      });
      return;
    }

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
  }, [isSubmitting, requestLocation, selectedEmployee]);

  const isCheckInDisabled = !selectedEmployee || isSubmitting;

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5 backdrop-blur">
      <div className="mt-2">
        <Select value={selectedEmployeeId || undefined} onValueChange={handleSelectChange}>
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
    </section>
  );
}
