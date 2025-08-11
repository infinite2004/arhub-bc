import { Card, CardContent } from "@/components/ui/card"
import { Users, MessageSquare, FileCode, Calendar } from "lucide-react"

export default function CommunityStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6 flex items-center">
          <Users className="h-10 w-10 text-blue-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Members</p>
            <p className="text-2xl font-bold">12,500+</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center">
          <MessageSquare className="h-10 w-10 text-purple-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Forum Posts</p>
            <p className="text-2xl font-bold">45,200+</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center">
          <FileCode className="h-10 w-10 text-green-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Projects</p>
            <p className="text-2xl font-bold">3,800+</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center">
          <Calendar className="h-10 w-10 text-orange-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Events</p>
            <p className="text-2xl font-bold">120+</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
