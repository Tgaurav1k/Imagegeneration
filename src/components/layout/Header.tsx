import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gallery?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 glass border-b border-border/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <span className="text-lg font-bold text-foreground hidden sm:block">PixelVault</span>
          </Link>

          {/* Desktop Navigation - Glass background */}
          <nav className="hidden lg:flex items-center gap-0.5 px-1.5 py-1 rounded-full bg-background/10 backdrop-blur-md border border-border/30 mx-4">
            <Link 
              to="/gallery" 
              className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all font-medium"
            >
              Explore
            </Link>
            <Link 
              to="/gallery?category=nature" 
              className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all font-medium"
            >
              Categories
            </Link>
            <Link 
              to="/gallery?sort=popular" 
              className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all font-medium"
            >
              Popular
            </Link>
          </nav>

          {/* Desktop Actions - Right aligned */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative flex items-center bg-muted/30 rounded-full border border-border/40 overflow-hidden">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-2 w-32 lg:w-40 h-9 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70 text-sm"
                />
                <Button 
                  type="submit" 
                  variant="gradient" 
                  size="sm"
                  className="h-7 rounded-full px-4 mr-1 text-xs"
                >
                  Search
                </Button>
              </div>
            </form>
            
            <ThemeToggle />
            
            <Button variant="gradient" size="sm" className="gap-1.5 rounded-full px-4 h-9">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full bg-background/50 border-border/50 rounded-full"
                  />
                </div>
                <Button type="submit" variant="gradient" size="icon" className="rounded-full">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              
              <Link 
                to="/gallery" 
                className="text-foreground py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              <Link 
                to="/gallery?category=nature" 
                className="text-foreground py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                to="/gallery?sort=popular" 
                className="text-foreground py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Popular
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Button variant="gradient" className="w-full gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
