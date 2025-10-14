import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, ShieldCheck, Home, Info, Users, LayoutDashboard, Sparkles } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ backgroundColor: '#0F151F' }}>
      <div className="container flex flex-col" style={{ height: '180px' }}>
        {/* Top row: Logo and Auth buttons */}
        <div className="flex items-center justify-between pt-6 pb-4">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Itinerari Intelligenti" className="h-16 w-auto" />
          </Link>

          {/* Auth buttons for desktop (non-logged in users) */}
          {!user && (
            <div className="hidden md:flex items-center space-x-2 font-heading">
              <Button variant="ghost" asChild className="text-white hover:text-primary">
                <Link to="/auth">Accedi</Link>
              </Button>
              <Button asChild className="text-white">
                <Link to="/auth">Registrati</Link>
              </Button>
            </div>
          )}

          {/* User menu for logged in users */}
          {user && (
            <div className="hidden md:flex items-center gap-3 font-heading">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 h-auto py-2 px-3 text-white hover:text-primary">
                    <Avatar className="h-8 w-8">
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
            </div>
          )}

          {/* Mobile menu button */}
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

        {/* Desktop Navigation - Below logo, aligned left */}
        <nav className="hidden md:flex items-center space-x-6 font-heading pb-6">
          {!user ? (
            <>
              <Link to="/" className="text-sm font-medium text-white transition-colors hover:text-primary flex items-center gap-2">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link to="/create-itinerary" className="text-sm font-medium text-white transition-colors hover:text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Progetto
              </Link>
              <Link to="/info" className="text-sm font-medium text-white transition-colors hover:text-primary flex items-center gap-2">
                <Info className="w-4 h-4" />
                Info
              </Link>
              <Link to="/affiliates" className="text-sm font-medium text-white transition-colors hover:text-primary flex items-center gap-2">
                <Users className="w-4 h-4" />
                Affiliates
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="text-sm font-medium text-white transition-colors hover:text-primary flex items-center gap-2">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link to="/dashboard" className="text-sm font-medium text-white transition-colors hover:text-primary flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/create-itinerary" className="text-sm font-medium text-white transition-colors hover:text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Experience
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
