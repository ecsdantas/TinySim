// cmodel_csvExport.jsx

const ExportCSVModel = function (node) {
    const outputFileName = `csv_${node.CGenUID}_filename`;
    const columnNames = node.columnNames;

    // Adiciona as bibliotecas necessárias
    this.addLibsH__include('#include <stdio.h>');
    this.addLibsH__include('#include <stdlib.h>');
    this.addLibsH__include('#include <string.h>');

    // Declaração de variáveis
    this.addModelC__vars(`static const char* ${outputFileName} = "data_${node.CGenUID}.csv";`);
    this.addModelC__vars(`const char* csv_column_names[] = {${columnNames.map(name => `"${name}"`).join(', ')}};`);

    // Função para criar o arquivo CSV com cabeçalhos
    this.addLibsC__functions(`
void csv_createFile(const char* filename, const char* csv_column_names[], size_t csv_column_count) {
    FILE* file = fopen(filename, "w");
    if (!file) {
        perror("Failed to open CSV file for writing");
        exit(EXIT_FAILURE);
    }

    fprintf(file, "Time,");
    for (size_t i = 0; i < csv_column_count; i++) {
        fprintf(file, "%s%s", csv_column_names[i], (i < csv_column_count - 1) ? "," : "\\n");
    }

    fclose(file);
}`);

    // Função para escrever uma linha no CSV
    this.addLibsC__functions(`
void csv_write_row(const char* filename, const double* data, size_t data_length) {
    FILE* file = fopen(filename, "a");
    if (!file) {
        perror("Failed to open CSV file for appending");
        exit(EXIT_FAILURE);
    }

    for (size_t i = 0; i < data_length; i++) {
        fprintf(file, "%f%s", data[i], (i < data_length - 1) ? "," : "\\n");
    }

    fclose(file);
}`);

    // Declarações de funções no header
    this.addLibsH__declaration(`void csv_createFile(const char* filename, const char* csv_column_names[], size_t csv_column_count);`);
    this.addLibsH__declaration(`void csv_write_row(const char* filename, const double* data, size_t data_length);`);

    // Inicialização do arquivo CSV
    this.addModelC__init(`csv_createFile(${outputFileName}, csv_column_names, ${columnNames.length});`);

    // Lógica de execução: salvar valores a cada passo
    const incomingData = node.getInPorts().map((port, index) => this.getNode(node.getNodeByInput(index)));
    this.addModelC__step(`double csvExport_${node.CGenUID}_data[] = {model->simulation.simulated_time, ${incomingData.join(", ")}};`);
    this.addModelC__step(`csv_write_row(${outputFileName}, csvExport_${node.CGenUID}_data, ${incomingData.length + 1});`);

    return null; // Este bloco não tem saída específica
};

export { ExportCSVModel };
