---
description: Synchronize local changes to the remote branch (Stage, Commit, Push)
---

1. Stage all changes
// turbo
```bash
git add .
```

2. Commit with a descriptive message (GENERATE A MEANINGFUL MESSAGE based on the changes)
```bash
git diff --cached --name-only | xargs echo "feat: update" # Placeholder: Agent should replace 'feat: update' with actual summary
git commit -m "feat: <description>"
```

3. Push to remote
// turbo
```bash
git push origin HEAD
```
