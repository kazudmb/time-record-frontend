import { AppShell } from "./components/layout/AppShell";
import { CheckInPage } from "./pages/CheckInPage";

export function App() {
  return (
    <AppShell
      title="出勤記録"
      primaryAction={null}
    >
      <CheckInPage />
    </AppShell>
  );
}
