import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  onUploadClick?: () => void;
}

export default function Navbar({ onUploadClick }: NavbarProps) {
  const { user } = useAuth() as { user: User | undefined; isLoading: boolean; isAuthenticated: boolean };
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const isActive = (path: string) => {
    if (path === "/" && (location === "/" || location === "/books")) return true;
    return location === path;
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  return (
    <nav className="bg-white shadow-md border-b border-shelf-beige sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <a className="flex items-center space-x-2" data-testid="link-home">
                <BookOpen className="text-shelf-brown text-2xl" />
                <span className="font-serif font-bold text-xl text-shelf-charcoal">ShelfSwap</span>
              </a>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/books">
                <a 
                  className={`py-2 font-medium transition-colors ${
                    isActive("/books") || isActive("/")
                      ? "text-shelf-brown border-b-2 border-shelf-brown"
                      : "text-gray-600 hover:text-shelf-brown"
                  }`}
                  data-testid="link-browse-books"
                >
                  Browse Books
                </a>
              </Link>
              <Link href="/my-books">
                <a 
                  className={`py-2 font-medium transition-colors ${
                    isActive("/my-books")
                      ? "text-shelf-brown border-b-2 border-shelf-brown"
                      : "text-gray-600 hover:text-shelf-brown"
                  }`}
                  data-testid="link-my-books"
                >
                  My Books
                </a>
              </Link>
              <Link href="/exchanges">
                <a 
                  className={`py-2 font-medium transition-colors ${
                    isActive("/exchanges")
                      ? "text-shelf-brown border-b-2 border-shelf-brown"
                      : "text-gray-600 hover:text-shelf-brown"
                  }`}
                  data-testid="link-exchanges"
                >
                  Exchanges
                </a>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {onUploadClick && (
              <Button 
                onClick={onUploadClick}
                className="bg-shelf-green hover:bg-green-700 text-white font-medium"
                data-testid="button-upload-book"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Book
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl ? user.profileImageUrl : ""} />
                    <AvatarFallback className="bg-shelf-beige text-shelf-brown">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-gray-700" data-testid="text-user-name">
                    {user?.firstName || user?.email || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
