# 📖 Lectio

<div align="center">
  <img src="app.lection/src/assets/logo.webp" alt="Lectio Logo" width="200" height="200">
  
  **Um quiz gamificado sobre textos bíblicos diários**
  
  [![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![AWS](https://img.shields.io/badge/AWS-Serverless-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
  [![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.13-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
</div>

## 🎯 Sobre o Projeto

O **Lectio** é uma aplicação web gamificada que transforma o estudo bíblico diário em uma experiência interativa e envolvente. Através de quizzes baseados nos textos diários das Testemunhas de Jeová, os usuários podem testar seus conhecimentos, acumular pontos e manter uma "ofensiva" de dias consecutivos de estudo.

### ✨ Principais Funcionalidades

- 📚 **Quiz Diário**: Questões geradas automaticamente baseadas no texto bíblico do dia
- 🎮 **Sistema de Gamificação**: Pontos, escudos e sequência de dias (ofensiva)
- 🤖 **IA Integrada**: Geração automática de perguntas usando OpenAI
- 📊 **Estatísticas Detalhadas**: Acompanhamento do progresso e conquistas
- 🛡️ **Sistema de Escudos**: Proteção da sequência de dias em caso de falha
- 🔄 **Scraping Automático**: Coleta automática de textos diários
- 📱 **Design Responsivo**: Interface moderna e adaptável a todos os dispositivos

## 🏗️ Arquitetura

### Frontend (`app.lection/`)

- **React 19** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **React Query** para gerenciamento de estado do servidor
- **Zustand** para estado local
- **React Router** para navegação

### Backend (`api.lection/`)

- **Serverless Framework** com AWS Lambda
- **Node.js 22** com TypeScript
- **Arquitetura Hexagonal** (Clean Architecture)
- **Dependency Injection** personalizado
- **AWS DynamoDB** para persistência
- **AWS SQS** para processamento assíncrono
- **AWS Cognito** para autenticação
- **OpenAI API** para geração de perguntas

### Infraestrutura

- **AWS Lambda** para funções serverless
- **DynamoDB** como banco de dados principal
- **SQS** para filas de processamento
- **Cognito** para autenticação e autorização
- **API Gateway** para endpoints HTTP
- **S3** para armazenamento de arquivos

## 🚀 Tecnologias Utilizadas

### Frontend

- React 19.1.0
- TypeScript 5.8.3
- Vite 7.0.4
- Tailwind CSS 4.1.13
- Framer Motion 12.23.11
- React Query 5.89.0
- Zustand 5.0.8
- React Router 6.22.1
- Radix UI
- Lucide React

### Backend

- Node.js 22.x
- TypeScript 5.9.2
- Serverless Framework
- AWS SDK v3
- OpenAI API 5.12.2
- Cheerio (web scraping)
- Zod (validação)
- Reflect Metadata

### Infraestrutura

- AWS Lambda
- DynamoDB
- SQS
- Cognito
- API Gateway
- S3
- CloudFormation

## 📦 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta AWS configurada
- Serverless Framework CLI
- Chave da API OpenAI

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/lection.git
cd lection
```

### 2. Configure o Backend

```bash
cd api.lection
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### 3. Configure o Frontend

```bash
cd ../app.lection
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com a URL da API
```

### 4. Deploy da Infraestrutura

```bash
cd ../api.lection
npx serverless deploy --stage dev
```

### 5. Execute o Frontend

```bash
cd ../app.lection
npm run dev
```

## 🎮 Como Funciona

### Sistema de Pontuação

- **Questões Fáceis**: 10 pontos
- **Questões Médias**: 20 pontos
- **Questões Difíceis**: 30 pontos

### Sistema de Escudos

- Custo: 100 pontos por escudo
- Máximo: 2 escudos por usuário
- Proteção: Mantém a sequência de dias quando você perde um dia

### Ofensiva (Streak)

- Conta dias consecutivos de quiz completado
- Perdida quando não completa o quiz em um dia
- Escudos protegem contra perda da ofensiva

## 🔧 Scripts Disponíveis

### Frontend

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Gera build de produção
npm run preview      # Preview do build de produção
npm run lint         # Executa o linter
npm run ci:typecheck # Verificação de tipos TypeScript
```

### Backend

```bash
npm run typecheck    # Verificação de tipos TypeScript
npm run lint         # Executa o linter
npx serverless deploy # Deploy para AWS
```

## 📁 Estrutura do Projeto

```
lection/
├── app.lection/                 # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # Serviços de API
│   │   └── contexts/          # Contextos React
│   └── public/                # Arquivos estáticos
├── api.lection/               # Backend Serverless
│   ├── src/
│   │   ├── application/       # Casos de uso e controllers
│   │   ├── entities/          # Entidades de domínio
│   │   ├── infra/            # Infraestrutura e gateways
│   │   └── main/             # Funções Lambda
│   └── sls/                  # Configurações Serverless
└── README.md
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Jonathan Amarante**

- GitHub: [@JonathanPR0](https://github.com/JonathanPR0)
- LinkedIn: [jonathanamarante](https://linkedin.com/in/jonathanamarante)

---

<div align="center">
  <p>Feito para incentivar o estudo bíblico diário</p>
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
</div>
EOF
