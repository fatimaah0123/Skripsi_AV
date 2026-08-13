import React from 'react';
import { AlertTriangle } from 'lucide-react';

const PredictiveAlertBar = ({ alert, onCreateTicket }) => (
  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl shadow-lg mb-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-lg mb-1">{alert.status}</h3>
          <p className="text-sm opacity-95">
            <span className="font-semibold">{alert.name}</span> {alert.failure}
          </p>
          <p className="text-sm opacity-90 mt-1">
            Segera lakukan tindakan. Sisa masa pakai (RUL) kurang dari:{' '}
            <span className="font-bold">{alert.rul_hours} jam.</span>
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default PredictiveAlertBar;