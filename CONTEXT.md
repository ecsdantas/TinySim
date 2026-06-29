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
    links/bezierLinks.jsx        # roteamento ortogonal (estilo Simulink) dos links;
                                  # nome "Bezier" é histórico, não desenha mais curvas
    selection/mouse.jsx          # seleção múltipla
    stack/stack.jsx              # undo/redo (existe, mas DESATIVADO)
  simulation/core.jsx            # engine de simulação (loop de tempo, integrationMethods.jsx)
  codeGeneration/                # gera projeto C a partir do diagrama
    cmodels/                     # um cmodel_*.jsx por tipo de bloco (espelha elements/)
    template/                    # templates .c/.h
public/samples/                  # exemplos .tsim prontos
```

## Como a simulação funciona hoje

- `SimulationEngine` (`src/simulation/core.jsx`) mantém `currentTime`,
  `stepSize`, `stopTime` e itera os nós marcados `isTerminalBlock` (saídas),
  que resolvem recursivamente suas entradas via `node.solve()` → `solution()`.
- Métodos de integração disponíveis: **Euler (RK1), Heun (RK2) e Runge-Kutta 4**,
  implementados em `src/simulation/integrationMethods.jsx`
  (`integrateLinearODE`) e usados pelos blocos com estado (Integrator,
  FirstOrder).
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
7. **Validação fraca** — checagem de ciclos algébricos feita na Fase 4
   (`algebraicLoop.jsx`); divisão por zero ainda não tratada, import de CSV
   ainda sem validação de tipos/schema.
8. **Subsistemas/hierarquia** implementados na Fase 4 (`SubsystemModel`);
   ainda sem geração de código C para eles e sem detecção de loop algébrico
   atravessando a fronteira do subsistema (ver detalhes na Fase 4).

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
- [x] **Regressão encontrada e corrigida**: a correção acima não cobria uma
      segunda borda do mesmo ciclo — `bezierLinks.jsx` e
      `selection/mouse.jsx` importavam `{ Engine } from '../nodeModel'`, e
      `nodeModel.jsx` importa `elements/index.jsx` (todos os blocos), que
      por sua vez chega em `simNodeModel.jsx` → `bezierPortModel.jsx` →
      `bezierLinks.jsx` → de volta a `nodeModel.jsx`, ainda no meio da
      definição da classe `SimNodeModel`. Isso quebrava 5 suítes de teste
      (`gain`, `integrator`, `PIDcontroller`, `variadicMathModel`,
      `isolatedImport` — 0 testes executados, `TypeError: Class extends
      value undefined`) sempre que um bloco era importado sem passar
      primeiro por `App.jsx`. Corrigido extraindo a criação do `Engine`
      para um módulo-folha novo, `src/nodes/engine.jsx` (sem dependência de
      `elements/index.jsx`); `nodeModel.jsx`, `bezierLinks.jsx` e
      `selection/mouse.jsx` agora importam `Engine` desse módulo. `npm test`
      voltou a 39/39 (7/7 suítes) e `npm run build` continua limpo.

> Validação na época: `npm test` (41/41) e `npm run build` passavam limpos
> (único warning restante é de uma dependência de terceiros,
> `@projectstorm/react-diagrams-routing`, não relacionado ao código do
> projeto). Os testes do `SimulationEngine` foram escritos contra o
> comportamento antigo antes do split em módulos, e continuaram passando
> sem alteração depois.
>
> **Atualização (2026-06-24): falha intermitente investigada — causa raiz
> identificada, não é bug de código.** `npm test` chegou a falhar (todas as
> suítes) com `TypeError: Class extends value undefined is not a
> constructor or null` em `src/elements/constant.jsx`. Repetindo `npm test`
> em loop com `node_modules/.vite` apagado a cada vez (15+ execuções), a
> falha reproduziu numa janela específica que coincidiu com uma edição em
> disco de `src/nodes/nodes/simNodeModel.jsx` (arquivo que define a classe
> base `SimNodeModel`, herdada por todo bloco) ocorrendo durante a leitura
> do Vite/Vitest. Conclusão: é uma corrida entre o test runner lendo o
> arquivo e o editor/linter salvando-o no mesmo instante — o Vite lê uma
> versão momentaneamente incompleta do módulo, a classe sai `undefined`, e
> qualquer bloco que estenda `SimNodeModel` falha no `extends`. Não é um
> ciclo de import nem regressão no código; `src/nodes/engine.jsx` e o corte
> do ciclo `nodeModel.jsx → elements/index.jsx → bloco → nodeModel.jsx`
> continuam corretos. Se voltar a acontecer, é esperado se houver edição de
> arquivo fonte (especialmente `simNodeModel.jsx`) durante a execução do
> `npm test` — não indica bug.
>
> Também nesta data: `bezierLinks.jsx` foi reescrito por completo —
> trocou o roteamento por curvas Bezier (com `computeCurvature`, descrito
> no parágrafo de Fase 2 abaixo) por roteamento ortogonal estilo Simulink
> (`computeOrthogonalRoute`, com desvio de obstáculos). `computeCurvature`
> não existe mais no código; o histórico abaixo é mantido como registro,
> não como descrição do estado atual.

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
- [x] Reativado undo/redo (`nodes/stack/stack.jsx`), com correções no design
      original: o listener antigo (`eventDidFire` no `DiagramModel`)
      capturava também `zoomUpdated`/`offsetUpdated`/`gridUpdated` (pan/zoom
      entrando como "ações" desfazíveis) e nunca capturava `positionChanged`
      (que dispara no nó, não no model) — ou seja, mover um bloco, a edição
      mais comum, nunca era gravada. `updateModel()` também trocava o
      `DiagramModel` inteiro via `Engine.setModel(new DiagramModel())`, o que
      descartava o próprio listener registrado no construtor após o primeiro
      undo/redo. Corrigido: filtra por `event.function` (só
      `nodesUpdated`/`linksUpdated`/`positionChanged`, debounced para
      `positionChanged` para não empilhar um estado por frame de arrasto);
      restaura desserializando no mesmo `model` (mesmo padrão de
      `samples.jsx`/`menubar.jsx`) em vez de trocar o objeto; reanexa
      listeners de posição aos nós recriados pela desserialização. Também
      passou a capturar edição de parâmetros de bloco (ex.: `gainValue`), que
      muda campos direto sem disparar evento nenhum — capturado no fechamento
      do modal de configurações (`useModal.close()`), único ponto confiável
      pra saber que um bloco terminou de ser editado.
      Atalhos: `Ctrl+Z` (undo) / `Ctrl+Shift+Z` (redo).
  - A instância do `Stack` é criada sob demanda (`getStackManager()`), não no
    carregamento do módulo: o módulo é importado por `modal.jsx`, que por sua
    vez é importado por praticamente todo bloco em `elements/`, então
    instanciar no load-time quebrava qualquer teste que importa um bloco
    isoladamente (`Engine.getModel()` ainda é `null` nesse cenário, antes de
    `nodeModel.jsx` rodar `Engine.setModel(...)`).
- [x] Implementar métodos de integração além de Euler — feito
      (`src/simulation/integrationMethods.jsx`: Euler/Heun/RK4).
- [x] Sincronizado o modo "tempo real" com a geração de código C. O loop
      `runRealTimeLoop` (`src/simulation/runModes.jsx`) já existia no React
      (`setTimeout(stepSize*1000)` entre passos) e o codegen já propagava o
      flag `realTimeMode` até a struct C (`model.simulation.mode`, 0 =
      simulado, 1 = tempo real), mas o `main.c.template` gerado **ignorava**
      esse campo — o loop C sempre rodava o mais rápido possível,
      independente do modo. Corrigido adicionando `sim_real_time_sleep(double
      seconds)` (`libs.h.template`/`libs.c.template`, `usleep` no
      POSIX/`Sleep` no Windows via `#ifdef _WIN32`), chamada no fim de cada
      iteração do `main.c.template` quando `model.simulation.mode == 1`,
      dormindo por `sampling_time` segundos — mesma cadência que o
      `runRealTimeLoop` do React, só que no C gerado. Validado manualmente
      compilando com `gcc` um `model.c`/`main.c` de exemplo (`stepSize=0.2`,
      `stopTime=1`, `mode=1`): 6 passos, ~1.2s de tempo real decorrido
      (medido com `time`), confirmando a sincronização.
- [x] Adicionados 4 blocos de fonte clássicos do Simulink, que faltavam por
      completo: **Step** (`src/elements/step.jsx`), **Ramp**
      (`src/elements/ramp.jsx`), **Sine Wave** (`src/elements/sineWave.jsx`)
      e **Pulse Generator** (`src/elements/pulseGenerator.jsx`) — cada um com
      bloco React, cmodel C correspondente
      (`src/codeGeneration/cmodels/cmodel_{step,ramp,sineWave,pulseGenerator}.jsx`)
      e testes (`*.test.jsx`, 16 casos novos). Seguem o mesmo padrão de
      `clock.jsx`/`random.jsx`: sem porta de entrada, leem
      `Simulation.getCurrentTime()` em `solution()`.
- [x] Adicionados 2 exemplos novos em `public/samples/`: **Signal Sources**
      (`signalsources.tsim`) — os 4 blocos novos, cada um plotado
      isoladamente — e **Closed-Loop Step Response** (`stepresponse.tsim`) —
      Step → PIDController (setpoint) com FirstOrder como planta na
      realimentação, plotando setpoint vs. resposta da planta. Gerados
      programaticamente (instanciando os nós, ligando as portas via
      `PortModel`/`LinkModel` e chamando `DiagramModel.serialize()`) em vez
      de à mão, para garantir um `model.json` válido no mesmo formato que o
      app produz ao salvar — o script usado foi descartado após a geração,
      não faz parte do repositório.

### Fase 4 — Funcionalidades tipo Simulink ainda ausentes
- [x] **Subsistemas/blocos aninhados.** Três blocos novos:
      `SubsystemModel` (`src/elements/subsystem.jsx`), `SubsystemInputModel`
      e `SubsystemOutputModel` (`subsystemInput.jsx`/`subsystemOutput.jsx`),
      registrados em `index.jsx`.
      - **Modelo**: `SubsystemModel` guarda seu próprio `internalModel`
        (`DiagramModel`) — um diagrama independente, vivo o tempo todo em
        memória, com seus próprios nós/links. Dentro dele, blocos
        `SubsystemInputModel`/`SubsystemOutputModel` marcam onde os sinais
        entram/saem; o botão "Sync Ports" no modal do `SubsystemModel`
        recalcula as portas externas a partir desses marcadores (não há
        sincronia automática em tempo real nesta rodada — decisão deliberada
        para não precisar de listeners no diagrama interno).
      - **Navegação**: "View Inside" troca o `model` do `Engine` global pelo
        `internalModel` do subsistema, no lugar (mesmo padrão que o
        undo/redo usa para restaurar estado — não cria um segundo Engine).
        Novo singleton `src/nodes/subsystemNavigation.jsx` (estilo ad-hoc
        igual ao `useModal`) mantém uma pilha de navegação e notifica
        `App.jsx`, que renderiza um breadcrumb com "‹ Back"/"Top".
        **Lacuna conhecida**: os listeners do `Stack` de undo/redo
        (`nodes/stack/stack.jsx`) são presos ao model que existia quando o
        `Stack` foi instanciado: undo/redo não acompanha a navegação para
        dentro/fora de um subsistema.
      - **Simulação**: `SubsystemModel.solution()` resolve **todas** as
        saídas de uma vez (não só a do `calledPort` chamado), porque o cache
        por passo em `SimNodeModel.solve()` guarda o retorno de uma única
        chamada de `solution()` — se o bloco resolvesse só uma porta por vez,
        consultar uma segunda saída no mesmo passo devolveria `undefined` em
        vez de recalcular. Cada `SubsystemInputModel` delega para
        `parentSubsystem.getOuterInputValue(portIndex)`, que chama
        `getNodeByInput` na própria porta externa do `SubsystemModel` — ou
        seja, o subsistema é "transparente" para o restante do motor de
        simulação, sem precisar de um segundo `SimulationEngine`.
        `reset()` propaga para todos os nós do `internalModel`.
      - **Análise de frequência**: também suportado — `linearize()` no
        `SubsystemModel` usa `this.calledPort.options.label` (`out1`,
        `out2`...) pra achar o marcador de saída certo e delega; loops
        algébricos e blocos não suportados *dentro* do subsistema propagam o
        mesmo erro que propagariam fora dele.
      - **Bug real encontrado e corrigido durante os testes**: `syncPorts()`
        chamava `this.removePort(port)` iterando direto sobre
        `this.getOutPorts()` — mas `getOutPorts()`/`getInPorts()` no
        `DefaultNodeModel` da lib retornam o **array vivo** interno
        (`portsIn`/`portsOut`), e `removePort` faz `splice` nesse mesmo
        array. Mutar um array enquanto o `forEach` itera sobre ele pula
        elementos (índices deslocam depois do `splice`) — com 2 portas para
        remover, só 1 saía. Corrigido iterando sobre uma cópia
        (`[...this.getOutPorts()]`).
      - **Não coberto nesta rodada** (limitações deliberadas, não bugs):
        detecção de loop algébrico não atravessa a fronteira de um
        subsistema (só vê suas portas externas como uma caixa preta); não há
        geração de código C para `SubsystemModel`/marcadores — chegar a um
        deles em `codeGeneration/modelActions.jsx` lança o mesmo erro
        "no C model registered" que qualquer outro bloco sem `cmodel`, em
        vez de gerar algo (falha clara, não silenciosa); sem suporte a
        subsistemas recursivos com referência a si mesmo (não testado, risco
        de recursão infinita se alguém arrastar um Subsystem dentro de si
        mesmo).
- [x] **Detecção de loop algébrico / validação de diagrama antes de simular.**
      Criado `src/simulation/algebraicLoop.jsx` (`detectAlgebraicLoop(nodes)`):
      faz DFS sobre o grafo de dependências (`getNodeByInput`) procurando
      ciclo entre blocos puramente combinacionais. A chave do design é a nova
      flag `breaksAlgebraicLoop` em `SimNodeModel` (default `false`),
      marcada `true` nos 7 blocos que já guardam `lastStepSolved`/
      `previousStep` **antes** de recursar nas entradas — `Integrator`,
      `Derivator`, `Memory`, `ZOH`, `ZeroOrder`, `FirstOrder`,
      `PIDController`. Esse guard pré-existente é o que faz esses blocos
      devolverem um valor cacheado do passo anterior em vez de recursar de
      novo no próprio input quando reentrados no mesmo passo — ou seja, eles
      já eram, na prática, os "quebra-ciclo" do motor; a detecção estática
      só formaliza essa mesma regra antes de rodar, em vez de descobrir via
      estouro de pilha. Um ciclo que não passa por nenhum desses blocos
      (ex.: `Add` ligado de volta nele mesmo via `Gain`) é reportado como erro
      antes da simulação começar.
      `setupSimulation()` (`src/simulation/setup.jsx`) agora roda essa
      checagem e retorna `{ok: false, error: 'algebraic-loop', cycleLabels}`;
      `SimulationEngine.runSetup()` (`src/simulation/core.jsx`) trata esse
      caso com um toast nomeando os blocos do ciclo (`A → B → A`) e sugerindo
      adicionar um bloco com estado, em vez de travar com call stack
      overflow sem explicação. Testes novos: `algebraicLoop.test.jsx` (6
      casos, incluindo self-loop e ciclo quebrado por bloco com estado),
      `setup.test.jsx` (4 casos) e um caso adicional em `core.test.jsx`.
- [x] **Scope de frequência / análise mais avançada**, usando `control-systems-js`
      (até então dependência sem uso real no código). Novo bloco
      `FrequencyScopeModel` (`src/elements/frequencyScope.jsx`): não participa
      do loop de tempo (`isTerminalBlock = false`), é uma análise estática
      sob demanda — botão "Analyze" no modal de configuração chama
      `analyze()`, que linealiza a cadeia de blocos conectada à sua entrada e
      plota o diagrama de Bode (magnitude/fase x frequência, escala log) com
      `BodeChart` (`elements/complements/BodeChart.jsx`, dois canvases
      chart.js empilhados).
      - **Mecanismo**: novo método `linearize()` em `SimNodeModel`
        (`nodes/nodes/simNodeModel.jsx`), análogo ao `solution()` mas
        retornando `{numerator, denominator}` (Laplace) em vez de um valor
        numérico. Default: bloco sem porta de entrada (fonte — Constant,
        Clock, Step...) é tratado como referência unitária (`{[1],[1]}`);
        bloco com entrada que não sobrescreve `linearize()` lança
        `LinearizationError` (bloco não-linear ou sem representação
        conhecida). Overrides adicionados em `GainModel` (ganho puro),
        `IntegratorModel` (`1/s`), `FirstOrderModel` (`1/(s+a)`),
        `ZeroOrderModel` (`s+a`), `PIDControllerModel` (só quando `kd=0` e a
        porta `setpoint` está desconectada — ver limitações abaixo), e
        genericamente em `VariadicMathModel` via uma flag `isLinearCombination`
        (`true` só em `AddModel`/`SubModel`; `Multiply/Divide/Mod` caem no
        default e lançam erro, por serem não-lineares).
      - Álgebra de polinômios isolada em `src/simulation/transferFunctionMath.jsx`
        (`seriesTF` para blocos em cascata, `addTF` para somas/subtrações
        sobre um denominador comum, `trimLeadingZeros`, `logSpace`,
        `LinearizationError`) — só na borda final (`FrequencyScopeModel.analyze()`)
        os coeficientes acumulados são passados pro `transferFunction()` da
        lib externa.
      - **Limitação real descoberta na lib, não só deste projeto**:
        `control-systems-js` exige `numerator.length <= denominator.length`
        (sistema "estritamente próprio" — physically realizable). Isso
        bloqueia um `Derivator` puro (`s/1`, numerador de ordem maior) e um
        PID completo com `kd≠0` (numerador de ordem 2 > denominador de ordem
        1) — por isso só PI (`kd=0`) é suportado na análise de frequência.
      - **Bug da lib contornado, não só evitado**: `tf.bode()` sem argumentos
        usa um range de frequência "default" calculado a partir dos
        polos/zeros: para qualquer sistema com polo na origem (ex.: um
        `Integrator` sozinho — o caso mais comum no app), esse cálculo
        retorna `Infinity`/`NaN` em todos os pontos (confirmado isolando o
        problema via Node antes de implementar). Por isso o bloco sempre
        gera seu próprio array de frequências log-espaçadas
        (`logSpace(minFrequency, maxFrequency, numPoints)`, configurável no
        modal) em vez de confiar no default da lib.
      - **Não suportado nesta rodada** (lança erro claro nomeando o bloco, em
        vez de silenciosamente dar um resultado errado): `Multiply`,
        `Divide`, `Mod`, `Derivator`, PID com `kd≠0`, `Saturation`, `Switch`,
        comparadores, `Memory`/`ZOH` (delay/sample discreto) e qualquer outro
        bloco que não sobrescreva `linearize()`.

### Fase 5 — Limpeza de código não utilizado (2026-06-24)
- [x] **Bug real encontrado e corrigido**: `src/elements/index.jsx` importava
      `PIDControllerModel`, `DFlipFlopModel`, `TFlipFlopModel`,
      `JKFlipFlopModel` e `SRFlipFlopModel`, mas nenhum dos 5 estava no bloco
      de `export` — ou seja, 5 blocos completos (com cmodel C e o PID com
      testes próprios) ficavam invisíveis na barra de elementos, sem nenhum
      erro visível. Corrigido adicionando os 5 ao `export`.
- [x] Removidos comentários de código morto sem valor explicativo:
      import comentado de `RightAnglePortModel` e comentário inline
      desatualizado em `simNodeModel.jsx`, bloco de serialização de portas
      comentado (feature nunca concluída) também em `simNodeModel.jsx`, e
      implementação antiga comentada em `cmodel_constantPI.jsx`.
- Avaliado e **mantido** (não é código morto, é débito documentado/planejado):
  `nodes/stack/stack.jsx` (undo/redo desativado, mas listado na Fase 3 para
  reativar) e a dependência `control-systems-js` no `package.json`
  (reservada para a Fase 4 — análise de frequência).

### Fase 6 — Sinais vetoriais (Fase 1: Mux/Demux + visualização) (2026-06-29)
- [x] **Maior gap estrutural com o Simulink identificado**: todo sinal hoje é
      escalar (`solution()` retorna `{label: Number}`); blocos como
      Add/Gain/Integrator fazem aritmética direta no valor lido, sem
      checagem de tipo. Isso bloqueava qualquer bloco MIMO/vetorial. Decisão
      explícita de **não** reescrever os ~70 blocos de uma vez (risco alto
      demais dado o débito técnico do projeto); esta fase entrega o núcleo
      Simulink-like com blast radius controlado.
- [x] Sinal vetorial representado como array JS comum (`number[]`), fluindo
      pela mesma porta/link que hoje carrega um `Number` — sem classe
      wrapper nova, mantendo a filosofia "valor opaco" do motor de
      simulação (`solve()`/cache/`getNodeByInput` continuam sem saber nada
      sobre o tipo do dado).
- [x] **Guard contra corrupção silenciosa**: novo módulo
      `src/simulation/vectorSignal.jsx` (`isVectorSignal`, `VectorSignalError`,
      `assertScalar`, mesmo padrão de `LinearizationError` em
      `transferFunctionMath.jsx`). Aplicado nos pontos de maior tráfego —
      `variadicMathModel.jsx` (cobre Add/Sub/Multiply/Divide/Mod de uma vez),
      `gain.jsx`, `integrator.jsx`, `derivator.jsx`, `firstOrder.jsx`,
      `memory.jsx` — para que alimentar esses blocos com um vetor lance um
      erro claro em vez de corromper silenciosamente (concatenação de string
      em vez de soma, por exemplo).
  - **Gap conhecido, deixado de propósito**: os outros ~19 blocos que também
    fazem aritmética/comparação direta (`comparator`, `average`,
    `pow/log/exp/sqrt/trigonometric`, `lookupTable`, `saturation`, `switch`,
    `CSVExport`, etc.) não receberam o guard nesta rodada — não é regressão
    (hoje também não validam nada), mas alimentá-los com vetor ainda falha
    silenciosamente. Candidato a uma Fase 1.1.
- [x] **Blocos novos `Mux`/`Demux`** (`src/elements/mux.jsx`/`demux.jsx`),
      registrados em `index.jsx`. `Mux`: N portas de entrada escalares (mesmo
      padrão "Add port" de `VariadicMathModel`) → 1 saída vetorial
      `[in1, in2, ...]`. `Demux`: 1 entrada vetorial → N saídas escalares,
      largura configurável no painel de settings (recria as portas de saída
      via `syncOutputPorts()`, mesmo padrão de `SubsystemModel.syncPorts()`).
  - **Cuidado de serialização**: `Demux.deserialize()` **não** chama
    `syncOutputPorts()` — as portas (e os links que carregam) já são
    restauradas por `super.deserialize()` a partir do próprio JSON salvo;
    recriá-las ali descartaria esses links. Só o campo `width` é restaurado.
- [x] `SimNodeModel.createPort(label, isInput, options)` ganhou um 3º
      parâmetro opcional repassado ao `BezierPortModel` — usado por Mux para
      marcar sua porta de saída com `vectorWidth: N`. Blocos existentes
      continuam chamando com 2 argumentos, sem alteração de comportamento.
  - **Limitação conhecida**: `vectorWidth` não sobrevive a um save/load do
    diagrama — `BezierPortModel` não tem `serialize()`/`deserialize()`
    próprios, então esse metadado (puramente cosmético, usado só pra engrossar
    o traço do link) se perde ao recarregar um `.tsim` salvo. Os links/portas
    em si (e a simulação) não são afetados, só o indicador visual.
- [x] **Visualização de vetor**: `plot.jsx` detecta quando um valor de porta é
      um array (`buildPlotDatasets()`, extraída como função pura e testada
      isoladamente) e expande automaticamente em N sub-datasets no gráfico
      (`label[0]`, `label[1]`...) em vez de quebrar contra o Chart.js, que
      espera `number[]` plano. `display.jsx` formata um valor vetorial como
      `[1.00, 2.00, 3.00]` em vez do `toString()` padrão do React.
      Comportamento escalar existente preservado 100% em ambos.
- [x] Indicador visual cosmético em `bezierLinks.jsx`: link cuja porta de
      origem tem `vectorWidth > 1` é desenhado com traço mais espesso (7 em
      vez de 4). Não afeta a simulação.
- **Fora de escopo desta fase** (mesmo padrão de documentação usado para
  Subsystem/PID kd≠0): geração de código C para Mux/Demux (cai no mesmo erro
  genérico "no C model registered"); `linearize()`/análise de frequência
  através de Mux/Demux; sinais vetoriais cruzando fronteira de Subsystem.

> `npm test` (113/113, 19 suítes) e `npm run build` passaram limpos após
> esta fase (mesmo warning pré-existente de terceiros em
> `@projectstorm/react-diagrams-routing`).

### Fase 6.1 — Guard de sinal vetorial nos blocos restantes (2026-06-29)
- [x] Fechado o gap documentado no fim da Fase 6: aplicado `assertScalar`
      (`src/simulation/vectorSignal.jsx`) nos ~32 blocos restantes que liam
      `inpt.solve()` cru e faziam aritmética/comparação direta —
      `comparator`, `comparatorConstante`, `average`, `standardDeviation`,
      `pow`, `log`, `exp`, `sqrt`, `trigonometric`, `round`, `saturation`,
      `lookupTable`, `min`, `max`, `isEven`, `isOdd`, `CSVExport`,
      `histogram`, `gauge`, `PIDcontroller` (entrada e setpoint), `zo`,
      `zoh`, os 7 gates lógicos (`AND/OR/NOT/NOR/NAND/XOR/XNOR`) e os 4
      flip-flops (`D/T/JK/SR`). Mesmo padrão de erro claro (`VectorSignalError`)
      em vez de corrupção silenciosa (concatenação de string, comparação
      sempre verdadeira por array ser truthy, `NaN`).
  - **Decisão de escopo dentro do Switch**: só a porta de condição
    (`in2`, usada como booleano) recebeu o guard. As portas selecionadas
    (`in1`/`in3`, repassadas direto pro output) ficaram sem guard de
    propósito — um Switch repassando um vetor inteiro (seleção de um de N
    sinais vetoriais) é uma operação Simulink-like legítima, não corrupção.
  - **Decisão de escopo no Subsystem**: `subsystem.jsx`/`subsystemOutput.jsx`
    continuam sem guard — são passthrough transparente de fronteira, e
    "sinais vetoriais cruzando fronteira de Subsystem" já está listado como
    fora de escopo (ver Fase 6); guardar ali bloquearia essa extensão futura
    sem nenhum bug atual a prevenir.
- [x] Testes de regressão dedicados (`src/elements/vectorSignalGuard.test.jsx`)
      cobrindo um representante de cada padrão de leitura (comparador de 2
      portas, redução variádica booleana, condição do Switch, blocos de
      aridade fixa 1 e 2 entradas, blocos de visualização) — não os 32
      arquivos individualmente, só os padrões.

> `npm test` (121/121, 20 suítes) e `npm run build` passaram limpos.

### Fase 7 — Geração de código C para Subsystem/Mux/Demux (2026-06-29)
- [x] Fechado o último gap documentado nas Fases 4 e 6: `SubsystemModel`,
      `MuxModel` e `DemuxModel` agora geram C em vez de cair no erro
      genérico "no C model registered". Implementado reaproveitando peças
      já existentes no `ModelActions`, sem mecanismo novo:
      `node.calledPort.options.label` (já usado por
      `cmodel_dFlipFlop.jsx` para blocos com múltiplas saídas),
      `node.isvisited` (dedupe de código gerado) e o fato de todo cmodel já
      poder devolver uma **expressão C**, não só um identificador simples
      (precedente: `_arrayReduceCModel.jsx` monta `double param[] = {...}`
      inline).
- [x] **`cmodel_mux.jsx`**: declara `double var_..._mux[N];` (N = portas de
      entrada conectadas) e preenche cada posição no step. Retorna o nome
      do array.
- [x] **`cmodel_demux.jsx`**: não declara variável própria — devolve uma
      expressão de indexação (`array[i]`) no array C da entrada, usando
      `calledPort` para saber qual `outN` foi pedido.
- [x] **`cmodel_subsystem.jsx`** (3 exports: `SubsystemModel`,
      `SubsystemOutputModel`, `SubsystemInputModel`): delega para as mesmas
      pontes já usadas pela simulação (`getNodeByInput`, `parentSubsystem`,
      `portIndex`, `getOutputMarkers()` — ver `src/elements/subsystem.jsx`,
      **zero alteração nesse arquivo**). Nenhum dos três marcadores declara
      variável própria, só repassa a expressão C do nó que resolveu —
      subsistemas aninhados funcionam por recursão sem caso especial.
- [x] **Decisão de design deliberada**: nenhuma validação em JS de "Mux
      alimentando bloco escalar" antes de gerar C. Um array decai pra
      pointer em C; se um bloco escalar tentar usar esse retorno em
      aritmética direta (`pointer * double`), o C gerado não compila —
      mesma filosofia "falha clara, não corrupção silenciosa" já usada no
      guard de simulação (Fase 6/6.1), só que resolvida pelo próprio
      compilador C em vez de um guard em JS.
- [x] Testes novos (`cmodel_mux.test.jsx`, `cmodel_demux.test.jsx`,
      `cmodel_subsystem.test.jsx`) chamando as funções de cmodel
      diretamente com um `this` mockado (`addModelC__vars`/`addModelC__step`/
      `getNode` como `vi.fn()`) — não havia precedente de teste de cmodel
      no repo antes desta fase.

> `npm test` (131/131, 23 suítes) e `npm run build` passaram limpos.
> Fora de escopo, documentado: subsistema recursivo referenciando a si
> mesmo (risco não testado já citado na Fase 4, herdado pelo codegen sem
> ser regressão nova).

## Observação sobre ordem

A Fase 1 deve vir antes da Fase 2 ser totalmente eficaz: escrever testes
contra a duplicação atual significa testar 20 variações do mesmo bug em
potencial. Mas a Fase 2 (mesmo que parcial — só o engine de simulação) deveria
começar em paralelo, antes de qualquer refator grande, para servir de rede de
segurança contra regressões durante a Fase 1.
