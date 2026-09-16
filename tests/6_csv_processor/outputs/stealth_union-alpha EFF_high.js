async function processCSV(csv, { filterColumn, filterValue, groupBy, aggregateColumn, operation }) {
    const { default: Papa } = await import('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js');
    const { default: _ } = await import('https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js');

    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
    const data = parsed.data;

    const filtered = data.filter(row => row[filterColumn] == filterValue);

    const grouped = _.groupBy(filtered, groupBy);

    const results = Object.keys(grouped).map(groupVal => {
        const rows = grouped[groupVal];
        const nums = rows.map(r => {
            const val = Number(r[aggregateColumn]);
            return isNaN(val) ? 0 : val;
        });

        let result;
        if (operation === 'sum') {
            result = nums.reduce((a, b) => a + b, 0);
        } else if (operation === 'avg') {
            const sum = nums.reduce((a, b) => a + b, 0);
            result = sum / nums.length;
        } else if (operation === 'count') {
            result = nums.length;
        }

        return { [groupBy]: groupVal, result };
    });

    return results;
}
export default processCSV;
// Generation time: 72.324s
// Result: FAIL