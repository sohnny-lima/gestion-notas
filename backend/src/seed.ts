// src/seed.ts
import { prisma } from "./prisma";
import { hashPassword } from "./utils/auth";

async function main() {
  console.log("🌱 Sembrando datos...");

  /* ============================================================
     LIMPIEZA BÁSICA (hijos -> padres)
  ============================================================ */
  await prisma.grade.deleteMany();
  await prisma.enrollment.deleteMany();
  // No borramos usuarios/cursos porque usamos upsert

  /* ============================================================
     USUARIOS
  ============================================================ */

  // ADMIN
  const adminPassword = await hashPassword("123456");
  const admin = await prisma.user.upsert({
    where: { email: "admin@sistema.com" },
    update: {},
    create: {
      email: "admin@sistema.com",
      name: "Super Admin",
      password: adminPassword,
      role: "ADMIN",
      code: "ADM-001",
    },
  });

  // DOCENTES HUAPAYA
  const teacherPassword = await hashPassword("123456");

  const teacher1 = await prisma.user.upsert({
    where: { email: "dante.gutierrez@victoralvarezhuapaya.edu.pe" },
    update: {},
    create: {
      email: "dante.gutierrez@victoralvarezhuapaya.edu.pe",
      name: "Iván Dante Gutiérrez Guerra",
      password: teacherPassword,
      role: "DOCENTE",
      code: "DOC-001",
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: "kevin.mauricio@victoralvarezhuapaya.edu.pe" },
    update: {},
    create: {
      email: "kevin.mauricio@victoralvarezhuapaya.edu.pe",
      name: "Kevin Javier Mauricio Arango",
      password: teacherPassword,
      role: "DOCENTE",
      code: "DOC-002",
    },
  });

  const teacher3 = await prisma.user.upsert({
    where: { email: "franklin.ochoa@victoralvarezhuapaya.edu.pe" },
    update: {},
    create: {
      email: "franklin.ochoa@victoralvarezhuapaya.edu.pe",
      name: "Franklin Zenón Ochoa Coras",
      password: teacherPassword,
      role: "DOCENTE",
      code: "DOC-003",
    },
  });

  const teacher4 = await prisma.user.upsert({
    where: { email: "edwin.vargas@victoralvarezhuapaya.edu.pe" },
    update: {},
    create: {
      email: "edwin.vargas@victoralvarezhuapaya.edu.pe",
      name: "Edwin Vargas Avilés",
      password: teacherPassword,
      role: "DOCENTE",
      code: "DOC-004",
    },
  });

  const teachers = [teacher1, teacher2, teacher3, teacher4];

  // ALUMNOS
  const studentsRaw = [
    "AQUINO MEDINA|DANIEL",
    "BARBARAN DE LA CRUZ|YURI DAVID",
    "BARBOZA SOLIER|ANGEL MOISES",
    "CANDIA AGUILAR|JHONATAN CRSITIANA",
    "CCONISLLA QUISPE|CLEYSON",
    "CHOQUECAHUA AYALA|JHOAN ALDAIR",
    "DE LA CRUZ FLORES|ARNOL GABRIEL",
    "GUZMAN RAMOS|YORDY",
    "HUAMANI CAHUANA|DEYBI BENEDIN",
    "LAPA TORRES|OSCAR MICHAEL",
    "LIMA INFANZÓN|SOHNNY WALTER",
    "OCHOA VILCAPOMA|JUAN EDUO",
    "ORE MAÑUICO|JUAN ANTONIO",
    "PALOMINO MEJIA|FABRICIO GUGHYN",
    "PARIONA ALARCON|JEAMPIER TITO",
    "PARIONA ENCISO|GIORDY ALEXANDER",
    "PARIONA ENCISO|GIAN CARLOS",
    "QUISPE SAUÑE|ADERLY",
    "RETAMOZO BERNA|CÉSAR AUGUSTO",
    "ROJAS OSCATA|ROLY",
    "SOLIER HUMAREDA|XIOMARA NICOLE",
    "SULCA GOMEZ|BRYAN",
    "VALDIVIEZO RUPIRE|NORA GABRIELA",
    "YANCCE TAYPE|JHANPOOL BRYAN",
  ];

  const students = [];
  const studentPassword = await hashPassword("123456");

  for (let i = 0; i < studentsRaw.length; i++) {
    const [lastnames, firstnames] = studentsRaw[i].split("|");
    const fullName = `${firstnames.trim()} ${lastnames.trim()}`;
    const codeNumber = (i + 1).toString().padStart(3, "0");
    const email = `alumno${codeNumber}@sistema.com`; // puedes cambiar el dominio si quieres

    const student = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: fullName,
        password: studentPassword,
        role: "ALUMNO",
        code: `ALU-${codeNumber}`,
      },
    });

    students.push(student);
  }

  /* ============================================================
     CURSOS (UNIDADES DIDÁCTICAS)
  ============================================================ */

  const courseNames = [
    // Semestre I (1–6)
    "Conectividad e infraestructura de redes",
    "Mantenimiento preventivo y correctivo de equipos informáticos",
    "Gestión de sistemas operativos Windows / Linux",
    "Administración de servidores de red",
    "Comunicación oral",
    "Aplicaciones en internet",
    // Semestre II (7–12)
    "Instalación y configuración de infraestructura de redes",
    "Seguridad y optimización de redes de comunicación",
    "Reparación de equipos de cómputo",
    "Soporte técnico en infraestructuras TI",
    "Interpretación y producción de textos",
    "Ofimática",
    // Semestre III (13–18)
    "Administración de base de datos",
    "Gestión de recursos TI",
    "Arquitectura de sistemas de información",
    "Algoritmos y programación",
    "Inglés para la comunicación oral",
    "Comportamiento ético",
    // Semestre IV (19–24)
    "Infraestructura TI",
    "Desarrollo de aplicaciones de escritorio",
    "Desarrollo de dispositivos autónomos",
    "Buenas prácticas en ITIL",
    "Comprensión y redacción en inglés",
    "Solución de problemas",
    // Semestre V (25–30)
    "Herramientas de diseño gráfico",
    "Desarrollo de aplicaciones web",
    "Arquitectura de Aplicaciones Java",
    "Desarrollo de recursos TIC's",
    "Fundamentos de innovación tecnológica",
    "Oportunidades de negocios",
    // Semestre VI (31–37)
    "Desarrollo arquitectónico y multimedia",
    "Aplicaciones con webservices",
    "Comercio electrónico",
    "Desarrollo de aplicaciones móviles",
    "Seguridad informática",
    "Innovación tecnológica",
    "Plan de negocios",
  ];

  const courses = [];

  for (let i = 0; i < courseNames.length; i++) {
    const name = courseNames[i];

    // Calcular semestre según el índice
    let semester = 1;
    if (i >= 6 && i < 12) semester = 2;
    else if (i >= 12 && i < 18) semester = 3;
    else if (i >= 18 && i < 24) semester = 4;
    else if (i >= 24 && i < 30) semester = 5;
    else if (i >= 30) semester = 6;

    // Número dentro del semestre
    let offset = 0;
    if (semester === 2) offset = 6;
    else if (semester === 3) offset = 12;
    else if (semester === 4) offset = 18;
    else if (semester === 5) offset = 24;
    else if (semester === 6) offset = 30;

    const numWithin = i - offset + 1;

    const code = `S${semester.toString().padStart(2, "0")}-UD${numWithin
      .toString()
      .padStart(2, "0")}`;

    // Asignar docente “al azar” pero balanceado (round-robin)
    const teacher = teachers[i % teachers.length];

    const course = await prisma.course.upsert({
      where: { code },
      update: {
        name,
        description: `Unidad didáctica del semestre ${semester}: ${name}`,
        teacherId: teacher.id,
      },
      create: {
        name,
        code,
        description: `Unidad didáctica del semestre ${semester}: ${name}`,
        teacherId: teacher.id,
      },
    });

    courses.push(course);
  }

  /* ============================================================
     MATRÍCULAS (mínimo 6 cursos por alumno)
  ============================================================ */

  const minCoursesPerStudent = 6;

  for (const student of students) {
    // Barajar cursos
    const shuffled = [...courses].sort(() => Math.random() - 0.5);
    // Entre 6 y 9 cursos por alumno
    const numCourses = minCoursesPerStudent + Math.floor(Math.random() * 4); // 6–9

    const selected = shuffled.slice(0, numCourses);

    for (const course of selected) {
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
        },
      });
    }
  }

  /* ============================================================
     NOTAS (10–20 al azar para cada matrícula)
  ============================================================ */

  const enrollments = await prisma.enrollment.findMany();

  for (const enrollment of enrollments) {
    const randomGrade = 10 + Math.floor(Math.random() * 11); // 10–20

    await prisma.grade.create({
      data: {
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        value: randomGrade,
      },
    });
  }

  /* ============================================================
     LOGS
  ============================================================ */

  console.log("✅ Admin:", admin.email);
  console.log(
    "✅ Docentes:",
    teacher1.email,
    teacher2.email,
    teacher3.email,
    teacher4.email
  );
  console.log(`✅ Alumnos: ${students.length}`);
  console.log(`✅ Cursos: ${courses.length}`);
  console.log(`✅ Matrículas: ${enrollments.length}`);
  console.log("✅ Notas creadas correctamente ✔️");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
