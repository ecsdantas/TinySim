// cmodel_import_csv.jsx


// Falta remover o 4 e colocar de acordo com o tamanho da tabela lida do arquivo CSV na linha 141.
// Falta resolver o problema de carregamento do Sensor3, pois o código não está lendo a última coluna do arquivo CSV.
const ImportCSVModel = function (node) {
    const calledPort = node.calledPort.options.label; // Nome da porta ao qual foi chamado
    const tableVar = `var_${node.CGenUID}_${calledPort}_table`;
    const tableSize = `var_${node.CGenUID}_${calledPort}_length`;
    const outputVar = `var_${node.CGenUID}_${calledPort}_output`;

    if(!node.isvisited){
        node.outputVars = [];
    }
    if(node.isvisited && node.outputVars && node.outputVars.includes(outputVar)){
        return outputVar;
    }
    node.isvisited = true;
    node.outputVars.push(outputVar);

    // Adiciona as bibliotecas necessárias
    this.addLibsH__include('#include <math.h>');
    this.addLibsH__include('#include <string.h>');
    this.addLibsH__include('#include <stdio.h>');
    this.addLibsH__include('#include <stdlib.h>');

    // Adiciona a implementação da função `lookup_csv`
    this.addLibsC__functions(`
void lookup_csv(const double* time, const double* table, size_t* size, double currentTime, double* output) {
    int timeIndex = -1;

    // Localiza o índice mais próximo do tempo atual
    for (size_t i = 0; i < *size; i++) {
        if (time[i] <= currentTime) {
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
void load_csv(const char* filename, double** table, size_t* length, const char* header) {
    FILE* file = fopen(filename, "r");
    if (!file) return;

    char line[1024];
    int colIndex = -1, row = 0, capacity = 10;
    *table = malloc(capacity * sizeof(double));
    if (!*table) {
        fclose(file);
        return;
    }

    // Processar o cabeçalho
    if (fgets(line, sizeof(line), file)) {
        char* token = strtok(line, ",");
        for (int col = 0; token; col++, token = strtok(NULL, ",")) {
            token[strcspn(token, "\\n")] = '\\0'; // Remove newline
            if (strcmp(token, header) == 0) {
                colIndex = col;
                break;
            }
        }
    }

    if (colIndex == -1) {
        free(*table);
        *table = NULL;
        fclose(file);
        return;
    }

    // Processar os dados
    while (fgets(line, sizeof(line), file)) {
        if (row >= capacity) {
            capacity *= 2;
            double* resizedTable = realloc(*table, capacity * sizeof(double));
            if (!resizedTable) {
                free(*table);
                *table = NULL;
                fclose(file);
                return;
            }
            *table = resizedTable;
        }

        char* token = strtok(line, ",");
        for (int col = 0; token; col++, token = strtok(NULL, ",")) {
            if (col == colIndex) {
                (*table)[row++] = atof(token);
                break;
            }
        }
    }

    *length = row;
    fclose(file);
}
`);

    // Adiciona a declaração das funções
    this.addLibsH__declaration(`void lookup_csv(const double* time, const double* table, size_t* size, double currentTime, double* output);`);
    this.addLibsH__declaration(`int validate_csv_header(const char* filename, const char* portNames[], size_t portCount);`);
    this.addLibsH__declaration(`void load_csv(const char* filename, double** table, size_t* length, const char* header);`);

    // Define a tabela com zeros para cada saída
    this.addModelC__vars(`double* ${tableVar} = NULL;`); // [] = { ${node.mapValues.get(calledPort) } };
    this.addModelC__vars(`static double ${outputVar};`);
    this.addModelC__vars(`static size_t ${tableSize};`);
    this.addModelC__vars(`const char* ${node.CGenUID}_portNames[] = {${node.getOutPorts().map(port => `"${port.options.name}"`).join(', ')}};`);
    this.addModelC__vars(`const char* var_${node.CGenUID}_csvFilename = "data.csv";`);

    // Adiciona a validação do cabeçalho no init
    this.addModelC__init(`
    if (!validate_csv_header(var_${node.CGenUID}_csvFilename, ${node.CGenUID}_portNames, ${node.getOutPorts().length})) {
      fprintf(stderr, "CSV header validation failed.\\n");
      exit(EXIT_FAILURE);
    }`);

    // Adiciona a inicialização para carregar os dados do arquivo CSV
    this.addModelC__init(`load_csv(var_${node.CGenUID}_csvFilename, &${tableVar}, &${tableSize}, "${calledPort}");`);

    // Adiciona a lógica de retorno condicional no passo de execução
    this.addModelC__step(`lookup_csv(var_${node.CGenUID}_Time_table,${tableVar}, &${tableSize}, model->simulation.simulated_time, &${outputVar});`);

    return outputVar;
};

export { ImportCSVModel };
