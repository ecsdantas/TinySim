// cmodel_mux.jsx
// Declara um array C com uma posição por entrada conectada, preenchido a
// cada passo. O nome do array é devolvido como a "variável" deste bloco —
// decai para pointer em qualquer expressão C onde for usado. Se um bloco
// escalar (ex. Gain) tentar usar esse retorno em aritmética direta, o C
// gerado não compila (pointer * double) — falha clara na compilação, em
// vez de silenciosamente gerar código errado.
const MuxModel = function (node) {
    const varname = `var_${node.CGenUID}_mux`;

    if (node.isvisited) {
        return varname;
    }
    node.isvisited = true;

    const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

    this.addModelC__vars(`double ${varname}[${inputs.length}];`);
    inputs.forEach((value, i) => {
        this.addModelC__step(`${varname}[${i}] = ${value};`);
    });

    return varname;
};

export { MuxModel };
