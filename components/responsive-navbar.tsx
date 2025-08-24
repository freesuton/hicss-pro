"use client"

import { Home, User, PlusCircle, Newspaper } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

export function ResponsiveNavbar() {
  const pathname = usePathname()
  const { user } = useAuth();

  const navItems = [
    {
      href: "/explore",
      icon: Home,
      label: "Explore",
      active: pathname === "/explore",
    },
    {
      href: "/news",
      icon: Newspaper,
      label: "News",
      active: pathname === "/news",
    },
    {
      href: user ? `/${user.id}` : "/profile",
      icon: User,
      label: "Profile",
      active: pathname === `/${user?.id}` || pathname === "/profile",
    },
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-blue-100 shadow-lg z-50">
        <div className="flex items-center justify-between py-2 px-2">
          <Link
            href="/explore"
            className={cn(
              "flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-200 flex-1 hover:bg-blue-50",
              pathname === "/explore" 
                ? "text-blue-600 bg-blue-50 shadow-sm" 
                : "text-gray-600 hover:text-blue-600",
            )}
          >
            <Home className="h-6 w-6 mb-0.5" />
            {/* <span className="text-xs font-medium">Explore</span> */}
          </Link>

          <Link
            href="/news"
            className={cn(
              "flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-200 flex-1 hover:bg-blue-50",
              pathname === "/news" 
                ? "text-blue-600 bg-blue-50 shadow-sm" 
                : "text-gray-600 hover:text-blue-600",
            )}
          >
            <Newspaper className="h-6 w-6 mb-0.5" />
            {/* <span className="text-xs font-medium">News</span> */}
          </Link>

          {/* Write Note Button - Center */}
          <Link href="/new-post">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full p-3 shadow-lg mx-2 transform hover:scale-105 transition-all duration-200"
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </Link>

          <Link
            href={user ? `/${user.id}` : "/profile"}
            className={cn(
              "flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-200 flex-1 hover:bg-blue-50",
              pathname === `/${user?.id}` || pathname === "/profile" 
                ? "text-blue-600 bg-blue-50 shadow-sm" 
                : "text-gray-600 hover:text-blue-600",
            )}
          >
            <User className="h-6 w-6 mb-0.5" />
            {/* <span className="text-xs font-medium">Profile</span> */}
          </Link>
        </div>
      </nav>

      {/* Desktop Left Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-white to-blue-50/30 border-r border-blue-100 shadow-xl z-40 flex-col">
        <div className="p-6 bg-gradient-to-r flex items-center gap-3">
          <img src="/nenki-icon.png" alt="Nenki Icon" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-gray-500">Nenki</h1>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-md",
                item.active 
                  ? "bg-gradient-to-r from-blue-100 to-blue-200 shadow-lg" 
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* Write Note Button */}
          <Link href="/new-post">
            <Button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
              <PlusCircle className="h-5 w-5 mr-2" />
              Write Note
            </Button>
          </Link>
        </div>

        {/* <div className="p-4 border-t border-blue-100 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-md flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name || 'Unknown User'}</p>
              <p className="text-sm text-gray-500">@{user?.id || ''}</p>
            </div>
          </div>
        </div> */}
      </nav>
    </>
  )
}
