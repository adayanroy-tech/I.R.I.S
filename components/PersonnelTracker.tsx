import React, { useMemo, useState } from 'react';
import type { CameraEvent } from '../types';
import { NOTABLE_PERSONNEL, D_CLASS_ROSTER, ALL_PERSONNEL_NAMES } from '../data/personnelData';

// Define a type for the processed personnel data
interface PersonnelStatus {
  name: string;
  status: string;
  statusColor: string;
  lastLocation: string;
  lastTimestamp: string;
  lastMessage: string;
  isNotable: boolean;
  type: 'STAFF' | 'D-CLASS';
}

// Define severity levels for status persistence
const statusSeverity: { [key: string]: number } = {
  'FALLECIDO': 6,
  'EN PELIGRO': 5,
  'DESAPARECIDO': 4,
  'HERIDO': 3,
  'CONDICIÓN ANÓMALA': 2,
  'NOMINAL': 1,
  'SIN REPORTES': 0,
};

const getStatusInfoFromEvent = (event: CameraEvent): { status: string; color: string } => {
  const msg = event.message.toLowerCase();
  
  if (msg.includes('fallecido') || msg.includes('cese de signos vitales') || msg.includes('k.i.a')) {
    return { status: 'FALLECIDO', color: 'text-red-500 animate-pulse font-black' };
  }
  if (msg.includes('herido') || msg.includes('incapacitado') || msg.includes('no responde')) {
    return { status: 'HERIDO', color: 'text-red-400' };
  }
  if (event.priority === 'HIGH' || msg.includes('gritos') || msg.includes('disparos') || msg.includes('ataque') || msg.includes('hostil') || msg.includes('brecha')) {
    return { status: 'EN PELIGRO', color: 'text-red-400' };
  }
  if (msg.includes('desaparecido') || msg.includes('sin señal') || msg.includes('no localizado')) {
    return { status: 'DESAPARECIDO', color: 'text-yellow-400' };
  }
  if (event.priority === 'MEDIUM' || msg.includes('estrés elevado') || msg.includes('signos vitales erráticos') || msg.includes('comportamiento anómalo')) {
    return { status: 'CONDICIÓN ANÓMALA', color: 'text-yellow-400' };
  }
  return { status: 'NOMINAL', color: 'text-green-400' };
};

// This function now analyzes the history to determine the most accurate current status.
const inferPersonnelStatus = (name: string, history: CameraEvent[]): PersonnelStatus => {
  const isNotable = Object.prototype.hasOwnProperty.call(NOTABLE_PERSONNEL, name);
  const type = name.startsWith('D-') ? 'D-CLASS' : 'STAFF';

  if (history.length === 0) {
    return {
      name,
      status: 'SIN REPORTES',
      statusColor: 'text-gray-500',
      lastLocation: 'Desconocida',
      lastTimestamp: 'N/A',
      lastMessage: 'Sin actividad registrada.',
      isNotable,
      type,
    };
  }

  // First, check for a terminal 'FALLECIDO' status anywhere in the history.
  // This status is persistent and should override any subsequent events.
  const deathEvent = history.find(event => {
    const { status } = getStatusInfoFromEvent(event);
    return status === 'FALLECIDO';
  });

  if (deathEvent) {
    const { status, color } = getStatusInfoFromEvent(deathEvent);
    return {
      name,
      status,
      statusColor: color,
      lastLocation: deathEvent.camera,
      lastTimestamp: deathEvent.timestamp,
      lastMessage: deathEvent.message,
      isNotable,
      type,
    };
  }

  // If not deceased, then apply the "most severe of last 10" logic for transient states.
  const recentHistory = history.slice(-10);
  
  let mostSevereEvent = history[history.length - 1]; // Default to the latest event
  let highestSeverity = -1;

  recentHistory.forEach(event => {
    const { status } = getStatusInfoFromEvent(event);
    const severity = statusSeverity[status] || 0;
    if (severity >= highestSeverity) { // Use >= to prefer the latest of equal severity
      highestSeverity = severity;
      mostSevereEvent = event;
    }
  });

  const { status, color } = getStatusInfoFromEvent(mostSevereEvent);

  return {
    name,
    status,
    statusColor: color,
    lastLocation: mostSevereEvent.camera,
    lastTimestamp: mostSevereEvent.timestamp,
    lastMessage: mostSevereEvent.message,
    isNotable,
    type,
  };
};

const PersonnelDossier: React.FC<{ name: string, description: string, onClose: () => void }> = ({ name, description, onClose }) => (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 animate-[fadeIn_0.2s_ease-out]">
        <div className="w-full max-w-2xl bg-black border-2 border-cyan-500/50 p-4 relative">
             <button onClick={onClose} className="absolute top-2 right-2 text-xl text-red-500 hover:text-red-400 transition-colors">[X]</button>
             <h3 className="text-2xl text-cyan-400 border-b border-cyan-800 pb-2 mb-2">// DOSSIER DE PERSONAL: {name}</h3>
             <p className="text-lg text-green-300 whitespace-pre-wrap">{description}</p>
        </div>
    </div>
);

const FilterButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => {
    const activeClass = "bg-cyan-600 border-cyan-300 text-cyan-50 text-shadow-sm shadow-cyan-500/50";
    const inactiveClass = "border-green-600/80 bg-green-900/50 text-green-300 hover:bg-green-800/50";
    return (
        <button onClick={onClick} className={`px-4 py-1 text-lg border transition-colors rounded-sm ${isActive ? activeClass : inactiveClass}`}>
            {label}
        </button>
    );
}

export const PersonnelTracker: React.FC<{ events: CameraEvent[]; onClose: () => void; }> = ({ events, onClose }) => {
  const [filter, setFilter] = useState<'ALL' | 'D-CLASS' | 'STAFF'>('ALL');
  const [selectedDossier, setSelectedDossier] = useState<{name: string, description: string} | null>(null);

  const generateDClassDossier = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }

    const seededRandom = (seed: number) => {
        let s = Math.sin(seed) * 10000;
        return s - Math.floor(s);
    };
    
    const getRandomElement = <T,>(arr: T[], seed: number): T => {
        return arr[Math.floor(seededRandom(seed) * arr.length)];
    };

    const origins = ["Corredor de la muerte", "Prisión de máxima seguridad", "Reclutamiento de población civil bajo el Protocolo 12", "Transferido desde el Sitio-[CENSURADO]", "Voluntario (ver anexo psiquiátrico)", "Capturado de un Grupo de Interés hostil"];
    const crimeCategories = {
        "Violentos": ["Múltiples homicidios", "Asesinato de personal de la Fundación", "Actos de terrorismo doméstico"],
        "Anómalos": ["Creación/distribución de un agente memético ilegal", "Colaboración con el GdI 'La Mano de la Serpiente'", "Uso no autorizado de un artefacto anómalo"],
        "Especiales": ["[CENSURADO] bajo el Protocolo de Seguridad 4000-Eshu", "Crímenes de guerra", "Traición contra un gobierno nacional"]
    };
    const psychTraits = [
        "Muestra una alta tolerancia al dolor.", "Exhibe un comportamiento errático bajo estrés.",
        "Tiene experiencia previa con fenómenos anómalos.", "Psicológicamente resistente a los efectos meméticos de Clase II.",
        "Muestra una obediencia excepcional al personal de Nivel 3 o superior.", "Propenso a la violencia contra otro personal de Clase-D.",
        "Niveles de empatía por debajo de la media.", "Sujeto muestra una notable aptitud para la improvisación.",
        "Tendencias a la insubordinación si no está supervisado de cerca.", "Se desensibiliza rápidamente a los estímulos anómalos."
    ];
    const assignmentNotes = [
        "Recomendado para pruebas de resistencia física.", "No recomendado para tareas que requieran concentración.",
        "Apto para pruebas con cognitopeligros de bajo nivel.", "Considerado de alto riesgo de fuga. Requiere vigilancia adicional.",
        "Apto para la observación directa de anomalías visuales.", "Recomendado para tareas con SCPs mecánicos o que requieran manipulación de dispositivos.",
        "No asignar a tareas que requieran la destrucción de artefactos.", "Requiere supervisión constante debido a su comportamiento impredecible."
    ];

    const origin = getRandomElement(origins, hash);
    const categoryKey = getRandomElement(Object.keys(crimeCategories), hash + 1) as keyof typeof crimeCategories;
    const specificCrime = getRandomElement(crimeCategories[categoryKey], hash + 2);
    const trait1 = getRandomElement(psychTraits, hash + 3);
    let trait2 = getRandomElement(psychTraits, hash + 4);
    // Ensure two different traits are selected
    while (trait1 === trait2) {
        trait2 = getRandomElement(psychTraits, hash + 4 + Math.random());
    }
    const note = getRandomElement(assignmentNotes, hash + 5);

    return `DESIGNACIÓN: ${name}\n\nORIGEN DEL RECLUTAMIENTO: ${origin}\n\nREGISTRO CRIMINAL: ${specificCrime}\n\nEVALUACIÓN PSICOLÓGICA: ${trait1} ${trait2} Perfil general estable dentro de los parámetros esperados para el personal de Clase-D.\n\nNOTA DE ASIGNACIÓN: ${note}`;
  };

  const personnelData = useMemo(() => {
    const personnelToEventsMap = new Map<string, CameraEvent[]>();

    // Initialize with the full roster
    ALL_PERSONNEL_NAMES.forEach(name => {
      personnelToEventsMap.set(name, []);
    });

    // Collate all events for each person
    events.forEach(event => {
      event.personnel?.forEach(name => {
        // This ensures dynamically added personnel are included
        if (!personnelToEventsMap.has(name)) {
          personnelToEventsMap.set(name, []);
        }
        personnelToEventsMap.get(name)?.push(event);
      });
    });

    // Infer status for each person based on their history
    const statuses = Array.from(personnelToEventsMap.keys()).map(name => {
      const history = personnelToEventsMap.get(name) || [];
      return inferPersonnelStatus(name, history);
    });

    // Sort notable personnel first, then alphabetically
    return statuses.sort((a, b) => {
      if (a.isNotable && !b.isNotable) return -1;
      if (!a.isNotable && b.isNotable) return 1;
      if (a.type === 'STAFF' && b.type === 'D-CLASS') return -1;
      if (a.type === 'D-CLASS' && b.type === 'STAFF') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [events]);

  const filteredPersonnel = useMemo(() => {
    if (filter === 'ALL') return personnelData;
    return personnelData.filter(p => p.type === filter);
  }, [personnelData, filter]);

  const handlePersonnelClick = (person: PersonnelStatus) => {
    if (person.isNotable) { // All Staff and D-11424 are notable
        setSelectedDossier({
            name: person.name,
            description: NOTABLE_PERSONNEL[person.name as keyof typeof NOTABLE_PERSONNEL]
        });
    } else if (person.type === 'D-CLASS') { // Other D-Class
        setSelectedDossier({
            name: person.name,
            description: generateDClassDossier(person.name)
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-out]">
      <div className="w-full max-w-7xl h-[90vh] bg-black border-2 border-green-700/80 flex flex-col p-4 relative static-noise scanlines">
        <div className="flex justify-between items-center border-b-2 border-green-800/70 pb-2 mb-2 flex-shrink-0">
          <h2 className="text-2xl text-yellow-400">// BIOMONITOR DEL PERSONAL DEL SITIO-19</h2>
          <button onClick={onClose} className="text-2xl text-red-500 hover:text-red-400 transition-colors">[CERRAR]</button>
        </div>
        
        <div className="flex items-center gap-4 mb-2 flex-shrink-0">
            <FilterButton label="[TODOS]" isActive={filter === 'ALL'} onClick={() => setFilter('ALL')} />
            <FilterButton label="[PERSONAL DEL SITIO]" isActive={filter === 'STAFF'} onClick={() => setFilter('STAFF')} />
            <FilterButton label="[CLASE-D]" isActive={filter === 'D-CLASS'} onClick={() => setFilter('D-CLASS')} />
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
          {personnelData.length === 0 ? (
             <div className="text-center text-2xl text-gray-500 p-8">
                -- NO SE HA DETECTADO PERSONAL EN LOS REGISTROS --
              </div>
          ) : (
            <table className="w-full text-left text-lg">
              <thead>
                <tr className="border-b border-green-800/50">
                  <th className="p-2 w-[20%] text-cyan-400">IDENTIFICACIÓN</th>
                  <th className="p-2 w-[20%] text-cyan-400">ESTADO BIOMÉTRICO</th>
                  <th className="p-2 w-[25%] text-cyan-400">ÚLTIMA UBICACIÓN CONOCIDA</th>
                  <th className="p-2 w-[35%] text-cyan-400">INFORME RELEVANTE</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel.map((p) => (
                  <tr key={p.name} className="border-b border-green-900/50 hover:bg-green-900/20">
                    <td className={`p-2 align-top ${p.isNotable ? 'text-cyan-300 font-bold' : 'text-green-300'}`}>
                      <button onClick={() => handlePersonnelClick(p)} className="hover:underline text-left w-full">
                          {p.name}
                      </button>
                      {p.type === 'D-CLASS' && <span className='text-orange-400 text-sm block'>(Clase-D)</span>}
                      {p.isNotable && !p.name.startsWith('D-') && <span className='text-cyan-400 text-sm block'>(Personal con Dossier)</span>}
                    </td>
                    <td className={`p-2 align-top font-bold ${p.statusColor}`}>
                      {p.status}
                    </td>
                    <td className="p-2 align-top text-yellow-400">{p.lastLocation}</td>
                    <td className="p-2 align-top text-green-300">
                      <span className="text-gray-400 mr-2">[{p.lastTimestamp}]</span>
                      {p.lastMessage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {selectedDossier && (
            <PersonnelDossier 
                name={selectedDossier.name}
                description={selectedDossier.description}
                onClose={() => setSelectedDossier(null)}
            />
        )}
      </div>
    </div>
  );
};