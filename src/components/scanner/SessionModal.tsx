import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, BookOpen, GraduationCap } from "lucide-react";
import type { Discipline, Teacher } from "@/types/student";

export interface SessionInfo {
  location: string;
  disciplineId?: string;
  disciplineName?: string;
  teacherId?: string;
  teacherName?: string;
}

interface SessionModalProps {
  open: boolean;
  disciplines: Discipline[];
  teachers: Teacher[];
  onConfirm: (session: SessionInfo) => void;
  onCancel: () => void;
}

export function SessionModal({ open, disciplines, teachers, onConfirm, onCancel }: SessionModalProps) {
  const [location, setLocation] = useState("");
  const [disciplineId, setDisciplineId] = useState("");

  const selectedDiscipline = disciplines.find((d) => d.id === disciplineId);
  const selectedTeacher = selectedDiscipline
    ? teachers.find((t) => t.id === selectedDiscipline.teacherId)
    : undefined;

  const handleConfirm = () => {
    if (!location.trim()) return;
    onConfirm({
      location: location.trim(),
      disciplineId: selectedDiscipline?.id,
      disciplineName: selectedDiscipline?.name,
      teacherId: selectedTeacher?.id,
      teacherName: selectedTeacher?.name,
    });
    setLocation("");
    setDisciplineId("");
  };

  const handleCancel = () => {
    setLocation("");
    setDisciplineId("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Configurar Sessão
          </DialogTitle>
          <DialogDescription>
            Informe o local e, opcionalmente, a disciplina da aula.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="session-location">Local *</Label>
            <Input
              id="session-location"
              placeholder="Ex: Sala 101, Laboratório..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              autoFocus
            />
          </div>

          {disciplines.length > 0 && (
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> Disciplina
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Select value={disciplineId} onValueChange={setDisciplineId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem disciplina</SelectItem>
                  {disciplines.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedTeacher && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <span className="text-muted-foreground">Professor: </span>
                <span className="font-medium">{selectedTeacher.name}</span>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">{selectedTeacher.department}</Badge>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          <Button variant="hero" onClick={handleConfirm} disabled={!location.trim()}>
            Iniciar Câmera
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
