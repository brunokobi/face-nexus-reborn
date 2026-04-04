import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, TrendingUp, Users, Calendar, Clock, MapPin, BookOpen, GraduationCap } from "lucide-react";
import type { Student, AttendanceRecord, Discipline, Teacher } from "@/types/student";

interface ReportsPageProps {
  students: Student[];
  attendance: AttendanceRecord[];
  disciplines: Discipline[];
  teachers: Teacher[];
}

export function ReportsPage({ students, attendance, disciplines, teachers }: ReportsPageProps) {
  const [disciplineFilter, setDisciplineFilter] = useState("all");

  // Aplica filtro de disciplina antes de calcular métricas
  const filteredAttendance = disciplineFilter === "all"
    ? attendance
    : attendance.filter((r) => r.disciplineId === disciplineFilter);

  const totalStudents = students.length;
  const avgAttendance = totalStudents > 0
    ? Math.round(
        students.reduce((a, s) => {
          const pct = s.totalClasses > 0 ? (s.presenceCount / s.totalClasses) * 100 : 0;
          return a + pct;
        }, 0) / totalStudents
      )
    : 0;

  const todayStr = new Date().toDateString();
  const presentToday = filteredAttendance.filter(
    (r) => new Date(r.timestamp).toDateString() === todayStr && r.status === "success"
  ).length;

  const attendanceByDate = filteredAttendance.reduce((acc, record) => {
    const dateStr = new Date(record.timestamp).toDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    if (record.status === "success") acc[dateStr].push(record.studentId);
    return acc;
  }, {} as Record<string, string[]>);

  const last7Days: { date: string; present: number; total: number; percentage: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    const uniqueStudents = new Set(attendanceByDate[ds] ?? []);
    last7Days.push({
      date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      present: uniqueStudents.size,
      total: totalStudents,
      percentage: totalStudents > 0 ? Math.round((uniqueStudents.size / totalStudents) * 100) : 0,
    });
  }

  const ranking = [...students]
    .sort((a, b) => {
      const pa = a.totalClasses > 0 ? a.presenceCount / a.totalClasses : 0;
      const pb = b.totalClasses > 0 ? b.presenceCount / b.totalClasses : 0;
      return pb - pa;
    })
    .slice(0, 5);

  const locationCounts: Record<string, number> = {};
  filteredAttendance.forEach((r) => {
    locationCounts[r.location] = (locationCounts[r.location] || 0) + 1;
  });

  // Presença por disciplina
  const disciplineCounts: Record<string, number> = {};
  attendance.forEach((r) => {
    if (r.disciplineName) {
      disciplineCounts[r.disciplineName] = (disciplineCounts[r.disciplineName] || 0) + 1;
    }
  });

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
            <h1 className="text-3xl lg:text-4xl font-bold">Relatórios de Presença</h1>
            <p className="text-muted-foreground text-lg">Análises e estatísticas baseadas em dados reais</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {disciplines.length > 0 && (
              <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
                <SelectTrigger className="w-56">
                  <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filtrar por disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as disciplinas</SelectItem>
                  {disciplines.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.code} — {d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><Users className="h-6 w-6 text-primary" /></div>
                <div>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <div className="text-sm text-muted-foreground">Alunos Cadastrados</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg"><TrendingUp className="h-6 w-6 text-success" /></div>
                <div>
                  <div className="text-2xl font-bold">{avgAttendance}%</div>
                  <div className="text-sm text-muted-foreground">Presença Média</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg"><Calendar className="h-6 w-6 text-accent" /></div>
                <div>
                  <div className="text-2xl font-bold">{filteredAttendance.length}</div>
                  <div className="text-sm text-muted-foreground">Total Registros</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg"><Clock className="h-6 w-6 text-warning" /></div>
                <div>
                  <div className="text-2xl font-bold">{presentToday}</div>
                  <div className="text-sm text-muted-foreground">Presentes Hoje</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Presença dos Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {last7Days.map((day, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium min-w-[50px]">{day.date}</div>
                      <div className="flex-1 bg-muted rounded-full h-2 max-w-[200px]">
                        <div className="bg-gradient-hero h-2 rounded-full transition-all duration-300" style={{ width: `${day.percentage}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getAttendanceBadgeVariant(day.percentage)}>{day.percentage}%</Badge>
                      <span className="text-sm text-muted-foreground">{day.present}/{day.total}</span>
                    </div>
                  </div>
                ))}
                {attendance.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Nenhum dado de presença registrado ainda.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Ranking de Presença</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ranking.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Nenhum aluno cadastrado.</p>
                ) : (
                  ranking.map((student, index) => {
                    const pct = student.totalClasses > 0 ? Math.round((student.presenceCount / student.totalClasses) * 100) : 0;
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm">{index + 1}</div>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.presenceCount}/{student.totalClasses} aulas</div>
                          </div>
                        </div>
                        <Badge className={getAttendanceBadgeVariant(pct)}>{pct}%</Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {Object.keys(disciplineCounts).length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Registros por Disciplina</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(disciplineCounts).sort((a, b) => b[1] - a[1]).map(([disc, count]) => {
                  const discipline = disciplines.find((d) => d.name === disc);
                  const teacher = discipline ? teachers.find((t) => t.id === discipline.teacherId) : undefined;
                  return (
                    <div key={disc} className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{disc}</span>
                        <Badge variant="outline">{count} reg.</Badge>
                      </div>
                      {teacher && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" /> {teacher.name}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {Object.keys(locationCounts).length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Registros por Local</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(locationCounts).sort((a, b) => b[1] - a[1]).map(([loc, count]) => (
                  <div key={loc} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">{loc}</span>
                    <Badge variant="outline">{count} registros</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
