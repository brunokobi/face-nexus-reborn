import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, User, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WebcamCapture } from "@/components/scanner/WebcamCapture";
import { supabase } from "@/integrations/supabase/client";
import type { Student } from "@/types/student";

interface StudentsPageProps {
  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  removeStudent: (id: string) => void;
}

/** Converte um data URL base64 em Blob para upload. */
function base64ToBlob(dataUrl: string, mimeType = "image/jpeg"): Blob {
  const [, base64] = dataUrl.split(",");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

export function StudentsPage({ students, addStudent, updateStudent, removeStudent }: StudentsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ matricula: "", name: "", email: "", course: "" });
  const [capturedAvatar, setCapturedAvatar] = useState<string | null>(null);
  const [capturedDescriptor, setCapturedDescriptor] = useState<Float32Array | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricula?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({ matricula: "", name: "", email: "", course: "" });
    setCapturedAvatar(null);
    setCapturedDescriptor(null);
    setIsDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData({ matricula: student.matricula ?? "", name: student.name, email: student.email, course: student.course });
    setCapturedAvatar(student.avatar || null);
    setCapturedDescriptor(student.faceDescriptor || null);
    setIsDialogOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("alunos").delete().eq("id", id);
    if (error) {
      console.error("Erro ao remover aluno:", error);
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
      return;
    }
    removeStudent(id);
    toast({ title: "Aluno removido", description: "O aluno foi removido com sucesso." });
  };

  const handleSaveStudent = async () => {
    if (!formData.matricula || !formData.name) {
      toast({ title: "Campos obrigatórios", description: "Preencha a matrícula e o nome.", variant: "destructive" });
      return;
    }
    if (!capturedDescriptor && !editingStudent?.faceDescriptor) {
      toast({ title: "Foto obrigatória", description: "Capture a foto do aluno para extrair os dados faciais.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const BUCKET = "fotos-alunos";
      const studentId = editingStudent?.id ?? crypto.randomUUID();

      // 1. Determina a foto a usar
      const avatarToUpload = capturedAvatar ?? (editingStudent?.avatar ?? null);

      let photoUrl: string;

      if (avatarToUpload && avatarToUpload.startsWith("data:")) {
        const blob = base64ToBlob(avatarToUpload);
        const filePath = `${formData.matricula}/${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, blob, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.error("Erro no upload Storage:", uploadError);
          toast({
            title: "Erro ao salvar foto",
            description: uploadError.message,
            variant: "destructive",
          });
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(filePath);

        photoUrl = publicUrlData.publicUrl;

      } else if (avatarToUpload && avatarToUpload.startsWith("http")) {
        // Edição sem nova foto — mantém URL já existente no Storage
        photoUrl = avatarToUpload;

      } else {
        toast({ title: "Foto obrigatória", description: "Capture ou envie uma foto antes de salvar.", variant: "destructive" });
        return;
      }

      // 2. Salva na tabela alunos (obrigatório)
      const descriptorToSave = capturedDescriptor
        ? Array.from(capturedDescriptor)
        : editingStudent?.faceDescriptor
          ? Array.from(editingStudent.faceDescriptor)
          : null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from("alunos")
        .upsert(
          {
            id: studentId,
            matricula: formData.matricula,
            nome: formData.name,
            email: formData.email,
            course: formData.course,
            foto: photoUrl,
            face_descriptor: descriptorToSave,
          },
          { onConflict: "id" }
        );

      if (dbError) {
        console.error("Erro ao salvar no banco:", dbError);
        toast({ title: "Erro ao salvar no banco", description: dbError.message, variant: "destructive" });
        return;
      }

      // 3. Ambos Supabase OK — atualiza estado local (necessário para reconhecimento facial em runtime)
      if (editingStudent) {
        updateStudent(editingStudent.id, {
          matricula: formData.matricula,
          name: formData.name,
          email: formData.email,
          course: formData.course,
          avatar: photoUrl,
          ...(capturedDescriptor ? { faceDescriptor: capturedDescriptor } : {}),
        });
        toast({ title: "Aluno atualizado", description: "Dados atualizados com sucesso." });
      } else {
        addStudent({
          id: studentId,
          matricula: formData.matricula,
          name: formData.name,
          email: formData.email,
          course: formData.course,
          registrationDate: new Date(),
          avatar: photoUrl,
          faceDescriptor: capturedDescriptor ?? undefined,
          presenceCount: 0,
          totalClasses: 0,
        });
        toast({ title: "Aluno cadastrado", description: "Aluno salvo no banco com sucesso." });
      }

      setIsDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const getAttendancePercentage = (s: Student) =>
    s.totalClasses === 0 ? 0 : Math.round((s.presenceCount / s.totalClasses) * 100);

  const getAttendanceBadgeVariant = (pct: number) => {
    if (pct >= 90) return "bg-success text-success-foreground";
    if (pct >= 75) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">Gestão de Alunos</h1>
            <p className="text-muted-foreground text-lg">Cadastre e gerencie os alunos do sistema</p>
          </div>
          <Button variant="hero" onClick={handleAddStudent}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Aluno
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="md:col-span-2 shadow-card">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar alunos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{students.length}</div>
                <div className="text-sm text-muted-foreground">Total de Alunos</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {students.length > 0
                    ? Math.round(students.reduce((a, s) => a + getAttendancePercentage(s), 0) / students.length)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Presença Média</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Lista de Alunos</CardTitle>
            <CardDescription>
              {filteredStudents.length} aluno{filteredStudents.length !== 1 ? "s" : ""} encontrado{filteredStudents.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}</p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const pct = getAttendancePercentage(student);
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="bg-gradient-hero text-white font-semibold">
                            {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{student.name}</h3>
                            {student.faceDescriptor && (
                              <CheckCircle className="h-4 w-4 text-success" />
                            )}
                          </div>
                          {student.matricula && (
                            <p className="text-sm font-medium text-primary">Matrícula: {student.matricula}</p>
                          )}
                          <p className="text-muted-foreground">{student.email}</p>
                          <p className="text-sm text-muted-foreground">{student.course}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className={getAttendanceBadgeVariant(pct)}>{pct}% Presença</Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {student.presenceCount}/{student.totalClasses} aulas
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditStudent(student)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteStudent(student.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
              <DialogDescription>
                {editingStudent ? "Atualize as informações do aluno" : "Preencha os dados e capture a foto facial"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  value={formData.matricula}
                  onChange={(e) => setFormData((p) => ({ ...p, matricula: e.target.value }))}
                  placeholder="Digite a matrícula do aluno"
                />
              </div>
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Digite o email"
                />
              </div>
              <div>
                <Label htmlFor="course">Curso</Label>
                <Input
                  id="course"
                  value={formData.course}
                  onChange={(e) => setFormData((p) => ({ ...p, course: e.target.value }))}
                  placeholder="Digite o nome do curso"
                />
              </div>
              <div>
                <Label>Captura Facial</Label>
                <WebcamCapture
                  onCapture={(img, desc) => {
                    setCapturedAvatar(img);
                    setCapturedDescriptor(desc);
                  }}
                  onError={(msg) => toast({ title: "Erro", description: msg, variant: "destructive" })}
                />
                {capturedDescriptor && (
                  <p className="text-xs text-success mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Descritores faciais extraídos com sucesso
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button variant="hero" onClick={handleSaveStudent} disabled={isSaving}>
                {isSaving ? "Salvando..." : editingStudent ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
