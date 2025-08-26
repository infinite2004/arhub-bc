#!/bin/bash

echo "🚀 ARHub Setup Script"
echo "====================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/arhub?schema=public"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# S3/R2 Storage (configure these for your storage provider)
S3_ENDPOINT="https://your-account.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_PUBLIC="arhub-public"
S3_BUCKET_PRIVATE="arhub-private"
S3_PUBLIC_BASE_URL="https://your-cdn-domain.com"

# UploadThing (get these from uploadthing.com)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
EOF
    echo "✅ .env.local created. Please update it with your actual values."
else
    echo "✅ .env.local already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
pnpm prisma generate

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your actual database and storage credentials"
echo "2. Run: pnpm prisma migrate dev --name init"
echo "3. Run: pnpm dev"
echo ""
echo "For detailed setup instructions, see README.md"
