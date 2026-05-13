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

### 3.2 Option B: AWS DocumentDB (MongoDB-compatible)
1. Go to **AWS DocumentDB Console**
2. Create a cluster
3. Get connection string
4. Add to environment variables

### 3.3 Run Prisma Migrations
After deployment:
1. Connect to your deployed app via AWS Amplify terminal
2. Or run locally with production database connection
3. Execute: `pnpm prisma db push`

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

## Step 6: Troubleshooting

### Build Fails with Prisma Error
- **Issue**: Prisma binary not found
- **Solution**: Ensure `prisma generate` runs during build
- **Update**: Modify `amplify.yml` to include Prisma setup

### Database Connection Timeout
- **Issue**: Can't connect to MongoDB
- **Solution**: 
  - Check `DATABASE_URL` format
  - Whitelist AWS Amplify IP range in MongoDB Atlas (0.0.0.0/0 for testing)
  - Verify network connectivity

### NextAuth Session Issues
- **Issue**: Sessions not persisting
- **Solution**:
  - Ensure `NEXTAUTH_SECRET` is set and consistent
  - Check `NEXTAUTH_URL` matches deployment domain
  - Clear browser cookies and try again

### 404 Errors on Routes
- **Issue**: Dynamic routes return 404
- **Solution**: Next.js pages should work out of the box; verify `next.config.ts` doesn't have conflicting settings

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
