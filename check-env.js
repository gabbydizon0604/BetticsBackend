#!/usr/bin/env node
/**
 * Environment Variables Checker
 * Run this script to verify your environment variables are set correctly
 * 
 * Usage:
 *   node check-env.js
 */

require('dotenv').config();

const required = {
    'USR_NAME': 'MongoDB username',
    'PSS_WORD': 'MongoDB password',
    'CLU': 'MongoDB cluster name'
};

const optional = {
    'PORT': 'Server port',
    'KEY_JWT': 'JWT secret key',
    'PAYPAL_CLIENT_ID': 'PayPal Client ID',
    'PAYPAL_CLIENT_SECRET': 'PayPal Client Secret',
    'PAYPAL_URL': 'PayPal API URL',
    'SENDGRID_API_KEY': 'SendGrid API Key'
};

console.log('\n🔍 Checking Environment Variables...\n');
console.log('='.repeat(60));

let hasErrors = false;

// Check required variables
console.log('\n📋 REQUIRED VARIABLES:\n');
for (const [key, description] of Object.entries(required)) {
    const value = process.env[key];
    const isSet = value && value.trim() !== '';
    
    if (isSet) {
        // Mask sensitive values
        let displayValue = value;
        if (key === 'PSS_WORD' || key === 'KEY_JWT' || key.includes('SECRET') || key.includes('KEY')) {
            displayValue = '***' + value.slice(-3);
        }
        console.log(`✅ ${key.padEnd(20)} ${description.padEnd(30)} Value: ${displayValue}`);
        
        // Check for common issues
        if (key === 'CLU' && value.includes('.mongodb.net')) {
            console.log(`   ⚠️  WARNING: CLU should not include '.mongodb.net'. Use only the cluster name.`);
            hasErrors = true;
        }
        if (value.trim() !== value) {
            console.log(`   ⚠️  WARNING: Value has leading/trailing spaces. Consider trimming.`);
        }
    } else {
        console.log(`❌ ${key.padEnd(20)} ${description.padEnd(30)} MISSING`);
        hasErrors = true;
    }
}

// Check optional variables
console.log('\n📋 OPTIONAL VARIABLES:\n');
for (const [key, description] of Object.entries(optional)) {
    const value = process.env[key];
    const isSet = value && value.trim() !== '';
    
    if (isSet) {
        let displayValue = value;
        if (key.includes('SECRET') || key.includes('KEY')) {
            displayValue = '***' + value.slice(-3);
        }
        console.log(`✅ ${key.padEnd(20)} ${description.padEnd(30)} Value: ${displayValue}`);
    } else {
        console.log(`⚪ ${key.padEnd(20)} ${description.padEnd(30)} Not set (optional)`);
    }
}

console.log('\n' + '='.repeat(60));

if (hasErrors) {
    console.log('\n❌ ERRORS FOUND: Some required variables are missing or incorrect.');
    console.log('\nPlease set the required variables:');
    console.log('  - In local development: Add them to your .env file');
    console.log('  - In production (Render): Add them in the Environment tab\n');
    process.exit(1);
} else {
    console.log('\n✅ All required environment variables are set correctly!\n');
    
    // Test connection string format
    if (process.env.USR_NAME && process.env.PSS_WORD && process.env.CLU) {
        const connectionString = `mongodb+srv://${process.env.USR_NAME}:***@${process.env.CLU}.mongodb.net/DB_Analytic_Bet`;
        console.log('📡 Connection string format:');
        console.log(`   ${connectionString}\n`);
    }
    
    process.exit(0);
}

