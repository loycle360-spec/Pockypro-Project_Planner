# Pocket Project

Offline-first project planning for Android by ORIGENTEK (PTY) Ltd. **Plan. Organise. Deliver.**

## Foundation included

- Expo Router, TypeScript strict mode, Zustand and NativeWind configuration
- SQLite migration and parameterised project repository
- Onboarding, adaptive light/dark interface, dashboard, project list/creation/detail and About screen
- Android package `com.origentek.pocketproject`, version `1.0.0` / version code `1`, and API 36 build settings

## Run

```sh
npm install
npx expo install --fix
npm run start
npm run typecheck
npm run lint
npm test
npx expo-doctor
```

Use Expo Go first for development. Create Android artifacts with EAS after linking this local app to an EAS project:

```sh
eas build --platform android --profile production # AAB for Google Play
eas build --platform android --profile apk        # APK for direct distribution
```

Do not distribute APKs through untrusted channels. Record the generated SHA-256 checksum and release notes with every direct distribution.

## Privacy

There is no account, backend, analytics, advertising or network sync. Data is stored in the device-local SQLite database unless a future user-initiated export is used.

## Disclaimer

Pocket Project is independently developed by ORIGENTEK (PTY) Ltd and is not affiliated with, endorsed by, sponsored by, or certified by PMI or PeopleCert.
