import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, ShieldCheck, Home, Info, Users, LayoutDashboard, Sparkles, Facebook, Instagram } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/logo.svg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const [profile, setProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-muted border-b">
        <div className="container flex items-center justify-between h-10">
          <span className="text-sm font-heading text-foreground">Portale itinerary experience</span>
          <div className="flex items-center gap-4 text-sm font-heading">
            {!user ? (
              <Button size="sm" asChild>
                <Link to="/auth">Accedi all'area personale</Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.display_name || user.email || "User"} />
                      <AvatarFallback>
                        {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {profile?.display_name || user.email?.split("@")[0] || "Utente"}
                    </span>
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
            )}
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div style={{ backgroundColor: '#0F151F' }}>
        <div className="container flex flex-col py-6">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="Itinerari Intelligenti" className="h-20 w-auto" />
            </Link>

            {/* Social icons - desktop */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-white text-sm font-heading">Seguici su:</span>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {!user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/" className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Home
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/create-itinerary" className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Progetto
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/info" className="flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Info
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/affiliates" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Affiliates
                      </Link>
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
                      <Link to="/" className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Home
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/create-itinerary" className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Experience
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profilo</Link>
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

          {/* Desktop Navigation - Below logo */}
          <nav className="hidden md:flex items-center space-x-8 font-heading">
            {!user ? (
              <>
                <Link to="/" className="text-base font-medium text-white transition-colors border-b border-transparent hover:border-white pb-1">
                  Home
                </Link>
                <Link to="/create-itinerary" className="text-base font-medium text-white transition-colors border-b border-transparent hover:border-white pb-1">
                  Progetto
                </Link>
                <Link to="/info" className="text-base font-medium text-white transition-colors border-b border-transparent hover:border-white pb-1">
                  Info
                </Link>
                <Link to="/affiliates" className="text-base font-medium text-white transition-colors border-b border-transparent hover:border-white pb-1">
                  Affiliates
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="text-base font-medium text-white transition-colors border-b border-transparent hover:border-white pb-1">
                  Home
                </Link>
                <Link to="/dashboard" className="text-base font-medium text-white transition-colors border-b border-transparent hover:border-white pb-1">
                  Dashboard
                </Link>
                <Link to="/create-itinerary" className="text-base font-medium text-white transition-colors border-b border-transparent hover:border-white pb-1">
                  Experience
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
