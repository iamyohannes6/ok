// Utility script to check connectivity and configuration
window.addEventListener('DOMContentLoaded', async function() {
    console.log("Configuration check starting...");
    
    // Check environment configuration
    console.log("Environment Configuration:");
    console.log("- BACKEND_URL:", window.ENV.BACKEND_URL);
    console.log("- SOLANA_RPC_URL:", window.ENV.SOLANA_RPC_URL);
    console.log("- CONNECTION_KEY:", window.ENV.CONNECTION_KEY);
    console.log("- GROUP_CHAT_ID:", window.ENV.GROUP_CHAT_ID);
    
    // Check Solana libraries
    console.log("\nSolana Libraries:");
    if (typeof solanaWeb3 !== 'undefined') {
        console.log("- @solana/web3.js: LOADED");
    } else {
        console.error("- @solana/web3.js: FAILED TO LOAD");
    }
    
    if (typeof splToken !== 'undefined') {
        console.log("- @solana/spl-token: LOADED");
    } else {
        console.error("- @solana/spl-token: FAILED TO LOAD");
    }
    
    if (typeof axios !== 'undefined') {
        console.log("- axios: LOADED");
    } else {
        console.error("- axios: FAILED TO LOAD");
    }
    
    // Test backend connectivity
    console.log("\nBackend Connectivity:");
    try {
        const response = await fetch(`${window.ENV.BACKEND_URL}/connect`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                CONNECTIONKEY: window.ENV.CONNECTION_KEY
            })
        });
        
        if (response.ok) {
            const data = await response.text();
            console.log(`- Backend connection: SUCCESS (Response: ${data})`);
        } else {
            console.error(`- Backend connection: FAILED (Status: ${response.status})`);
        }
    } catch (error) {
        console.error(`- Backend connection: ERROR (${error.message})`);
    }
    
    // Test RPC connectivity
    console.log("\nSolana RPC Connectivity:");
    try {
        const connection = new solanaWeb3.Connection(window.ENV.SOLANA_RPC_URL);
        const blockHeight = await connection.getBlockHeight();
        console.log(`- RPC connection: SUCCESS (Block Height: ${blockHeight})`);
    } catch (error) {
        console.error(`- RPC connection: ERROR (${error.message})`);
    }
    
    console.log("\nConfiguration check complete. Check console for any errors.");
}); 