
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { CameraEvent } from '../types';
import { NOTABLE_PERSONNEL, ALL_PERSONNEL_NAMES } from '../data/personnelData';
import { scpData } from '../data/scpData';

interface TerminalProps {
  onClose: () => void;
  events: CameraEvent[];
  onCommand: (command: string) => void;
}

const WelcomeMessage: React.FC = () => (
    <>
      <pre className="text-cyan-400 text-sm">
{`
██╗██████╗ ██╗███████╗
██║██╔══██╗██║██╔════╝
██║██████╔╝██║███████╗
██║██╔══██╗██║╚════██║
██║██║  ██║██║███████║
╚═╝╚═╝  ╚═╝╚═╝╚══════╝
`}
      </pre>
      <p>I.R.I.S. COMMAND LINE INTERFACE v4.7.5</p>
      <p>Conectado a: Site-19 Mainframe</p>
      <p>Bienvenido, Supervisor. Escriba 'help' para ver la lista de comandos disponibles.</p>
    </>
);

const HelpMessage: React.FC = () => (
    <div className='text-green-300'>
        <p className='text-cyan-400 text-xl border-b border-green-900 mb-2'>// LISTA DE COMANDOS DE I.R.I.S.</p>
        <p><span className='text-yellow-400'>help</span> - Muestra esta lista de comandos.</p>
        <p><span className='text-yellow-400'>clear | cls</span> - Limpia la pantalla de la terminal.</p>
        <p><span className='text-yellow-400'>exit</span> - Cierra la interfaz de la terminal.</p>
        
        <p className='text-cyan-400 mt-2'>-- Personal y Experimentos --</p>
        <p><span className='text-yellow-400'>personnel.list</span> - Lista todo el personal conocido.</p>
        <p><span className='text-yellow-400'>personnel.query "nombre completo"</span> - Muestra el dossier de un miembro del personal. Ej: personnel.query "Dr. Aris Thorne"</p>
        <p><span className='text-yellow-400'>personnel.locate "nombre completo"</span> - Muestra la última ubicación conocida de un miembro del personal.</p>
        <p><span className='text-yellow-400'>personnel.psych_eval "nombre completo"</span> - [SIMULACIÓN] Ordena una evaluación psicológica. Esta acción tiene consecuencias narrativas.</p>
        <p><span className='text-yellow-400'>personnel.terminate "nombre" pd. "razón"</span></p>
        <p className='pl-4'>[SIMULACIÓN] Solicita la terminación de un individuo. Rara vez se aprueba. Ej: personnel.terminate "D-11205" pd. "Insubordinación"</p>
        <p><span className='text-yellow-400'>personnel.relocate "nombre" to "ubicación"</span></p>
        <p className='pl-4'>[SIMULACIÓN] Reasigna al personal a una zona de alto riesgo. Ej: personnel.relocate "Agente Carter" to "Containment Area (SCP-106)"</p>
        <p><span className='text-yellow-400'>experiment.approve "investigador"</span> - [SIMULACIÓN] Aprueba la última propuesta de experimento de un investigador.</p>
        <p><span className='text-yellow-400'>experiment.deny "investigador" [pd. "nota"]</span></p>
        <p className='pl-4'>[SIMULACIÓN] Deniega la última propuesta de experimento. La postdata opcional permite dar una razón.</p>
        <p><span className='text-yellow-400'>experiment.begin "scp" "investigador" "clase_d" [pd. "nota"]</span></p>
        <p className='pl-4'>[SIMULACIÓN] Ordena el inicio de un experimento. La postdata (pd.) opcional permite dar instrucciones específicas.</p>
        <p><span className='text-yellow-400'>resource.send "item" "investigador" [pd. "nota"]</span></p>
        <p className='pl-4'>[SIMULACIÓN] Envía un recurso. Los ítems con propiedades anómalas tendrán consecuencias. Ej: resource.send "SCP-500" "Dr. Petrova" pd. "Para tus pruebas."</p>

        <p className='text-cyan-400 mt-2'>-- Anomalías y Contención --</p>
        <p><span className='text-yellow-400'>scp.list [--active] [--status &lt;level&gt;]</span></p>
        <p className='pl-4'>Lista anomalías. Opcional:</p>
        <p className='pl-6'><span className='text-yellow-400'>--active</span>: Muestra solo SCPs con actividad reciente.</p>
        <p className='pl-6'><span className='text-yellow-400'>--status &lt;alert|observation&gt;</span>: Filtra SCPs activos por estado.</p>
        <p><span className='text-yellow-400'>scp.query &lt;designación&gt;</span> - Muestra la entrada de la base de datos para un SCP (ej: scp.query SCP-173).</p>
        <p><span className='text-yellow-400'>containment.status "cámara"</span> - Muestra el estado de contención de una cámara/celda específica.</p>
        <p><span className='text-yellow-400'>containment.lockdown "celda/sector"</span> - [SIMULACIÓN] Inicia un protocolo de bloqueo de emergencia.</p>

        <p className='text-cyan-400 mt-2'>-- Operaciones del Sitio --</p>
        <p><span className='text-yellow-400'>log.search "palabra clave"</span> - Busca una palabra clave en el registro de eventos.</p>
        <p><span className='text-yellow-400'>cctv.feed "nombre de cámara"</span> - Muestra los últimos 5 eventos de una cámara.</p>
        <p><span className='text-yellow-400'>site.status</span> - Muestra el estado operativo general del Sitio-19.</p>
    </div>
);


export const Terminal: React.FC<TerminalProps> = ({ onClose, events, onCommand }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<React.ReactNode[]>([<WelcomeMessage key="welcome" />]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [output]);

  const processCommand = useCallback((commandStr: string) => {
    const newOutput: React.ReactNode[] = [];
    let isConsequential = false;

    // Standard arg parsing for most commands
    const args = commandStr.trim().match(/(?:[^\s"]+|"[^"]*")+/g)?.map(arg => arg.replace(/"/g, '')) || [''];
    const command = (args.shift() || '').toLowerCase();

    switch (command) {
        case 'help':
            newOutput.push(<HelpMessage key={Date.now()}/>);
            break;
        case 'clear':
        case 'cls':
            setOutput([<WelcomeMessage key="welcome" />]);
            return;
        case 'exit':
            onClose();
            return;
        case 'site.status':
            const highAlerts = events.filter(e => e.priority === 'HIGH').length;
            const medAlerts = events.filter(e => e.priority === 'MEDIUM').length;
            newOutput.push(`Estado del Sitio-19:`);
            newOutput.push(<span className={highAlerts > 0 ? 'text-red-500' : 'text-green-400'}>- Integridad de la Contención: {highAlerts > 0 ? `FALLO DETECTADO (${highAlerts} alertas altas)` : 'ESTABLE'}</span>);
            newOutput.push(<span className={medAlerts > 5 ? 'text-yellow-400' : 'text-green-400'}>- Estabilidad Operacional: {medAlerts > 5 ? 'TENSIÓN DETECTADA' : 'NOMINAL'}</span>);
            newOutput.push(`- Red de Energía: ESTABLE (99.8% de eficiencia)`);
            newOutput.push(`- Estado de I.R.I.S.: ONLINE`);
            break;

        case 'personnel.list':
            newOutput.push("Listando todo el personal conocido:");
            ALL_PERSONNEL_NAMES.sort().forEach(p => newOutput.push(p));
            break;

        case 'personnel.query':
            if (args.length === 0) {
                newOutput.push(<span className='text-red-500'>ERROR: Se requiere un nombre. Uso: personnel.query "nombre completo"</span>);
            } else {
                isConsequential = true;
                const name = args.join(' ');
                const dossier = NOTABLE_PERSONNEL[name as keyof typeof NOTABLE_PERSONNEL];
                if (dossier) {
                    newOutput.push(`// DOSSIER: ${name}`);
                    newOutput.push(<pre className="whitespace-pre-wrap">{dossier}</pre>);
                } else {
                    newOutput.push(<span className='text-yellow-400'>Sin dossier detallado para '{name}'. El personal no es notable o la designación es incorrecta.</span>);
                }
            }
            break;

        case 'personnel.locate':
            if (args.length === 0) {
                 newOutput.push(<span className='text-red-500'>ERROR: Se requiere un nombre. Uso: personnel.locate "nombre completo"</span>);
            } else {
                isConsequential = true;
                const name = args.join(' ');
                const personEvents = events.filter(e => e.personnel?.includes(name));
                if (personEvents.length > 0) {
                    const lastEvent = personEvents[personEvents.length - 1];
                    newOutput.push(`Última ubicación conocida de ${name}: ${lastEvent.camera} a las ${lastEvent.timestamp}.`);
                    newOutput.push(`  > Log asociado: "${lastEvent.message}"`);
                } else {
                    newOutput.push(<span className='text-yellow-400'>No hay registros de localización recientes para '{name}'.</span>);
                }
            }
            break;

        case 'personnel.psych_eval':
            if (args.length === 0) {
                newOutput.push(<span className='text-red-500'>ERROR: Se requiere un nombre de personal. Uso: personnel.psych_eval "nombre completo"</span>);
            } else {
                isConsequential = true;
                const name = args.join(' ');
                newOutput.push(<span className="text-yellow-400">Procesando orden de evaluación psicológica para: {name}...</span>);
                newOutput.push(`El personal ha sido notificado. El acceso ha sido restringido temporalmente pendiente de evaluación.`);
            }
            break;

        case 'personnel.terminate': {
            const lowerCmdStr = commandStr.toLowerCase();
            const pdIndex = lowerCmdStr.indexOf(' pd. ');
            if (pdIndex === -1 || pdIndex === lowerCmdStr.length - 5) { // ' pd. ' is 5 chars
                newOutput.push(<span className='text-red-500'>ERROR: Uso incorrecto. Uso: personnel.terminate "nombre" pd. "razón"</span>);
            } else {
                isConsequential = true;
                const name = commandStr.substring(command.length, pdIndex).trim().replace(/[<>]/g, '').replace(/^"|"$/g, '');
                const reason = commandStr.substring(pdIndex + ' pd. '.length).trim().replace(/^"|"$/g, '');
                newOutput.push(<span className="text-yellow-400">[SIMULACIÓN] Solicitud de terminación registrada.</span>);
                newOutput.push(`  - Objetivo: ${name}`);
                newOutput.push(`  - Razón proporcionada: "${reason}"`);
                newOutput.push("La solicitud ha sido enviada al Comité de Ética para su revisión. Esta acción ha sido registrada.");
            }
            break;
        }

        case 'personnel.relocate': {
            const lowerCmdStr = commandStr.toLowerCase();
            const toIndex = lowerCmdStr.indexOf(' to ');
            if (toIndex === -1 || toIndex === lowerCmdStr.length - 4) { // ' to ' is 4 chars
                 newOutput.push(<span className='text-red-500'>ERROR: Uso incorrecto. Uso: personnel.relocate "nombre" to "ubicación"</span>);
            } else {
                isConsequential = true;
                const name = commandStr.substring(command.length, toIndex).trim().replace(/[<>]/g, '').replace(/^"|"$/g, '');
                const location = commandStr.substring(toIndex + ' to '.length).trim().replace(/[<>]/g, '').replace(/^"|"$/g, '');
                newOutput.push(<span className="text-cyan-400">[SIMULACIÓN] Orden de reasignación de personal registrada.</span>);
                newOutput.push(`  - Objetivo: ${name}`);
                newOutput.push(`  - Nuevo destino: ${location}`);
                newOutput.push(`  - Pretexto: Calibración de sensores de rutina.`);
                newOutput.push("La orden de traslado se procesará en el próximo ciclo operativo.");
            }
            break;
        }

        case 'experiment.approve':
            if (args.length === 0) {
                newOutput.push(<span className='text-red-500'>ERROR: Se requiere un nombre de investigador. Uso: experiment.approve "investigador"</span>);
            } else {
                isConsequential = true;
                const researcher = args.join(' ');
                newOutput.push(<span className="text-cyan-400">[SIMULACIÓN] Aprobación para el experimento de {researcher} registrada.</span>);
                newOutput.push("La asignación de recursos y el calendario se ajustarán en consecuencia.");
            }
            break;
            
        case 'experiment.deny':
            const denyPdIndex = args.findIndex(arg => arg.toLowerCase() === 'pd.');
            let denyMainArgs = [...args];
            let denyNote = null;

            if (denyPdIndex !== -1) {
                denyNote = args.slice(denyPdIndex + 1).join(' ');
                denyMainArgs = args.slice(0, denyPdIndex);
            }

            if (denyMainArgs.length === 0) {
                 newOutput.push(<span className='text-red-500'>ERROR: Se requiere un nombre de investigador. Uso: experiment.deny "investigador" [pd. "nota"]</span>);
            } else {
                isConsequential = true;
                const researcher = denyMainArgs.join(' ');
                newOutput.push(<span className="text-cyan-400">[SIMULACIÓN] Denegación para la propuesta de {researcher} registrada.</span>);
                if(denyNote) {
                    newOutput.push(`  - Razón proporcionada: "${denyNote}"`);
                }
                newOutput.push("Se notificará al investigador y se anularán las asignaciones de recursos pendientes.");
            }
            break;

        case 'experiment.begin':
            const pdIndex = args.findIndex(arg => arg.toLowerCase() === 'pd.');
            let mainArgs = [...args];
            let note = null;

            if (pdIndex !== -1) {
                note = args.slice(pdIndex + 1).join(' ');
                mainArgs = args.slice(0, pdIndex);
            }

            if (mainArgs.length < 3) {
                newOutput.push(<span className='text-red-500'>ERROR: Argumentos insuficientes. Uso: experiment.begin "scp" "investigador" "clase_d" [pd. "nota"]</span>);
            } else {
                isConsequential = true;
                const scp = mainArgs[0];
                const dclass = mainArgs[mainArgs.length - 1];
                const researcher = mainArgs.slice(1, -1).join(' ');
                newOutput.push(<span className="text-cyan-400">[SIMULACIÓN] Directiva para iniciar experimento recibida.</span>);
                newOutput.push(`  - Anomalía: ${scp}`);
                newOutput.push(`  - Investigador Principal: ${researcher}`);
                newOutput.push(`  - Sujeto de Pruebas: ${dclass}`);
                if (note) {
                    newOutput.push(`  - Postdata del Supervisor: "${note}"`);
                }
                newOutput.push("Se están transmitiendo las órdenes a las partes pertinentes...");
            }
            break;

        case 'resource.send':
            const resPdIndex = args.findIndex(arg => arg.toLowerCase() === 'pd.');
            let resMainArgs = [...args];
            let resNote = null;

            if (resPdIndex !== -1) {
                resNote = args.slice(resPdIndex + 1).join(' ');
                resMainArgs = args.slice(0, resPdIndex);
            }

            if (resMainArgs.length < 2) {
                newOutput.push(<span className='text-red-500'>ERROR: Argumentos insuficientes. Uso: resource.send "item" "researcher" [pd. "nota"]</span>);
            } else {
                isConsequential = true;
                const item = resMainArgs[0];
                const researcher = resMainArgs.slice(1).join(' ');
                newOutput.push(<span className="text-cyan-400">[SIMULACIÓN] Orden de transferencia de recursos registrada.</span>);
                newOutput.push(`  - Ítem: [PAQUETE CLASIFICADO]`);
                newOutput.push(`  - Destinatario: ${researcher}`);
                if (resNote) {
                    newOutput.push(`  - Nota adjunta: "${resNote}"`);
                }
                newOutput.push("El Intendente O'Malley ha sido notificado para procesar la solicitud.");
            }
            break;


        case 'scp.list': {
            const hasActiveFlag = args.includes('--active');
            const statusIndex = args.indexOf('--status');
            const statusFilter = statusIndex !== -1 && args.length > statusIndex + 1 ? args[statusIndex + 1] : null;

            if (hasActiveFlag || statusFilter) {
                const activeScpMap = new Map<string, { lastEvent: CameraEvent }>();
                events.forEach(event => {
                    event.anomalies?.forEach(anomaly => {
                        activeScpMap.set(anomaly, { lastEvent: event });
                    });
                });

                let filteredScps = Array.from(activeScpMap.keys());
                
                if (statusFilter) {
                    const targetPriority = statusFilter.toLowerCase() === 'alert' ? 'HIGH' : statusFilter.toLowerCase() === 'observation' ? 'MEDIUM' : null;
                    if (targetPriority) {
                        filteredScps = filteredScps.filter(scp => {
                            const data = activeScpMap.get(scp);
                            return data?.lastEvent.priority === targetPriority;
                        });
                        newOutput.push(`// Listando SCPs activos con estado: ${statusFilter.toUpperCase()}`);
                    } else {
                         newOutput.push(<span className='text-red-500'>ERROR: Estado no válido. Use 'alert' u 'observation'.</span>);
                         break;
                    }
                } else {
                    newOutput.push("// Listando todos los SCPs con actividad reciente:");
                }
                
                const scpsToDisplay = filteredScps.map(id => {
                    const name = scpData.find(s => s.id === id)?.name || "Nombre Desconocido";
                    const event = activeScpMap.get(id)?.lastEvent;
                    return { id, name, event };
                }).sort((a,b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

                if (scpsToDisplay.length > 0) {
                    scpsToDisplay.forEach(({ id, name, event }) => {
                        let status = "NOMINAL";
                        let color = 'text-green-400';
                        if (event?.priority === 'HIGH') { status = "ALERTA"; color = 'text-red-500'; }
                        else if (event?.priority === 'MEDIUM') { status = "OBSERVACIÓN"; color = 'text-yellow-400'; }

                        newOutput.push(`- <span class="${color}">${id}: ${name} [${status}]</span>`);
                        if (event) {
                            newOutput.push(`    Última vez visto: ${event.camera} @ ${event.timestamp}`);
                        }
                    });
                } else {
                     newOutput.push("No se encontraron SCPs que coincidan con los criterios de actividad.");
                }

            } else {
                newOutput.push("Listando designaciones SCP en la base de datos local (001-600):");
                const uniqueScps = scpData.filter((scp, index, self) => 
                    index === self.findIndex((s) => s.id === scp.id)
                );
                
                const scpList = uniqueScps.map(scp => {
                     // For SCP-001, just use the first proposal's name as a representative.
                    return `  - ${scp.id.padEnd(8, ' ')}: ${scp.name}`;
                });
                newOutput.push(<pre className='text-green-300'>{scpList.join('\n')}</pre>);
            }
            break;
        }    
        case 'scp.query':
            if (args.length === 0) {
                newOutput.push(<span className='text-red-500'>ERROR: Se requiere una designación. Uso: scp.query &lt;designación&gt;</span>);
            } else {
                isConsequential = true;
                const originalQuery = args[0];
                let query = originalQuery;

                // Allow users to type just the number, e.g., "scp.query 173"
                if (/^\d+$/.test(query)) {
                    query = `SCP-${query.padStart(3, '0')}`;
                }
                const designation = query.toUpperCase();
                
                const entries = scpData.filter(s => s.id.toUpperCase() === designation);

                if (entries.length > 0) {
                    // Special handling for multiple SCP-001 proposals
                    if (designation === 'SCP-001' && entries.length > 1) {
                        newOutput.push(`// MÚLTIPLES PROPUESTAS ENCONTRADAS PARA ${designation}:`);
                        entries.forEach(entry => {
                             newOutput.push(`- ${entry.name}: ${entry.description}`);
                        });
                    } else {
                        const entry = entries[0];
                        newOutput.push(`// BASE DE DATOS: ${entry.id} - ${entry.name}`);
                        newOutput.push(entry.description);
                    }
                } else {
                     newOutput.push(<span className='text-yellow-400'>Designación '{originalQuery}' no encontrada en la base de datos.</span>);
                }
            }
            break;
        
        case 'containment.status':
            if (args.length === 0) {
                newOutput.push(<span className='text-red-500'>ERROR: Se requiere un nombre de cámara.</span>);
            } else {
                const camera = args.join(' ');
                const camEvents = events.filter(e => e.camera.toLowerCase() === camera.toLowerCase());
                if(camEvents.length > 0){
                    const lastEvent = camEvents[camEvents.length -1];
                    let status = "NOMINAL";
                    let color = 'text-green-400';
                    if(lastEvent.priority === 'HIGH') { status = "ALERTA - BRECHA POTENCIAL"; color = 'text-red-500';}
                    else if(lastEvent.priority === 'MEDIUM') { status = "PRECAUCIÓN - ACTIVIDAD ANÓMALA"; color = 'text-yellow-400';}
                    newOutput.push(`Estado de ${camera}: <span class="${color}">${status}</span>`);
                    newOutput.push(`  > Último evento: [${lastEvent.timestamp}] ${lastEvent.message}`);
                } else {
                    newOutput.push(`Estado de ${camera}: <span class="text-gray-500">NOMINAL (Sin eventos recientes)</span>`);
                }
            }
            break;

        case 'containment.lockdown':
            if (args.length === 0) {
                newOutput.push(<span className='text-red-500'>ERROR: Se requiere una celda o sector.</span>);
            } else {
                isConsequential = true;
                const target = args.join(' ');
                newOutput.push(<span className="text-yellow-400">Iniciando protocolo de bloqueo para: {target}...</span>);
                newOutput.push("Cerrando puertas de titanio...");
                newOutput.push("Activando contramedidas meméticas de emergencia...");
                newOutput.push("Desplegando equipos de respuesta rápida a la ubicación...");
                newOutput.push(<span className="text-cyan-400">BLOQUEO COMPLETADO. El área ahora está asegurada.</span>);
            }
            break;

        case 'log.search':
             if (args.length === 0) {
                newOutput.push(<span className='text-red-500'>ERROR: Se requiere una palabra clave.</span>);
            } else {
                isConsequential = true;
                const keyword = args.join(' ').toLowerCase();
                const matches = events.filter(e => e.message.toLowerCase().includes(keyword));
                if (matches.length > 0) {
                    newOutput.push(`${matches.length} coincidencias encontradas para "${keyword}":`);
                    matches.slice(-10).forEach(e => { // show last 10 matches
                        newOutput.push(`[${e.timestamp}] (${e.camera}): ${e.message}`);
                    });
                     if (matches.length > 10) newOutput.push(`...y ${matches.length - 10} más.`);
                } else {
                    newOutput.push(`No se encontraron coincidencias para "${keyword}".`);
                }
            }
            break;

        case 'cctv.feed':
             if (args.length === 0) {
                newOutput.push(<span className='text-red-500'>ERROR: Se requiere un nombre de cámara.</span>);
            } else {
                isConsequential = true;
                const camera = args.join(' ');
                const matches = events.filter(e => e.camera.toLowerCase().includes(camera.toLowerCase()));
                if (matches.length > 0) {
                    newOutput.push(`Mostrando los últimos 5 eventos de cámaras que coinciden con "${camera}":`);
                    matches.slice(-5).forEach(e => {
                        newOutput.push(`[${e.timestamp}] (${e.camera}): ${e.message}`);
                    });
                } else {
                    newOutput.push(`No hay eventos registrados para cámaras que coincidan con "${camera}".`);
                }
            }
            break;

        default:
            newOutput.push(<span className='text-red-500'>Comando desconocido: '{command}'. Escriba 'help' para obtener ayuda.</span>);
            break;
    }
    
    if (isConsequential) {
      onCommand(commandStr);
      newOutput.push(<span key="consequence-info" className="text-gray-500 italic mt-2 block">COMANDO REGISTRADO. LAS CONSECUENCIAS SE REFLEJARÁN EN EL PRÓXIMO CICLO DE EVENTOS.</span>);
    }
    
    setOutput(prev => [
        ...prev,
        <p key={`cmd-${Date.now()}`}><span className="text-cyan-400">IRIS:&gt;</span> {commandStr}</p>,
        ...newOutput.map((line, i) => {
            const key = `${Date.now()}-${i}`;
            if (typeof line === 'string') {
                return <div key={key} dangerouslySetInnerHTML={{ __html: line }} />;
            }
            return <div key={key}>{line}</div>;
        })
    ]);

    if (command && commandStr.trim()) {
      setHistory(prev => [commandStr, ...prev]);
    }
    setHistoryIndex(-1);
    setInput('');

  }, [events, onClose, onCommand]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if(input.trim()){
        processCommand(input);
      }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if(history.length > 0 && historyIndex < history.length -1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setInput(history[newIndex]);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if(historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setInput(history[newIndex]);
        } else {
            setHistoryIndex(-1);
            setInput('');
        }
    }
  };


  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out] p-2 md:p-4 terminal-container">
      <div className="w-full h-full bg-black border-2 border-green-700/80 flex flex-col static-noise scanlines p-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-green-800/70 pb-2 mb-4 flex-shrink-0">
          <h2 className="text-xl md:text-2xl text-yellow-400">// I.R.I.S. TERMINAL DE COMANDOS</h2>
          <button onClick={onClose} className="text-2xl text-red-500 hover:text-red-400 transition-colors">[CERRAR]</button>
        </div>
        
        {/* Output */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto pr-4 text-xl terminal-output space-y-2">
            {output.map((line, index) => (
                <div key={index}>{line}</div>
            ))}
        </div>
        
        {/* Input */}
        <div className="flex-shrink-0 mt-4 terminal-input-line">
            <span className="text-cyan-400 text-xl mr-2">IRIS:&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="terminal-input"
              autoComplete="off"
              spellCheck="false"
            />
            <div className='terminal-cursor'></div>
        </div>
      </div>
    </div>
  );
};