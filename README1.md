# Frample Frontend

Angular client for **Frample**, a free marketplace to upload, stream and download music samples.

Backend repo: <link to frample-backend>

## Features

- Login and signup with validation, and **Sign in with Google**
- Silent session restore on page reload (refresh cookie, so the user stays logged in)
- Browse samples as waveform rows with smooth playback progress and click-to-seek
- Search and filter by title/uploader, genre, type, key, scale and BPM range, with debounced requests and "Load more" paging
- Upload flow with in-browser audio analysis (duration and waveform) and direct upload to cloud storage
- My uploads page to edit or delete your own samples
- Dark UI built with Tailwind CSS

## Tech stack

Angular (standalone components, signals), Reactive Forms, RxJS, Tailwind CSS v4, Google Identity Services, Web Audio API

## Notable implementation details

- Access token kept **in memory only**. The refresh token lives in an httpOnly cookie that the backend sets, so nothing sensitive sits in `localStorage`.
- Functional HTTP interceptor attaches the access token and retries once after a silent refresh on `401`.
- Route guards (`authGuard`, `guestGuard`) and an app initializer that restores the session before the first route renders.
- Waveform progress is driven by `requestAnimationFrame` plus a clipped overlay for a smooth fill.

## Running locally

1. Start the backend (see its README) on `http://localhost:8080`.
2. Set your values in `src/environments/environment.development.ts`:
   ```ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080/api/v1',
     googleClientId: '<your Google OAuth client ID>'
   };
   ```
3. In Google Cloud Console, add `http://localhost:4200` as an authorized JavaScript origin for that client ID.
4. Install and run:
   ```bash
   npm install
      ng serve
   ```
5. Open `http://localhost:4200`.

  <img width="1917" height="870" alt="image" src="https://github.com/user-attachments/assets/5ea6e70f-38bc-4f05-b5d0-0a68bb0069c5" />
  <img width="1917" height="866" alt="image" src="https://github.com/user-attachments/assets/88db4d0f-0707-46bc-bfb4-062d37e245d5" />
  <img width="1897" height="862" alt="image" src="https://github.com/user-attachments/assets/b999ca72-03a1-4601-a794-0e70a25303c9" />
  <img width="1450" height="865" alt="image" src="https://github.com/user-attachments/assets/7dcacaaa-00a7-4a1d-b826-4e9611efbd50" />



 
