# gambino

## What is this

This is a script that will look at

## Prerequisites

- Docker desktop must be installed

## How to run script:

1. Create a .env file in the root directory and add the following variables. (Note: this is an example for https://www.recreation.gov/permits/445857/registration/detailed-availability?date=2026-05-22&type=overnight-permit)

```
INYO_WILDERNESS_PERMIT_ID=445857 // This is typically found in the URL where you want to get your permit (see above URL)
INYO_WILDERNESS_TRAIL_ID=44585703 // This trailhead ID is Bubb's creek. This is under a field called "division_ids" in the permit content API call, search in the devtools network tab for this: https://www.recreation.gov/api/permitcontent/445857
INYO_START_DATE=2026-09-01
INYO_END_DATE=2026-09-30

SMTP_USER= email username // gmail is smtp.gmail.com
SMTP_PASS= application password // for gmail I used https://support.google.com/mail/answer/185833?hl=en
EMAIL_FROM= email you want to send from
EMAIL_TO= email you want to send to
```

Note: only Inyo NF wilderness permits are supported at the moment.

2. Run `npm run docker:up` and you're good to go.
