# NEXUS AI Mobile v0.1

Mobile-first Progressive Web App (PWA) starter for Android.

## Included
- Responsive Android-friendly chat interface
- Installable PWA manifest and service worker
- Local conversation memory using browser storage
- Export and erase local conversation
- Adaptive-personality setting
- Optional backend URL setting
- Offline demo responses with honest labeling

## Important limitation
This version is a mobile app shell, not yet a full AI model. Without a connected backend, replies are local demo messages. Do not put provider API keys in this frontend. A secure backend must hold secrets and call the AI provider.

## Run / install
A PWA must be served over HTTPS (or localhost) for installation and service workers.

1. Publish the contents of this folder to a static HTTPS host.
2. Open the HTTPS address in Chrome on Android.
3. Open Chrome menu (⋮) and choose **Install app** or **Add to Home screen**.
4. Launch NEXUS from the home screen.

You can use any static hosting provider that serves these files. This package itself is not an APK and does not include a hosted URL.

## Backend contract
The optional backend URL should expose:
`POST /chat`
JSON body: `{"message":"...","conversation_id":"mobile-default"}`
Expected JSON response: `{"reply":"..."}`

The old desktop-oriented prototype is not required for this mobile PWA.
