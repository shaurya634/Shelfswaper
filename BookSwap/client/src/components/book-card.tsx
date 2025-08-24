import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BookWithOwner } from "@shared/schema";

interface BookCardProps {
  book: BookWithOwner;
  onBookClick: (book: BookWithOwner) => void;
  viewMode?: "grid" | "list";
}

export default function BookCard({ book, onBookClick, viewMode = "grid" }: BookCardProps) {
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

  if (viewMode === "list") {
    return (
      <Card 
        className="hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => onBookClick(book)}
        data-testid={`card-book-${book.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 bg-gray-100 rounded flex-shrink-0">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No Cover
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-shelf-charcoal mb-1 line-clamp-1" data-testid={`text-book-title-${book.id}`}>
                {book.title}
              </h3>
              <p className="text-gray-600 mb-2" data-testid={`text-book-author-${book.id}`}>
                {book.author}
              </p>
              <div className="flex items-center gap-3">
                <Badge className="bg-shelf-beige text-shelf-brown" data-testid={`badge-genre-${book.id}`}>
                  {book.genre}
                </Badge>
                <Badge className={getConditionColor(book.condition)} data-testid={`badge-condition-${book.id}`}>
                  {formatCondition(book.condition)}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Avatar className="h-6 w-6">
                <AvatarImage src={book.owner.profileImageUrl || ""} />
                <AvatarFallback className="bg-shelf-beige text-shelf-brown text-xs">
                  {getInitials(book.owner.firstName || undefined, book.owner.lastName || undefined)}
                </AvatarFallback>
              </Avatar>
              <span data-testid={`text-owner-name-${book.id}`}>
                {book.owner.firstName || book.owner.email?.split("@")[0] || "Anonymous"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
      onClick={() => onBookClick(book)}
      data-testid={`card-book-${book.id}`}
    >
      <div className="aspect-[3/4] bg-gray-100">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-xs">No Cover</div>
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-shelf-charcoal mb-2 line-clamp-2" data-testid={`text-book-title-${book.id}`}>
          {book.title}
        </h3>
        <p className="text-gray-600 mb-2" data-testid={`text-book-author-${book.id}`}>
          {book.author}
        </p>
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-shelf-beige text-shelf-brown" data-testid={`badge-genre-${book.id}`}>
            {book.genre}
          </Badge>
          <Badge className={getConditionColor(book.condition)} data-testid={`badge-condition-${book.id}`}>
            {formatCondition(book.condition)}
          </Badge>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Avatar className="h-6 w-6">
            <AvatarImage src={book.owner.profileImageUrl || ""} />
            <AvatarFallback className="bg-shelf-beige text-shelf-brown text-xs">
              {getInitials(book.owner.firstName || undefined, book.owner.lastName || undefined)}
            </AvatarFallback>
          </Avatar>
          <span data-testid={`text-owner-name-${book.id}`}>
            {book.owner.firstName || book.owner.email?.split("@")[0] || "Anonymous"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
