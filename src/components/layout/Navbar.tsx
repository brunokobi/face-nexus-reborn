import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Menu, X, Camera, Users, BarChart3, Settings, LogOut, Sun, Moon, User, GraduationCap, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoIcon from "@/assets/logo-icon.png";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const { signOut, profile, isAdmin, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
    }
    if (email) return email[0].toUpperCase();
    return "U";
  };

  const handleOpenProfile = () => {
    setEditName(profile?.full_name || "");
    setEditEmail(profile?.email || user?.email || "");
    setIsProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: editName, email: editEmail })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
      setIsProfileOpen(false);
      window.location.reload();
    } catch {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const navigation = [
    { name: "Início", id: "home", icon: Camera },
    { name: "Reconhecimento", id: "scanner", icon: Camera },
    { name: "Alunos", id: "students", icon: Users },
    { name: "Professores", id: "teachers", icon: GraduationCap },
    { name: "Disciplinas", id: "disciplines", icon: BookOpen },
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
              <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <PopoverTrigger asChild>
                  <button
                    onClick={handleOpenProfile}
                    className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {getInitials(profile?.full_name, profile?.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                          {getInitials(profile?.full_name, profile?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{profile?.full_name || "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground truncate">{profile?.email || user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="edit-name" className="text-xs">Nome completo</Label>
                        <Input id="edit-name" value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label htmlFor="edit-email" className="text-xs">Email</Label>
                        <Input id="edit-email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="h-8 text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={handleSaveProfile} disabled={saving}>
                        {saving ? "Salvando..." : "Salvar"}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-1" /> Sair
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
              className="w-full justify-start gap-2"
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {theme === "light" ? "Tema Escuro" : "Tema Claro"}
            </Button>
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
