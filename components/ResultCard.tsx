// /components/ResultCard.tsx

function JsonTable({ data }: { data: any }) {
  const renderValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const entries: { key: string; value: any; isArray?: boolean; isNested?: boolean; nestedLevel?: number }[] = [];

  const processValue = (key: string, value: any, level: number = 0) => {
    if (Array.isArray(value)) {
      // For arrays, add each item as a separate row
      value.forEach((item, idx) => {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          // If array contains objects, process each key-value pair
          Object.entries(item).forEach(([itemKey, itemValue], itemIdx) => {
            entries.push({
              key: idx === 0 && itemIdx === 0 ? key : '',
              value: renderValue(itemValue),
              isArray: true,
              isNested: level > 0,
              nestedLevel: level
            });
          });
        } else {
          entries.push({
            key: idx === 0 ? key : '',
            value: renderValue(item),
            isArray: true,
            isNested: level > 0,
            nestedLevel: level
          });
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      // For nested objects, process each key-value pair
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        processValue(`${key} > ${nestedKey}`, nestedValue, level + 1);
      });
    } else {
      entries.push({
        key,
        value: renderValue(value),
        isNested: level > 0,
        nestedLevel: level
      });
    }
  };

  // Process only the summary key from data
  const summaryValue = data.summary;
  if (typeof summaryValue === 'object' && summaryValue !== null) {
    Object.entries(summaryValue).forEach(([summaryKey, value]) => {
      processValue(summaryKey, value, 0);
    });
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700 align-top">
                <div style={{ marginLeft: `${(entry.nestedLevel || 0) * 20}px` }}>
                  {entry.key}
                </div>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-gray-600 whitespace-pre-wrap font-mono text-xs">{entry.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ResultCard({ doc }: { doc: any }) {
  const output = doc.output || {};
  
  return (
    <div className="border rounded p-4 bg-white">
  {/*    <h4 className="font-semibold text-lg mb-4">{doc.title}</h4> */}
      {typeof output === 'object' && Object.keys(output).length > 0 ? (
        <JsonTable data={output} />
      ) : (
        <p className="text-gray-500">No output available</p>
      )}
    </div>
  );
}