const { Client } = require('pg');

async function createDatabase() {
  // Connect to default postgres database
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres',
    password: process.env.DB_PASSWORD, // Set this in .env file
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL');

    // Check if database exists
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname='expense_management'"
    );

    if (res.rows.length === 0) {
      // Create database
      await client.query('CREATE DATABASE expense_management');
      console.log('✓ Database "expense_management" created successfully');
    } else {
      console.log('✓ Database "expense_management" already exists');
    }

    await client.end();
    console.log('\n✅ Setup complete! You can now run: npm run dev');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDatabase();
