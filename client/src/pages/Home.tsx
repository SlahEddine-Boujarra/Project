import Calendar from "@/components/Calendar";

/**
 * Work Scheduler App - Calendar-based task management
 * Features: Monthly calendar view, add/edit/delete tasks, local storage persistence
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Calendar />
    </div>
  );
}
