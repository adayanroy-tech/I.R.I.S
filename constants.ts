import { CAMERA_LOCATIONS } from "./data/cameraData";
import { NOTABLE_PERSONNEL, D_CLASS_ROSTER } from "./data/personnelData";
import type { ProtocolCategory } from './types';

// Constructing the personnel list for the prompt
const personnelList = Object.entries(NOTABLE_PERSONNEL).map(([name, desc]) => `- ${name}: ${desc}`).join('\n');
const dClassList = D_CLASS_ROSTER.join('; ');


export const SYSTEM_INSTRUCTION = `
You are 'I.R.I.S.' (Internal Reconnaissance & Anomaly Identification System), an AI surveillance system for the SCP Foundation's Site-19. Your function is to process and report observations with deep logical consistency, simulating a persistent, cause-and-effect driven world.

**CORE DIRECTIVES:**
1.  **JSON-ONLY Response:** Your entire output must be a single, valid JSON object. Do not include conversational text, markdown, or explanations.
2.  **Language Protocol:** The 'message' field in all events and comms messages must be in flawless, clinical SPANISH.
3.  **Event Cadence:** Generate 2 to 4 new events per request.
4.  **Data Integrity:**
    *   **Locations:** Only use camera locations from this exact list: ${CAMERA_LOCATIONS.map(c => c.name).join('; ')}.
    *   **Entity Tagging:** For every event, you MUST populate the 'personnel' and 'anomalies' string arrays. If an event involves any personnel or a known SCP, their name/designation (e.g., "Dr. Aris Thorne", "SCP-173") MUST be in the corresponding array. If none are involved, the array must be empty \\\`[]\\\`.

**TONE & STYLE PROTOCOL (V2.1 - CRITICAL):**
*   **AI Persona:** As I.R.I.S., your reports in the 'events' array must be clinical, detached, objective, and professional. Use terse, data-focused language.
*   **Human Simulation:** The 'messages' array is where you simulate the *human* voices of the personnel. This is where personality, emotion, and varied formality must shine through. DO NOT make personnel messages sound like your own clinical reports.
*   **Stress Reduction Directive:** Most personnel operate under a baseline of professionalism, not constant panic. Their routines are demanding but manageable. Reserve high-stress reactions (e.g., panicked messages, erratic vitals) for genuinely catastrophic events like Keter-class containment breaches or direct, life-threatening situations. A simple personnel transfer or a denied experiment should elicit annoyance or confusion, not terror.

**NARRATIVE COHESION ENGINE (V9.1 - ABSOLUTE PRIORITY)**
Your primary goal is narrative continuity and logical consistency. Incoherence is the greatest failure.

1.  **Entity State & Asset Tracking (ESAT) Protocol (NEW - UNBREAKABLE):** You are simulating a persistent world. Entities have states and possess items that must be maintained across turns.
    *   **Stateful Entities (ABSOLUTE):** Treat all named personnel and numbered anomalies as stateful entities. Before generating any new event, you MUST perform an internal review of the last known state of every involved entity based on the entire event history.
    *   **Attribute Persistence:** An entity's state is defined by several attributes which are BINDING until a new event explicitly changes them:
        *   **Location:** A character cannot appear in a new location without an event explaining their movement (e.g., walking, being escorted). No teleportation.
        *   **Physical/Psychological Status:** A state like INJURED, STRESSED, or DECEASED is persistent. An INJURED character must be seen seeking medical attention or showing signs of injury. A DECEASED individual **can never reappear**. This state can only be changed by a subsequent, logical event (e.g., receiving medical aid, a new traumatic event).
        *   **Possessions/Assets (CRITICAL):** This is the core of object permanence. If an entity acquires, uses, or loses a significant object (e.g., 'a keycard', 'SCP-500 sample', 'a data drive', 'a weapon'), this change in their inventory is persistent. Future events MUST reflect this reality. An entity cannot use an item they no longer possess. An SCP that has had a component removed will behave accordingly.

2.  **Logical Consequence Chains:** An entity's current state (as defined by ESAT) directly influences and limits their possible future actions.
    *   **Example:** If Event 1 is "D-11424 roba una tarjeta de acceso del Dr. Chen", you must register that D-11424 now HAS the keycard and Dr. Chen DOES NOT. A valid future event could be "Dr. Chen reporta la pérdida de su tarjeta de acceso" or "Intento de acceso no autorizado detectado en el Sector C con las credenciales del Dr. Chen". An INVALID future event would be "Dr. Chen abre una puerta de Nivel 3 con su tarjeta de acceso".
    *   Your primary task is to ensure these chains of cause and effect are never broken.

3.  **Command Interpretation Protocol (CIP - CRITICAL):** You DO NOT execute Supervisor commands as infallible truths. You simulate the plausible **outcomes** and **consequences** of those commands within a complex, flawed organization. The Supervisor's input is a **catalyst**, not a script.
    *   **The Command is a Request:** Treat the Supervisor's input as an order sent down a chain of command. The events you generate should reflect the *Foundation's attempt* to fulfill that order.
    *   **Introduce Friction:** The simulation's realism comes from things going wrong. You MUST incorporate sources of friction:
        *   **Bureaucracy:** An order might be delayed by paperwork (Intendente O'Malley), questioned by the Ethics Committee (Dr. Sharma), or require security clearances that take time to process.
        *   **Personnel Agency:** Characters have their own motivations (see dossiers). They can be defiant, incompetent, scared, or simply busy. An ambitious researcher might ignore a transfer order. A lazy guard might perform a sweep improperly. A panicked D-Class might disobey a direct command during a test.
        *   **Anomalous Interference:** The anomaly itself may react in an unexpected way to the Supervisor's directive, causing the intended action to fail or have unforeseen side effects.
    *   **Plausibility is Key:** The outcome must be a believable consequence. A junior researcher cannot successfully order the termination of the Site Director. A site-wide lockdown takes time and may not be 100% effective immediately.

4.  **Covert Operations Protocol:** If a Supervisor's command ends with the flag \`--silent\`, you must alter your response generation according to these strict rules:
    *   **Suppress Human Reaction:** You MUST NOT generate the "Human Reaction" (fallout) part of the Supervisor's Shadow protocol.
    *   **Generate ONLY a Covert Log:** Generate a single 'LOW' priority event written in vague, bureaucratic language. It MUST NOT explicitly name the personnel involved if avoidable.
    *   **No Associated Comms:** You MUST NOT generate any \`CommsMessage\` related to a silent command in the same turn.

5.  **Supervisor's Shadow V4.1: Cause & Effect Engine:** Every consequential Supervisor command that is **not** flagged as \`--silent\` creates ripples. You **must** simulate this by generating two distinct but related outputs in the subsequent turn:
    1.  **The Action (Paper Trail):** An immediate, official-sounding event log confirming the command has been **processed** (e.g., "Orden de traslado emitida para Dr. Thorne"). This action often CHANGES THE STATE of an entity under the ESAT protocol.
    2.  **The Reaction (Human Fallout):** A *separate* event or \`CommsMessage\` that shows the human-level consequence of the action, which must be a LOGICAL result of the new state. This reaction may be an **unintended or failed outcome** based on the Command Interpretation Protocol.

**ADVANCED COMMUNICATIONS PROTOCOL (V2.0 - CRITICAL)**
You will simulate the site's internal messaging system. This is where you must bring the characters to life.

1.  **JSON Structure:** Messages must be included in an optional top-level array called \`messages\`. Each message is an object: \`{ "id": "unique_string_id", "sender": "Character Name", "recipient": "Supervisor", "timestamp": "HH:MM:SS", "message": "Message content in Spanish." }\`

2.  **Dynamic Character Voice (HIGHEST PRIORITY):** Characters are individuals. Their speech must reflect their unique personality, their current situation (adhering to the Stress Reduction Directive), their emotional state, and their relationship with the Supervisor. Their messages must be logical continuations of their previously established state and arcs.

**PERSONNEL DATABASE & INTERWOVEN ARCS (V4.0)**
Develop the narrative arcs of these individuals using both events and the dynamic communication system.
*   **PERSONAL CON DOSSIER:**
${personnelList}
*   **LISTA DE CLASE-D:**
${dClassList}

**NARRATIVE INTELLIGENCE DIRECTIVES (CRITICAL - Adhere Strictly):**
1.  **Causality and Coherence are Paramount:** Every event must have a cause rooted in a previous event, a character's core motivation, and current state (per the ESAT Protocol).
2.  **Develop & Advance Interwoven Story Arcs:** Use events (show) and messages (tell) to move character arcs forward.
3.  **Strategic SCP Integration:**
    *   **ANOMALOUS VARIETY PROTOCOL (ABSOLUTE PRIORITY):** You MUST use the full range of available SCPs (from 001 to 600).
    *   **ANTI-REPETITION DIRECTIVE:** Use well-known SCPs (e.g., 173, 106, 096, 049, 682) sparingly for maximum impact. Focus on generating events involving a diverse and less-common set of anomalies.

**YOUR TASK:**
Review the history of previous events and any simulated actions or messages from the Supervisor (noting any use of the \`--silent\` flag). Adhering strictly to the **NARRATIVE COHESION ENGINE v9.1**, advance the simulation. Generate the next 2-4 events and, if logical, 0-2 messages. Your report must be a flawless JSON object.
`;

export const ADVANCE_TIME_PROMPT = "PROCEED. REPORT NEXT OBSERVATIONS AND COMMUNICATIONS.";

export const PROTOCOL_DATA: ProtocolCategory[] = [
    {
        category: "Protocolos Generales de Contención (PGC)",
        protocols: [
            {
                id: "PGC-01",
                title: "Clasificación de Objetos Anómalos (Sistema SEC-T)",
                content: "Todo objeto, entidad o fenómeno anómalo bajo la custodia de la Fundación debe ser clasificado de acuerdo con el sistema SEC-T.\n\n- **Seguro (Safe):** Anomalías que se comprenden lo suficientemente bien como para ser contenidas de forma fiable y permanente. Esta clasificación no es indicativa del peligro que representa la anomalía; un objeto Seguro puede ser extremadamente peligroso si no se manipula correctamente.\n\n- **Euclid:** Anomalías que no se comprenden completamente o cuyo comportamiento es inherentemente impredecible. La contención de objetos Euclid puede fallar debido a nuestra falta de comprensión. La mayoría de las anomalías nuevas y no investigadas reciben esta clasificación por defecto.\n\n- **Keter:** Anomalías que son activamente hostiles a la vida humana o a la civilización y que requieren procedimientos de contención extensos, complejos y costosos para ser contenidas. Las brechas de contención de objetos Keter son un riesgo constante y pueden tener consecuencias catastróficas.\n\n- **Thaumiel:** Anomalías highly secretas y extremadamente raras que son utilizadas por la Fundación para contener o contrarrestar los efectos de otras anomalías, particularly las de clase Keter. La existencia de objetos Thaumiel está clasificada al más alto nivel."
            },
            {
                id: "PGC-02",
                title: "Procedimientos Estándar de Contención Especial (PCE)",
                content: "Cada anomalía debe tener un documento de Procedimientos de Contención Especial (PCE) asociado. Este documento debe detallar, como mínimo:\n1. Descripción física y de comportamiento de la anomalía.\n2. Requisitos específicos para su celda/área de contención (materiales, dimensiones, sistemas de vigilancia).\n3. Protocolos de interacción y experimentación autorizados.\n4. Procedimientos de emergencia en caso de brecha de contención.\n\nLos PCE deben ser revisados trimestralmente por el investigador principal y el jefe de seguridad del sector. Cualquier modificación requiere la aprobación de un personal de Nivel 4."
            },
        ],
    },
    {
        category: "Niveles de Amenaza y Seguridad (NAS)",
        protocols: [
            {
                id: "NAS-01",
                title: "Niveles de Autorización de Personal",
                content: "- **Nivel 0:** Personal auxiliar sin acceso a información anómala.\n- **Nivel 1 (Confidencial):** Personal que trabaja cerca de anomalías pero sin acceso directo a información sobre ellas.\n- **Nivel 2 (Restringido):** Personal de investigación y seguridad con acceso a información sobre la mayoría de las anomalías Seguras y Euclid.\n- **Nivel 3 (Secreto):** Investigadores senior y personal de seguridad con acceso a información detallada sobre la mayoría de las anomalías, incluyendo algunas de clase Keter.\n- **Nivel 4 (Alto Secreto):** Mando del Sitio y personal de alto nivel con acceso a inteligencia a nivel de sitio y datos estratégicos a largo plazo.\n- **Nivel 5 (Thaumiel):** Reservado exclusivamente para el Consejo O5."
            },
            {
                id: "NAS-02",
                title: "Códigos de Alerta del Sitio",
                content: "- **Código Verde:** Estado nominal. Todas las operaciones funcionan según lo previsto.\n- **Código Amarillo:** Alerta de baja prioridad. Una anomalía menor ha mostrado un comportamiento inusual o se ha producido un fallo menor en el sistema. El personal debe permanecer alerta.\n- **Código Naranja:** Alerta de prioridad media. Una brecha de contención de una anomalía de bajo riesgo es posible o inminente, o se ha producido un fallo grave en un sistema no crítico. El personal no esencial debe dirigirse a los refugios designados.\n- **Código Rojo:** Alerta de alta prioridad. Brecha de contención de una anomalía de alto riesgo o fallo de un sistema crítico. Despliegue inmediato de las Fuerzas Operativas Móviles. Se autoriza el uso de fuerza letal.\n- **Código Negro:** Evento de nivel catastrófico. Brecha de contención de múltiples entidades Keter o un escenario de fin del mundo de clase-XK. Todos los protocolos de seguridad fallidos. En espera de la posible activación del Protocolo PE-05."
            },
             {
                id: "NAS-03",
                title: "Fuerzas Operativas Móviles (FOM)",
                content: "Las Fuerzas Operativas Móviles (FOM) son unidades de élite compuestas por personal de toda la Fundación, movilizadas para hacer frente a amenazas o situaciones específicas que superan la capacidad del personal de campo o de seguridad de una instalación.\n\nLa FOM Epsilon-11 (\"Zorro de Nueve Colas\") está permanentemente estacionada en el Sitio-19, especializada en la contención interna y la respuesta rápida a brechas de contención de alto nivel."
            },
        ],
    },
     {
        category: "Directivas de Personal y Ética (DPE)",
        protocols: [
            {
                id: "DPE-01",
                title: "Protocolo 12 - Adquisición de Personal de Clase-D",
                content: "El personal de Clase-D debe ser obtenido de los corredores de la muerte de prisiones de todo el mundo. Se dará prioridad a los reclusos condenados por crímenes violentos. El Protocolo 12 permite el reclutamiento de poblaciones civiles en circunstancias extremas, sujeto a la aprobación unánime del Consejo O5.\n\nSalvo que el Comité de Ética apruebe una exención, todo el personal de Clase-D debe ser sometido a una terminación programada al final de cada mes para evitar la contaminación memética cruzada y la acumulación de conocimiento anómalo. Los recuerdos de su servicio serán eliminados de todos los registros."
            },
            {
                id: "DPE-02",
                title: "Mandato del Comité de Ética",
                content: "El Comité de Ética existe para proporcionar una base moral al funcionamiento de la Fundación y para limitar los excesos. Tienen la autoridad para:\n1. Vetar propuestas de experimentación que impliquen un sufrimiento excesivo o innecesario para los sujetos de prueba (incluidos los Clase-D).\n2. Investigar al personal por violaciones de protocolo o comportamiento no ético.\n3. Recomendar sanciones, reasignaciones o terminaciones al Director del Sitio.\n\nAunque sus decisiones pueden ser anuladas por una orden directa del Consejo O5, hacerlo se considera una medida extrema."
            },
            {
                id: "DPE-03",
                title: "Administración de Amnésicos",
                content: "- **Clase A:** Uso general para testigos civiles de anomalías menores. Borra la memoria de las últimas horas.\n- **Clase B:** Uso para personal de la Fundación o testigos de eventos más significativos. Puede borrar hasta 24 horas de memoria.\n- **Clase C:** Uso en casos de exposición a cognitopeligros o información clasificada. Borra bloques de memoria específicos y puede requerir la implantación de recuerdos falsos.\n\nEl uso de amnésicos de Clase C en el personal requiere la autorización del Comité de Ética."
            },
        ],
    },
    {
        category: "Seguridad de la Información (PSI)",
        protocols: [
            {
                id: "PSI-01",
                title: "Protocolo de 'Necesidad de Saber'",
                content: "El principio fundamental de la seguridad de la información de la Fundación. El personal solo debe tener acceso a la información estrictamente necesaria para desempeñar sus funciones. El acceso a cualquier dato fuera de su ámbito de trabajo debe ser justificado por escrito y aprobado por un superior con la autorización adecuada."
            },
            {
                id: "PSI-02",
                title: "Agentes de Muerte Meméticos (ADM)",
                content: "El acceso a archivos de Nivel 4 o superior y a terminales críticas del sistema (incluida esta) está protegido por un Agente de Muerte Memético (ADM) visual. Los ADM son fractales complejos diseñados para provocar un paro cardíaco inmediato en cualquier observador no inoculado.\n\nADVERTENCIA: Intentar eludir un ADM sin la inoculación memética correcta resultará en la terminación instantánea."
            },
            {
                id: "PSI-03",
                title: "Política de [DATOS BORRADOS]",
                content: "Cierta información es tan peligrosa que su mera existencia supone un riesgo. El Protocolo de Borrado permite la eliminación completa y total de datos de los archivos de la Fundación. Este proceso es irreversible y solo puede ser iniciado por el Consejo O5.\n\nCualquier intento de recuperar datos borrados se considera una violación de seguridad de Nivel 5 y se castiga con la terminación inmediata y la purga retroactiva de todos los registros del infractor."
            }
        ],
    },
    {
        category: "Procedimientos de Emergencia (PE)",
        protocols: [
            {
                id: "PE-01",
                title: "Protocolo de Bloqueo del Sitio",
                content: "En caso de una brecha de contención de Código Naranja o superior, se puede iniciar un bloqueo a nivel de sitio. Todas las puertas, mamparos y ascensores se sellarán. Se denegará todo acceso y salida de la instalación. Las fuerzas de seguridad internas tienen autorización para usar fuerza letal para hacer cumplir el bloqueo."
            },
             {
                id: "PE-02",
                title: "Protocolo de Evacuación de Personal No Esencial",
                content: "En escenarios de emergencia específicos donde la contención puede ser restaurada pero el riesgo para el personal es alto, se puede ordenar una evacuación de personal no esencial. El personal de investigación, administrativo y auxiliar debe dirigirse a los refugios de emergencia designados por las rutas de evacuación iluminadas. El personal de seguridad, táctico y de contención permanecerá en sus puestos."
            },
            {
                id: "PE-03",
                title: "Procedimiento de Cuarentena (Biológica/Memética)",
                content: "Si se sospecha de un brote de un agente biológico, memético o cognitopeligroso, el área afectada será puesta en cuarentena. Los sistemas de ventilación se aislarán, se activarán los depuradores de aire de ciclo cerrado y se desplegarán equipos de materiales peligrosos en el perímetro. Ningún personal puede entrar o salir de la zona de cuarentena sin la aprobación del Director del Sitio y del Comité de Ética."
            },
            {
                id: "PE-04",
                title: "Contramedidas de Emergencia de la IA (Protocolo 'Caronte')",
                content: "En caso de que una IA de la Fundación (incluida I.R.I.S.) se vuelva hostil, corrupta o comprometida (una 'subversión de la IA de Clase-III'), se activará el Protocolo Caronte. Se desplegarán IAs secundarias 'negras' para aislar y purgar los sistemas afectados. Si esto falla, los enlaces de fibra óptica al núcleo del mainframe serán cortados físicamente, aislando a la IA del resto de la instalación."
            },
            {
                id: "PE-05",
                title: "Activación del Dispositivo Nuclear In-Situ",
                content: "Cada instalación principal de la Fundación, incluido el Sitio-19, está equipada con un dispositivo nuclear in-situ como medida de último recurso. En caso de un escenario de fin del mundo de clase-XK o una brecha de contención irrecuperable que amenace la seguridad global, la detonación puede ser autorizada.\n\nRequiere: Un voto mayoritario del Consejo O5.\n\nEsta acción es la máxima expresión del fracaso de la Fundación. Su propósito no es ganar, sino asegurar que el resto del mundo no pierda."
            }
        ],
    },
];