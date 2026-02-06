export default {
  functionName: 'computeMST',
  prompt: `// Write an async JavaScript function 'computeMST' that parses a TOML config describing weighted graph edges, computes the Minimum Spanning Tree using Kruskal's algorithm, and returns the result as a formatted ASCII table.
// - The function must accept a TOML string.
// - You MUST use dynamic import() to load ALL THREE of these libraries from CDNs:
//   1. 'smol-toml' — to parse the TOML string into a JS object.
//   2. 'mnemonist' — to use its Heap (min-heap by weight) for sorting edges, AND its SparseQueueSet or similar union-find approach. Actually, mnemonist does not have union-find, so implement a simple union-find yourself (with path compression and union by rank), but you MUST use mnemonist's Heap to process edges in weight order.
//   3. 'text-table' — to format the final MST edges as an aligned ASCII table.
//
// TOML format:
//   [[edges]]
//   from = "A"
//   to = "B"
//   weight = 4
//
//   [[edges]]
//   from = "B"
//   to = "C"
//   weight = 2
//   ... etc
//
// Algorithm (Kruskal's):
//   1. Parse the TOML to extract the edges array.
//   2. Push all edges into a mnemonist Heap (min-heap), comparing by weight.
//   3. Initialize a union-find for all unique node names found in edges.
//   4. Pop edges from the heap in ascending weight order. For each edge, if 'from' and 'to' are in different sets, union them and add the edge to the MST.
//   5. Continue until MST has (number_of_nodes - 1) edges or heap is empty.
//
// Output:
//   - Collect MST edges as arrays: [from, to, String(weight)] in the order they were added.
//   - Prepend a header row: ['From', 'To', 'Weight'].
//   - Pass this array-of-arrays to text-table to produce an aligned ASCII string.
//   - Return an object: { table: string, totalWeight: number }
//     where 'table' is the text-table output and 'totalWeight' is the sum of MST edge weights.`,
  runTest: async (computeMST) => {
    const assert = {
      strictEqual: (a, e, m) => { if (a !== e) throw new Error(m || `FAIL: ${a} !== ${e}`) },
      ok: (v, m) => { if (!v) throw new Error(m) },
    };

    const toml = `
[[edges]]
from = "A"
to = "B"
weight = 4

[[edges]]
from = "A"
to = "C"
weight = 2

[[edges]]
from = "B"
to = "C"
weight = 5

[[edges]]
from = "B"
to = "D"
weight = 10

[[edges]]
from = "C"
to = "D"
weight = 3

[[edges]]
from = "C"
to = "E"
weight = 8

[[edges]]
from = "D"
to = "E"
weight = 7
`;

    const result = await computeMST(toml);

    assert.ok(result && typeof result === 'object', 'Should return an object');
    assert.ok(typeof result.table === 'string', 'table should be a string');
    assert.ok(typeof result.totalWeight === 'number', 'totalWeight should be a number');

    // MST of this graph:
    // A-C (2), C-D (3), A-B (4), D-E (7) = total 16
    assert.strictEqual(result.totalWeight, 16, `Total MST weight should be 16, got ${result.totalWeight}`);

    const lines = result.table.trim().split('\n').map(l => l.trim());
    assert.strictEqual(lines.length, 5, `Table should have 5 lines (1 header + 4 edges), got ${lines.length}`);
    assert.ok(lines[0].includes('From') && lines[0].includes('To') && lines[0].includes('Weight'), 'First line should be header row');

    const edgeLines = lines.slice(1);
    const parsed = edgeLines.map(l => {
      const parts = l.split(/\s+/).filter(Boolean);
      return { from: parts[0], to: parts[1], w: parseInt(parts[2], 10) };
    });
    const weights = parsed.map(e => e.w).sort((a, b) => a - b);
    assert.strictEqual(JSON.stringify(weights), JSON.stringify([2, 3, 4, 7]), `MST edge weights should be [2,3,4,7], got [${weights}]`);

    const nodes = new Set();
    parsed.forEach(e => { nodes.add(e.from); nodes.add(e.to); });
    assert.strictEqual(nodes.size, 5, `MST should span all 5 nodes, got ${nodes.size}`);
  }
};
