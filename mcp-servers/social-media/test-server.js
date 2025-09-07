#!/usr/bin/env node

// Simple test to verify the MCP server starts correctly
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing MCP Social Media Server...');

const server = spawn('node', [join(__dirname, 'dist', 'index.js')], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    // Add test environment variables if needed
  }
});

let output = '';

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('Server output:', data.toString());
});

server.stderr.on('data', (data) => {
  console.log('Server log:', data.toString());
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Send a test request after a short delay
setTimeout(() => {
  console.log('\nSending test request...');
  
  const testRequest = {
    jsonrpc: '2.0',
    method: 'tools/list',
    params: {},
    id: 1
  };
  
  server.stdin.write(JSON.stringify(testRequest) + '\n');
  
  // Give time for response
  setTimeout(() => {
    console.log('\nTest complete. Shutting down server...');
    server.kill();
    process.exit(0);
  }, 2000);
}, 1000);