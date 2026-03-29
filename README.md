# freekawa-web

Reference web app for `@freekawa/ikawa-home-protocol` and `@freekawa/ikawa-home-web-bluetooth`.

This project is currently validated against **IKAWA Home** roasters. It is not claiming IKAWA Pro compatibility.

## What It Does

- Edit IKAWA Home roast profiles
- Export legacy IKAWA Home share links
- Connect directly to an IKAWA Home roaster over Web Bluetooth
- Send profiles to the roaster
- Read the currently loaded roaster profile
- Poll live roast telemetry and compare it against the machine-loaded recipe

## Browser Support

Direct Bluetooth control requires:

- `https` or `localhost`
- a Chromium-based desktop browser with Web Bluetooth support
  - Chrome
  - Edge

iPhone/iPad Safari is not currently a supported direct-Bluetooth target.

## Safety

This app can write profiles directly to a connected roaster. Mid-roast profile updates can take effect immediately at the current roast time. Treat it as experimental control software and validate changes carefully on real hardware.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Packages

This demo app consumes:

- `@freekawa/ikawa-home-protocol`
- `@freekawa/ikawa-home-web-bluetooth`

## License

MIT
