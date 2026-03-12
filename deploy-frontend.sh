#!/bin/bash
# Deploy frontend to Vercel (buildinginitial project)
# Usage: ./deploy-frontend.sh

echo "Deploying frontend to Vercel (buildinginitial)..."
cd "$(dirname "$0")"
npx vercel --prod --yes
echo ""
echo "Done! Visit https://buildinginitial.vercel.app to verify."
