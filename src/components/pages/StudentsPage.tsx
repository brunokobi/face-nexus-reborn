import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Camera, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  registrationDate: Date;
  avatar?: string;
  presenceCount: number;
  totalClasses: number;
}

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([
    {
      id: "001",
      name: "Ana Silva",
      email: "ana.silva@email.com",
      course: "Engenharia de Software",
      registrationDate: new Date("2024-01-15"),
      presenceCount: 18,
      totalClasses: 20
    },
    {
      id: "002",
      name: "Bruno Costa",
      email: "bruno.costa@email.com",
      course: "Ciência da Computação",
      registrationDate: new Date("2024-01-20"),
      presenceCount: 19,
      totalClasses: 20
    },
    {
      id: "003",
      name: "Carlos Santos",
      email: "carlos.santos@email.com",
      course: "Sistemas de Informação",
      registrationDate: new Date("2024-02-01"),
      presenceCount: 15,
      totalClasses: 18
    },
    {
      id: "004",
      name: "Diana Oliveira",
      email: "diana.oliveira@email.com",
      course: "Engenharia de Software",
      registrationDate: new Date("2024-01-10"),
      presenceCount: 20,
      totalClasses: 20
    },
    {
      id: "005",
      name: "Eduardo Lima",
      email: "eduardo.lima@email.com",
      course: "Ciência da Computação",
      registrationDate: new Date("2024-01-25"),
      presenceCount: 16,
      totalClasses: 20
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: ""
  });

  const { toast } = useToast();

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({ name: "", email: "", course: "" });
    setIsDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      course: student.course
    });
    setIsDialogOpen(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    toast({
      title: "Aluno removido",
      description: "O aluno foi removido com sucesso.",
    });
  };

  const handleSaveStudent = () => {
    if (!formData.name || !formData.email || !formData.course) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (editingStudent) {
      // Update existing student
      setStudents(prev => prev.map(s => 
        s.id === editingStudent.id 
          ? { ...s, ...formData }
          : s
      ));
      toast({
        title: "Aluno atualizado",
        description: "Os dados do aluno foram atualizados com sucesso.",
      });
    } else {
      // Add new student
      const newStudent: Student = {
        id: (students.length + 1).toString().padStart(3, '0'),
        ...formData,
        registrationDate: new Date(),
        presenceCount: 0,
        totalClasses: 0
      };
      setStudents(prev => [...prev, newStudent]);
      toast({
        title: "Aluno adicionado",
        description: "Novo aluno foi cadastrado com sucesso.",
      });
    }

    setIsDialogOpen(false);
    setFormData({ name: "", email: "", course: "" });
  };

  const getAttendancePercentage = (student: Student) => {
    if (student.totalClasses === 0) return 0;
    return Math.round((student.presenceCount / student.totalClasses) * 100);
  };

  const getAttendanceBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return "bg-success text-success-foreground";
    if (percentage >= 75) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">Gestão de Alunos</h1>
            <p className="text-muted-foreground text-lg">
              Cadastre e gerencie os alunos do sistema
            </p>
          </div>
          <Button variant="hero" onClick={handleAddStudent}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Aluno
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="md:col-span-2 shadow-card">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alunos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
                  {Math.round(students.reduce((acc, s) => acc + getAttendancePercentage(s), 0) / students.length || 0)}%
                </div>
                <div className="text-sm text-muted-foreground">Presença Média</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Lista de Alunos</CardTitle>
            <CardDescription>
              {filteredStudents.length} aluno{filteredStudents.length !== 1 ? 's' : ''} encontrado{filteredStudents.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
                  </p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const attendancePercentage = getAttendancePercentage(student);
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="bg-gradient-hero text-white font-semibold">
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{student.name}</h3>
                          <p className="text-muted-foreground">{student.email}</p>
                          <p className="text-sm text-muted-foreground">{student.course}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className={getAttendanceBadgeVariant(attendancePercentage)}>
                            {attendancePercentage}% Presença
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {student.presenceCount}/{student.totalClasses} aulas
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-destructive hover:text-destructive"
                          >
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

        {/* Add/Edit Student Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? "Editar Aluno" : "Novo Aluno"}
              </DialogTitle>
              <DialogDescription>
                {editingStudent 
                  ? "Atualize as informações do aluno" 
                  : "Preencha os dados para cadastrar um novo aluno"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome completo"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Digite o email"
                />
              </div>
              
              <div>
                <Label htmlFor="course">Curso</Label>
                <Input
                  id="course"
                  value={formData.course}
                  onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                  placeholder="Digite o nome do curso"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="hero" onClick={handleSaveStudent}>
                {editingStudent ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}