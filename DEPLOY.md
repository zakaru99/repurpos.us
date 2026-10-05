# Deployment

## Production (reframedb.org)

### 1. Build
```powershell
ng build --configuration=production --base-href https://reframedb.org/
```

### 2. Package
```powershell
cd dist
tar cfv dist.tar --exclude=assets/video *
cd ..
```

### 3. Transfer
Upload `dist/dist.tar` to `/home/centos/reframedb/dist.tar` via WinSCP.

### 4. Deploy
SSH into the server and run:
```bash
bash ~/unpack.sh
```

### Verify
Visit https://reframedb.org and check the browser console for errors.

---

**Updating a video file:** Upload directly to `/home/centos/static-assets/video/` — no full deploy needed.

**New server setup:** See one-time video setup notes in chat history.

---

## Test (EC2)

### 1. Build
```powershell
ng build --configuration=production --base-href https://ec2-35-92-254-147.us-west-2.compute.amazonaws.com/
```

### 2. Package
```powershell
cd dist
tar cfv dist.tar --exclude=assets/video *
cd ..
```

### 3. Transfer
Upload `dist/dist.tar` to `/home/centos/reframedb/dist.tar` via WinSCP.

### 4. Deploy
SSH into the server and run:
```bash
bash ~/unpack.sh
```
