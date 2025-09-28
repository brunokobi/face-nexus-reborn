import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, TrendingUp, Users, Calendar, Clock } from "lucide-react";

export function ReportsPage() {
  // Mock data - in a real app, this would come from a database
  const stats = {
    totalStudents: 5,
    averageAttendance: 87,
    totalClasses: 20,
    presentToday: 4
  };

  const attendanceData = [
    { date: "2024-01-22", present: 4, total: 5, percentage: 80 },
    { date: "2024-01-23", present: 5, total: 5, percentage: 100 },
    { date: "2024-01-24", present: 3, total: 5, percentage: 60 },
    { date: "2024-01-25", present: 4, total: 5, percentage: 80 },
    { date: "2024-01-26", present: 5, total: 5, percentage: 100 },
  ];

  const topStudents = [
    { name: "Diana Oliveira", attendance: 100, classes: "20/20" },
    { name: "Bruno Costa", attendance: 95, classes: "19/20" },
    { name: "Ana Silva", attendance: 90, classes: "18/20" },
    { name: "Eduardo Lima", attendance: 80, classes: "16/20" },
    { name: "Carlos Santos", attendance: 83, classes: "15/18" },
  ];

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
            <h1 className="text-3xl lg:text-4xl font-bold">Relatórios de Presença</h1>
            <p className="text-muted-foreground text-lg">
              Análises e estatísticas detalhadas do sistema
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <div className="text-sm text-muted-foreground">Alunos Cadastrados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
                  <div className="text-sm text-muted-foreground">Presença Média</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalClasses}</div>
                  <div className="text-sm text-muted-foreground">Total de Aulas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.presentToday}</div>
                  <div className="text-sm text-muted-foreground">Presentes Hoje</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Attendance Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Presença dos Últimos Dias
              </CardTitle>
              <CardDescription>
                Acompanhe a evolução da presença diária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceData.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium min-w-[80px]">
                        {new Date(day.date).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: '2-digit' 
                        })}
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-2 max-w-[200px]">
                        <div 
                          className="bg-gradient-hero h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${day.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getAttendanceBadgeVariant(day.percentage)}>
                        {day.percentage}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {day.present}/{day.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Students */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ranking de Presença
              </CardTitle>
              <CardDescription>
                Alunos com melhor frequência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.classes} aulas
                        </div>
                      </div>
                    </div>
                    <Badge className={getAttendanceBadgeVariant(student.attendance)}>
                      {student.attendance}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Análise Detalhada</CardTitle>
            <CardDescription>
              Insights sobre o desempenho do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-success">Pontos Positivos</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Presença média acima de 85%</li>
                  <li>• Sistema funcionando 100% do tempo</li>
                  <li>• Reconhecimento facial preciso</li>
                  <li>• Interface intuitiva e rápida</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-warning">Pontos de Atenção</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 1 aluno com frequência abaixo de 75%</li>
                  <li>• Variação na presença diária</li>
                  <li>• Necessidade de follow-up</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Recomendações</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Acompanhar alunos com baixa frequência</li>
                  <li>• Implementar notificações automáticas</li>
                  <li>• Gerar relatórios semanais</li>
                  <li>• Considerar sistema de recompensas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}