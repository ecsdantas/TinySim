// Resets every node that opted into it (most blocks with internal state:
// integrators, memory, flip-flops, etc).
function resetNodes(nodes) {
    nodes.filter(node => node.reset).forEach(node => {
        node.isvisited = false;
        node.reset()
        node.update()
    });
}

export { resetNodes }
