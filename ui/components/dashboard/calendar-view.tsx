"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Video, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns"

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  duration: string
  type: "meeting" | "call"
  attendees: string[]
}

interface CalendarViewProps {
  events: CalendarEvent[]
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.date), date))
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendar Grid */}
      <Card className="bg-card border-border shadow-sm lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight">
            {format(currentDate, "MMMM yyyy")}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week day headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const today = isToday(day)

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative flex h-20 flex-col items-start rounded-lg border border-transparent p-2 text-left transition-all duration-150 hover:bg-muted/50 hover:border-border",
                    !isCurrentMonth && "opacity-40",
                    isSelected && "border-primary bg-primary/5 hover:bg-primary/10",
                    today && !isSelected && "border-primary/50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-sm",
                      today && "bg-primary text-primary-foreground",
                      isSelected && !today && "font-semibold text-primary"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            event.type === "meeting" ? "bg-primary" : "bg-success"
                          )}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{dayEvents.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Events */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">
            {selectedDate
              ? format(selectedDate, "EEEE, MMMM d")
              : "Select a day"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedDateEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No events scheduled for this day.
            </p>
          ) : (
            selectedDateEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-foreground">{event.title}</h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      event.type === "meeting"
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-success/20 text-success border-success/30"
                    )}
                  >
                    {event.type === "meeting" ? (
                      <Users className="mr-1 h-3 w-3" />
                    ) : (
                      <Video className="mr-1 h-3 w-3" />
                    )}
                    {event.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {event.time}
                  </span>
                  <span>{event.duration}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {event.attendees.map((attendee, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {attendee}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
