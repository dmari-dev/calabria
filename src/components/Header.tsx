import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="Itinerari Intelligenti" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {!user ? (
            <>
              <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </Link>
              <Link to="/create-itinerary" className="text-sm font-medium transition-colors hover:text-primary">
                Progetto
              </Link>
              <Link to="/info" className="text-sm font-medium transition-colors hover:text-primary">
                Info
              </Link>
              <Link to="/affiliates" className="text-sm font-medium transition-colors hover:text-primary">
                Affiliates
              </Link>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Accedi</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Registrati</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </Link>
              <Link to="/profile" className="text-sm font-medium transition-colors hover:text-primary">
                Profilo
              </Link>
              <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              <Button asChild>
                <Link to="/create-itinerary">Start Experience</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profilo</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    Esci
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!user ? (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/">Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/create-itinerary">Progetto</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/info">Info</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/affiliates">Affiliates</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/auth">Accedi</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/auth">Registrati</Link>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/">Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profilo</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/create-itinerary">Start Experience</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  Esci
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
