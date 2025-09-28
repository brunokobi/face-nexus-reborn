import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Users, BarChart3, Zap, Shield, Clock } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: Camera,
      title: "Reconhecimento Facial",
      description: "Tecnologia avançada de IA para identificação precisa em tempo real"
    },
    {
      icon: Zap,
      title: "Processamento Rápido",
      description: "Respostas instantâneas com algoritmos otimizados"
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Proteção de dados e privacidade garantidas"
    },
    {
      icon: Clock,
      title: "Controle de Presença",
      description: "Registro automático e preciso de frequência"
    },
    {
      icon: Users,
      title: "Gestão de Alunos",
      description: "Cadastro e gerenciamento completo de estudantes"
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Análises e estatísticas completas de presença"
    }
  ];

  const stats = [
    { value: "99.8%", label: "Precisão" },
    { value: "<1s", label: "Tempo de Resposta" },
    { value: "24/7", label: "Disponibilidade" },
    { value: "100%", label: "Segurança" }
  ];

  return (
    <div className="min-h-screen animated-gradient">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-hero bg-clip-text text-transparent">
                    Presence Now
                  </span>
                  <br />
                  <span className="text-foreground">
                    Reconhecimento Facial Inteligente
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                  Sistema moderno de controle de presença usando tecnologia de IA avançada. 
                  Registro automático, preciso e seguro para instituições educacionais.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => onNavigate("scanner")}
                  className="text-lg px-8 py-6"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Iniciar Reconhecimento
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => onNavigate("students")}
                  className="text-lg px-8 py-6"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Gerenciar Alunos
                </Button>
              </div>
            </div>
            
            <div className="relative animate-fade-in">
              <div className="absolute inset-0 bg-gradient-hero rounded-3xl opacity-20 blur-3xl transform scale-90"></div>
              <img 
                src={heroImage}
                alt="Tecnologia de Reconhecimento Facial"
                className="relative rounded-3xl shadow-glow w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-muted-foreground mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Funcionalidades Avançadas
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tecnologia de ponta para transformar o controle de presença em sua instituição
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="glass hover:shadow-card transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Experimente agora o sistema de reconhecimento facial mais avançado do mercado
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => onNavigate("scanner")}
              className="text-lg px-8 py-6"
            >
              <Camera className="h-5 w-5 mr-2" />
              Testar Agora
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onNavigate("reports")}
              className="text-lg px-8 py-6"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Ver Relatórios
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}