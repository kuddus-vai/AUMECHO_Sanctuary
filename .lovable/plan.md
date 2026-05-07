# Audio-only hover preview

Right now hovering a featured playlist card opens a modal with the full YouTube video iframe playing. You want to hear the track without seeing the video.

## What changes

Keep the existing hover/leave timing and modal shell, but replace the video surface with an **audio-only "now playing" panel**:

- The YouTube iframe still loads (that is the only way to play AUMECHO tracks without a separate audio file), but it is rendered **hidden off-screen** (1px, `opacity-0`, `pointer-events-none`, `aria-hidden`) so only its audio is audible.
- The visible modal area becomes a styled "now playing" card showing:
  - Large playlist cover art (`thumbnail_url`) with a soft blurred halo behind it
  - Playlist title, track count, and a small "Audio preview" label
  - An animated equalizer / pulsing dot to signal sound is playing
  - Existing "Open playlist", YouTube, and Close controls stay
- Hover-out behavior unchanged: leaving the card or the modal stops audio (iframe unmounts via `previewing = null`).

## Technical notes

- File touched: `src/pages/Founder.tsx` only.
- Replace the visible `<iframe>` block (around line 380) with the artwork panel; render a second hidden `<iframe>` (same `src`) absolutely positioned with `w-px h-px opacity-0 pointer-events-none` so YouTube still autoplays audio.
- No backend, schema, or routing changes.
- No new dependencies; equalizer is pure Tailwind/CSS animation.

## Caveats

- YouTube embeds always load video bytes under the hood — we are only hiding the picture, not saving bandwidth.
- Some browsers (especially mobile Safari) block autoplay with sound; behavior there is unchanged from today.
