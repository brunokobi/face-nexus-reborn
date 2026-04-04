import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, BookOpen, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Discipline, Teacher } from "@/types/student";

interface DisciplinesPageProps {
  disciplines: Discipline[];
  teachers: Teacher[];
  addDiscipline: (d: Discipline) => void;
  updateDiscipline: (id: string, data: Partial<Discipline>) => void;
  removeDiscipline: (id: string) => void;
}

const EMPTY_FORM = { code: "", name: "", course: "", teacherId: "", workloadHours: "60", description: "" };

export function DisciplinesPage({ disciplines, teachers, addDiscipline, updateDiscipline, removeDiscipline }: DisciplinesPageProps) {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Discipline | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { toast } = useToast();

  const filtered = disciplines.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.course.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEdit = (d: Discipline) => {
    setEditing(d);
    setForm({
      code: d.code,
      name: d.name,
      course: d.course,
      teacherId: d.teacherId,
      workloadHours: String(d.workloadHours),
      description: d.description ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim() || !form.teacherId) {
      toast({ title: "Campos obrigatórios", description: "Preencha código, nome e professor.", variant: "destructive" });
      return;
    }
    const hours = parseInt(form.workloadHours) || 0;
    if (hours <= 0) {
      toast({ title: "Carga horária inválida", description: "Informe um número de horas válido.", variant: "destructive" });
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      course: form.course.trim(),
      teacherId: form.teacherId,
      workloadHours: hours,
      description: form.description.trim() || undefined,
    };

    if (editing) {
      updateDiscipline(editing.id, payload);
      toast({ title: "Disciplina atualizada", description: `${form.name} foi atualizada.` });
    } else {
      addDiscipline({ id: crypto.randomUUID(), registrationDate: new Date(), ...payload });
      toast({ title: "Disciplina cadastrada", description: `${form.name} foi adicionada.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (d: Discipline) => {
    removeDiscipline(d.id);
    toast({ title: "Disciplina removida", description: `${d.name} foi removida.` });
  };

  const teacherName = (id: string) => teachers.find((t) => t.id === id)?.name ?? "—";

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">Disciplinas</h1>
            <p className="text-muted-foreground text-lg">{disciplines.length} disciplina{disciplines.length !== 1 ? "s" : ""} cadastrada{disciplines.length !== 1 ? "s" : ""}</p>
          </div>
          <Button variant="hero" onClick={openAdd} disabled={teachers.length === 0}>
            <Plus className="h-4 w-4 mr-2" /> Nova Disciplina
          </Button>
        </div>

        {teachers.length === 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-warning-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Cadastre ao menos um professor antes de criar disciplinas.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código ou curso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <BookOpen className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">{search ? "Nenhuma disciplina encontrada." : "Nenhuma disciplina cadastrada ainda."}</p>
              {!search && teachers.length > 0 && (
                <Button variant="outline" onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Cadastrar Disciplina</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((d) => (
              <Card key={d.id} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{d.name}</CardTitle>
                        <p className="text-xs text-muted-foreground font-mono">{d.code}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(d)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {d.course && <Badge variant="secondary">{d.course}</Badge>}
                    <Badge variant="outline">{d.workloadHours}h</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" /> {teacherName(d.teacherId)}
                  </p>
                  {d.description && <p className="text-xs text-muted-foreground line-clamp-2">{d.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="disc-code">Código *</Label>
                <Input
                  id="disc-code"
                  placeholder="Ex: MAT101"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="disc-hours">Carga Horária (h) *</Label>
                <Input
                  id="disc-hours"
                  type="number"
                  min={1}
                  placeholder="60"
                  value={form.workloadHours}
                  onChange={(e) => setForm((f) => ({ ...f, workloadHours: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="disc-name">Nome *</Label>
              <Input
                id="disc-name"
                placeholder="Nome da disciplina"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="disc-course">Curso</Label>
              <Input
                id="disc-course"
                placeholder="Ex: Engenharia de Software"
                value={form.course}
                onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Professor *</Label>
              <Select value={form.teacherId} onValueChange={(v) => setForm((f) => ({ ...f, teacherId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="disc-desc">Descrição</Label>
              <Input
                id="disc-desc"
                placeholder="Descrição opcional"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
