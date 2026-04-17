# pi-cat

`pi-cat` is a cat-themed package for pi. It keeps the phosphor-green terminal palette, adds a light optional cat prompt layer, renders a compact telemetry block, and defaults the header title to `(。-ω-)` with the subtitle `Your Cat Agent`.

The package is designed to feel tidy, quiet, and slightly playful without interfering with normal coding work.

## Preview

A typical header looks like this:

```text

           (。-ω-)
       Your Cat Agent

```

A typical lower telemetry block looks like this:

```text
(。-ω-) | openai-codex/gpt-5.4 | high
CTX 55% 150K/272K | ↑339K ↓51K R9.6M |  AUTO
~/Developer/pi-cat (main)
```

The exact spacing depends on terminal width, active model, and session state.

## Features

- Bundled `cat` theme with a phosphor-green palette.
- Optional append-only cat prompt layer that preserves pi's base system prompt.
- Minimal text header with configurable title and subtitle.
- Below-editor telemetry showing model, provider, thinking level, context usage, token traffic, and workspace path.
- Footer override that removes default lower-footer clutter.
- Session-scoped toggles with disk-backed global or project settings.
- Safe width handling so header and telemetry lines do not overflow narrow terminals.

## Installation

Install directly from GitHub:

```bash
pi install https://github.com/lulucatdev/pi-cat
```

Then reload pi:

```text
/reload
```

For local development from this working copy:

```bash
pi install /Users/lucas/Developer/pi-cat
```

For a one-off run without installation:

```bash
pi -e /Users/lucas/Developer/pi-cat/extensions/cat/index.ts \
  --theme /Users/lucas/Developer/pi-cat/themes/cat.json
```

## Update and removal

Update the installed GitHub package:

```bash
pi update https://github.com/lulucatdev/pi-cat
```

Uninstall it:

```bash
pi uninstall https://github.com/lulucatdev/pi-cat
```

## What it enables

After installation, the package can automatically:

- switch pi to the bundled `cat` theme;
- replace the default header with a centered cat header;
- optionally append a light cat terminal persona to the system prompt;
- show a telemetry panel below the editor with provider, model, thinking level, context usage, token counters, and workspace path;
- suppress the default lower-footer clutter with a custom footer override.

All of these features are individually toggleable. By default, the prompt layer is off, so the package changes the terminal presentation without changing the model persona unless you enable it.

## Custom header text

You can customize the header title and subtitle. Changes are saved to the global configuration immediately.

```text
/cat-title My Terminal
/cat-subtitle Sleeping Supervisor
```

You can also set them through the main command surface:

```text
/cat header-title My Terminal
/cat header-subtitle Sleeping Supervisor
```

To reset them to the defaults, run the commands without a value:

```text
/cat-title
/cat-subtitle
```

Defaults:

- title: `(。-ω-)`
- subtitle: `Your Cat Agent`

## Telemetry reference

The lower telemetry block is designed to stay compact while exposing the most useful runtime information.

- `provider/model` is the active pi model identifier, for example `openai-codex/gpt-5.4`.
- The last field on the first line is the current thinking level, such as `off`, `high`, or `xhigh`.
- `CTX` is the estimated context percentage followed by current tokens over context window.
- `↑` is the cumulative input-token count from assistant turns in the current session history.
- `↓` is the cumulative output-token count from assistant turns in the current session history.
- `R` is the cumulative cache-read token count.
- `AUTO` appears when pi auto-compaction is currently enabled.
- The final line shows the current workspace path and Git branch, if available.

## Command surface

The package registers `/cat`, `/cat-title`, and `/cat-subtitle`.

### Interactive control panel

```text
/cat
```

This opens a toggle list for the current session.

### Direct toggles

```text
/cat on
/cat off
/cat prompt on
/cat telemetry off
/cat theme on
/cat header off
/cat status
/cat reset
```

`reset` restores the current session to the merged disk-backed configuration.

### Persist settings

```text
/cat save global
/cat save project
```

Persistence is stored in these files:

- global: `~/.pi/agent/pi-cat.json`
- project: `.pi/pi-cat.json`

Project settings override global settings.

## Recommended first run

After installation, a typical setup flow is:

1. Run `/reload`.
2. Run `/cat` to open the session control panel.
3. Confirm that `theme`, `header`, `telemetry`, and `status` are enabled.
4. If desired, persist the current configuration with `/cat save global`.

## Files

```text
pi-cat/
├── extensions/cat/index.ts
├── extensions/cat/prompt.txt
├── themes/cat.json
├── package.json
└── README.md
```

## Development notes

Useful local checks:

```bash
npm run pack:check
npm run typecheck
```

`typecheck` assumes the pi peer dependencies are available in the development environment.

## License

MIT. See `LICENSE`.
