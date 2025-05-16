# Frontend Deployment Guide

This folder contains the frontend code that can be deployed to Netlify.

## Deployment Steps

1. Push this repository to GitHub
2. Log in to Netlify (https://app.netlify.com/)
3. Click "New site from Git"
4. Choose your GitHub repository
5. Set the following build settings:
   - Build command: (leave blank)
   - Publish directory: `frontend`

## Environment Variables

Set the following environment variables in the Netlify UI (Site settings > Build & deploy > Environment):

- `BACKEND_URL`: URL of your backend API (e.g., https://your-backend-api.com)
- `SOLANA_RPC_URL`: Solana RPC URL (e.g., https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY)
- `CONNECTION_KEY`: The connection key that matches your backend
- `GROUP_CHAT_ID`: Your Telegram group chat ID

## Important Notes

1. The backend server must be deployed separately (e.g., on Heroku, DigitalOcean, etc.)
2. Make sure CORS is enabled on your backend to allow requests from your Netlify domain
3. Update the `main.js` file to use the correct Solana RPC endpoint

## Local Development

1. Create a `.env` file based on `.env.example`
2. Update the environment variables in the `.env` file
3. Serve the frontend folder using a local server, e.g.:
   ```
   npx serve frontend
   ``` 