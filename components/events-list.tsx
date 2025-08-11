import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"

// Mock events data
const events = [
  {
    id: 1,
    title: "AR Hub Virtual Meetup",
    date: "May 15, 2023",
    time: "7:00 PM - 9:00 PM",
    location: "Online",
    attendees: 120,
    type: "Virtual",
  },
  {
    id: 2,
    title: "AR Development Workshop",
    date: "May 22, 2023",
    time: "10:00 AM - 4:00 PM",
    location: "San Francisco, CA",
    attendees: 45,
    type: "In-Person",
  },
  {
    id: 3,
    title: "OpenCV for AR Webinar",
    date: "June 5, 2023",
    time: "1:00 PM - 3:00 PM",
    location: "Online",
    attendees: 250,
    type: "Virtual",
  },
]

export default function EventsList() {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Link href={`/community/events/${event.id}`} key={event.id}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{event.title}</h4>
                <Badge variant={event.type === "Virtual" ? "outline" : "default"}>{event.type}</Badge>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {event.date}, {event.time}
                  </span>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.attendees} attendees</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
