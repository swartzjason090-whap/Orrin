# Orrin — personal AI agent (text, voice, 3D avatar)

A Progressive Web App that runs in Chrome on Android. No build tools, no server, no paid services.

## Files (upload these 8 to publish)
| File | Purpose |
|---|---|
| index.html | The whole app (interface + logic, built from `src/`) |
| web-llm.js | Offline AI engine (6.8 MB), so offline replies don't depend on any website |
| sw.js | Service worker: makes the app open offline |
| manifest.webmanifest | Lets Android install it like an app |
| icon.svg, icon-192.png, icon-512.png | App icons |

## Publish free on GitHub Pages (from your phone)
1. In Chrome, sign up at github.com (free).
2. Tap **+ → New repository**, name it `orrin`, set **Public**, tick **Add a README**, create.
3. Tap **Add file → Upload files**, choose the 8 files from the unzipped folder, tap **Commit changes**.
4. Open **Settings → Pages**. Under *Branch*, pick `main` and `/ (root)`, tap **Save**.
5. After 1–2 minutes your app is at `https://YOUR-USERNAME.github.io/orrin/`.
6. Open it in Chrome, tap **⋮ → Add to Home screen / Install app**.

To update later, upload the changed files again (same names).

## Turning on the AI brain
The app picks the best available option automatically (Settings → AI brain):
1. **Claude (inside the Claude app)** — works only when the app is opened as a preview inside Claude. Uses your own Claude plan, no key. It does *not* work on your published website, because Claude Pro doesn't include API access.
2. **Free online AI with your key** — Groq, Google Gemini or OpenRouter free tiers. Get a key from the link in Settings and paste it there. The key stays on your phone and goes only to that provider. Free tiers have rate limits and can change their terms.
3. **On-device model** — free, private and offline after a one-time ~400 MB download. Needs WebGPU (recent Chrome, newer phones). Slower and simpler than online AI.
4. **Built-in helper** — always available, no AI: tasks, notes, memories, reminders, time/date.

Why a key lives in the browser: a "secret" key can only be hidden on a server, which costs setup or money. This app has no server; you enter your own key on your own phone, it's never in the code, never in chat history, and never in backups. If you ever share the app, other people enter their own keys. Optional upgrade: a free Cloudflare Worker proxy can hold the key server-side.

## How it's built
- `src/1-core.js` — storage (IndexedDB, or Claude's storage in preview), data model, local tools, slash commands
- `src/2-brain.js` — replaceable AI providers behind one interface (`chat({system, messages, signal, onToken})`)
- `src/3-voice.js` — speech recognition, text-to-speech, hands-free loop, lip-sync level
- `src/4-avatar.js` — procedural Three.js character (blinking, gaze, head motion, expressions, mouth)
- `src/5-ui.js` — screens, chat flow, history, memory, settings, reminders
- `src/6-me.js` — your photo as the avatar, 3D look options, optional cloned voice (ElevenLabs)
- `src/7-offline.js` — offline readiness checks, one-tap preparation, automatic offline AI, crash guard
- `src/9-boot.js` — starts the app
- `./build.sh` inlines `src/*.js` into `index.html` → `dist/`

To add a provider: create an object with `id`, `label`, `available()` and `chat()` in `2-brain.js` and add it to `PROVIDERS`.
To add a tool: add a function to `Tools`, a case in `runAction`, and one line describing it in `systemPrompt()`.

## Using it offline
The preview inside the Claude app always needs internet. For offline use, publish the app (above), open it once in Chrome, install it to your home screen, then open **Settings → Offline readiness** while on Wi-Fi and tap **Get ready for offline**.
- **Always offline:** opening the app, chats, history, memories, tasks, notes, reminders, your photo face or 3D character, settings.
- **Offline after one download (~400 MB):** AI replies from the on-device model. It starts by itself when you lose connection. Needs WebGPU (recent Chrome on newer phones).
- **Offline if your phone supports it:** voice input via the *Offline voice input (experimental)* switch. If it ever freezes the app, the app switches it off on the next launch.
- **Offline with Android voice data:** spoken replies (Android Settings → Text-to-speech → Google → install voice data). The cloned voice always needs internet.
- **Needs internet:** online AI (Claude, Groq, Gemini), cloned voice, and normal voice input.

## Make it look and sound like you
- **Look (free, offline):** Settings → How your assistant looks. Either *My photo* (take a selfie, tap your eyes and mouth; it blinks, talks and moves) or *3D character* with your skin, hair, eye colours, glasses, beard, long hair.
- **Sound (paid, optional):** Settings → How your assistant sounds → *My cloned voice*. Needs an ElevenLabs plan with Instant Voice Cloning (about $5–6/month). Paste your API key and voice ID. When used, the mouth follows the real audio. Falls back to the phone voice if offline or if the service fails.

## Privacy
Data is stored only on this phone (no sync between devices). When an online AI answers, your message, recent conversation and memories go to that provider. Voice input on most Android phones is processed by Google's speech service. Settings → Your data has export, import and delete-everything.

## Known limitations
- Voice input needs internet unless the experimental offline switch works on your phone; typing always works.
- Offline AI is far less capable than online AI and takes time to start.
- Reminders alert only while the app is open; use "Add to calendar" for reliable alarms.
- Lip-sync is approximate: browser voices don't expose audio to analyse, so the mouth follows a speech rhythm plus word timing.
- The avatar is a stylised 3D character or your animated photo, not photorealistic video. The photo face can't turn its head or move its eyes.
- Phone voices can't copy your voice; that needs the optional cloned-voice service.
- Future live camera/video: the avatar view is a separate pane, so a camera pane can be added alongside it without changing the brain or chat.
