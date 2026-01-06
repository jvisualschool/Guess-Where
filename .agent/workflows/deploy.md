---
description: How to deploy the Guess Where game to the AWS server
---

This workflow describes the process of building and deploying the application to the production server.

### Prerequisites
- SSH key located at `~/.ssh/jvibeschool_org.pem`
- Permission to access the server `15.164.161.165`

### Deployment Steps

// turbo
1. **Prepare the build**
   Ensure `vite.config.ts` has the correct `base` path:
   ```typescript
   base: '/WHERE/'
   ```

// turbo
2. **Build the application**
   Run the build command to generate the `dist` folder:
   ```bash
   npm run build
   ```

// turbo
3. **Execute the deployment script**
   Run the `deploy.sh` script to upload files to the server:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Troubleshooting
- If the images don't load, verify that the `base` path in `vite.config.ts` matches the remote directory name.
- If permission errors occur on the server, ensure the remote directory has the correct ownership (`bitnami:bitnami`).
