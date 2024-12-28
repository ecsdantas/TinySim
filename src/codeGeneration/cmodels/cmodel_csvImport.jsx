// cmodel_import_csv.jsx


// Falta remover o 4 e colocar de acordo com o tamanho da tabela lida do arquivo CSV na linha 141.
// Falta resolver o problema de carregamento do Sensor3, pois o código não está lendo a última coluna do arquivo CSV.
const ImportCSVModel = function (node) {
    const calledPort = node.calledPort.options.label; // Nome da porta ao qual foi chamado
    const tableVar = `var_${node.CGenUID}_${calledPort}_table`;
    const outputVar = `var_${node.CGenUID}_${calledPort}_output`;

    if(node.isvisited && node.outputVars && node.outputVars.includes(outputVar)){
        return outputVar;
    }
    node.isvisited = true;
    if(!node.outputVars){
        node.outputVars = [];
    }
    node.outputVars.push(outputVar);

    // Adiciona as bibliotecas necessárias
    this.addLibsH__include('#include <math.h>');
    this.addLibsH__include('#include <string.h>');
    this.addLibsH__include('#include <stdio.h>');
    this.addLibsH__include('#include <stdlib.h>');

    // Adiciona a implementação da função `lookup_csv`
    this.addLibsC__functions(`
void lookup_csv(const double* table, int size, double currentTime, double* output) {
    int timeIndex = -1;

    // Localiza o índice mais próximo do tempo atual
    for (int i = 0; i < size; i++) {
        if (table[i] <= currentTime) {
            timeIndex = i;
        } else {
            break;
        }
    }

    // Se nenhum índice válido foi encontrado, use o primeiro valor
    if (timeIndex == -1) {
        timeIndex = 0;
    }

    // Retorna o valor correspondente
    *output = table[timeIndex];
}
`);

    this.addLibsC__functions(`
int validate_csv_header(const char* filename, const char* portNames[], size_t portCount) {
    FILE* file = fopen(filename, "r");
    if (!file) return 0;

    char line[1024];
    if (!fgets(line, sizeof(line), file)) {
        fclose(file);
        return 0;
    }
    fclose(file);

    // Remove o newline ao final da linha, se existir
    char* newline = strchr(line, '\\n');
    if (newline) *newline = '\\0';

    char* token = strtok(line, ",");
    size_t i = 0;

    while (token != NULL) {
        // Remove espaços no início e no final
        while (*token == ' ') token++;
        char* end = token + strlen(token) - 1;
        while (end > token && *end == ' ') *end-- = '\\0';

        // Verifica se o número de colunas é maior que o esperado
        if (i >= portCount || strcmp(token, portNames[i]) != 0) {
            return 0; // Cabeçalho inválido
        }

        token = strtok(NULL, ",");
        i++;
    }

    // Verifica se o número de colunas no cabeçalho é igual ao esperado
    return i == portCount;
}`);

    this.addLibsC__functions(`
void load_csv(const char* filename, double** table, const char* header) {
    FILE* file = fopen(filename, "r");
    if (!file) return;

    char line[1024];
    int colIndex = -1, row = 0, capacity = 10;
    *table = malloc(capacity * sizeof(double));
    if (!*table) return fclose(file), perror("Memory allocation failed"), (void)0;

    if (fgets(line, sizeof(line), file)) {
        for (int col = 0; (colIndex == -1) && (col < sizeof(line)); col++, line[strcspn(line, "\\n")] = '\\0')
            if (!strcmp(strtok(col ? NULL : line, ","), header)) colIndex = col;
    }
    if (colIndex == -1) return fclose(file), free(*table), (void)(*table = NULL);

    while (fgets(line, sizeof(line), file)) {
        if (row >= capacity && !(*table = realloc(*table, (capacity *= 2) * sizeof(double)))) break;
        for (int col = 0; col <= colIndex; col++) {
            char* token = strtok(col ? NULL : line, ",");
            if (col == colIndex) (*table)[row++] = atof(token);
        }
    }
    fclose(file);
}
`);

    // Adiciona a declaração das funções
    this.addLibsH__declaration(`void lookup_csv(const double* table, int size, double currentTime, double* output);`);
    this.addLibsH__declaration(`void load_csv(const char* filename, double** table, const char* header);`);
    this.addLibsH__declaration(`int validate_csv_header(const char* filename, const char* portNames[], size_t portCount);`);

    // Verifica se a tabela de busca está definida
    const lookupTable = Array.isArray(node.lookupTable) ? node.lookupTable.flat() : [0];
    const rows = Array.isArray(node.lookupTable) ? node.lookupTable.length : 1;

    // Define a tabela com zeros para cada saída
    this.addModelC__vars(`double* ${tableVar} = NULL;`); // [] = { ${node.mapValues.get(calledPort) } };
    this.addModelC__vars(`static double ${outputVar};`);
    this.addModelC__vars(`const char* ${node.CGenUID}_portNames[] = {${node.getOutPorts().map(port => `"${port.options.name}"`).join(', ')}};`);

    // Adiciona a validação do cabeçalho no init
    this.addModelC__init(`
    if (!validate_csv_header("data.csv", ${node.CGenUID}_portNames, ${node.getOutPorts().length})) {
      fprintf(stderr, "CSV header validation failed.\\n");
      exit(EXIT_FAILURE);
    }`);

    // Adiciona a inicialização para carregar os dados do arquivo CSV
    this.addModelC__init(`load_csv("data.csv", &${tableVar}, "${calledPort}");`);

    // Adiciona a lógica de retorno condicional no passo de execução
    this.addModelC__step(`lookup_csv(${tableVar}, 4, model->simulation.simulated_time, &${outputVar});`);

    return outputVar;
};

export { ImportCSVModel };
