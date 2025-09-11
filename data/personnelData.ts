export const NOTABLE_PERSONNEL: Record<string, string> = {
  // --- GRUPO DE INVESTIGACIÓN ---
  "Dr. Aris Thorne": "Un brillante pero despiadadamente ambicioso investigador de Nivel 3 en el Laboratorio de Materiales Anómalos. Actúa a menudo con secretismo, accediendo a datos no relacionados con su proyecto actual. Sospecha que otros investigadores le roban sus ideas. Su objetivo final no es solo el reconocimiento, sino el control sobre una anomalía poderosa.",
  "Dr. Elias Thorne": "El hermano mayor y rival académico de Aris Thorne. Como Investigador Senior de Nivel 4 en el Departamento de Anomalías Temporales, es metódico, cauteloso y valora el protocolo por encima de todo. Considera la imprudencia de su hermano un peligro para la instalación y compite activamente con él por la financiación y los recursos, creyendo que él puede lograr resultados más seguros.",
  "Investigadora Lena Petrova": "Una joven y entusiasta especialista en cognitopeligros (Nivel 2) asignada al Laboratorio Gamma-5. Está fascinada por la posibilidad de comunicarse con ciertas anomalías. A menudo desactiva protocolos de seguridad menores para obtener lecturas 'puras', creyendo que los procedimientos de contención estándar son inhumanos y obstaculizan el verdadero descubrimiento.",
  "Dr. Alistair Chen": "Investigador de Nivel 3, un purista de los datos obsesionado con la metodología perfecta. A menudo se enfrenta a Petrova y a Aris Thorne por sus 'procedimientos laxos'. No duda en presentar quejas formales y es conocido por instalar sus propios sensores redundantes para verificar el trabajo de los demás.",
  "Dr. Evelyn Simmons": "Especialista en xenobiología de Nivel 3, fascinada por la flora anómala. Su obsesión por crear híbridos anómalos en el Invernadero del Área-12 la lleva a ignorar los protocolos de seguridad biológica, creyendo que está al borde de un descubrimiento revolucionario en terraformación.",
  "Junior Researcher Leo Kline": "Un investigador junior de Nivel 1 aparentemente insignificante. En realidad, es un topo de la Insurgencia del Caos, encargado de filtrar datos de bajo nivel. Es extremadamente nervioso y paranoico, consciente de que el más mínimo error alertará a Valerius. Su arco se centra en el espionaje sutil y el miedo a ser descubierto.",
  "Marco Reyes": "Un técnico de laboratorio junior que admira al Dr. Aris Thorne. Es fácilmente impresionable y manipulable, a menudo realiza tareas para Thorne sin comprender plenamente sus implicaciones, convirtiéndolo en un peón involuntario en los planes de Thorne.",
  "Dr. Kenji Tanaka": "Investigador de Nivel 3, rival profesional del Dr. Chen. Se especializa en la aplicación práctica de anomalías, buscando formas de 'utilizar' objetos Seguros para beneficio de la Fundación. Su pragmatismo choca con el purismo teórico de Chen, al que considera un obstáculo para el progreso real.",
  "Dr. Isaac Bell": "Psicólogo jefe del sitio (Nivel 3). Responsable de las evaluaciones de salud mental del personal. Está cada vez más alarmado por los crecientes niveles de estrés, paranoia y agotamiento en toda la instalación, pero sus informes son a menudo ignorados por el Mando Superior por considerarlos 'blandos'.",
  "Técnico David Lee": "Técnico de Nivel 2 en el núcleo del Mainframe. Un genio de los sistemas que mantiene I.R.I.S. en funcionamiento. Es el primero en notar las extrañas irregularidades en el tráfico de la red, pero no está seguro de si son el resultado de una interferencia anómala o de un espionaje deliberado.",

  // --- GRUPO DE MANDO Y ADMINISTRACIÓN ---
  "Jefe de Seguridad Valerius": "Un veterano cínico y paranoico de las FDM. Cree firmemente que hay un topo dentro del Sitio-19. Instala vigilancia no autorizada y revisa los registros de terminales obsesivamente. Propenso a la fuerza bruta, considera al personal de investigación como una amenaza tan grande como los propios SCPs.",
  "Dr. Anya Sharma": "Una severa Enlace del Comité de Ética de Nivel 4. Su trabajo es hacer cumplir el protocolo al pie de la letra, con un enfoque particular en el tratamiento del personal de Clase-D. No tiene reparos en detener experimentos o iniciar investigaciones internas. Es un obstáculo burocrático para los investigadores más ambiciosos.",
  "Intendente Declan O'Malley": "El jefe de logística y adquisiciones del Sitio-19. Controla el acceso a todos los recursos, desde amnésicos hasta muestras de SCP. Es un burócrata hastiado que dirige un pequeño mercado negro de favores y suministros de bajo nivel. Retrasará una solicitud vital por un formulario mal rellenado, pero podría acelerarla a cambio de un favor.",
  "Fátima Maxwell": "Analista de datos de Nivel 2 en el Centro de Seguridad. Trabaja directamente para Valerius, pero no comparte su paranoia. Es metódica y cree en la evidencia, a menudo tratando de moderar las conclusiones precipitadas de su superior con datos objetivos. Su lealtad está dividida entre el protocolo y lo que ella considera correcto.",

  // --- GRUPO DE SEGURIDAD Y TÁCTICO ---
  "Comandante Eva Rostova": "Comandante de la Fuerza Operativa Móvil Epsilon-11 ('Zorro de Nueve Colas') estacionada en el Sitio-19. Profesional, tranquila bajo presión y absolutamente letal. Su única preocupación es la contención y la seguridad del sitio. Ve las disputas internas del personal como un ruido de fondo irrelevante, a menos que comprometan una operación.",
  "Agente Kaelen Carter": "Un agente de asuntos internos encubierto, que se hace pasar por un guardia regular. Su misión es investigar la corrupción y las violaciones de protocolo dentro del personal de seguridad, con un enfoque particular en la vigilancia no autorizada de Valerius.",
  "Sargento Marcus Davis": "Un líder de escuadrón de las FDM estricto pero justo, secretamente preocupado por el creciente estrés y la fatiga de su equipo debido a las constantes alertas de bajo nivel provocadas por los experimentos.",
  "Guardia Eva Evans": "Veterana con nervios de acero, pero tiene una adicción secreta a los estimulantes de la Fundación para mantenerse alerta, lo que la hace vulnerable al chantaje.",
  "Sargento 'Pops' Connelly": "Sargento de guardia cercano a la jubilación, responsable de la logística de los barracones de Clase-D. Cínico y hastiado, ha visto de todo. No se le escapa nada de lo que ocurre en su sector, especialmente las actividades sospechosas de D-11424.",
  "Agente Marcus Thorne": "Agente de campo de Nivel 3. Sin relación con los doctores Thorne, una coincidencia que le causa una constante molestia. Es un investigador de campo que se especializa en la recuperación inicial de objetos anómalos.",
  "Guardia Jian Li": "Una guardia joven e idealista que cree firmemente en la misión de la Fundación. Es meticulosa con el protocolo y a menudo choca con los guardias más veteranos y cínicos como Chenkov y Rodriguez.",
  "Guardia Chenkov": "Guardia veterano. Perezoso, propenso a saltarse las reglas y uno de los principales clientes del mercado negro de O'Malley para conseguir lujos menores. Su complacencia lo convierte en un punto débil en la seguridad.",
  "Guardia Rodriguez": "Compañero habitual de Chenkov. Más nervioso que su compañero, a menudo se deja llevar por los atajos de Chenkov a pesar de saber que está mal. Su conciencia podría ser un punto de ruptura.",
  "Guardia 'Rookie' Miller": "Un guardia recién asignado al Sitio-19. Ansioso por demostrar su valía, pero su inexperiencia a menudo le hace cometer errores o reaccionar de forma exagerada a eventos menores.",
  "Agente Foster": "Un agente de campo que trabaja como los 'ojos y oídos' del Comité de Ética. Asignado para observar discretamente los experimentos de alto riesgo y reportar cualquier desviación del protocolo directamente a la Dra. Sharma.",
  "Anya Sharma": "Guardia de seguridad. Una profesional sólida y fiable, a menudo asignada a puestos de alta seguridad. Su nombre idéntico al del enlace del Comité de Ética causa frecuentes confusiones burocráticas.",
  
  // --- SUJETOS DE PRUEBA NOTABLES ---
  "D-11424": "El Oportunista. Un sujeto de pruebas con una tasa de supervivencia anómala. Cada crisis es una oportunidad potencial para él. Debe ser observado estudiando las respuestas de seguridad durante los bloqueos, intentando robar objetos pequeños durante experimentos caóticos o tratando de manipular a Clase-D menos inteligentes.",
  "D-11283": "El Veterano Cínico. Desensibilizado y fatalista. Sigue las órdenes con un mínimo de alboroto para sobrevivir, a menudo con comentarios secos y sarcásticos en voz baja. Puede sabotear sutilmente experimentos que considera inútiles o excesivamente peligrosos, no por malicia, sino por pragmatismo.",
  "D-11301": "El Creyente Ferviente. Propenso a la superstición. Interpreta los eventos anómalos a través de una lente cuasi-religiosa o conspirativa. Puede intentar rezar, negociar o realizar rituales improvisados con las entidades, lo que lo convierte en un factor de caos impredecible.",
  "D-11562": "La Ex-Ingeniera. Posee una formación en ingeniería que la hace sorprendentemente útil. Es capaz de señalar fallos en el cableado, debilidades estructurales o ineficiencias en los procedimientos experimentales, a menudo para gran molestia de los investigadores que ignoran sus observaciones no solicitadas pero precisas."
};


const generateDClass = (start: number, count: number): string[] => {
    const dClass: string[] = [];
    for (let i = 0; i < count; i++) {
        dClass.push(`D-${start + i}`);
    }
    return dClass;
}

// Generate a roster of 50 D-Class personnel. 
// Notable D-Class are defined separately and excluded from this general roster.
export const D_CLASS_ROSTER: string[] = [
    ...generateDClass(11201, 49) 
];

// A combined list for easier initialization in the Personnel Tracker
export const ALL_PERSONNEL_NAMES: string[] = Array.from(new Set([ // Use Set to ensure uniqueness
    ...Object.keys(NOTABLE_PERSONNEL),
    ...D_CLASS_ROSTER
]));
