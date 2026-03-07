# gambino

Checks Inyo Wilderness permit availability on recreation.gov and sends email alerts when permits open up. Runs on a schedule via GitHub Actions.

## How it works

On each run, the app checks permit availability for each configured trail/date range and sends an email to subscribers if any dates are available. It exits after one check — it's designed to be invoked repeatedly by a scheduler (GitHub Actions cron, etc.).

## Running locally

**Prerequisites:** Node.js 20+

```bash
# Install dependencies
npm ci

# Set environment variables (see below), then run directly with ts-node:
npm run start:dev

# Or build and run compiled JS:
npm run build
npm start
```

## Environment variables

All variables are required.

| Variable                    | Description                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------- |
| `SMTP_HOST`                 | SMTP server hostname (e.g. `smtp.gmail.com`)                                           |
| `SMTP_USER`                 | SMTP username / email address for authentication                                       |
| `SMTP_PASS`                 | SMTP password or app password                                                          |
| `EMAIL_FROM`                | From address used in outgoing emails (e.g. `alerts@example.com`)                       |
| `INYO_WILDERNESS_PERMIT_ID` | The permit ID from recreation.gov (found in the URL when viewing the inyo permit page) |
| `SUBSCRIBERS`               | JSON array of subscriber objects (see format below)                                    |

### `SUBSCRIBERS` format

A JSON array where each entry has an `email` and a list of `trails` to watch:

```json
[
  {
    "email": "you@example.com",
    "trails": [
      {
        "trailId": "12345",
        "startDate": "2026-07-01",
        "endDate": "2026-07-31"
      }
    ]
  }
]
```

- `trailId` — the division/trail ID from recreation.gov
- `startDate` / `endDate` — date range to check, in `YYYY-MM-DD` format

You can watch multiple trails per subscriber, and multiple subscribers can watch the same trail.

### Example `.env` setup

Create a `.env` file in the project root:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=you@gmail.com
INYO_WILDERNESS_PERMIT_ID=233262
SUBSCRIBERS='[{"email":"you@example.com","trails":[{"trailId":"12345","startDate":"2026-07-01","endDate":"2026-07-31"}]}]'
```

Note: trailId can be found by doing the following:

1. open your browser's devtools
2. visit an inyo NF recreation gov wilderness permit page
3. go to the netowrk tab and find the `permitcontent` API
4. Search the API by the name of your desired trailhead in the payload.campsites section (cmd+f is easiest)
5. Once you've located the campsites entry, the id can be found under `division_ids`

- The trailId should look very similar to the INYO_WILDERNESS_PERMIT_ID, just with an appended number at the end

## GitHub Actions

The workflow at `.github/workflows/permit-check.yml` runs the check every 10 minutes automatically.

Store all environment variables as [repository secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) and they'll be injected at runtime. You can also trigger a run manually via **Actions → Permit Check → Run workflow**.
