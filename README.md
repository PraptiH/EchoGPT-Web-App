# EchoGPT

A browser preview of the EchoGPT workspace. It covers chat, model comparison, image and video studios, tasks, connectors, and account pages. Replies and generated media are produced in the browser. Nothing is sent to a model provider.

## Live Site : https://funny-quokka-90e0db.netlify.app/

## Project overview

The home screen is a light workspace: a top bar, a sidebar, and a composer. From there you can start a chat, compare models, open the image studio, or run a workflow. On a small screen the logo stays on the left and the menu button moves to the right. The New workspace button is hidden until the sidebar is available.

Sign-in is Google or GitHub only. There is no sign-up page and no email or password form. A signed-in session opens `/account`.

The app keeps chats, connectors, studio drafts, the selected plan, and the theme in `localStorage` on this device. Free accounts get 20 messages per 5-hour window. Preview Plus raises that limit and unlocks the advanced models in this preview. Signing out returns the quota to the free limit.

Main routes:

| Route | What it is |
| --- | --- |
| `/` | Chat |
| `/compare` | Same prompt across models |
| `/image`, `/video` | Image and video studios |
| `/jobs`, `/sop` | Job insight and statement of purpose |
| `/tasks` | Workflow starting points |
| `/store`, `/connectors` | App store and saved connectors |
| `/history` | Saved chats |
| `/pricing` | Free and Plus preview |
| `/login` | Sign in with Google or GitHub |
| `/account` | Signed-in session and sign-out |
| `/support`, `/privacy`, `/terms` | Help and notes |

## Setup instructions

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If that port is already in use, Next.js prints the port it chose instead.

Other scripts:

```bash
npm run build
npm start
npm run lint
```

No environment variables are required. There is no database and no API key.

## Technologies used

- [Next.js 16](https://nextjs.org) App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Geist, loaded with `next/font`

The UI has no extra runtime dependencies beyond Next.js and React.

## Assumptions

- This is an interface preview of [echogpt.live](https://echogpt.live), not a connection to the live models.
- Chat, compare, image, and video results are written locally so the screens can be used without a provider account.
- Google and GitHub on the sign-in page create a local session. They do not contact those services. There is no email sign-in and no sign-up flow.
- Preview Plus only changes the plan stored in this browser. It does not take payment.
- Canceling Plus on the live site does not refund the current period. That note is shown on the pricing page.
- A guest can chat without signing in. The session, chats, and quota stay on this device until storage is cleared.
- Image and video studios can be walked through here. On the live site those tools are paid.

## Additional features implemented

These are in this preview and are not part of the original EchoGPT site:

- **Search anything** (`Ctrl+K`) jumps to a page, model, chat, or a new chat.
- **Light and dark theme**, saved on this device.
- **Guest chat** without signing in.
- **Preview Plus**, a local plan switch for the higher quota and locked models.
- **File attach** on the composer, plus `@` mentions for saved connectors. The composer has no microphone control.
- **Small-screen header.** The menu sits on the right. New workspace appears only on a wide screen, where the sidebar is visible.
- **Copy, regenerate, and share** on a thread. Share copies the transcript. It does not publish a link.
- **Collapsible sidebar.** When it is closed, the new-chat button and the sidebar button stack vertically.
- **Account page** for a signed-in session, with sign-out returning the quota to the free limit of 20.
- **Skip link**, keyboard send (`Enter`, `Shift+Enter` for a new line), and dialogs that close with Escape.
