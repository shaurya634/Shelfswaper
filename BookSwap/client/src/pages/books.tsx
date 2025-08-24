import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import BookCard from "@/components/book-card";
import BookUploadModal from "@/components/book-upload-modal";
import BookDetailModal from "@/components/book-detail-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, List } from "lucide-react";
import type { BookWithOwner } from "@shared/schema";

export default function Books() {
  const { user, isLoading: authLoading } = useAuth() as { user: User | undefined; isLoading: boolean; isAuthenticated: boolean };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookWithOwner | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  const { data: books = [], isLoading } = useQuery<BookWithOwner[]>({
    queryKey: ["/api/books"],
    enabled: !!user,
  });

  const exchangeRequestMutation = useMutation({
    mutationFn: async ({ bookId, message }: { bookId: string; message?: string }) => {
      await apiRequest("POST", "/api/exchange-requests", { bookId, message });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Exchange request sent successfully!",
      });
      setSelectedBook(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send exchange request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/books"] });
    setIsUploadModalOpen(false);
    toast({
      title: "Success",
      description: "Book uploaded successfully!",
    });
  };

  const handleExchangeRequest = (bookId: string, message?: string) => {
    exchangeRequestMutation.mutate({ bookId, message });
  };

  // Filter books based on search and filters
  const filteredBooks = books.filter((book: BookWithOwner) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "all" || book.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchesCondition = selectedCondition === "all" || book.condition.toLowerCase() === selectedCondition.toLowerCase();
    
    return matchesSearch && matchesGenre && matchesCondition;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-shelf-bg">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shelf-brown mx-auto mb-4"></div>
            <p className="text-gray-600">Loading books...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shelf-bg">
      <Navbar onUploadClick={() => setIsUploadModalOpen(true)} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-shelf-cream to-shelf-beige py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-shelf-charcoal mb-6">
                Discover Your Next Great Read
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Exchange books with fellow readers, discover new genres, and build a community around the love of reading. Upload your books and find your next literary adventure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-shelf-brown hover:bg-shelf-brown/90 text-white"
                  onClick={() => document.getElementById('books-section')?.scrollIntoView({ behavior: 'smooth' })}
                  data-testid="button-start-browsing"
                >
                  Start Browsing
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-shelf-brown text-shelf-brown hover:bg-shelf-brown hover:text-white"
                  onClick={() => setIsUploadModalOpen(true)}
                  data-testid="button-upload-first-book"
                >
                  Upload Your First Book
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
                alt="Cozy reading space with books" 
                className="rounded-xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-4 -right-4 bg-shelf-gold text-white p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold" data-testid="text-total-books">{books.length}</div>
                  <div className="text-sm">Books Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white shadow-sm border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title, author, or genre..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-40" data-testid="select-genre">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  <SelectItem value="fiction">Fiction</SelectItem>
                  <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                  <SelectItem value="mystery">Mystery</SelectItem>
                  <SelectItem value="romance">Romance</SelectItem>
                  <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="biography">Biography</SelectItem>
                  <SelectItem value="self-help">Self-Help</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger className="w-40" data-testid="select-condition">
                  <SelectValue placeholder="Any Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Condition</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <main id="books-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-serif text-3xl font-bold text-shelf-charcoal">Available Books</h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600" data-testid="text-books-count">
              {filteredBooks.length} books found
            </span>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-shelf-brown text-white" : ""}
                data-testid="button-grid-view"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-shelf-brown text-white" : ""}
                data-testid="button-list-view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg" data-testid="text-no-books">
              No books found matching your criteria.
            </p>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
            : "space-y-4 mb-8"
          }>
            {filteredBooks.map((book: BookWithOwner) => (
              <BookCard
                key={book.id}
                book={book}
                onBookClick={setSelectedBook}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <BookUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      <BookDetailModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onExchangeRequest={handleExchangeRequest}
        currentUserId={user?.id || ""}
        isRequestPending={exchangeRequestMutation.isPending}
      />
    </div>
  );
}
