export const ProgressCircle = ({ porcentaje = 35, tamaño = 120 }) => {
  const radio = (tamaño - 8) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const offsetProgreso = circunferencia - (porcentaje / 100) * circunferencia;
  
  // Determinar color según progreso
  let colorProgreso = '#ef4444'; // Rojo para < 30%
  if (porcentaje >= 30 && porcentaje < 70) colorProgreso = '#f59e0b'; // Ámbar
  if (porcentaje >= 70 && porcentaje < 100) colorProgreso = '#84cc16'; // Lima
  if (porcentaje === 100) colorProgreso = '#22c55e'; // Verde

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4 px-4 bg-gray-800 rounded-lg border border-gray-700 mb-4">
      <svg
        width={tamaño}
        height={tamaño}
        viewBox={`0 0 ${tamaño} ${tamaño}`}
        className="drop-shadow-lg"
      >
        {/* Fondo del círculo (gris) */}
        <circle
          cx={tamaño / 2}
          cy={tamaño / 2}
          r={radio}
          fill="none"
          stroke="#374151"
          strokeWidth="4"
        />
        
        {/* Progreso (color dinámico) */}
        <circle
          cx={tamaño / 2}
          cy={tamaño / 2}
          r={radio}
          fill="none"
          stroke={colorProgreso}
          strokeWidth="4"
          strokeDasharray={circunferencia}
          strokeDashoffset={offsetProgreso}
          strokeLinecap="round"
          style={{
            transform: `rotate(-90deg)`,
            transformOrigin: `${tamaño / 2}px ${tamaño / 2}px`,
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease',
          }}
        />
        
        {/* Porcentaje en el centro */}
        <text
          x={tamaño / 2}
          y={tamaño / 2}
          textAnchor="middle"
          dy="0.3em"
          className="text-2xl font-bold"
          fill="white"
        >
          {porcentaje}%
        </text>
      </svg>
      
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Completado
        </p>
        <p className="text-xs text-gray-400 mt-1">¡Sigue adelante! 🚀</p>
      </div>
    </div>
  );
};
