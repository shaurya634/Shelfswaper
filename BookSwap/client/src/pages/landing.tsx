import { Button } from "@/components/ui/button";
import { BookOpen, Users, ArrowRight, Star } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-shelf-bg">
      {/* Landing Navbar */}
      <nav className="bg-white shadow-md border-b border-shelf-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="text-shelf-brown text-2xl" />
              <span className="font-serif font-bold text-xl text-shelf-charcoal">ShelfSwap</span>
            </div>
            <Button 
              onClick={handleLogin}
              className="bg-shelf-brown hover:bg-shelf-brown/90 text-white"
              data-testid="button-login"
            >
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-shelf-cream to-shelf-beige py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-serif text-4xl lg:text-6xl font-bold text-shelf-charcoal mb-6">
                Discover Your Next Great Read
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Exchange books with fellow readers, discover new genres, and build a community around the love of reading. Upload your books and find your next literary adventure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleLogin}
                  className="bg-shelf-brown hover:bg-shelf-brown/90 text-white px-6 py-3 text-base"
                  data-testid="button-start-browsing"
                >
                  Start Browsing
                </Button>
                <Button 
                  onClick={handleLogin}
                  variant="outline"
                  className="border-2 border-shelf-brown text-shelf-brown hover:bg-shelf-brown hover:text-white px-6 py-3 text-base"
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
                  <div className="text-2xl font-bold" data-testid="text-total-books">Join Now</div>
                  <div className="text-sm">To Start Reading</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-shelf-charcoal mb-4">
              Why Choose ShelfSwap?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of book lovers who have already discovered their next favorite read through our platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-shelf-beige rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-shelf-brown text-2xl" />
              </div>
              <h3 className="font-semibold text-xl text-shelf-charcoal mb-2">Vast Collection</h3>
              <p className="text-gray-600">
                Browse thousands of books across all genres from fellow readers in your community.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-shelf-beige rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-shelf-brown text-2xl" />
              </div>
              <h3 className="font-semibold text-xl text-shelf-charcoal mb-2">Safe Exchanges</h3>
              <p className="text-gray-600">
                Connect with verified readers and exchange books safely within your local community.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-shelf-beige rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="text-shelf-brown text-2xl" />
              </div>
              <h3 className="font-semibold text-xl text-shelf-charcoal mb-2">Easy to Use</h3>
              <p className="text-gray-600">
                Simple upload process, intuitive search, and streamlined exchange requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-shelf-charcoal text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold mb-4">
            Ready to Start Your Reading Adventure?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join our community of book lovers and discover your next great read today.
          </p>
          <Button 
            onClick={handleLogin}
            className="bg-shelf-gold hover:bg-shelf-gold/90 text-shelf-charcoal px-8 py-3 text-lg font-semibold"
            data-testid="button-join-now"
          >
            Join ShelfSwap Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BookOpen className="text-shelf-brown text-2xl" />
              <span className="font-serif font-bold text-xl text-shelf-charcoal">ShelfSwap</span>
            </div>
            <p className="text-gray-600">
              Connecting book lovers and building reading communities through secure, easy book exchanges.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
