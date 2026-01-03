import { AppShell } from "@/components/layout/AppShell";
import PersonsPage from "@/features/persons/PersonsPage";

export default function App() {
  return (
    <AppShell>
      <PersonsPage />
    </AppShell>
  );
}
