const ImportCSVModel = function (node) {
    const varnames = [];

    // Verifica se as variáveis já foram utilizadas
    node.columnNames.forEach((colName, index) => {
        const varname = `var_${node.CGenUID}_col${index + 1}`;
        if (!this.inUseVariables.includes(varname)) {
            this.inUseVariables.push(varname);
        }
        varnames.push(varname);
    });

    this.addIncludeLib('<stdio.h>')
    this.addIncludeLib('<stdlib.h>')


    // Adiciona a biblioteca necessária
    this.addLib({
        name: "csv_import",
        declaration: `void load_csv(const char* file_path, double** data, int* rows, int* cols);`,
        implementation: `
            void load_csv(const char* file_path, double** data, int* rows, int* cols) {
                FILE* file = fopen(file_path, "r");
                if (!file) return;

                // Count rows and columns
                *rows = 0;
                *cols = 0;
                char line[1024];

                while (fgets(line, 1024, file)) {
                    (*rows)++;
                    if (*rows == 1) {
                        char* token = strtok(line, ",");
                        while (token) {
                            (*cols)++;
                            token = strtok(NULL, ",");
                        }
                    }
                }

                rewind(file);
                *data = (double*)malloc((*rows) * (*cols) * sizeof(double));
                int row = 0;

                while (fgets(line, 1024, file)) {
                    int col = 0;
                    char* token = strtok(line, ",");
                    while (token) {
                        (*data)[row * (*cols) + col] = atof(token);
                        token = strtok(NULL, ",");
                        col++;
                    }
                    row++;
                }

                fclose(file);
            }
        `
    });

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
};

export { ImportCSVModel };
