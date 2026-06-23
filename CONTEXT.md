# TinySim — Contexto do Projeto

## O que é

Simulador de diagramas de blocos estilo **Simulink**, rodando 100% no browser
(SPA React, deploy em Vercel: https://tinysim.vercel.app). O usuário arrasta
blocos para um canvas, conecta-os com curvas Bezier, configura parâmetros e
executa uma simulação de tempo contínuo. O resultado pode ser exportado como
código C compilável.

## Stack

- React 18.3.1 (JSX puro, **sem TypeScript**)
- Vite 6 + @vitejs/plugin-react-swc
- `@projectstorm/react-diagrams` v7 — engine de canvas/nodes/links
- `chart.js` — blocos de plot/histograma
- `control-systems-js`, `jszip`, `dompurify`, `react-toastify`
- Sem gerenciador de estado global (Redux/Zustand) — `useState` local +
  alguns singletons ad-hoc (`Simulation`, `useModal`, `sessionStorage`)
- **Vitest** (`npm test` / `npm run test:watch`), ambiente `happy-dom`
  (necessário porque `@projectstorm/react-diagrams` espera globais de
  browser mesmo só sendo importado) — adicionado nesta fase de refatoração,
  era zero antes.

## Estrutura principal

```
src/
  App.jsx, main.jsx              # raiz da aplicação
  components/                    # UI: menubar, sidebar, librarybar, modal, zoom...
  elements/                      # ~55 blocos (Constant, Add, Integrator, PID, Plot...)
    complements/                 # widgets de visualização (LineChart, Gauge, Histogram)
  nodes/                         # motor de diagrama
    nodeModel.jsx                # classe base de nó
    nodes/simNodeModel.jsx       # SimNodeModel (toda lógica de bloco herda daqui)
    ports/                       # portas Bezier
    links/bezierLinks.jsx        # cálculo das curvas Bezier dos links
    selection/mouse.jsx          # seleção múltipla
    stack/stack.jsx              # undo/redo (existe, mas DESATIVADO)
  simulation/core.jsx            # engine de simulação (loop de tempo, Euler/ODE1)
  codeGeneration/                # gera projeto C a partir do diagrama
    cmodels/                     # um cmodel_*.jsx por tipo de bloco (espelha elements/)
    template/                    # templates .c/.h
public/samples/                  # exemplos .tsim prontos
```

## Como a simulação funciona hoje

- `SimulationEngine` (`src/simulation/core.jsx`) mantém `currentTime`,
  `stepSize`, `stopTime` e itera os nós marcados `isTerminalBlock` (saídas),
  que resolvem recursivamente suas entradas via `node.solve()` → `solution()`.
- Único método de integração implementado: **Euler explícito (ODE1)**. Existe
  um campo `method` para outros métodos, mas não está implementado.
- Cache por passo (`lastStepSolved`) evita recálculo, desativável via
  `statelessMode`.
- Cada bloco em `src/elements/*.jsx` estende `SimNodeModel` e implementa sua
  própria `solution()`, ícone e painel de configuração — não há abstração
  compartilhada para os padrões repetidos (ex: operações binárias).

## Estado atual (a partir do git log e do código)

Desenvolvimento ativo, mas em estágio "beta funcional, sem rede de segurança".
Commits recentes corrigiram bugs visuais nas conexões Bezier (`fix bezier
port`, `fix bug nodes is scapping`) — sinal de que a camada de
nodes/links/ports ainda é frágil.

## Débito técnico identificado (ordem de impacto)

1. **Zero testes** — qualquer refator é às escuras. Maior risco do projeto,
   já que é um simulador (resultado numérico errado é silencioso).
2. **Sem TypeScript / tipagem** — `SimNodeModel`, portas e o engine de
   simulação têm contratos implícitos (quais campos um bloco "tem que" ter)
   que só existem na cabeça de quem escreveu.
3. **`simulation/core.jsx` monolítico** (224 linhas) — mistura setup, loop de
   tempo, modo realtime e reset numa única classe.
4. **Duplicação massiva em `elements/`** — ~20 blocos matemáticos binários
   (add/sub/multiply/divide/pow/mod...) repetem o mesmo boilerplate de
   criação de portas e estrutura. Mesmo padrão duplicado em
   `codeGeneration/cmodels/` (um arquivo por bloco, pouca reutilização).
5. **Undo/redo desativado** (`nodes/stack/stack.jsx` existe mas foi desligado
   no commit `00871ea`) — feature incompleta largada pela metade.
6. **Estado global desorganizado** — mistura de singleton de classe
   (`Simulation`), objeto global (`useModal`), `sessionStorage` (clipboard) e
   `useState` espalhado pelos componentes, sem padrão único.
7. **Validação fraca** — sem checagem de ciclos algébricos, divisão por zero
   não tratada, import de CSV sem validação de tipos/schema.
8. **Sem subsistemas/hierarquia** — todo diagrama é uma única camada plana;
   Simulink real permite blocos aninhados.

## Plano de trabalho

### Fase 1 — Refatoração de base (pré-requisito para tudo o resto)
- [x] Extrair uma classe genérica para os blocos matemáticos variádicos
      (add/sub/multiply/divide/mod): criada `VariadicMathModel`
      (`src/elements/variadicMathModel.jsx`). Ela concentra criação de portas,
      o loop de redução (`combine()`) e a UI de "Add port"; cada bloco agora
      só declara metadata (`identity`, `seedFromFirstInput`, `combine()`,
      ícone). Os 5 arquivos em `elements/` caíram de ~50-70 linhas cada para
      ~25-30.
- [x] Mesma consolidação no code generation: criada
      `makeArrayReduceCModel` (`src/codeGeneration/cmodels/_arrayReduceCModel.jsx`),
      uma factory para cmodels que compilam para uma função C
      `(const double* array, int size)`. `cmodel_add/sub/multiply/divide/mod.jsx`
      agora só passam nome da função e corpo em C; o boilerplate de
      registrar libs/vars/steps ficou centralizado. `cmodel_mod` foi
      convertido do formato pairwise antigo (`mod_operation(a,b)`) para o
      mesmo formato array/size dos demais — sem mudança de comportamento
      (mesma matemática, NaN em divisão por zero), apenas C gerado mais
      consistente entre blocos.
  - **Ainda não cobertos por essa abstração**: pow/log/exp/sqrt são
    aridade fixa (1-2 entradas, sem "Add port") — padrão diferente, menor
    ganho de duplicação. Candidatos a uma segunda abstração
    (`FixedArityMathModel`) numa próxima rodada, mas não bloqueiam o resto.
- [x] Bug pequeno encontrado e corrigido durante a Fase 1: `getCurrentTime()`
      estava duplicado em `simulation/core.jsx` (warning de build), e havia
      um terceiro método `getTime()` idêntico e não usado em nenhum lugar do
      código. Os dois métodos redundantes foram removidos.
- [x] Configurado **Vitest** (`npm test` / `npm run test:watch`) — primeira
      ferramenta de teste do projeto. Foi necessário subir `vite` de 6.0.3
      para 6.4.3 (mesmo range `^6` do `package.json`, sem mudar a versão
      major) porque vitest 4.1.9 não inicializava contra o `vite@6.0.3`
      exato (erro interno no `ModuleRunner`).
- [x] Escrita uma suíte de regressão para `SimulationEngine`
      (`src/simulation/core.test.jsx`, 9 testes) **antes** de tocar na
      estrutura interna — cobre `runSetup`, `runStep` (caminho feliz e
      quando um nó lança erro), `runStandard`, `resetSimulation` e os
      cálculos de `getTotalTimeArray`/`getTimeArray`. Serviu de rede de
      segurança para o item abaixo.
- [x] Quebrado `simulation/core.jsx` em módulos menores, com a API pública
      da classe `SimulationEngine` preservada (mesmos métodos, mesma
      assinatura, mesmo singleton exportado por padrão — a classe agora
      também é exportada nomeada para permitir testes com instâncias
      isoladas):
      - `setup.jsx` — `setupSimulation(model)`: valida o modelo e extrai os nós.
      - `runStep.jsx` — `solveTerminalNodes(...)`: resolve os blocos terminais de um passo.
      - `runModes.jsx` — `runStandardLoop`/`runRealTimeLoop`: os dois laços de execução.
      - `reset.jsx` — `resetNodes(...)`: reseta os blocos com estado interno.
      - `timeArrays.jsx` — `buildTotalTimeArray`/`buildTimeArray`: funções puras já usadas pelos testes.
      `core.jsx` ficou como um orquestrador fino que mantém o estado
      (`currentStep`, `currentTime`, flags) e delega a lógica para esses
      módulos.
- [ ] Definir contrato explícito de bloco (interface que todo `SimNodeModel`
      deve cumprir) e documentar em um único lugar.
- [ ] Unificar gerenciamento de estado global (escolher um padrão: Context,
      Zustand, ou ao menos consolidar os singletons existentes em um só
      lugar coerente).
- [ ] Avaliar migração incremental para TypeScript (ao menos `nodeModel`,
      `simNodeModel` e `simulation/core` primeiro, por serem o núcleo).
- [x] Trocado, nos 48 arquivos restantes de `src/elements/*.jsx`, o import
      `{ SimNodeModel } from '../nodes/nodeModel'` pelo import direto de
      `../nodes/nodes/simNodeModel` (troca mecânica, mesma import shape em
      todos os arquivos). Isso elimina o ciclo `nodeModel.jsx →
      elements/index.jsx → <qualquer bloco> → nodeModel.jsx` para todo o
      diretório `elements/` — qualquer bloco agora pode ser importado
      isoladamente (testes, Storybook, etc.) sem depender da ordem de
      carregamento. `App.jsx` e `components/dropElement.jsx` continuam
      importando de `nodeModel.jsx` normalmente, pois eles de fato
      precisam do `Engine`/`Model`, não só do `SimNodeModel`.
  - Teste de regressão dedicado em
    `src/elements/isolatedImport.test.jsx`: importa 5 blocos
    (`Average`, `Clock`, `Comparator`, `Text`, `Switch`) como os
    **primeiros** imports do arquivo, reproduzindo exatamente o cenário que
    quebrava antes (módulo cego, sem `App.jsx` carregado primeiro).

> Validação até aqui: `npm test` (41/41) e `npm run build` passam limpos
> (único warning restante é de uma dependência de terceiros,
> `@projectstorm/react-diagrams-routing`, não relacionado ao código do
> projeto). Os testes do `SimulationEngine` foram escritos contra o
> comportamento antigo antes do split em módulos, e continuaram passando
> sem alteração depois. A correção de `computeCurvature` foi confirmada
> explicitamente com o usuário antes de aplicar, por mudar a aparência
> visual de todos os links já existentes.

### Fase 2 — Rede de segurança
- [x] Configurar test runner (Vitest — `npm test`).
- [x] Testes unitários para `SimulationEngine` (Euler step, reset, stop
      condition) — feito em paralelo com o split do `core.jsx` (ver Fase 1).
- [x] Testes para `solution()` dos blocos mais usados:
      `Add/Sub/Multiply/Divide/Mod` (via `VariadicMathModel`), `Integrator`
      (Euler + guarda de loop algébrico + reset), `Gain` e `PIDController`
      (termos P/I/D isolados + guarda de loop algébrico + reset). Total: 36
      testes (`npm test`). Ambiente do Vitest precisou ser trocado de
      `node` para `happy-dom`, porque `@projectstorm/react-diagrams`
      assume globais de browser (`self`) mesmo só sendo importado, não
      renderizado.
- [x] Testes de regressão para o cálculo de curvatura Bezier
      (`bezierLinks.jsx` → `computeCurvature`).
  - **Bug real encontrado e corrigido durante a escrita desses testes**:
    `computeCurvature` sempre retornava `0.5`, para qualquer ângulo. Causa:
    `Array.prototype.find` num array ordenado ascendente por ângulo sempre
    batia no primeiro item (`{angle:5, curvature:0}`) sempre que o ângulo
    real era maior que 5°; e como esse item tem `curvature: 0` (falsy), o
    fallback `?.curvature || 0.5` sempre vencia. Ou seja, a "curvatura
    adaptativa" por ângulo nunca funcionou — todo link sempre usou 0.5.
    Corrigido para uma busca por "menor breakpoint que ainda cobre o
    ângulo" (ângulos pequenos → quase reto, perto de 90° → curva máxima,
    voltando a quase reto perto de 180°), confirmado com o usuário antes de
    aplicar por mudar a aparência visual de todos os links existentes.
  - **Bug colateral encontrado e corrigido ao testar `VariadicMathModel`**:
    importar `add.jsx` (ou qualquer um dos 5 blocos refatorados) de forma
    isolada — como um teste faz, sem passar primeiro por `App.jsx`/
    `nodeModel.jsx` — quebrava com `Class extends value undefined is not a
    constructor`. Causa: `variadicMathModel.jsx` importava `SimNodeModel`
    de `../nodes/nodeModel`, que reexporta o `Engine`/`Model` e por isso
    arrasta `elements/index.jsx` (todos os blocos) de volta — um ciclo de
    import que só "dava sorte" de resolver na ordem certa quando a entrada
    era sempre `App.jsx`. Corrigido importando direto do módulo-fonte
    (`../nodes/nodes/simNodeModel`), que não depende de `elements/index.jsx`.
    **Esse mesmo padrão de import (`from '../nodes/nodeModel'`) ainda existe
    em praticamente todos os outros arquivos de `elements/`** — funciona
    hoje só por ordem de carregamento favorável; é uma dívida arquitetural
    a ter em mente ao adicionar testes para mais blocos.

### Fase 3 — Dívidas funcionais conhecidas (do próprio `public/todo.html`)
- [ ] Reativar undo/redo (`nodes/stack/stack.jsx`).
- [ ] Implementar métodos de integração além de Euler (campo `method` já
      existe, falta implementação).
- [ ] Sincronizar modo "tempo real" com a geração de código C.
- [ ] Adicionar mais blocos e mais exemplos.

### Fase 4 — Funcionalidades tipo Simulink ainda ausentes
- [ ] Subsistemas/blocos aninhados.
- [ ] Detecção de loop algébrico / validação de diagrama antes de simular.
- [ ] Scope de frequência / análise mais avançada (há `control-systems-js`
      já na dependência, subutilizada).

## Observação sobre ordem

A Fase 1 deve vir antes da Fase 2 ser totalmente eficaz: escrever testes
contra a duplicação atual significa testar 20 variações do mesmo bug em
potencial. Mas a Fase 2 (mesmo que parcial — só o engine de simulação) deveria
começar em paralelo, antes de qualquer refator grande, para servir de rede de
segurança contra regressões durante a Fase 1.
