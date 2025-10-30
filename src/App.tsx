import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "./components/layout/AppShell";

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

export function App() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId) ?? null,
    [selectedEmployeeId],
  );

  const handleSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmployeeId(event.target.value);
  }, []);

  const handleCheckIn = useCallback(async () => {
    if (!selectedEmployee || isSubmitting) return;

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
  }, [isSubmitting, selectedEmployee]);

  return (
    <AppShell
      title="出勤記録"
      primaryAction={null}
    >
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div>
          <select
            id="employee"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            value={selectedEmployeeId}
            onChange={handleSelectChange}
          >
            <option value="">選択してください</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!selectedEmployee || isSubmitting}
          onClick={handleCheckIn}
          className={[
            "w-full rounded-full px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            selectedEmployee && !isSubmitting
              ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-900 focus-visible:outline-slate-900"
              : "cursor-not-allowed bg-slate-200 text-slate-500",
          ].join(" ")}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "送信中..." : "出勤"}
        </button>
      </section>
    </AppShell>
  );
}
