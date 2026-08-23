import React from 'react';
import { HasilSkema } from '../../types/pajak';

export const KartuVonis: React.FC<{ hasil: HasilSkema }> = ({ hasil }) => {
  return (
    <div style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
      <h3>Skema: {hasil.id}</h3>
      <p>Status Kelayakan: <strong>{hasil.statusKelayakan}</strong></p>
      
      {hasil.alasanKelayakan.length > 0 && (
        <ul>
          {hasil.alasanKelayakan.map((alasan, i) => (
            <li key={i}>{alasan}</li>
          ))}
        </ul>
      )}

      <p>Status Kalkulasi: <strong>{hasil.statusKalkulasi}</strong></p>

      {hasil.statusKalkulasi === 'TERSEDIA' && (
        <div>
          <p>Pajak Terutang: {hasil.pajakTerutang}</p>
          <pre>{JSON.stringify(hasil.rincianKalkulasi, null, 2)}</pre>
        </div>
      )}

      {hasil.statusKalkulasi === 'BELUM_TERSEDIA' && hasil.alasanKalkulasi && (
        <p>Alasan Kalkulasi: {hasil.alasanKalkulasi}</p>
      )}

      <details>
        <summary>Dasar Hukum</summary>
        <ul>
          {hasil.dasarHukum.map((dh, i) => (
            <li key={i}>
              <a href={dh.url} target="_blank" rel="noreferrer">
                {dh.namaRegulasi} - {dh.pasalAtauLampiran}
              </a>: {dh.fungsi} ({dh.statusVerifikasi})
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};
