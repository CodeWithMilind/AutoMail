import { Header } from "@/components/dashboard/header"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { calendarEvents } from "@/lib/mock-data"

export default function CalendarPage() {
  return (
    <div className="flex flex-col">
      <Header title="Calendar" />
      <div className="flex-1 p-6">
        <CalendarView events={calendarEvents} />
      </div>
    </div>
  )
}
