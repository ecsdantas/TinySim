import { describe, it, expect } from 'vitest';
import { buildPlotDatasets } from './plot';

describe('buildPlotDatasets', () => {
  const genColor = () => '#000000';

  it('builds one dataset per scalar input port', () => {
    const inPorts = [{}, {}];
    const values = [[1, 2, 3], [4, 5, 6]];
    const settings = [{ name: 'A' }, { name: 'B' }];

    const datasets = buildPlotDatasets(inPorts, values, settings, genColor);

    expect(datasets).toHaveLength(2);
    expect(datasets[0]).toMatchObject({ label: 'A', data: [1, 2, 3] });
    expect(datasets[1]).toMatchObject({ label: 'B', data: [4, 5, 6] });
  });

  it('expands a vector-valued port (e.g. from a Mux) into one dataset per component', () => {
    const inPorts = [{}];
    // 3 time steps, each a 2-component vector
    const values = [[[1, 10], [2, 20], [3, 30]]];
    const settings = [{ name: 'Mux out' }];

    const datasets = buildPlotDatasets(inPorts, values, settings, genColor);

    expect(datasets).toHaveLength(2);
    expect(datasets[0]).toMatchObject({ label: 'Mux out[0]', data: [1, 2, 3] });
    expect(datasets[1]).toMatchObject({ label: 'Mux out[1]', data: [10, 20, 30] });
  });
});
