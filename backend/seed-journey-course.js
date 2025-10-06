import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Função para criar o curso Journey
async function createJourneyCourse(client) {
  // Verificar se o curso já existe
  const existingCourse = await client.query(`
    SELECT id, name FROM courses WHERE name = $1
  `, ['Journey - English for Life']);
  
  if (existingCourse.rows.length > 0) {
    console.log("⚠️  Curso Journey já existe, usando o existente");
    return existingCourse.rows[0];
  }
  
  const courseResult = await client.query(`
    INSERT INTO courses (id, name, description, language, level, duration, price, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())
    RETURNING id, name
  `, [
    'Journey - English for Life',
    'Curso completo de inglês baseado em vídeos interativos e atividades práticas',
    'English',
    'intermediate',
    180, // 180 horas
    0 // grátis para demo
  ]);
  
  return courseResult.rows[0];
}

// Função para criar Book One
async function createBookOne(client, courseId) {
  const bookResult = await client.query(`
    INSERT INTO books (id, course_id, name, description, color, display_order, total_days, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())
    RETURNING id, name
  `, [
    courseId,
    'Book One',
    '1 hora semanal - Unidades 01 a 10',
    '#3b82f6', // azul
    1,
    60 // 10 units x 6 dias
  ]);
  
  const book = bookResult.rows[0];
  
  // Criar Units do Book One (10 units + checkpoint + review)
  const units = [];
  for (let i = 1; i <= 10; i++) {
    const unitResult = await client.query(`
      INSERT INTO course_units (id, book_id, name, description, display_order, unit_type, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'lesson', true, NOW(), NOW())
      RETURNING id, name
    `, [
      book.id,
      `Unit ${String(i).padStart(2, '0')}`,
      `Unidade ${i} - 6 dias de contato com vídeo + atividade`,
      i
    ]);
    units.push(unitResult.rows[0]);
    
    // Criar 6 vídeos para cada unit
    await createVideosForUnit(client, unitResult.rows[0].id, i);
  }
  
  // Criar checkpoint após a Unit 05
  await client.query(`
    INSERT INTO course_units (id, book_id, name, description, display_order, unit_type, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, 'checkpoint', true, NOW(), NOW())
  `, [
    book.id,
    'Checkpoint',
    'Atividade plataforma para correção dos teachers',
    11
  ]);
  
  // Criar Review e Final Checkpoint
  await client.query(`
    INSERT INTO course_units (id, book_id, name, description, display_order, unit_type, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, 'review', true, NOW(), NOW())
  `, [
    book.id,
    'Review',
    'Aula revisão com teacher',
    12
  ]);
  
  await client.query(`
    INSERT INTO course_units (id, book_id, name, description, display_order, unit_type, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, 'checkpoint', true, NOW(), NOW())
  `, [
    book.id,
    'Check Point Book One',
    'Atividade plataforma para correção dos teachers',
    13
  ]);
  
  return book;
}

// Função para criar Book Two
async function createBookTwo(client, courseId) {
  const bookResult = await client.query(`
    INSERT INTO books (id, course_id, name, description, color, display_order, total_days, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())
    RETURNING id, name
  `, [
    courseId,
    'Book Two',
    '2 horas semanais - Unidades 11 a 20',
    '#8b5cf6', // roxo
    2,
    60 // 10 units x 6 dias
  ]);
  
  const book = bookResult.rows[0];
  
  // Criar Units do Book Two (10 units + checkpoint + review)
  for (let i = 11; i <= 20; i++) {
    const unitResult = await client.query(`
      INSERT INTO course_units (id, book_id, name, description, display_order, unit_type, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'lesson', true, NOW(), NOW())
      RETURNING id, name
    `, [
      book.id,
      `Unit ${String(i).padStart(2, '0')}`,
      `Unidade ${i} - 6 dias de contato com vídeo + atividade + Conversation`,
      i - 10
    ]);
    
    // Criar 6 vídeos para cada unit
    await createVideosForUnit(client, unitResult.rows[0].id, i);
  }
  
  // Criar checkpoint após a Unit 15
  await client.query(`
    INSERT INTO course_units (id, book_id, name, description, display_order, unit_type, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, 'checkpoint', true, NOW(), NOW())
  `, [
    book.id,
    'Checkpoint',
    'Atividade plataforma para correção dos teachers',
    11
  ]);
  
  // Criar Review e Final Checkpoint
  await client.query(`
    INSERT INTO course_units (id, book_id, name, description, display_order, unit_type, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, 'review', true, NOW(), NOW())
  `, [
    book.id,
    'Review',
    'Aula revisão com teacher',
    12
  ]);
  
  await client.query(`
    INSERT INTO course_units (id, book_id, name, description, display_order, unit_type, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, 'checkpoint', true, NOW(), NOW())
  `, [
    book.id,
    'Check Point Book Two',
    'Atividade plataforma para correção dos teachers',
    13
  ]);
  
  return book;
}

// Função para criar Book Three
async function createBookThree(client, courseId) {
  const bookResult = await client.query(`
    INSERT INTO books (id, course_id, name, description, color, display_order, total_days, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())
    RETURNING id, name
  `, [
    courseId,
    'Book Three',
    '3 horas semanais - Unidades 21 a 30',
    '#10b981', // verde
    3,
    60 // 10 units x 6 dias
  ]);
  
  const book = bookResult.rows[0];
  
  // Criar Units do Book Three (10 units + checkpoint + review)
  for (let i = 21; i <= 30; i++) {
    const unitResult = await client.query(`
      INSERT INTO course_units (id, book_id, name, description, display_order, unit_type, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'lesson', true, NOW(), NOW())
      RETURNING id, name
    `, [
      book.id,
      `Unit ${String(i).padStart(2, '0')}`,
      `Unidade ${i} - 6 dias de contato com vídeo + atividade + Conversation + Listening`,
      i - 20
    ]);
    
    // Criar 6 vídeos para cada unit
    await createVideosForUnit(client, unitResult.rows[0].id, i);
  }
  
  // Criar checkpoint após a Unit 25
  await client.query(`
    INSERT INTO course_units (id, book_id, name, description, display_order, unit_type, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, 'checkpoint', true, NOW(), NOW())
  `, [
    book.id,
    'Checkpoint',
    'Atividade plataforma para correção dos teachers',
    11
  ]);
  
  // Criar Review e Final Checkpoint
  await client.query(`
    INSERT INTO course_units (id, book_id, name, description, display_order, unit_type, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, 'review', true, NOW(), NOW())
  `, [
    book.id,
    'Review',
    'Aula revisão com teacher',
    12
  ]);
  
  await client.query(`
    INSERT INTO course_units (id, book_id, name, description, display_order, unit_type, is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, 'checkpoint', true, NOW(), NOW())
  `, [
    book.id,
    'Check Point Book Three',
    'Atividade plataforma para correção dos teachers',
    13
  ]);
  
  return book;
}

// Função para criar vídeos para uma unit
async function createVideosForUnit(client, unitId, unitNumber) {
  const dayTitles = [
    'Welcome & Introduction',
    'Listening Practice',
    'Speaking Exercise',
    'Fill in the Blanks',
    'Complete the Dialogue',
    'Subtitles & Review'
  ];
  
  const dayInstructions = [
    'Boas vindas! Assista o vídeo e escolha a frase que foi usada por um dos palestrantes.',
    'Escolha a frase que foi usada no vídeo por um dos Speakers.',
    'Dê uma olhada na frase do vídeo. Clique no ícone do microfone para gravar sua voz lendo esta frase em voz alta.',
    'Ouça os diálogos e digite as palavras que faltam para preencher as lacunas.',
    'Clique nas caixas abaixo e escolha as frases corretas para completar o diálogo.',
    'Assista ao vídeo com legendas. Lembre-se de clicar no botão CC para ativá-las.'
  ];
  
  const activityTypes = [
    'multiple_choice',
    'multiple_choice',
    'speaking',
    'fill_blank',
    'unscramble',
    'listening'
  ];
  
  for (let day = 1; day <= 6; day++) {
    // Criar vídeo
    const videoResult = await client.query(`
      INSERT INTO course_videos (id, unit_id, day_number, title, description, video_url, thumbnail_url, duration, has_subtitles, display_order, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())
      RETURNING id
    `, [
      unitId,
      day,
      `Day ${day}: ${dayTitles[day - 1]}`,
      `Unit ${unitNumber} - ${dayInstructions[day - 1]}`,
      `https://www.youtube.com/embed/dQw4w9WgXcQ`, // Video placeholder
      `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`, // Thumbnail placeholder
      300, // 5 minutos
      day === 6, // apenas o dia 6 tem legendas
      day
    ]);
    
    const videoId = videoResult.rows[0].id;
    
    // Criar atividade para o vídeo
    await client.query(`
      INSERT INTO course_activities (id, video_id, activity_type, title, description, instruction, content, correct_answer, points, display_order, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())
    `, [
      videoId,
      activityTypes[day - 1],
      dayTitles[day - 1],
      `Atividade do dia ${day}`,
      dayInstructions[day - 1],
      JSON.stringify({
        question: `Complete the activity for Day ${day}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D']
      }),
      JSON.stringify({ correctAnswer: 'Option A' }),
      10,
      1
    ]);
  }
}

export async function seedJourneyCourse() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    console.log("🎓 Criando curso Journey - English for Life...");
    const course = await createJourneyCourse(client);
    console.log(`✅ Curso criado: ${course.name} (ID: ${course.id})`);
    
    console.log("\n📘 Criando Book One...");
    const bookOne = await createBookOne(client, course.id);
    console.log(`✅ Book One criado: ${bookOne.name}`);
    
    console.log("\n📗 Criando Book Two...");
    const bookTwo = await createBookTwo(client, course.id);
    console.log(`✅ Book Two criado: ${bookTwo.name}`);
    
    console.log("\n📙 Criando Book Three...");
    const bookThree = await createBookThree(client, course.id);
    console.log(`✅ Book Three criado: ${bookThree.name}`);
    
    await client.query("COMMIT");
    console.log("\n🎉 Seed do curso Journey concluído com sucesso!");
    
    return { course, bookOne, bookTwo, bookThree };
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Erro no seed:", e.message);
    throw e;
  } finally {
    client.release();
  }
}

async function main() {
  console.log("🚀 Iniciando seed do curso Journey...\n");
  await seedJourneyCourse();
  await pool.end();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(async (e) => {
    console.error("💥 Erro fatal:", e.message);
    await pool.end();
    process.exit(1);
  });
}
