# Team content

- Runtime store: `.data/team/members.json`
- Committed mirror: `content/team/members.json`
- Demo seed source: `content/team/demo-members.js`

Seed / refresh temporary demo members (idempotent):

```bash
npm run seed:team
```

Demo portraits live in `public/images/team/demo-*.svg` and can be replaced from `/admin/team`.
