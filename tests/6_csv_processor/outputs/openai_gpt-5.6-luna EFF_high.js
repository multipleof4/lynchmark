const dependencies = Promise.all([
  import("https://cdn.jsdelivr.net/npm/papaparse@5.4.3/+esm"),
  import("https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm")
]);

async function processCSV(csv, config) {
  if (typeof csv !== "string") throw new TypeError("csv must be a string");
  if (!config || typeof config !== "object") {
    throw new TypeError("config must be an object");
  }

  const {
    filterColumn,
    filterValue,
    groupBy,
    aggregateColumn,
    operation
  } = config;

  if (![filterColumn, groupBy, aggregateColumn].every(
    value => typeof value === "string"
  )) {
    throw new TypeError("Column names must be strings");
  }

  if (!["sum", "avg", "count"].includes(operation)) {
    throw new RangeError("operation must be sum, avg, or count");
  }

  const [parserModule, utilityModule] = await dependencies;
  const Papa = parserModule.default ?? parserModule;
  const _ = utilityModule.default ?? utilityModule;

  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors.length) {
    throw new Error(
      parsed.errors.map(error => error.message).join("; ")
    );
  }

  const rows = _.filter(
    parsed.data,
    row => row[filterColumn] == filterValue
  );

  const groups = _.groupBy(rows, groupBy);

  const toNumber = value => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  return Object.values(groups).map(group => {
    const total = operation === "count"
      ? group.length
      : group.reduce(
          (sum, row) => sum + toNumber(row[aggregateColumn]),
          0
        );

    return {
      [groupBy]: group[0][groupBy],
      result: operation === "avg" ? total / group.length : total
    };
  });
}
export default processCSV;
// Generation time: 22.212s
// Result: FAIL