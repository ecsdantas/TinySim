// cmodel_plot.jsx

const PlotModel = function (node) {
    
    this.addModelC__vars("#define points ${MODEL_C__STOP_SIMULATION_TIME_TEMPLATE}/${MODEL_C__SAMPLING_TIME_TEMPLATE}+1");
    this.addModelC__vars(`const char* plot_${node.CGenUID}_filename = "plot.svg";`);
    node.datasetSettings.map((_, index) => {
        this.addModelC__vars(`double var_${node.CGenUID}_dataset${index+1}_values[points] = {0};`);
    })
    this.addModelC__vars(`double var_${node.CGenUID}_time[points] = {0};`);
    this.addModelC__vars(`const char* var_${node.CGenUID}_labels[] = {${ node.datasetSettings.map( ds => `"${ds.name}"` ).join(", ") }};`);
    this.addModelC__vars(`const char* var_${node.CGenUID}_color[] = {${ node.datasetSettings.map( ds => `"${ds.color}"` ).join(", ") }};`);

    // Adiciona as bibliotecas necessárias
    this.addLibsH__include('#include <stdio.h>');

    // Adiciona a implementação da função `lookup_csv`
    this.addLibsC__functions(`
int create_svg(const char *filename, double *x, double **y, const char *labels[], const char *colors[], size_t signals, size_t size) {
    int width = 800, height = 600;
	FILE *file = fopen(filename, "w");
	if (!file) {
		perror("Erro ao criar o arquivo SVG");
		return 0;
	}

	fprintf(file, "<svg xmlns='http://www.w3.org/2000/svg' width='%d' height='%d'>\\n", width, height);
	fprintf(file, "<rect width='100%%' height='100%%' fill='white'/>\\n");

	int x_min = x[0], x_max = x[size - 1], y_min = y[0][0], y_max = y[0][0];
	for (int i = 0; i < size; i++) {
		if (x[i] < x_min) x_min = x[i];
		if (x[i] > x_max) x_max = x[i];
		for (int j = 0; j < signals; j++) {
			if (y[j][i] < y_min) y_min = y[j][i];
			if (y[j][i] > y_max) y_max = y[j][i];
		}
	}

	fprintf(file, "<g stroke='lightgray' stroke-width='0.5'>\\n");
	int x_ticks = (size < 10) ? size : 10;
	for (int i = 0; i < x_ticks; i++) {
		int x_value = x_min + i * (x_max - x_min) / (x_ticks - 1);
		int gx = 50 + (x_value - x_min) * (width - 100) / (x_max - x_min);
		fprintf(file, "<line x1='%d' y1='50' x2='%d' y2='%d'/>\\n", gx, gx, height - 50);
	}
	for (int gy = 50; gy <= height - 50; gy += 50) fprintf(file, "<line x1='50' y1='%d' x2='%d' y2='%d'/>\\n", gy, width - 50, gy);
	fprintf(file, "</g>\\n");

	fprintf(file, "<line x1='50' y1='%d' x2='%d' y2='%d' stroke='black' stroke-width='2'/>\\n", height - 50, width - 50, height - 50);
	fprintf(file, "<line x1='50' y1='%d' x2='50' y2='50' stroke='black' stroke-width='2'/>\\n", height - 50);
	fprintf(file, "<text x='%d' y='%d' font-size='16' fill='black'>X-axis</text>\\n", width - 100, height - 30);
	fprintf(file, "<text x='20' y='70' font-size='16' fill='black'>Y-axis</text>\\n");

	for (int j = 0; j < signals; j++) {
		fprintf(file, "<polyline fill='none' stroke='%s' stroke-width='1.5' points='", colors[j]);
		for (int i = 0; i < size; i++) {
			int x_scaled = 50 + (x[i] - x_min) * (width - 100) / (x_max - x_min);
			int y_scaled = height - 50 - (y[j][i] - y_min) * (height - 100) / (y_max - y_min);
			fprintf(file, "%d,%d ", x_scaled, y_scaled);
		}
		fprintf(file, "'/>\\n");
	}

	fprintf(file, "<g font-size='14'>\\n");
	for (int j = 0; j < signals; j++) {
		fprintf(file, "<rect x='%d' y='%d' width='20' height='10' fill='%s'/>\\n", width - 150, 60 + j * 20, colors[j]);
		fprintf(file, "<text x='%d' y='%d' fill='black'>%s</text>\\n", width - 120, 70 + j * 20, labels[j]);
	}
	fprintf(file, "</g>\\n");

	// Add x-axis ticks
	fprintf(file, "<g font-size='12' fill='black' text-anchor='middle'>\\n");
	for (int i = 0; i < x_ticks; i++) {
		int x_value = x_min + i * (x_max - x_min) / (x_ticks - 1);
		int x_scaled = 50 + (x_value - x_min) * (width - 100) / (x_max - x_min);
		fprintf(file, "<text x='%d' y='%d'>%d</text>\\n", x_scaled, height - 35, x_value);
	}
	fprintf(file, "</g>\\n");

	// Add y-axis ticks
	fprintf(file, "<g font-size='12' fill='black' text-anchor='end'>\\n");
	int y_ticks = 11;
	for (int i = 0; i <= y_ticks; i++) {
		int y_value = y_min + i * (y_max - y_min) / y_ticks;
		int y_scaled = height - 50 - i * (height - 100) / y_ticks;
		fprintf(file, "<text x='45' y='%d'>%d</text>\\n", y_scaled + 4, y_value);
	}
	fprintf(file, "</g>\\n");

	fprintf(file, "</svg>\\n");
	fclose(file);

    return 1;
}
`);

    // Adiciona a declaração das funções
    this.addLibsH__declaration(`int create_svg(const char *filename, double *x, double **y, const char *labels[], const char *colors[], size_t signals, size_t size);`);

    const incomingData = node.getInPorts().map((port, index) => this.getNode(node.getNodeByInput(index)));
    node.datasetSettings.map((_, index) => {
        this.addModelC__step(`var_${node.CGenUID}_dataset${index+1}_values[model->simulation.current_step] = ${incomingData[index]};`);
    })
    this.addModelC__step(`var_${node.CGenUID}_time[model->simulation.current_step] = model->simulation.simulated_time;`);
    
    // Adiciona a validação do cabeçalho no init
    this.addModelC__term(`
    double *var_${node.CGenUID}_y[] = {${node.datasetSettings.map((_, index) => `(double*)&var_${node.CGenUID}_dataset${index+1}_values`).join(", ")}};
    size_t var_${node.CGenUID}_signals = ${node.datasetSettings.length};
    size_t var_${node.CGenUID}_size = model->simulation.current_step;
    if (create_svg(plot_${node.CGenUID}_filename, var_${node.CGenUID}_time, var_${node.CGenUID}_y, var_${node.CGenUID}_labels, var_${node.CGenUID}_color, var_${node.CGenUID}_signals, var_${node.CGenUID}_size) )
        printf("%s file created successfully!\\n", plot_${node.CGenUID}_filename);
    else
        printf("Error creating plot.svg file!\\n");
    `);


};

export { PlotModel };
