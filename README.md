# Presence Now — Sistema de Controle de Presença por Reconhecimento Facial

> Aplicação web moderna para registro automático de presença utilizando reconhecimento facial em tempo real via MediaPipe Face Mesh.

---

## Visão Geral

O **Presence Now** é um sistema de controle de presença baseado em visão computacional. Utilizando a câmera do dispositivo, o sistema detecta e reconhece rostos de alunos cadastrados em tempo real, registrando automaticamente a presença com timestamp, localização e nível de confiança — sem necessidade de cartões, senhas ou interação manual.

---

## Funcionalidades

- **Reconhecimento facial em tempo real** — detecção contínua via webcam com overlay visual
- **Cadastro de alunos** — captura facial integrada no formulário de cadastro
- **Registro automático de presença** — cada aluno é reconhecido uma vez por sessão
- **Múltiplos locais** — suporte a portaria, salas, laboratórios etc.
- **Dashboard de relatórios** — KPIs, ranking de frequência e histórico por local
- **100% client-side** — sem backend, todos os dados armazenados localmente no navegador

---

## Stack Tecnológica

| Categoria | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Reconhecimento Facial | MediaPipe Face Mesh (Tasks Vision API) |
| Gerenciamento de Estado | React hooks + localStorage |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Ícones | Lucide React |

---

## Como o Reconhecimento Funciona

```
Cadastro                          Scanner
─────────                         ───────
Webcam → FaceLandmarker           Webcam → FaceLandmarker (loop)
       → 478 landmarks                   → 478 landmarks por rosto
       → 68 pontos-chave                 → descriptor normalizado
       → descriptor Float32Array[204]    → FaceMatcher (distância cosseno)
       → salvo no localStorage           → match < 0.25 → aluno identificado
                                         → registro de presença automático
```

- **Modelo**: MediaPipe `face_landmarker` (float16)
- **Descriptor**: 68 landmarks normalizados → vetor unitário de 204 floats
- **Matching**: Distância cosseno — threshold `0.25`
- **Confiança**: `1 - (distância / 0.25)` → escala 0–100%
- **Status**: Verde > 70% | Amarelo 50–70% | Vermelho < 50%

---

## Pré-requisitos

- Node.js 18+
- npm 9+
- Navegador com suporte a WebRTC (Chrome, Edge, Firefox, Safari)
- Conexão com internet (para download do modelo MediaPipe no primeiro acesso)

---

## Instalação e Execução

```bash
# Clonar o repositório
git clone <URL_DO_REPOSITÓRIO>
cd face-nexus-reborn

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse em: **http://localhost:8080**

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Build de produção |
| `npm run preview` | Pré-visualizar build de produção |
| `npm run lint` | Verificar erros de lint |

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── layout/
│   │   └── Navbar.tsx              # Barra de navegação
│   ├── pages/
│   │   ├── HomePage.tsx            # Landing page
│   │   ├── ScannerPage.tsx         # Reconhecimento em tempo real
│   │   ├── StudentsPage.tsx        # CRUD de alunos
│   │   └── ReportsPage.tsx         # Dashboard de relatórios
│   ├── scanner/
│   │   ├── WebcamCapture.tsx       # Captura facial para cadastro
│   │   └── LocationModal.tsx       # Seleção de local
│   └── ui/                         # Componentes shadcn/ui
├── hooks/
│   ├── use-mediapipe.ts            # MediaPipe Face Mesh (detecção + matching)
│   ├── use-student-store.ts        # Estado global + persistência
│   ├── use-camera.ts               # Gerenciamento de webcam (WebRTC)
│   └── use-toast.ts                # Notificações
├── types/
│   └── student.ts                  # Interfaces TypeScript
public/
└── mediapipe-wasm/                 # Arquivos WASM do MediaPipe (servidos localmente)
```

---

## Modelo de Dados

### Student

```typescript
{
  id: string                  // UUID
  name: string
  email: string
  course: string
  registrationDate: Date
  avatar?: string             // JPEG em base64
  faceDescriptor?: Float32Array  // Vetor 204 floats (MediaPipe)
  presenceCount: number
  totalClasses: number
}
```

### AttendanceRecord

```typescript
{
  id: string
  studentId: string
  studentName: string
  timestamp: Date
  confidence: number          // 0.0 – 1.0
  location: string
  status: "success" | "warning" | "error"
}
```

---

## Persistência

Todos os dados são armazenados no `localStorage` do navegador:

| Chave | Conteúdo |
|---|---|
| `presence-now-students` | Lista de alunos (com descritores faciais) |
| `presence-now-attendance` | Histórico de registros de presença |

> **Atenção**: ao limpar os dados do navegador, todos os registros serão perdidos. Para ambientes de produção, recomenda-se integração com um backend e banco de dados.

---

## Permissões Necessárias

- **Câmera** (`getUserMedia`) — obrigatória para detecção e cadastro
- A aplicação deve ser servida via **HTTPS** em produção para acesso à câmera

---

## Limitações Conhecidas

- Dados armazenados apenas localmente (sem sincronização entre dispositivos)
- Reconhecimento pode ser afetado por iluminação inadequada ou ângulos extremos
- O modelo MediaPipe (~29 MB) é baixado no primeiro acesso e cacheado pelo browser
- Alunos cadastrados com versões anteriores baseadas em `face-api.js` precisam recadastrar a foto

---

## Licença

Este projeto é de uso privado. Todos os direitos reservados.
