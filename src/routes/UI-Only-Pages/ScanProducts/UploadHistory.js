import React, { useEffect, useState } from 'react';
import './ScanProducts.css';
import SubHeading from '../../../components/general_components/headings/SubHeading';
import { fetchMealLogs } from '../../../services/mealLogApi';

function UploadHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const remoteHistory = await fetchMealLogs();
        if (!cancelled) {
          setHistory(Array.isArray(remoteHistory) ? remoteHistory : []);
        }
      } catch (error) {
        console.error('Failed to load remote scan history, falling back to local uploadHistory.', error);
        const storedHistory = localStorage.getItem('uploadHistory');
        if (!cancelled && storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="scan-products-container">
      <SubHeading text="Upload History" />
      {history.length === 0 ? (
        <p>No upload history available.</p>
      ) : (
        <ul className="scanned-products-list">
          {history.map((entry, index) => (
            <li key={index}>
              {entry.created_at || entry.time || 'Saved'} - {entry.label || entry.imageName || entry.name || 'Scanned item'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UploadHistory;
