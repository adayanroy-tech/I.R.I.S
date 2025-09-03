export const NOTABLE_PERSONNEL: Record<string, string> = {
  // Former Key Personnel
  "Dr. Aris Thorne": "Un brillante pero despiadadamente ambicioso investigador de Nivel 3 en el Laboratorio de Materiales Anómalos. Actúa a menudo con secretismo, accediendo a datos no relacionados con su proyecto actual. Sospecha que otros investigadores le roban sus ideas. Su objetivo final no es solo el reconocimiento, sino el control sobre una anomalía poderosa.",
  "Jefe de Seguridad Valerius": "Un veterano cínico y paranoico de las FDM. Cree firmemente que hay un topo dentro del Sitio-19. Instala vigilancia no autorizada y revisa los registros de terminales obsesivamente. Propenso a la fuerza bruta, considera al personal de investigación como una amenaza tan grande como los propios SCPs.",
  "Investigadora Lena Petrova": "Una joven y entusiasta especialista en cognitopeligros (Nivel 2) asignada al Laboratorio Gamma-5. Está fascinada por la posibilidad de comunicarse con ciertas anomalías. A menudo desactiva protocolos de seguridad menores para obtener lecturas 'puras', creyendo que los procedimientos de contención estándar son inhumanos y obstaculizan el verdadero descubrimiento.",
  "D-11424": "Un sujeto de pruebas de Clase-D con una tasa de supervivencia inusualmente alta. No es un simple superviviente; está activamente planeando su fuga. Intenta crear distracciones, robar tarjetas de acceso y memorizar las rutas de los guardias. Su pánico a menudo frustra sus propios planes.",
  
  // Former Other Researchers
  "Dr. Alistair Chen": "Obsesionado con la pureza de los datos, a menudo se enfrenta a Petrova por sus métodos poco ortodoxos.",
  "Dr. Evelyn Simmons": "Especialista en xenobiología, fascinada por la flora anómala, pasa demasiado tiempo en el Invernadero del Área-12.",
  "Marco Reyes": "Un técnico de laboratorio junior que admira al Dr. Thorne y podría ser fácilmente manipulado por él.",
  "Fátima Maxwell": "Experta en anomalías temporales, constantemente preocupada por las paradojas y los bucles de causalidad.",
  "Dr. Kenji Tanaka": "Especialista en memética, está desarrollando nuevas contramedidas cognitopeligrosas, a veces probándolas de formas no autorizadas.",
  "Anya Sharma": "Geóloga anómala, cree que la propia instalación es geológicamente inestable debido a las anomalías que contiene.",
  "Dr. Isaac Bell": "Experto en SCPs de clase Segura, argumenta constantemente por una reducción de los protocolos, lo que le pone en conflicto con Valerius.",
  "Técnico David Lee": "Responsable del mantenimiento del mainframe, nota picos de uso de datos inexplicables que no se atreve a reportar por miedo.",
  
  // Former Security Personnel
  "Guardia 'Rookie' Miller": "Nuevo en el Sitio-19, registra detalles triviales que los veteranos ignoran, a veces con una precisión sorprendente.",
  "Guardia Eva Evans": "Veterana con nervios de acero, pero tiene una adicción secreta a los estimulantes de la Fundación para mantenerse alerta.",
  "Sargento Marcus Davis": "Un líder de escuadrón estricto pero justo, secretamente preocupado por el estado mental de sus hombres.",
  "Agente Kaelen Carter": "Un agente de asuntos internos encubierto, que se hace pasar por un guardia regular para vigilar a Valerius y a Thorne.",
  "Guardia Chenkov": "Ex-Spetsnaz, demasiado propenso a la violencia, a menudo es el primero en abrir fuego en situaciones ambiguas.",
  "Guardia Rodriguez": "Realiza pequeños rituales de protección antes de cada turno, lo que irrita a sus compañeros más seculares.",
  "Sargento Anya Sharma": "Ex-ingeniera de combate, experta en brechas estructurales. Valerius confía en ella para asegurar las zonas de contención.",
  "Agente Marcus Thorne": "Especialista en interrogatorios (sin relación con el Dr. Thorne), conocido por su habilidad para quebrar al personal de Clase-D.",
  "Comandante Eva Rostova": "La oficial de más alto rango bajo Valerius, a cargo de la logística y el despliegue de las FDM. Es metódica y no le gusta la improvisación de Valerius.",
  "Guardia Jian Li": "La guardia más observadora en el centro de seguridad, a menudo la primera en detectar anomalías visuales en los monitores.",
  "Sargento 'Pops' Connelly": "A punto de jubilarse, su apatía lo hace propenso a pasar por alto pequeñas infracciones de protocolo.",
  "Agente Foster": "Un especialista en contención de humanoides, a menudo asignado a SCPs como SCP-049."
};


const generateDClass = (start: number, count: number): string[] => {
    const dClass: string[] = [];
    for (let i = 0; i < count; i++) {
        dClass.push(`D-${start + i}`);
    }
    return dClass;
}

// Generate a roster of 50 D-Class personnel. 
// D-11424 is special and defined in NOTABLE_PERSONNEL.
export const D_CLASS_ROSTER: string[] = [
    ...generateDClass(11201, 49)
];

// A combined list for easier initialization in the Personnel Tracker
export const ALL_PERSONNEL_NAMES: string[] = Array.from(new Set([ // Use Set to ensure uniqueness
    ...Object.keys(NOTABLE_PERSONNEL),
    ...D_CLASS_ROSTER
]));