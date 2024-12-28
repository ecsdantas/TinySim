// cmodel_import_csv.jsx
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
void lookup_csv(const double* table, double currentTime, double* output) {
    int timeIndex = -1;
    int size = sizeof(table) / sizeof(table[0]);
    for (int i = 0; i < size; i++) {
        if (table[i] <= currentTime) {
            timeIndex = i;
        } else {
            break;
        }
    }

    if (timeIndex == -1) {
        timeIndex = 0; // Use o primeiro valor se nenhum anterior existir
    }

    *output = table[timeIndex];
} else {
            break;
        }
    }

    if (timeIndex == -1) {
        timeIndex = 0; // Use o primeiro valor se nenhum anterior existir
    }

    *output = table[timeIndex];
}`);

    this.addLibsC__functions(`
int validate_csv_header(const char* filename, const char* portNames, int portCount) {
    FILE* file = fopen(filename, "r");
    if (file == NULL) {
        perror("Failed to open file");
        return 0;
    }

    char line[1024];
    if (fgets(line, sizeof(line), file) == NULL) {
        fclose(file);
        perror("Failed to read header line");
        return 0;
    }

    fclose(file);

    char* token = strtok(line, ",");
    int index = 0;
    while (token != NULL && index < portCount) {
        // Remove trailing newline or spaces
        char* newline = strchr(token, '\\n');
        if (newline) *newline = '\\0';
        char* space = strchr(token, ' ');
        if (space) *space = '\\0';

        if (strcmp(token, portNames[index]) != 0) {
            fprintf(stderr, "Header mismatch: expected %s but found %s\\n", portNames[index], token);
            return 0;
        }
        token = strtok(NULL, ",");
        index++;
    }

    return index == portCount;
}`);

    this.addLibsC__functions(`
void load_csv(const char* filename, double** table, const char* header) {
    FILE* file = fopen(filename, "r");
    if (file == NULL) {
        perror("Failed to open file");
        return;
    }

    char line[1024];
    int colIndex = -1;
    int capacity = 10; // Initial capacity
    int row = 0;

    *table = (double*)malloc(capacity * sizeof(double));
    if (*table == NULL) {
        perror("Failed to allocate memory for table");
        fclose(file);
        return;
    }

    if (fgets(line, sizeof(line), file) != NULL) {
        char* token = strtok(line, ",");
        int col = 0;
        while (token != NULL) {
            // Remove trailing newline or spaces
            char* newline = strchr(token, '\\n');
            if (newline) *newline = '\\0';
            char* space = strchr(token, ' ');
            if (space) *space = '\\0';

            if (strcmp(token, header) == 0) {
                colIndex = col;
                break;
            }
            token = strtok(NULL, ",");
            col++;
        }
    }

    if (colIndex == -1) {
        fprintf(stderr, "Header %s not found in CSV file.\\n", header);
        fclose(file);
        free(*table);
        *table = NULL;
        return;
    }

    while (fgets(line, sizeof(line), file)) {
        if (row >= capacity) {
            capacity *= 2;
            double* resizedTable = (double*)realloc(*table, capacity * sizeof(double));
            if (resizedTable == NULL) {
                perror("Failed to reallocate memory for table");
                free(*table);
                *table = NULL;
                fclose(file);
                return;
            }
            *table = resizedTable;
        }

        char* token = strtok(line, ",");
        int col = 0;
        while (token != NULL) {
            if (col == colIndex) {
                (*table)[row] = atof(token);
                break;
            }
            token = strtok(NULL, ",");
            col++;
        }
        row++;
    }

    fclose(file);
}
`);

    // Adiciona a declaração das funções
    this.addLibsH__declaration(`void lookup_csv(const double* table, double currentTime, double* output);`);
    this.addLibsH__declaration(`void load_csv(const char* filename, double* table, const char* header);`);
    this.addLibsH__declaration(`int validate_csv_header(const char* filename, const char* portNames, int portCount);`);

    // Verifica se a tabela de busca está definida
    const lookupTable = Array.isArray(node.lookupTable) ? node.lookupTable.flat() : [0];
    const rows = Array.isArray(node.lookupTable) ? node.lookupTable.length : 1;

    // Define a tabela com zeros para cada saída
    this.addModelC__vars(`static double ${tableVar}[] = { ${node.mapValues.get(calledPort) } };`);
    this.addModelC__vars(`static double ${outputVar};`);
    this.addModelC__vars(`static char* ${node.CGenUID}_portNames[] = {${node.getOutPorts().map(port => `"${port.options.name}"`).join(', ')}};`);

    // Adiciona a validação do cabeçalho no init
    this.addModelC__init(`
    if (!validate_csv_header("data.csv", csvImp0_portNames, 1)) {
      fprintf(stderr, "CSV header validation failed.\\n");
      exit(EXIT_FAILURE);
    }`);

    // Adiciona a inicialização para carregar os dados do arquivo CSV
    this.addModelC__init(`load_csv("data.csv", ${tableVar}, "${calledPort}");`);

    // Adiciona a lógica de retorno condicional no passo de execução
    this.addModelC__step(`lookup_csv(${tableVar}, model->simulation.simulated_time, &${outputVar});`);

    return outputVar;
};

export { ImportCSVModel };
