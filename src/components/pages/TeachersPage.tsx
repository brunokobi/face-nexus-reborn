import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Teacher } from "@/types/student";

interface TeachersPageProps {
  teachers: Teacher[];
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (id: string, data: Partial<Teacher>) => void;
  removeTeacher: (id: string) => void;
}

const EMPTY_FORM = { name: "", email: "", department: "" };

export function TeachersPage({ teachers, addTeacher, updateTeacher, removeTeacher }: TeachersPageProps) {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { toast } = useToast();

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEdit = (teacher: Teacher) => {
    setEditing(teacher);
    setForm({ name: teacher.name, email: teacher.email, department: teacher.department });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.department.trim()) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome e departamento.", variant: "destructive" });
      return;
    }

    if (editing) {
      updateTeacher(editing.id, { name: form.name.trim(), email: form.email.trim(), department: form.department.trim() });
      toast({ title: "Professor atualizado", description: `${form.name} foi atualizado com sucesso.` });
    } else {
      addTeacher({
        id: crypto.randomUUID(),
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        registrationDate: new Date(),
      });
      toast({ title: "Professor cadastrado", description: `${form.name} foi adicionado com sucesso.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (teacher: Teacher) => {
    removeTeacher(teacher.id);
    toast({ title: "Professor removido", description: `${teacher.name} foi removido.` });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">Professores</h1>
            <p className="text-muted-foreground text-lg">{teachers.length} professor{teachers.length !== 1 ? "es" : ""} cadastrado{teachers.length !== 1 ? "s" : ""}</p>
          </div>
          <Button variant="hero" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" /> Novo Professor
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <GraduationCap className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">{search ? "Nenhum professor encontrado." : "Nenhum professor cadastrado ainda."}</p>
              {!search && <Button variant="outline" onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Cadastrar Professor</Button>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((teacher) => (
              <Card key={teacher.id} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{teacher.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{teacher.email || "—"}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(teacher)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(teacher)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Badge variant="outline">{teacher.department}</Badge>
                  <p className="text-xs text-muted-foreground">
                    Cadastrado em {teacher.registrationDate.toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Professor" : "Novo Professor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="teacher-name">Nome *</Label>
              <Input
                id="teacher-name"
                placeholder="Nome completo"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="teacher-email">E-mail</Label>
              <Input
                id="teacher-email"
                type="email"
                placeholder="professor@escola.edu.br"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="teacher-dept">Departamento *</Label>
              <Input
                id="teacher-dept"
                placeholder="Ex: Ciências Exatas, Humanas..."
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button variant="hero" onClick={handleSave}>{editing ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
