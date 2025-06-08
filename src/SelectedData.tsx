import { useEffect, useState } from 'react';

interface Satellite {
  name: string;
  noradCatId: string;
}

const SelectedData = () => {
  const [satellites, setSatellites] = useState<Satellite[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('selectedSatellites');
    if (saved) {
      setSatellites(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Selected Satellites</h1>
      <ul className="list-disc pl-6">
        {satellites.map((sat, index) => (
          <li key={index}>
            <strong>{sat.name}</strong> – NORAD Cat ID: {sat.noradCatId}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectedData;
