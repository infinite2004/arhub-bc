import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Users, Calendar, ArrowRight, ThumbsUp, MessageCircle, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import CommunityStats from "@/components/community-stats"
import ForumPreview from "@/components/forum-preview"
import EventsList from "@/components/events-list"

export default function CommunityPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">AR Hub Community</h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect with AR developers, share your projects, and learn from others.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <MessageSquare className="h-8 w-8 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Forums</h3>
              <p className="mb-4">Join discussions about AR development, OpenCV, and more.</p>
              <Link href="/community/forums">
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Browse Forums
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <Users className="h-8 w-8 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Members</h3>
              <p className="mb-4">Connect with AR developers from around the world.</p>
              <Link href="/community/members">
                <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                  Find Members
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <Calendar className="h-8 w-8 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Events</h3>
              <p className="mb-4">Attend virtual and in-person AR development events.</p>
              <Link href="/community/events">
                <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                  View Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <CommunityStats />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recent Discussions</h2>
              <Link href="/community/forums">
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <ForumPreview />
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Featured Community Projects</h2>
              <Link href="/projects?filter=community">
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/projects/7">
                <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src="/placeholder.svg?height=200&width=350"
                      alt="AR Navigation Project"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-2">AR Indoor Navigation</h3>
                    <p className="text-gray-600 mb-4">
                      A community-built indoor navigation system using AR markers and OpenCV.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Navigation
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Community
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        OpenCV
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">By ARCommunity</p>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      245
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      32
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      1.2k
                    </div>
                  </CardFooter>
                </Card>
              </Link>

              <Link href="/projects/8">
                <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src="/placeholder.svg?height=200&width=350"
                      alt="AR Education Tool"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-2">AR Chemistry Lab</h3>
                    <p className="text-gray-600 mb-4">
                      An educational AR tool for visualizing chemical reactions and molecular structures.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Education
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Chemistry
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Community
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">By EduTech</p>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      189
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      24
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      876
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Featured Members</h2>
              <Link href="/community/members">
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="ARDeveloper" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">ARDeveloper</h3>
                  <p className="text-gray-500 mb-2">AR Engineer</p>
                  <div className="flex justify-center gap-2 mb-4">
                    <Badge variant="outline">Face Tracking</Badge>
                    <Badge variant="outline">OpenCV</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Created 12 projects • Member for 2 years</p>
                </CardContent>
                <CardFooter className="justify-center">
                  <Link href="/community/members/ardeveloper">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="TechCreator" />
                    <AvatarFallback>TC</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">TechCreator</h3>
                  <p className="text-gray-500 mb-2">AR Researcher</p>
                  <div className="flex justify-center gap-2 mb-4">
                    <Badge variant="outline">Object Recognition</Badge>
                    <Badge variant="outline">SLAM</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Created 8 projects • Member for 1 year</p>
                </CardContent>
                <CardFooter className="justify-center">
                  <Link href="/community/members/techcreator">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="ARInnovator" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">ARInnovator</h3>
                  <p className="text-gray-500 mb-2">AR Designer</p>
                  <div className="flex justify-center gap-2 mb-4">
                    <Badge variant="outline">3D Models</Badge>
                    <Badge variant="outline">UI/UX</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Created 15 projects • Member for 3 years</p>
                </CardContent>
                <CardFooter className="justify-center">
                  <Link href="/community/members/arinnovator">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">Join Our Community</h3>
              <p className="mb-6">Connect with AR developers, share your projects, and get help from experts.</p>
              <Link href="/register">
                <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">Sign Up Now</Button>
              </Link>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
            <EventsList />
            <div className="mt-4 text-center">
              <Link href="/community/events">
                <Button variant="outline" size="sm">
                  View All Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Community Resources</h3>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li>
                    <Link href="/docs/tutorials" className="text-blue-600 hover:underline flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      AR Development Tutorials
                    </Link>
                  </li>
                  <li>
                    <Link href="/community/showcase" className="text-blue-600 hover:underline flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Community Showcase
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/faq" className="text-blue-600 hover:underline flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Frequently Asked Questions
                    </Link>
                  </li>
                  <li>
                    <Link href="/community/guidelines" className="text-blue-600 hover:underline flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Community Guidelines
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/api" className="text-blue-600 hover:underline flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      API Documentation
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Join Our Discord</h3>
            <Card className="bg-[#5865F2] text-white">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto mb-2"
                  >
                    <circle cx="9" cy="12" r="1" />
                    <circle cx="15" cy="12" r="1" />
                    <path d="M7.5 7.5c3.5-1 5.5-1 9 0" />
                    <path d="M7 16.5c3.5 1 6.5 1 10 0" />
                    <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5" />
                    <path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.48-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5" />
                  </svg>
                  <h4 className="text-lg font-semibold">AR Hub Discord Server</h4>
                </div>
                <p className="mb-4 text-center">
                  Join 5,000+ AR developers in real-time discussions, get help, and share your projects.
                </p>
                <Link href="https://discord.gg/arhub" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-white text-[#5865F2] hover:bg-gray-100">Join Discord Server</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
