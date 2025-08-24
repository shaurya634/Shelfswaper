import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Handshake, MessageSquare } from "lucide-react";
import type { BookWithOwner } from "@shared/schema";

interface BookDetailModalProps {
  book: BookWithOwner | null;
  isOpen: boolean;
  onClose: () => void;
  onExchangeRequest: (bookId: string, message?: string) => void;
  currentUserId?: string;
  isRequestPending?: boolean;
  showExchangeButton?: boolean;
}

export default function BookDetailModal({ 
  book, 
  isOpen, 
  onClose, 
  onExchangeRequest, 
  currentUserId, 
  isRequestPending = false,
  showExchangeButton = true 
}: BookDetailModalProps) {
  const [message, setMessage] = useState("");

  if (!book) return null;

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "like-new":
        return "bg-green-100 text-green-700";
      case "good":
        return "bg-yellow-100 text-yellow-700";
      case "fair":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatCondition = (condition: string) => {
    return condition.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  const handleExchangeRequest = () => {
    onExchangeRequest(book.id, message.trim() || undefined);
    setMessage("");
  };

  const handleSendMessage = () => {
    // TODO: Implement messaging system
    alert("Messaging feature coming soon!");
  };

  const isOwnBook = currentUserId === book.ownerId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold text-shelf-charcoal">
            Book Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <div className="text-sm">No Cover Available</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-serif text-3xl font-bold text-shelf-charcoal mb-2" data-testid="text-book-title">
                {book.title}
              </h3>
              <p className="text-xl text-gray-600 mb-4" data-testid="text-book-author">
                by {book.author}
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-shelf-beige text-shelf-brown" data-testid="badge-genre">
                  {book.genre}
                </Badge>
                <Badge className={getConditionColor(book.condition)} data-testid="badge-condition">
                  {formatCondition(book.condition)}
                </Badge>
              </div>
            </div>

            {book.description && (
              <div className="border-l-4 border-shelf-gold pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">About this book</h4>
                <p className="text-gray-600 leading-relaxed" data-testid="text-book-description">
                  {book.description}
                </p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Owner Information</h4>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={book.owner.profileImageUrl || ""} />
                  <AvatarFallback className="bg-shelf-beige text-shelf-brown">
                    {getInitials(book.owner.firstName || undefined, book.owner.lastName || undefined)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900" data-testid="text-owner-name">
                    {book.owner.firstName && book.owner.lastName 
                      ? `${book.owner.firstName} ${book.owner.lastName}`
                      : book.owner.email?.split("@")[0] || "Anonymous"
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(book.owner.createdAt!).getFullYear()}
                  </p>
                </div>
              </div>
            </div>

            {showExchangeButton && !isOwnBook && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="exchange-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message to owner (optional)
                  </Label>
                  <Textarea
                    id="exchange-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell the owner why you're interested in this book or what you'd like to exchange..."
                    data-testid="textarea-exchange-message"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <Button 
                    className="flex-1 bg-shelf-green hover:bg-green-700 text-white"
                    onClick={handleExchangeRequest}
                    disabled={isRequestPending}
                    data-testid="button-request-exchange"
                  >
                    <Handshake className="h-4 w-4 mr-2" />
                    {isRequestPending ? "Sending..." : "Request Exchange"}
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 border-2 border-shelf-brown text-shelf-brown hover:bg-shelf-brown hover:text-white"
                    onClick={handleSendMessage}
                    data-testid="button-send-message"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            )}

            {isOwnBook && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm font-medium">
                  This is your book. You can manage it from the "My Books" section.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
