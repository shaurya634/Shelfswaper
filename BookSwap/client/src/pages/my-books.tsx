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
import { Trash2, Edit } from "lucide-react";
import type { BookWithOwner } from "@shared/schema";

export default function MyBooks() {
  const { user, isLoading: authLoading } = useAuth() as { user: User | undefined; isLoading: boolean; isAuthenticated: boolean };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookWithOwner | null>(null);

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
    queryKey: ["/api/my-books"],
    enabled: !!user,
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      await apiRequest("DELETE", `/api/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-books"] });
      toast({
        title: "Success",
        description: "Book deleted successfully!",
      });
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
        description: "Failed to delete book. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/my-books"] });
    setIsUploadModalOpen(false);
    toast({
      title: "Success",
      description: "Book uploaded successfully!",
    });
  };

  const handleDeleteBook = (bookId: string) => {
    if (confirm("Are you sure you want to delete this book?")) {
      deleteBookMutation.mutate(bookId);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-shelf-bg">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shelf-brown mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your books...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shelf-bg">
      <Navbar onUploadClick={() => setIsUploadModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-shelf-charcoal">My Books</h1>
            <p className="text-gray-600 mt-2">Manage your book collection and track exchanges</p>
          </div>
          <Button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-shelf-green hover:bg-green-700 text-white"
            data-testid="button-upload-book"
          >
            Upload New Book
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-shelf-brown" data-testid="text-total-books">
                {books.length}
              </div>
              <div className="text-gray-600">Total Books</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600" data-testid="text-available-books">
                {books.filter((book: BookWithOwner) => book.isAvailable).length}
              </div>
              <div className="text-gray-600">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600" data-testid="text-unavailable-books">
                {books.filter((book: BookWithOwner) => !book.isAvailable).length}
              </div>
              <div className="text-gray-600">In Exchange</div>
            </div>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-no-books-title">
                No books uploaded yet
              </h3>
              <p className="text-gray-600 mb-6" data-testid="text-no-books-description">
                Start building your library by uploading your first book. Share your favorites with the community!
              </p>
              <Button 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-shelf-brown hover:bg-shelf-brown/90 text-white"
                data-testid="button-upload-first-book"
              >
                Upload Your First Book
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book: BookWithOwner) => (
              <div key={book.id} className="relative group">
                <BookCard
                  book={book}
                  onBookClick={setSelectedBook}
                  viewMode="grid"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white shadow-md hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement edit functionality
                      toast({
                        title: "Coming Soon",
                        description: "Book editing feature will be available soon!",
                      });
                    }}
                    data-testid={`button-edit-${book.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBook(book.id);
                    }}
                    disabled={deleteBookMutation.isPending}
                    data-testid={`button-delete-${book.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {!book.isAvailable && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      In Exchange
                    </span>
                  </div>
                )}
              </div>
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
        onExchangeRequest={() => {}}
        currentUserId={user?.id || ""}
        isRequestPending={false}
        showExchangeButton={false}
      />
    </div>
  );
}
