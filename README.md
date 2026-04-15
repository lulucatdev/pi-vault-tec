# pi-vault-tec

`pi-vault-tec` is a pi package that applies a restrained Vault-Tec presentation layer to the interactive terminal. It combines a bundled phosphor-green theme, a light prompt layer, a text-only `PI-BOY 3000` header, and a telemetry block rendered below the editor.

The package is inspired by [`kommander/oc-plugin-vault-tec`](https://github.com/kommander/oc-plugin-vault-tec), but it is implemented directly against pi's extension and theme APIs rather than as a line-for-line port.

## Preview

A typical lower telemetry block looks like this:

```text
PI-BOY 3000 | openai-codex/gpt-5.4 | high
CTX [=.............] 7% | ↑19K ↓67 R0 | 19K/272K | AUTO
~/Developer/pi-vault-tec (main)
```

The exact spacing depends on terminal width, active model, and current session state.

## Features

- Bundled `vault-tec` theme with a phosphor-green terminal palette.
- Append-only Vault-Tec prompt layer that preserves pi's base system prompt.
- Text-only `PI-BOY 3000` header banner.
- Below-editor telemetry that shows model, provider, thinking level, context usage, cumulative token traffic, and workspace path.
- Footer override that suppresses the default lower-footer clutter from pi and other extensions.
- Session-scoped toggles plus disk-backed global or project settings.

## Installation

Install directly from GitHub:

```bash
pi install https://github.com/lulucatdev/pi-vault-tec
```

Then reload pi:

```text
/reload
```

For local development from this working copy:

```bash
pi install /Users/lucas/Developer/pi-vault-tec
```

For a one-off run without installation:

```bash
pi -e /Users/lucas/Developer/pi-vault-tec/extensions/vault-tec/index.ts \
  --theme /Users/lucas/Developer/pi-vault-tec/themes/vault-tec.json
```

## Update and removal

Update the installed GitHub package:

```bash
pi update https://github.com/lulucatdev/pi-vault-tec
```

Uninstall it:

```bash
pi uninstall https://github.com/lulucatdev/pi-vault-tec
```

## What it enables

After installation, the package can automatically:

- switch pi to the bundled `vault-tec` theme;
- append a light Vault-Tec terminal persona to the system prompt;
- replace the default header with a text-only `PI-BOY 3000` banner;
- show a telemetry panel below the editor with provider, model, thinking level, context usage, token counters, and workspace path;
- suppress the default lower-footer clutter with a custom footer override.

All of these features are individually toggleable.

## Telemetry reference

The lower telemetry block is designed to remain compact while exposing the most useful runtime information.

- `provider/model` is the active pi model identifier, for example `openai-codex/gpt-5.4`.
- The last field on the first line is the current thinking level, such as `off`, `high`, or `xhigh`.
- `CTX` is the estimated context usage bar and percentage for the active model.
- `↑` is the cumulative input-token count from assistant turns in the current session history.
- `↓` is the cumulative output-token count from assistant turns in the current session history.
- `R` is the cumulative cache-read token count.
- `19K/272K` means estimated current context tokens over the model context window.
- `AUTO` appears when pi auto-compaction is currently enabled.
- The final line shows the current workspace path and Git branch, if available.

## Command surface

The package registers `/vault-tec`.

### Interactive control panel

```text
/vault-tec
```

This opens a toggle list for the current session.

### Direct toggles

```text
/vault-tec on
/vault-tec off
/vault-tec prompt off
/vault-tec telemetry off
/vault-tec theme on
/vault-tec header off
/vault-tec status
/vault-tec reset
```

`reset` restores the current session to the merged disk-backed configuration.

### Persist settings

```text
/vault-tec save global
/vault-tec save project
```

Persistence is stored in these files:

- global: `~/.pi/agent/vault-tec.json`
- project: `.pi/vault-tec.json`

Project settings override global settings.

## Recommended first run

After installation, a typical setup flow is:

1. Run `/reload`.
2. Run `/vault-tec` to open the session control panel.
3. Confirm that `theme`, `header`, `telemetry`, and `status` are enabled.
4. If desired, persist the current configuration with `/vault-tec save global`.

## Feature mapping from the upstream plugin

The upstream OpenCode plugin has two major halves: prompt transformation and TUI slot customization. The pi port maps those capabilities as follows.

| Upstream idea | pi implementation |
|---|---|
| server prompt injection | `before_agent_start` system-prompt append |
| bundled theme | `themes/vault-tec.json` |
| settings dialog | `/vault-tec` interactive settings list |
| sidebar Pip-Boy panel | below-editor `PI-BOY 3000` telemetry widget |
| terminal header | custom `setHeader()` with a text-only `PI-BOY 3000` banner |
| lower console chrome | custom `setFooter()` used to suppress default footer clutter |

## Intentional differences

This package does not attempt a pixel-identical reproduction of the OpenCode plugin.

- pi does not expose the same home-screen slot and post-processing APIs, therefore true scanlines, vignette, and sidebar slot injection are not replicated.
- The prompt layer is append-only. It does not replace pi's base system prompt because pi's tool contracts and runtime constraints must remain intact.
- The current package favors a clean text terminal presentation over image-based or heavy decorative rendering.
- The persona is intentionally lighter than the upstream prompt so that normal coding work remains readable.

## Files

```text
pi-vault-tec/
├── extensions/vault-tec/index.ts
├── extensions/vault-tec/prompt.txt
├── themes/vault-tec.json
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
