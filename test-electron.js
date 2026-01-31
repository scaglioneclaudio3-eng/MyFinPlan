// Test file to diagnose electron loading
console.log('Starting diagnostics...');
console.log('process.versions:', JSON.stringify(process.versions, null, 2));
console.log('process.type:', process.type);

// Check if electron process
if (process.versions['electron']) {
    console.log('Running in Electron context');
    console.log('Electron version:', process.versions.electron);
}

// Try requiring electron and inspecting it
const electron = require('electron');
console.log('typeof electron:', typeof electron);

if (typeof electron === 'string') {
    console.log('ERROR: electron is a string (path), not the API');
    console.log('Path:', electron);

    // Let's check Module._builtinModules
    const Module = require('module');
    console.log('Builtin modules:', Module.builtinModules?.filter(m => m.includes('electron')));
} else if (typeof electron === 'object') {
    console.log('Electron API loaded successfully!');
    console.log('Available keys:', Object.keys(electron));
}
