const ImportCSVModel = function (node) {
    
    this.addIncludeLib('<stdlib.h>')
    this.addIncludeLib('<string.h>')

    // Adiciona a biblioteca necessária
    this.addLib({
        name: "csv_import_structs",
        declaration: `
        #define BUFFER_SIZE 1024

        typedef struct {
            char* name;
            double* value;
            int length;
        } DataColumn;

        typedef struct {
            DataColumn* columns;
            int columnCount;
        } CSVData;`,
        implementation: ''
    });

    // Adiciona a biblioteca necessária
    this.addLib({
        name: "csv_import_freeCSV",
        declaration: `void freeCSV(CSVData* csv);`,
        implementation: `
            void freeCSV(CSVData* csv) {
                if (csv->columns) {
                    for (int i = 0; i < csv->columnCount; i++) {
                        free(csv->columns[i].name);
                        free(csv->columns[i].value);
                    }
                    free(csv->columns);
                    csv->columns = NULL;
                    csv->columnCount = 0;
                }
            }
        `
    });

    // Adiciona a biblioteca necessária
    this.addLib({
        name: "csv_import_trimCSV",
        declaration: `void trim(char* str);`,
        implementation: `
            void trim(char* str) {
                char* end = str + strlen(str) - 1;
                while (end > str && (*end == '\\n' || *end == '\\r' || *end == ' ')) {
                    *end-- = '\\0';
                }
                memmove(str, str + strspn(str, " "), strlen(str));
            }
        `
    });

    // Adiciona a biblioteca necessária
    this.addLib({
        name: "csv_import_loadCSV",
        declaration: `void loadCSV(const char* filePath, CSVData* csv);`,
        implementation: `
            void loadCSV(const char* filePath, CSVData* csv) {
                FILE* file = fopen(filePath, "r");
                if (!file) {
                    perror("Failed to open file");
                    return;
                }

                char line[BUFFER_SIZE];
                if (!fgets(line, BUFFER_SIZE, file)) {
                    perror("Failed to read header");
                    fclose(file);
                    return;
                }

                char* token = strtok(line, ",");
                csv->columnCount = 0;
                while (token) {
                    csv->columnCount++;
                    token = strtok(NULL, ",");
                }

                csv->columns = calloc(csv->columnCount, sizeof(DataColumn));
                if (!csv->columns) {
                    perror("Memory allocation failed");
                    fclose(file);
                    return;
                }

                rewind(file);
                fgets(line, BUFFER_SIZE, file);
                token = strtok(line, ",");
                for (int i = 0; token && i < csv->columnCount; i++) {
                    trim(token);
                    csv->columns[i].name = strdup(token);
                    csv->columns[i].length = 0;
                    token = strtok(NULL, ",");
                }

                size_t rowCapacity = 16;
                size_t rowCount = 0;
                double** tempValues = calloc(csv->columnCount, sizeof(double*));

                for (int i = 0; i < csv->columnCount; i++) {
                    tempValues[i] = malloc(rowCapacity * sizeof(double));
                }

                while (fgets(line, BUFFER_SIZE, file)) {
                    if (rowCount == rowCapacity) {
                        rowCapacity *= 2;
                        for (int i = 0; i < csv->columnCount; i++) {
                            tempValues[i] = realloc(tempValues[i], rowCapacity * sizeof(double));
                        }
                    }

                    token = strtok(line, ",");
                    for (int i = 0; token && i < csv->columnCount; i++) {
                        trim(token);
                        tempValues[i][rowCount] = strtod(token, NULL);
                        token = strtok(NULL, ",");
                    }
                    rowCount++;
                }

                for (int i = 0; i < csv->columnCount; i++) {
                    csv->columns[i].value = malloc(rowCount * sizeof(double));
                    memcpy(csv->columns[i].value, tempValues[i], rowCount * sizeof(double));
                    csv->columns[i].length = rowCount;
                    free(tempValues[i]);
                }

                free(tempValues);
                fclose(file);
            }
        `
    });


    const varnames = [];

    // Verifica se as variáveis já foram utilizadas
    node.columnNames.forEach((colName, index) => {
        const varname = `var_${node.CGenUID}_${colName.replace(/\W+/g,"")}`;
        if (!this.inUseVariables.includes(varname)) {
            this.inUseVariables.push(varname);
        }
        varnames.push(varname);
    });

    this.addInit(`loadCSV(const char* filePath, CSVData* csv);`)
    this.addTerm(`freeCSV(CSVData* csv);`)

    /*
    

    // Declara o carregamento de dados
    const csvDataVar = `csv_data_${node.CGenUID}`;
    const rowsVar = `csv_rows_${node.CGenUID}`;
    const colsVar = `csv_cols_${node.CGenUID}`;
    const filePath = `"${node.filePath || "data.csv"}"`;

    this.addStep(`double* ${csvDataVar} = NULL;`);
    this.addStep(`int ${rowsVar} = 0, ${colsVar} = 0;`);
    this.addStep(`load_csv(${filePath}, &${csvDataVar}, &${rowsVar}, &${colsVar});`);

    // Gera as variáveis de saída
    varnames.forEach((varname, index) => {
        const colIndex = index;
        this.addStep(`double ${varname} = (${csvDataVar} != NULL) ? ${csvDataVar}[currentStep * ${colsVar} + ${colIndex}] : 0;`);
    });

    // Limpa memória após o uso
    this.addStep(`if (${csvDataVar} != NULL) free(${csvDataVar});`);

    return varnames;
    */

    return 'ops';
};

export { ImportCSVModel };
