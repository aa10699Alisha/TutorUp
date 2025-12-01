/**
 * Script to verify if backend_app_user exists and has proper privileges
 * Run this to check if backend_app_user was created successfully
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyBackendUser() {
    console.log('\nVerifying backend_app_user in database...\n');
    
    let connection;
    
    try {
        // Connect using admin credentials
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('Connected to database as:', process.env.DB_USER);
        
        // Check if backend_app_user exists
        console.log('\n Checking if backend_app_user exists...');
        const [users] = await connection.query(
            "SELECT User, Host FROM mysql.user WHERE User = 'backend_app_user'"
        );
        
        if (users.length === 0) {
            console.log(' backend_app_user does NOT exist');
            console.log('\n You need to create this user first.');
            console.log('\nRun this SQL command in your MySQL console:');
            console.log("CREATE USER IF NOT EXISTS 'backend_app_user'@'%' IDENTIFIED BY 'BackendApp2025!Secure';");
            return false;
        }
        
        console.log('Backend_app_user EXISTS');
        console.log('   User:', users[0].User);
        console.log('   Host:', users[0].Host);
        
        // Check privileges
        console.log('\n Checking privileges for backend_app_user...');
        const [grants] = await connection.query(
            "SHOW GRANTS FOR 'backend_app_user'@'%'"
        );
        
        console.log(`\nFound ${grants.length} privilege grant(s):`);
        grants.forEach((grant, index) => {
            const grantText = Object.values(grant)[0];
            console.log(`   ${index + 1}. ${grantText}`);
        });
        
        // Test connection with backend_app_user
        console.log('\n Testing connection as backend_app_user...');
        
        try {
            const testConnection = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: 'backend_app_user',
                password: 'BackendApp2025!Secure',
                database: process.env.DB_NAME
            });
            
            console.log('Successfully connected as backend_app_user');
            
            // Test a simple query
            const [testResult] = await testConnection.query('SELECT COUNT(*) as count FROM Course');
            console.log(` Can query Course table: ${testResult[0].count} courses found`);
            
            await testConnection.end();
            console.log('\n backend_app_user is READY to use!');
            return true;
            
        } catch (testError) {
            console.log('Failed to connect as backend_app_user');
            console.log('   Error:', testError.message);
            
            if (testError.code === 'ER_ACCESS_DENIED_ERROR') {
                console.log('\n Password might be incorrect or user not properly created');
            }
            return false;
        }
        
    } catch (error) {
        console.error('Error during verification:', error.message);
        return false;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run verification
verifyBackendUser().then(success => {
    if (success) {
        console.log('\n You can safely update your .env file to use backend_app_user');
        console.log('\nChange these lines in back-end/.env:');
        console.log('   DB_USER=backend_app_user');
        console.log('   DB_PASSWORD=BackendApp2025!Secure');
    } else {
        console.log('\n Keep using avnadmin in .env until backend_app_user is fixed');
    }
    process.exit(success ? 0 : 1);
});
