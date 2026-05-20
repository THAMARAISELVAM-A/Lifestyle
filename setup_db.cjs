const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_u0j9QXxmkoaM@ep-royal-brook-aokk7v7o-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function setupDatabase() {
  const sql = neon(DATABASE_URL);
  
  try {
    console.log('Connecting to Neon PostgreSQL via serverless driver...');

    // Test connection
    const test = await sql`SELECT version()`;
    console.log('Connected! PostgreSQL version:', test[0].version.substring(0, 60), '...\n');

    // Create tables one at a time for reliability
    console.log('Creating user_profiles...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        auth_user_id TEXT UNIQUE,
        display_name TEXT NOT NULL DEFAULT 'User',
        email TEXT,
        avatar_url TEXT,
        bio TEXT,
        life_score INTEGER DEFAULT 75,
        xp_total INTEGER DEFAULT 0,
        theme TEXT DEFAULT 'neural-dark',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ user_profiles');

    console.log('Creating tasks...');
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'todo',
        priority TEXT NOT NULL DEFAULT 'medium',
        project TEXT,
        due_date TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ tasks');

    console.log('Creating passwords...');
    await sql`
      CREATE TABLE IF NOT EXISTS passwords (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        username TEXT NOT NULL,
        encrypted_password TEXT,
        url TEXT,
        strength TEXT DEFAULT 'medium',
        otp_secret TEXT,
        category TEXT DEFAULT 'logins',
        last_modified TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ passwords');

    console.log('Creating health_metrics...');
    await sql`
      CREATE TABLE IF NOT EXISTS health_metrics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        heart_rate INTEGER DEFAULT 72,
        sleep NUMERIC DEFAULT 7.0,
        calories INTEGER DEFAULT 0,
        steps INTEGER DEFAULT 0,
        hydration INTEGER DEFAULT 0,
        stress INTEGER DEFAULT 50,
        weight NUMERIC DEFAULT 70,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ health_metrics');

    console.log('Creating expenses...');
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        category TEXT NOT NULL,
        amount NUMERIC NOT NULL DEFAULT 0,
        date TEXT NOT NULL,
        description TEXT,
        recurring BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ expenses');

    console.log('Creating devices...');
    await sql`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status BOOLEAN DEFAULT FALSE,
        value TEXT,
        room TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ devices');

    console.log('Creating messages...');
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        avatar TEXT,
        platform TEXT NOT NULL,
        content TEXT NOT NULL,
        "timestamp" TEXT NOT NULL,
        priority TEXT DEFAULT 'normal',
        summary TEXT,
        suggested_replies JSONB DEFAULT '[]',
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ messages');

    console.log('Creating files...');
    await sql`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        size TEXT NOT NULL,
        type TEXT NOT NULL,
        last_modified TEXT,
        encrypted BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ files');

    console.log('Creating automations...');
    await sql`
      CREATE TABLE IF NOT EXISTS automations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        trigger_condition TEXT NOT NULL,
        action TEXT NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        last_triggered TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ automations');

    console.log('Creating goals...');
    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        target INTEGER NOT NULL DEFAULT 1,
        current INTEGER NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'units',
        streak INTEGER DEFAULT 0,
        xp_value INTEGER DEFAULT 10,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ goals');

    console.log('Creating notifications...');
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ notifications');

    console.log('Creating calendar_events...');
    await sql`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE,
        all_day BOOLEAN DEFAULT FALSE,
        color TEXT DEFAULT '#8b5cf6',
        recurring TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ calendar_events');

    console.log('Creating ai_chat_history...');
    await sql`
      CREATE TABLE IF NOT EXISTS ai_chat_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ ai_chat_history');

    console.log('Creating knowledge_notes...');
    await sql`
      CREATE TABLE IF NOT EXISTS knowledge_notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        tags TEXT[],
        category TEXT DEFAULT 'general',
        pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`;
    console.log('  ✓ knowledge_notes');

    // Create indexes
    console.log('\nCreating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_passwords_user ON passwords(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_health_user ON health_metrics(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_automations_user ON automations(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifs_user ON notifications(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cal_user ON calendar_events(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_user ON ai_chat_history(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_user ON knowledge_notes(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_profiles_auth ON user_profiles(auth_user_id)`;
    console.log('  ✓ All indexes created');

    // Verify
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name`;
    
    console.log('\n=== TABLES IN DATABASE ===');
    tables.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.table_name}`);
    });

    console.log('\n✅ Database setup complete! All 14 tables and indexes are ready.');

  } catch (err) {
    console.error('Database setup error:', err);
  }
}

setupDatabase();
