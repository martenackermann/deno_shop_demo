@echo off

:: Start Deno server in a new terminal
start cmd /k "cd backend && deno run --allow-net --allow-read --allow-write --allow-env --unstable-temporal server.ts"

:: Start frontend server in a new terminal
start cmd /k "cd frontend && npm run serve"

echo Both servers are running in separate terminals!
