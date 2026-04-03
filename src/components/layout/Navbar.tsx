import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Camera, Users, BarChart3, Settings, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import logoIcon from "@/assets/logo-icon.png";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut, profile, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: "Início", id: "home", icon: Camera },
    { name: "Reconhecimento", id: "scanner", icon: Camera },
    { name: "Alunos", id: "students", icon: Users },
    { name: "Relatórios", id: "reports", icon: BarChart3 },
    ...(isAdmin ? [{ name: "Configurações", id: "settings", icon: Settings }] : []),
  ];

  return (
    <nav className="bg-card/90 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img src={logoIcon} alt="Presence Now" className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Presence Now
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
            <div className="border-l border-border/50 pl-4 flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === "light" ? "Tema escuro" : "Tema claro"}>
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                {profile?.full_name || profile?.email || "Usuário"}
              </span>
              <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-card/95 backdrop-blur-lg border-t border-border/50">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
