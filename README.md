# Combinar-Formularios | ETL para Distribuição de Carga

Uma aplicação web administrativa atuando como um pipeline de dados (ETL - Extract, Transform, Load) para preparar, higienizar e consolidar informações departamentais. O sistema processa formulários de intenção, listas de disciplinas e planilhas de saldo, exportando um arquivo JSON padronizado e rigoroso para alimentar algoritmos de otimização combinatória e metaheurísticas no problema de atribuição de carga didática.

## 🚀 Funcionalidades

### 📥 1. Ingestão de Dados (Upload)

A plataforma suporta o upload de múltiplas fontes de dados estruturadas:
*   **Disciplinas (`.json`):** Importação da grade de disciplinas/turmas ofertadas no semestre.
*   **Saldos Docentes (`.xlsx`):** Leitura nativa de planilhas Excel para extração da carga didática acumulada e do status atual de cada professor.
*   **Formulários de Intenção (Lote de `.json`):** Upload em massa dos formulários individuais dos docentes, contendo avaliações, comentários, preferências de agrupamento e os pesos associados às turmas desejadas.

### ⚙️ 2. Transformação e Normalização (Backend)
*   **Tratamento de Chaves de Turma:** Algoritmo interno que normaliza formatações inconsistentes vindas dos formulários (ex: conversão de `"SME0320,1.0"` para o formato padrão `"SME0320,1"`).
*   **Cruzamento Relacional:** Vinculação automática entre as intenções extraídas dos formulários e a base oficial de disciplinas cadastradas.

### 📊 3. Gestão e Análise (Painel Administrativo)
Interface de usuário rica para intervenção manual e curadoria dos dados antes da otimização:
*   **Dashboard Estatístico:** Visão geral rápida do volume de dados ingeridos (cadastros ativos, total de turmas e formulários processados).
*   **Tabelas de Edição (Data Tables):** Listagem paginada e com busca para analisar e editar propriedades dos docentes (status de atividade, saldo numérico, agrupamentos e comentários).
*   **Resolução de Conflitos:** Interface dedicada para corrigir manualmente vínculos falhos (quando uma turma solicitada pelo docente não é encontrada automaticamente na grade oficial).

### 📤 4. Exportação Padronizada
Geração do arquivo final consolidado para o motor de otimização. O sistema garante uma tipagem estrita da saída, gerando um JSON na versão `3.0` contendo:
*   **`docentes`**: Exportado rigorosamente como um array de objetos (contendo `nome`, `ativo`, `comentario` e `agrupar`).
*   **`formularios`**: Dicionário de relações docente-turma com seus respectivos pesos.
*   **`disciplinas`**: Base atualizada de turmas ofertadas.
*   **`saldos`**: Dicionário mapeando cada docente ao seu saldo didático para o modelo matemático.

---

## 🛠️ Tecnologias Utilizadas

O sistema foi desenvolvido visando alta performance, tipagem estrita e uma experiência de usuário (UX) fluida:

*   **[Next.js](https://nextjs.org/) (App Router):** Framework React para renderização de interface e rotas de API (Server Actions).
*   **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática para garantir a integridade dos dados durante o processo de ETL.
*   **[Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/):** Estilização utilitária e biblioteca de componentes acessíveis para a construção do painel administrativo.

---

## 💻 Como rodar o projeto localmente

### Pré-requisitos
*   Node.js (versão 18+ recomendada)
*   Gerenciador de pacotes (NPM, Yarn ou PNPM)
*   Instância local ou remota do PostgreSQL (ou projeto no Supabase)

### Instalação

1. Clone o repositório:
```bash
git clone [https://github.com/InvOptLab/combinar-formularios.git](https://github.com/InvOptLab/combinar-formularios.git)
cd combinar-formularios
```

2. Instale as dependências:
```bash
npm install
```