# AWS Amplify Deployment Guide for Super-Code

This guide covers deploying your Next.js application with Prisma and NextAuth to AWS Amplify.

## Prerequisites

1. **AWS Account** - Create one at [AWS Console](https://aws.amazon.com)
2. **Git Repository** - Push your code to GitHub, GitLab, Bitbucket, or CodeCommit
3. **AWS CLI** - Install [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
4. **Node.js** - Version 18+ (verify with `node --version`)

## Step 1: Prepare Your Repository

### 1.1 Create `.amplifyignore` File
Create this file in your project root to exclude unnecessary files from deployment:

```
node_modules
.next
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.git
.gitignore
```

### 1.2 Update Build Configuration
The custom build script in package.json may need adjustment. Create `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: '.next'
    files:
      - '**/*'
  cache:
    paths:
      - 'node_modules/**/*'
      - '.next/cache/**/*'
```

## Step 2: Configure Environment Variables

### 2.1 AWS Amplify Console Setup
Go to **AWS Amplify Console** → **App Settings** → **Environment Variables**

Add all required environment variables:

```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
NEXTAUTH_URL=https://your-domain.amplifyapp.com  # or your custom domain
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL_INTERNAL=https://your-domain.amplifyapp.com

# Any other provider secrets (OAuth, etc.)
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
```

### 2.2 Generate NEXTAUTH_SECRET
Run locally and copy the secret:
```bash
openssl rand -hex 32
```

## Step 3: Database Setup

### 3.1 Option A: MongoDB Atlas (Recommended)
1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
2. Create a cluster and database
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
4. Add this to environment variables as `DATABASE_URL`
5. **Important:** Whitelist your MongoDB IP in Atlas:
   - Go to **Security** → **Network Access**
   - Add IP `0.0.0.0/0` to allow access from anywhere (for testing/production, consider restricting)

### 3.2 Option B: AWS DocumentDB (MongoDB-compatible)
1. Go to **AWS DocumentDB Console**
2. Create a cluster
3. Get connection string
4. Add to environment variables

### 3.3 Run Prisma Migrations
After Amplify deployment succeeds:

**Option 1: Using Amplify Console Terminal**
1. Go to **Amplify Console** → **App Details** → **Backend Environments** 
2. Open terminal
3. Run: `pnpm exec prisma db push --skip-generate`

**Option 2: Using Local Machine** 
```bash
# After deployment, run locally with production DATABASE_URL
export DATABASE_URL="your-production-database-url"
pnpm exec prisma db push
```

**Option 3: Automated (Recommended)**
After first deployment, run: `bash post-deploy.sh`

## Step 4: Deploy to AWS Amplify

### 4.1 Connect Repository
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"Create app"** → **"Host web app"**
3. Choose your Git provider (GitHub, GitLab, etc.)
4. Authorize and select your repository
5. Select branch (usually `main`)

### 4.2 Build Settings
Click **"Edit backend"** and configure:

**Build command:**
```
pnpm install && pnpm run build
```

**Start command:**
```
pnpm start
```

**Backend:**
- Keep default Node.js runtime
- Amplify may auto-detect Next.js

### 4.3 Environment Variables
Add all variables from Step 2 in the **Environment variables** section

### 4.4 Deploy
Click **"Save and deploy"** and wait for build to complete (5-15 minutes)

## Step 5: Custom Domain Setup

1. Go to **Domain management** in Amplify console
2. Add your custom domain (requires Route 53 or external DNS)
3. Update `NEXTAUTH_URL` environment variable with new domain
4. Redeploy application

## Troubleshooting AWS Amplify Build Failures

### Build Fails with Prisma Error
- **Issue**: "Prisma db push failed" or migration timeout
- **Solution**: Database migration is now separate from build. See Step 3.3 to run migrations after deployment.

### Build Fails with "command not found: pnpm"
- **Issue**: pnpm not installed in Amplify build environment
- **Solution**: Already handled in `amplify.yml` - installs pnpm globally in preBuild phase

### Build Fails with MongoDB Connection Error
- **Issue**: Can't connect to MongoDB during build
- **Solution**: Build no longer attempts DB connection. If needed after deployment:
  - Check `DATABASE_URL` format is correct
  - Whitelist MongoDB Atlas IP to `0.0.0.0/0` (or restrict later)
  - Verify network connectivity from Amplify to MongoDB

### 404 Errors on Routes After Deployment
- **Issue**: Dynamic routes return 404
- **Solution**: Next.js pages should work out of the box. Check:
  - App deployed successfully in Amplify Console
  - Custom domain configured if using one
  - `NEXTAUTH_URL` environment variable matches deployment URL

## Step 7: Post-Deployment

### 7.1 Monitor Logs
1. Go to **Amplify Console** → **App Settings** → **Logs**
2. Check **CloudWatch logs** for errors

### 7.2 Setup CI/CD
Amplify automatically deploys on:
- Push to connected branch
- Pull request (preview builds)

### 7.3 Performance Optimization
- Enable **Amplify Edge Cache** (Amplify Console Settings)
- Use **CloudFront** CDN (automatic)
- Enable **Image Optimization** in Next.js

## Additional Resources

- [Next.js on AWS Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html)
- [AWS Amplify Hosting Documentation](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [NextAuth.js Documentation](https://authjs.dev/getting-started/installation)
- [Prisma Deployment Guide](https://www.prisma.io/docs/orm/more/deployment)

## Quick Checklist

- [ ] Git repository created and pushed
- [ ] `.amplifyignore` file added
- [ ] Environment variables configured
- [ ] Database setup (MongoDB Atlas or DocumentDB)
- [ ] `NEXTAUTH_SECRET` generated
- [ ] Repository connected to Amplify
- [ ] Build settings configured
- [ ] First deployment successful
- [ ] Custom domain added (optional)
- [ ] Prisma migrations applied
- [ ] Application tested in production
