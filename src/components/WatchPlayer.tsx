import { useState, useCallback } from "react";
import "@videojs/react/video/skin.css";
import {
  createPlayer,
  Controls,
  PlayButton,
  SeekButton,
  Time,
  TimeSlider,
  Slider,
  MuteButton,
  FullscreenButton,
  PlaybackRateButton,
  BufferingIndicator,
  Popover,
  Poster,
  Tooltip,
  ErrorDialog,
  AlertDialog,
  VolumeSlider,
  usePlayer,
} from "@videojs/react";
import { Video, videoFeatures } from "@videojs/react/video";
import { selectSource, selectTextTrack } from "@videojs/core/dom";

import type { MovieDetail, MovieSubtitleTrack } from "../lib/lmscript";

const Player = createPlayer({ features: videoFeatures });

const SEEK_TIME = 10;

// ---------------------------------------------------------------------------
// Inline SVG icons (from @videojs/react default skin, not publicly exported)
// ---------------------------------------------------------------------------

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        d="m14.051 10.723-7.985 4.964a1.98 1.98 0 0 1-2.758-.638A2.06 2.06 0 0 1 3 13.964V4.036C3 2.91 3.895 2 5 2c.377 0 .747.109 1.066.313l7.985 4.964a2.057 2.057 0 0 1 .627 2.808c-.16.257-.373.475-.627.637"
      />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width={5} height={14} x={2} y={2} fill="currentColor" rx={1.75} />
      <rect width={5} height={14} x={11} y={2} fill="currentColor" rx={1.75} />
    </svg>
  );
}

function RestartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        d="M9 17a8 8 0 0 1-8-8h2a6 6 0 1 0 1.287-3.713l1.286 1.286A.25.25 0 0 1 5.396 7H1.25A.25.25 0 0 1 1 6.75V2.604a.25.25 0 0 1 .427-.177l1.438 1.438A8 8 0 1 1 9 17"
      />
      <path
        fill="currentColor"
        d="m11.61 9.639-3.331 2.07a.826.826 0 0 1-1.15-.266.86.86 0 0 1-.129-.452V6.849C7 6.38 7.374 6 7.834 6c.158 0 .312.045.445.13l3.331 2.071a.858.858 0 0 1 0 1.438"
      />
    </svg>
  );
}

function SeekIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        d="M1 9c0 2.21.895 4.21 2.343 5.657l1.414-1.414a6 6 0 1 1 8.956-7.956l-1.286 1.286a.25.25 0 0 0 .177.427h4.146a.25.25 0 0 0 .25-.25V2.604a.25.25 0 0 0-.427-.177l-1.438 1.438A8 8 0 0 0 1 9"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <rect width={2} height={5} x={8} y={0.5} opacity={0.5} rx={1}>
        <animate
          attributeName="opacity"
          begin="0s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width={2}
        height={5}
        x={12.243}
        y={2.257}
        opacity={0.45}
        rx={1}
        transform="rotate(45 13.243 4.757)"
      >
        <animate
          attributeName="opacity"
          begin="0.125s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect width={5} height={2} x={12.5} y={8} opacity={0.4} rx={1}>
        <animate
          attributeName="opacity"
          begin="0.25s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width={5}
        height={2}
        x={10.743}
        y={12.243}
        opacity={0.35}
        rx={1}
        transform="rotate(45 13.243 13.243)"
      >
        <animate
          attributeName="opacity"
          begin="0.375s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect width={2} height={5} x={8} y={12.5} opacity={0.3} rx={1}>
        <animate
          attributeName="opacity"
          begin="0.5s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width={2}
        height={5}
        x={3.757}
        y={10.743}
        opacity={0.25}
        rx={1}
        transform="rotate(45 4.757 13.243)"
      >
        <animate
          attributeName="opacity"
          begin="0.625s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect width={5} height={2} x={0.5} y={8} opacity={0.15} rx={1}>
        <animate
          attributeName="opacity"
          begin="0.75s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width={5}
        height={2}
        x={2.257}
        y={3.757}
        opacity={0.1}
        rx={1}
        transform="rotate(45 4.757 4.757)"
      >
        <animate
          attributeName="opacity"
          begin="0.875s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
    </svg>
  );
}

function VolumeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752M14.5 7.586l-1.768-1.768a1 1 0 1 0-1.414 1.414L13.085 9l-1.767 1.768a1 1 0 0 0 1.414 1.414l1.768-1.768 1.768 1.768a1 1 0 0 0 1.414-1.414L15.914 9l1.768-1.768a1 1 0 0 0-1.414-1.414z"
      />
    </svg>
  );
}

function VolumeLowIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"
      />
    </svg>
  );
}

function VolumeHighIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        d="M15.6 3.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4C15.4 5.9 16 7.4 16 9s-.6 3.1-1.8 4.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3C17.1 13.2 18 11.2 18 9s-.9-4.2-2.4-5.7"
      />
      <path
        fill="currentColor"
        d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"
      />
    </svg>
  );
}

function FullscreenEnterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        d="M9.57 3.617A1 1 0 0 0 8.646 3H4c-.552 0-1 .449-1 1v4.646a.996.996 0 0 0 1.001 1 1 1 0 0 0 .706-.293l4.647-4.647a1 1 0 0 0 .216-1.089m4.812 4.812a1 1 0 0 0-1.089.217l-4.647 4.647a.998.998 0 0 0 .708 1.706H14c.552 0 1-.449 1-1V9.353a1 1 0 0 0-.618-.924"
      />
    </svg>
  );
}

function FullscreenExitIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        d="M7.883 1.93a.99.99 0 0 0-1.09.217L2.146 6.793A.998.998 0 0 0 2.853 8.5H7.5c.551 0 1-.449 1-1V2.854a1 1 0 0 0-.617-.924m7.263 7.57H10.5c-.551 0-1 .449-1 1v4.646a.996.996 0 0 0 1.001 1.001 1 1 0 0 0 .706-.293l4.646-4.646a.998.998 0 0 0-.707-1.707z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEnglishSubtitles(subtitles: MovieSubtitleTrack[]): MovieSubtitleTrack[] {
  return subtitles.filter((track) => track.language.toLowerCase().includes("english"));
}

function getSubtitleLabel(subtitle: MovieSubtitleTrack, index: number): string {
  return subtitle.releaseTitle.trim() || subtitle.source.trim() || `English ${index + 1}`;
}

// ---------------------------------------------------------------------------
// Shared button wrapper (matches the default skin pattern)
// ---------------------------------------------------------------------------

function Button(props: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      className={`media-button media-button--subtle media-button--icon ${props.className ?? ""}`}
    />
  );
}

// ---------------------------------------------------------------------------
// Quality menu (Popover in control bar)
// ---------------------------------------------------------------------------

function QualityMenu({ movie }: { movie: MovieDetail }) {
  const source = usePlayer(selectSource);
  const media = Player.useMedia();
  const [activeLabel, setActiveLabel] = useState<string | null>(movie.streams[0]?.label ?? null);

  const handleSelect = useCallback(
    (label: string | null) => {
      if (!source) return;
      const resumeTime = media ? media.currentTime : 0;

      setActiveLabel(label);
      if (label === null) {
        source.loadSource(`/api/stream?movieId=${movie.id}`);
      } else {
        const variant = movie.streams.find((s) => s.label === label);
        if (variant) source.loadSource(variant.directUrl);
      }

      if (media && resumeTime > 0) {
        const seekOnReady = () => {
          media.currentTime = resumeTime;
          media.removeEventListener("loadedmetadata", seekOnReady);
        };
        media.addEventListener("loadedmetadata", seekOnReady);
      }
    },
    [source, movie, media],
  );

  if (movie.streams.length <= 1) return null;

  return (
    <Popover.Root side="top" align="center">
      <Tooltip.Root side="top">
        <Tooltip.Trigger
          render={
            <Popover.Trigger render={<Button aria-label="Quality" />}>
              <span className="media-quality-label">HD</span>
            </Popover.Trigger>
          }
        />
        <Tooltip.Popup className="media-surface media-tooltip">Quality</Tooltip.Popup>
      </Tooltip.Root>
      <Popover.Popup className="media-surface media-popover media-popover--menu">
        <ul className="media-menu" role="menu">
          <li role="menuitem">
            <button
              type="button"
              className="media-menu__item"
              data-active={activeLabel === null ? "" : undefined}
              onClick={() => handleSelect(null)}
            >
              Auto
            </button>
          </li>
          {movie.streams.map((stream) => (
            <li key={stream.label} role="menuitem">
              <button
                type="button"
                className="media-menu__item"
                data-active={activeLabel === stream.label ? "" : undefined}
                onClick={() => handleSelect(stream.label)}
              >
                {stream.label}
              </button>
            </li>
          ))}
        </ul>
      </Popover.Popup>
    </Popover.Root>
  );
}

// ---------------------------------------------------------------------------
// Subtitle menu (Popover in control bar)
// ---------------------------------------------------------------------------

function SubtitleMenu({ subtitles }: { subtitles: MovieSubtitleTrack[] }) {
  const textTracks = usePlayer(selectTextTrack);
  const media = Player.useMedia();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleSelect = useCallback(
    (index: number | null) => {
      setActiveIndex(index);
      if (!media) return;
      const tracks = media.textTracks;
      let subIdx = 0;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.kind === "subtitles" || track.kind === "captions") {
          track.mode = subIdx === index ? "showing" : "disabled";
          subIdx++;
        }
      }
    },
    [media],
  );

  if (subtitles.length === 0) return null;

  const isShowing = textTracks?.subtitlesShowing ?? false;

  return (
    <Popover.Root side="top" align="center">
      <Tooltip.Root side="top">
        <Tooltip.Trigger
          render={
            <Popover.Trigger
              render={<Button data-active={isShowing ? "" : undefined} aria-label="Subtitles" />}
            >
              <span className="media-quality-label">CC</span>
            </Popover.Trigger>
          }
        />
        <Tooltip.Popup className="media-surface media-tooltip">Subtitles</Tooltip.Popup>
      </Tooltip.Root>
      <Popover.Popup className="media-surface media-popover media-popover--menu">
        <ul className="media-menu" role="menu">
          <li role="menuitem">
            <button
              type="button"
              className="media-menu__item"
              data-active={activeIndex === null ? "" : undefined}
              onClick={() => handleSelect(null)}
            >
              Off
            </button>
          </li>
          {subtitles.map((sub, i) => (
            <li key={sub.id} role="menuitem">
              <button
                type="button"
                className="media-menu__item"
                data-active={activeIndex === i ? "" : undefined}
                onClick={() => handleSelect(i)}
              >
                {getSubtitleLabel(sub, i)}
              </button>
            </li>
          ))}
        </ul>
      </Popover.Popup>
    </Popover.Root>
  );
}

// ---------------------------------------------------------------------------
// Volume popover (matches default skin pattern)
// ---------------------------------------------------------------------------

function VolumePopover() {
  const volumeUnsupported = usePlayer((s) => s.volumeAvailability === "unsupported");

  const muteButton = (
    <MuteButton className="media-button--mute" render={<Button />}>
      <VolumeOffIcon className="media-icon media-icon--volume-off" />
      <VolumeLowIcon className="media-icon media-icon--volume-low" />
      <VolumeHighIcon className="media-icon media-icon--volume-high" />
    </MuteButton>
  );

  if (volumeUnsupported) return muteButton;

  return (
    <Popover.Root openOnHover delay={200} closeDelay={100} side="top">
      <Popover.Trigger render={muteButton} />
      <Popover.Popup className="media-surface media-popover media-popover--volume">
        <VolumeSlider.Root className="media-slider" orientation="vertical" thumbAlignment="edge">
          <Slider.Track className="media-slider__track">
            <Slider.Fill className="media-slider__fill" />
          </Slider.Track>
          <Slider.Thumb className="media-slider__thumb media-slider__thumb--persistent" />
        </VolumeSlider.Root>
      </Popover.Popup>
    </Popover.Root>
  );
}

// ---------------------------------------------------------------------------
// Player skin (ejected from default VideoSkin, with custom menus added)
// ---------------------------------------------------------------------------

function PlayerSkin({
  movie,
  englishSubs,
}: {
  movie: MovieDetail;
  englishSubs: MovieSubtitleTrack[];
}) {
  return (
    <Player.Provider>
      <Player.Container className="media-default-skin media-default-skin--video">
        <Video src={movie.streams[0].directUrl} playsInline crossOrigin="anonymous">
          {englishSubs.map((sub, i) => (
            <track
              key={sub.id}
              kind="subtitles"
              label={getSubtitleLabel(sub, i)}
              srcLang="en"
              src={sub.proxyUrl}
            />
          ))}
        </Video>

        <Poster src={movie.backdropUrl} />

        <BufferingIndicator
          render={(props) => (
            <div {...props} className="media-buffering-indicator">
              <div className="media-surface">
                <SpinnerIcon className="media-icon" />
              </div>
            </div>
          )}
        />

        <ErrorDialog.Root>
          <AlertDialog.Popup className="media-error">
            <div className="media-error__dialog media-surface">
              <div className="media-error__content">
                <AlertDialog.Title className="media-error__title">
                  Something went wrong.
                </AlertDialog.Title>
                <ErrorDialog.Description className="media-error__description" />
              </div>
              <div className="media-error__actions">
                <AlertDialog.Close className="media-button media-button--primary">
                  OK
                </AlertDialog.Close>
              </div>
            </div>
          </AlertDialog.Popup>
        </ErrorDialog.Root>

        <Controls.Root className="media-surface media-controls">
          <Tooltip.Provider>
            {/* Left: play, seek back, seek forward */}
            <div className="media-button-group">
              <Tooltip.Root side="top">
                <Tooltip.Trigger
                  render={
                    <PlayButton className="media-button--play" render={<Button />}>
                      <RestartIcon className="media-icon media-icon--restart" />
                      <PlayIcon className="media-icon media-icon--play" />
                      <PauseIcon className="media-icon media-icon--pause" />
                    </PlayButton>
                  }
                />
                <Tooltip.Popup className="media-surface media-tooltip" />
              </Tooltip.Root>

              <Tooltip.Root side="top">
                <Tooltip.Trigger
                  render={
                    <SeekButton
                      seconds={-SEEK_TIME}
                      className="media-button--seek"
                      render={<Button />}
                    >
                      <span className="media-icon__container">
                        <SeekIcon className="media-icon media-icon--seek media-icon--flipped" />
                        <span className="media-icon__label">{SEEK_TIME}</span>
                      </span>
                    </SeekButton>
                  }
                />
                <Tooltip.Popup className="media-surface media-tooltip">
                  Seek backward {SEEK_TIME} seconds
                </Tooltip.Popup>
              </Tooltip.Root>

              <Tooltip.Root side="top">
                <Tooltip.Trigger
                  render={
                    <SeekButton
                      seconds={SEEK_TIME}
                      className="media-button--seek"
                      render={<Button />}
                    >
                      <span className="media-icon__container">
                        <SeekIcon className="media-icon media-icon--seek" />
                        <span className="media-icon__label">{SEEK_TIME}</span>
                      </span>
                    </SeekButton>
                  }
                />
                <Tooltip.Popup className="media-surface media-tooltip">
                  Seek forward {SEEK_TIME} seconds
                </Tooltip.Popup>
              </Tooltip.Root>
            </div>

            {/* Center: time + slider */}
            <div className="media-time-controls">
              <Time.Value type="current" className="media-time" />
              <TimeSlider.Root className="media-slider">
                <Slider.Track className="media-slider__track">
                  <Slider.Fill className="media-slider__fill" />
                  <Slider.Buffer className="media-slider__buffer" />
                </Slider.Track>
                <Slider.Thumb className="media-slider__thumb" />
                <div className="media-surface media-preview media-slider__preview">
                  <Slider.Value type="pointer" className="media-time media-preview__time" />
                </div>
              </TimeSlider.Root>
              <Time.Value type="duration" className="media-time" />
            </div>

            {/* Right: rate, quality, subtitles, volume, pip, fullscreen */}
            <div className="media-button-group">
              <Tooltip.Root side="top">
                <Tooltip.Trigger
                  render={
                    <PlaybackRateButton
                      className="media-button--playback-rate"
                      render={<Button />}
                    />
                  }
                />
                <Tooltip.Popup className="media-surface media-tooltip">
                  Toggle playback rate
                </Tooltip.Popup>
              </Tooltip.Root>

              <QualityMenu movie={movie} />
              <SubtitleMenu subtitles={englishSubs} />
              <VolumePopover />

              <Tooltip.Root side="top">
                <Tooltip.Trigger
                  render={
                    <FullscreenButton className="media-button--fullscreen" render={<Button />}>
                      <FullscreenEnterIcon className="media-icon media-icon--fullscreen-enter" />
                      <FullscreenExitIcon className="media-icon media-icon--fullscreen-exit" />
                    </FullscreenButton>
                  }
                />
                <Tooltip.Popup className="media-surface media-tooltip" />
              </Tooltip.Root>
            </div>
          </Tooltip.Provider>
        </Controls.Root>

        <div className="media-overlay" />
      </Player.Container>
    </Player.Provider>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function WatchPlayer({ movie }: { movie: MovieDetail }) {
  const englishSubs = getEnglishSubtitles(movie.subtitles);

  if (movie.streams.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-[#a1a1aa]">No playable streams are available for this movie.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black">
      <PlayerSkin movie={movie} englishSubs={englishSubs} />
    </div>
  );
}
