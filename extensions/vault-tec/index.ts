import { mkdir, readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  getAgentDir,
  getSettingsListTheme,
  SettingsManager,
  type ExtensionAPI,
  type ExtensionCommandContext,
  type ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import {
  Container,
  type SettingItem,
  SettingsList,
  Spacer,
  Text,
  truncateToWidth,
  visibleWidth,
} from "@mariozechner/pi-tui";

const THEME_NAME = "vault-tec";
const SETTINGS_ENTRY_TYPE = "vault-tec-settings";
const PROJECT_CONFIG_RELATIVE_PATH = ".pi/vault-tec.json";
const GLOBAL_CONFIG_PATH = join(getAgentDir(), "vault-tec.json");
const PROMPT_TEXT = readFileSync(new URL("./prompt.txt", import.meta.url), "utf8").trim();
const PROMPT_MARKER = "VAULT-TEC TERMINAL ACTIVE";

const HEADER_HOME = [
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⡶⠶⠶⢶⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠘⠛⠛⠛⠛⢻⡿⠁⣠⣤⣤⣄⠈⢿⡟⠛⠛⠛⠛⠃⠀⠀⠀⠀",
  "⠶⠶⠶⠶⠶⠶⠶⠶⠶⢾⡁⠀⣿⣿⣿⣿⠀⢨⡷⠶⠶⠶⠶⠶⠶⠶⠶⠶",
  "⠀⠀⠀⠀⢤⣴⣶⣶⣶⣾⣷⡀⠙⠛⠛⠋⢀⣾⣷⣶⣶⣶⣦⡤⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠷⠶⠶⠾⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
] as const;

const HEADER_HOME_1 = [
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡿⣷⣤⡾⠟⠻⠿⠛⠉⠻⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣇⣀⣠⠷⢶⣄⣠⣤⡀⠀⠈⠻⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡏⠉⠀⢀⡤⠈⠉⠙⢷⣄⣀⣀⠻⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡟⣽⡿⠆⢠⡟⠀⢀⡀⠀⠈⠁⠈⣹⠀⢿⡆⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡿⠀⠉⢡⡴⠋⠀⢺⣿⠙⠂⠀⢠⣿⡉⢀⣾⠃⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣧⣦⠀⠸⠷⠀⠀⠘⠋⠀⠀⠀⣸⣿⣿⣾⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⡟⠻⣝⡓⠶⠤⠤⣿⡄⠀⠀⠈⠛⢽⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⡀⠸⠿⠓⠒⠋⠛⠁⠀⠀⣀⣀⣼⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⢀⣤⣶⠶⢶⣤⣤⣄⠀⠀⠀⠀⠀⠀⠀⣠⣴⡾⠟⠛⢳⣾⣿⣄⡀⠀⠀⠀⢀⣠⣴⣿⡛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⣸⡟⠻⠷⠶⣦⣤⣽⣿⡇⠀⠀⠀⠀⢀⣼⠟⠁⠀⠀⠀⠘⠳⣤⠙⢿⣶⣂⣀⣽⢿⣩⠿⠙⢿⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⣰⣿⣄⣀⣀⠀⠀⣿⠃⣿⡇⠀⠀⠀⠀⣾⠏⠀⠀⠀⠀⠀⠀⢠⡿⠀⠀⠀⠀⣴⠟⠋⠀⠀⠀⠀⠈⠻⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⣸⠟⣻⠁⠀⢹⣿⣿⣷⢾⣿⡆⠀⠀⠀⠀⣿⠀⠀⢠⡄⠀⠀⠀⣾⠁⠀⠀⠀⢰⠏⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣧⡀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⢸⡟⢠⡇⠀⠀⣾⡇⢙⣿⠟⠋⠀⠀⠀⠀⠀⣿⣀⡀⢸⡇⠀⠀⢠⡇⠀⠀⠀⠀⣼⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣷⡄⠀⠀⠀⠀⠀⠀",
  "⢀⣿⠃⡾⠁⠀⢰⣿⠁⣽⡿⠿⣦⣤⣶⢶⣶⣾⣯⡉⠙⠟⣷⠀⠀⣾⠁⠀⠀⠀⢀⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⡆⠀⠀⠀⠀⠀",
  "⢸⣷⣠⠇⠀⠀⣾⠏⢀⣿⠻⠶⣶⡟⢀⡏⢰⠏⣿⢿⣄⡀⢸⡆⠀⡟⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠘⢷⣦⡀⠀⠀⠀⠀⠈⣿⡄⠀⠀⠀⠀",
  "⢀⣾⢿⣤⣀⣼⡿⣦⣼⠇⠀⠀⠘⢿⣭⢡⣼⡀⢻⣦⣄⣉⣛⠛⠿⠧⣄⣀⡀⠀⠸⣇⣀⣀⣀⣀⣀⣠⡿⠉⠻⣦⡀⠀⠀⠀⢸⣿⠀⠀⠀⠀",
  "⢸⣏⠀⠀⠉⠙⢣⣿⠀⠀⠀⠀⠀⠀⠛⠛⠛⠛⠛⠛⠛⠋⢻⣿⠳⠦⢤⣄⣉⡙⠲⠦⠤⣀⣀⠀⠀⣾⠇⠀⠀⠹⣷⡀⠀⠀⠀⢻⡄⠀⠀⠀",
  "⠈⠛⠻⠷⣶⣤⣾⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡟⠀⠀⠀⠈⠉⠙⠓⠶⢦⣤⣉⡙⠒⠻⣶⣤⣤⣀⣽⣷⣤⣤⠶⠻⣧⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡾⠛⠓⠶⠦⣤⣤⣤⣤⣤⣤⣤⠼⠿⠛⣿⣶⣤⣭⣝⡙⢺⡆⠀⠀⠀⣿⡀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡿⠁⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠘⣿⡄⠈⠹⣿⠛⣡⠄⣀⣴⣟⡻⣷⡀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡟⠀⠀⠀⠀⠀⠀⠀⠀⢻⡀⠀⠀⠀⠀⠀⠀⠀⠘⣷⡀⠀⠙⠛⠛⠛⠛⠋⠛⠛⠋⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡿⠀⠀⠀⠀⠀⠀⠀⢀⣴⡟⢿⣄⠀⠀⠀⠀⠀⠀⠀⢹⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠇⠀⠀⠀⠀⠀⠀⢠⡾⠋⠀⠈⢻⣆⠀⠀⠀⠀⠀⠀⠀⢹⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⢠⡿⠁⠀⠀⠀⠀⠻⣧⠀⠀⠀⠀⠀⠀⠘⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⣸⡇⠀⠀⠀⠀⠀⠀⢻⣧⠀⠀⠀⠀⠀⠀⢿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡄⠀⠀⠀⠀⠀⣿⠁⠀⠀⠀⠀⠀⠀⠀⢻⣧⠀⠀⠀⠀⠀⢸⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣧⠀⠀⠀⠀⣀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣧⠀⠀⠀⠀⠸⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⡶⠛⠛⢒⣿⣯⣭⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣷⠖⠒⠒⠛⢿⡄⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⠿⠶⠾⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⢷⣤⣀⣴⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
] as const;

const HEADER_HOME_2 = [
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣄⣴⣿⣿⣶⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣄⣠⠾⠛⠿⠃⠈⠻⣿⢿⣿⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⣸⠿⢃⣴⣿⣶⣶⠾⣶⣼⣤⣤⠸⣧⠻⣷⣦⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣶⣿⣧⢋⣦⢶⣿⡿⣿⣿⡷⣌⣿⢿⢁⢼⣿⡎⠿⣿⣿⣿⣷⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣤⣿⣿⣿⠟⠋⣼⣏⣸⡏⢣⢧⣧⣠⢹⣿⣭⢑⢕⠻⠀⠀⠀⠙⠻⣿⣿⣿⣦⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢯⣶⣿⢸⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⣿⣿⣿⡀⢿⣿⡟⣿⣿⣾⣬⣕⣕⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡸⣿⣏⢾⣿⣿⣿⣿⣿⡟⠁⠀⠀⠀⠀⢿⠸⣛⣛⣛⣛⡭⠌⣻⣿⣿⣿⡿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⢘⣛⣃⣙⠿⣮⡛⢿⣿⣿⠏⠀⠀⠀⠀⠀⠀⠘⢿⣶⡊⢩⣵⣾⣷⣿⡟⠝⣠⣶⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣿⡛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠉⠉⠉⠉⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠿⠿⠿⠿⣿⡎⢿⡌⢙⣋⣀⠀⠀⠀⠀⢀⣀⣀⣌⠛⢿⣿⣿⣿⣿⣟⡁⣴⣯⢙⡻⢿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣶⡜⡿⠃⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣷⣄⣉⣉⣛⣡⣾⡿⢃⣾⣿⣷⣯⡳⡀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⣀⣤⣶⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⡃⣶⣶⣶⣮⠕⡿⠀⣸⣿⣿⣿⣿⣿⣿⡟⣿⣿⣿⡷⢹⣿⣿⣿⠿⢟⣩⣴⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣤⣀⠀⠀",
  "⠐⢾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣜⣛⣂⡊⠁⠴⠿⠿⠿⠟⠛⠛⠉⠁⣿⣿⣿⡇⣿⣿⣿⡇⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠛⠂",
  "⠀⠀⠀⠉⠛⠛⠛⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⢿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⢱⣿⣿⣿⢡⣿⣿⣿⣿⣶⣭⣛⠿⢿⣿⣿⣿⣿⣿⣆⠀⠀⠀⢸⣿⣿⡿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠛⠛⠛⠁⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⢸⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⡏⣸⣷⢢⣿⣿⣿⣿⡟⠀⠀⠀⣼⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣆⠀⠀⠀⠀⠀⠀⢸⣿⣿⢸⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⢃⡿⣣⣿⣿⣿⣿⡟⠀⠀⠀⢠⣿⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⣴⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣿⣿⣿⣆⠀⠀⠀⠀⠀⢰⣬⣛⢸⣿⣿⣿⢸⣿⣿⣿⠿⠿⢛⠘⢡⣿⣿⣿⣿⡟⠀⠀⠀⢠⣿⣿⣿⣷⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣷⣶⣶⣶⣾⣿⣿⢀⣦⣙⠻⠿⠟⠀⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⢭⣛⡻⠿⠿⣿⣿⣿⠿⠿⠿⢛⣃⡈⣿⣿⡟⠴⡄⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⠿⠿⠿⠿⠿⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣷⣦⡀⠸⣿⣿⣿⣿⣶⣶⣶⣿⣿⣿⣿⣿⣧⠙⠛⠛⢒⣡⣾⣿⣿⠿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⢿⣿⣿⣷⣆⣉⠙⠛⠻⠿⠿⠿⠿⠿⠿⠟⠛⠋⢁⣰⣾⣿⣿⡿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⣿⣿⣿⣿⣷⣶⣶⣶⣶⣶⣶⣶⣿⣿⣿⣿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡴⠊⣹⠁⠀⡀⣬⢰⡆⡇⡀⠀⢀⠀⡤⠀⠀⠀⠈⠙⠛⠻⠿⠿⠿⠿⠿⠿⠛⠛⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡞⠀⢠⠇⡼⢡⠇⡇⡞⠈⠓⠁⠃⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠓⣡⡞⠀⠑⠉⠀⠀⠀⠀⠀⢸⣿⢀⣿⡇⣿⢿⡇⢸⣿⢸⣿⢸⣿⠸⢿⣿⠿⠀⠸⢿⣿⠿⢸⣿⠛⢠⣾⠛⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡴⡱⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⢠⣿⢸⣇⢸⣿⢸⣿⢸⣿⠀⢸⣿⢠⣤⡄⢸⣿⠀⢸⣿⠶⢸⣿⠀⣉⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡿⢸⣿⢹⣿⠸⣿⣼⡿⢸⣿⣤⢸⣿⠀⠀⠀⢸⣿⠀⠸⣿⣤⡌⣿⣤⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
] as const;

function logoWidth(lines: readonly string[]): number {
  return Math.max(...lines.map((line) => line.length));
}

const HEADER_HOME_1_WIDTH = logoWidth(HEADER_HOME_1);
const HEADER_HOME_2_WIDTH = logoWidth(HEADER_HOME_2);

type Scope = "global" | "project";

type ToggleKey =
  | "enabled"
  | "prompt"
  | "autoTheme"
  | "header"
  | "status"
  | "telemetry";

interface VaultTecSettings extends Record<ToggleKey, boolean> {
  headerTitle: string;
  headerSubtitle: string;
}

const DEFAULT_SETTINGS: VaultTecSettings = {
  enabled: true,
  prompt: false,
  autoTheme: true,
  header: true,
  status: true,
  telemetry: true,
  headerTitle: "PI-BOY 3000",
  headerSubtitle: "VAULT-TEC TERMINAL INTERFACE",
};

const SETTING_DEFS: Array<{ key: ToggleKey; label: string; description: string }> = [
  {
    key: "enabled",
    label: "Vault-Tec mode",
    description: "Master switch for prompt and UI treatment.",
  },
  {
    key: "prompt",
    label: "Prompt layer",
    description: "Append the Vault-Tec terminal voice before each run.",
  },
  {
    key: "autoTheme",
    label: "Auto theme",
    description: "Switch pi to the bundled vault-tec theme.",
  },
  {
    key: "header",
    label: "Vault-Tec crest",
    description: "Replace the default header with the exact upstream Vault-Tec home logo.",
  },
  {
    key: "status",
    label: "Footer console",
    description: "Replace the default footer with the Vault-Tec console.",
  },
  {
    key: "telemetry",
    label: "Telemetry panel",
    description: "Show context and cost metrics above the editor.",
  },
];

const KEY_ALIASES: Record<string, ToggleKey> = {
  enabled: "enabled",
  mode: "enabled",
  prompt: "prompt",
  theme: "autoTheme",
  autoTheme: "autoTheme",
  header: "header",
  status: "status",
  telemetry: "telemetry",
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeSettings(value: unknown, fallback: VaultTecSettings = DEFAULT_SETTINGS): VaultTecSettings {
  const object = isObject(value) ? value : {};
  return {
    enabled: bool(object.enabled, fallback.enabled),
    prompt: bool(object.prompt, fallback.prompt),
    autoTheme: bool(object.autoTheme, fallback.autoTheme),
    header: bool(object.header, fallback.header),
    status: bool(object.status, fallback.status),
    telemetry: bool(object.telemetry, fallback.telemetry),
    headerTitle: typeof object.headerTitle === "string" ? object.headerTitle : fallback.headerTitle,
    headerSubtitle: typeof object.headerSubtitle === "string" ? object.headerSubtitle : fallback.headerSubtitle,
  };
}

async function readSettingsFile(path: string): Promise<Record<string, unknown> | undefined> {
  try {
    const text = await readFile(path, "utf8");
    const parsed = JSON.parse(text);
    return isObject(parsed) ? parsed : undefined;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return undefined;
    throw error;
  }
}

async function writeSettingsFile(path: string, settings: VaultTecSettings): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}

async function loadDiskSettings(cwd: string): Promise<VaultTecSettings> {
  const globalSettings = normalizeSettings(await readSettingsFile(GLOBAL_CONFIG_PATH), DEFAULT_SETTINGS);
  const projectPath = join(cwd, PROJECT_CONFIG_RELATIVE_PATH);
  return normalizeSettings(await readSettingsFile(projectPath), globalSettings);
}

function getSessionSettings(ctx: ExtensionContext, fallback: VaultTecSettings): VaultTecSettings | undefined {
  let restored: VaultTecSettings | undefined;

  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type !== "custom") continue;
    if (entry.customType !== SETTINGS_ENTRY_TYPE) continue;
    restored = normalizeSettings(entry.data, fallback);
  }

  return restored;
}

function formatTokens(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${Math.round(value / 1_000)}K`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function formatCost(value: number): string {
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(3)}`;
  return `$${value.toFixed(4)}`;
}

function getContextRatio(usage: ReturnType<ExtensionContext["getContextUsage"]>): number | null {
  if (!usage) return null;

  if (typeof usage.tokens === "number" && usage.contextWindow > 0) {
    return Math.max(0, Math.min(1, usage.tokens / usage.contextWindow));
  }

  if (typeof usage.percent === "number") {
    const normalized = usage.percent > 1 ? usage.percent / 100 : usage.percent;
    return Math.max(0, Math.min(1, normalized));
  }

  return null;
}

function progressBar(percent: number | null, width = 14): string {
  if (percent === null) return `${".".repeat(width)}`;
  const ratio = Math.max(0, Math.min(1, percent));
  const filled = Math.round(ratio * width);
  return `${"=".repeat(filled)}${".".repeat(Math.max(0, width - filled))}`;
}

function centerStyled(text: string, width: number): string {
  const textWidth = visibleWidth(text);
  if (textWidth >= width) return truncateToWidth(text, width);
  const left = Math.floor((width - textWidth) / 2);
  const right = Math.max(0, width - textWidth - left);
  return `${" ".repeat(left)}${text}${" ".repeat(right)}`;
}

function centerPlain(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  const left = Math.floor((width - text.length) / 2);
  const right = Math.max(0, width - text.length - left);
  return `${" ".repeat(left)}${text}${" ".repeat(right)}`;
}

function isAutoCompactionEnabled(cwd: string): boolean {
  try {
    return SettingsManager.create(cwd).getCompactionEnabled();
  } catch {
    return true;
  }
}

function pickHeaderLogo(width: number, rows: number): readonly string[] {
  if (rows >= HEADER_HOME_2.length && width >= HEADER_HOME_2_WIDTH) return HEADER_HOME_2;
  if (rows >= HEADER_HOME_1.length && width >= HEADER_HOME_1_WIDTH) return HEADER_HOME_1;
  return HEADER_HOME;
}

function buildHeaderLogo(
  theme: ExtensionContext["ui"]["theme"],
  width: number,
  _rows: number,
  title: string,
  subtitle: string,
): string[] {
  const contentWidth = Math.max(visibleWidth(title), visibleWidth(subtitle));
  const blockWidth = Math.min(width, Math.max(28, contentWidth + 8));

  return [
    "",
    truncateToWidth(centerStyled(centerStyled(theme.fg("accent", title), blockWidth), width), width),
    truncateToWidth(centerStyled(centerStyled(theme.fg("muted", subtitle), blockWidth), width), width),
    "",
  ];
}

function getUsageSnapshot(ctx: ExtensionContext): {
  totalInput: number;
  totalOutput: number;
  totalCacheRead: number;
} {
  let totalInput = 0;
  let totalOutput = 0;
  let totalCacheRead = 0;

  for (const entry of ctx.sessionManager.getEntries()) {
    if (entry.type !== "message") continue;
    const message = entry.message as { role?: string; usage?: Record<string, unknown> };
    if (message.role !== "assistant") continue;

    const usage = isObject(message.usage) ? message.usage : {};
    totalInput += typeof usage.input === "number" ? usage.input : 0;
    totalOutput += typeof usage.output === "number" ? usage.output : 0;
    totalCacheRead += typeof usage.cacheRead === "number" ? usage.cacheRead : 0;
  }

  return {
    totalInput,
    totalOutput,
    totalCacheRead,
  };
}

function getThinkingLevelFromSession(ctx: ExtensionContext): string | undefined {
  const branch = ctx.sessionManager.getBranch();

  for (let index = branch.length - 1; index >= 0; index -= 1) {
    const entry = branch[index];
    if (entry?.type !== "thinking_level_change") continue;
    return typeof entry.thinkingLevel === "string" ? entry.thinkingLevel : undefined;
  }

  return undefined;
}

function buildTelemetryLines(
  ctx: ExtensionContext,
  theme: ExtensionContext["ui"]["theme"],
  branch: string | null,
  thinkingLevel: string,
  width: number,
  headerTitle: string,
): string[] {
  const usage = ctx.getContextUsage();
  const snapshot = getUsageSnapshot(ctx);
  const modelId = ctx.model?.id ?? "no-model";
  const provider = ctx.model?.provider;
  const model = provider && provider !== "auto" ? `${provider}/${modelId}` : modelId;
  const contextRatio = getContextRatio(usage);
  const contextLabel = contextRatio === null ? "n/a" : `${Math.round(contextRatio * 100)}%`;
  const contextTokens = usage?.tokens === null || usage?.tokens === undefined ? "n/a" : formatTokens(usage.tokens);
  const contextWindow = usage ? formatTokens(usage.contextWindow) : "n/a";
  const modelLineSuffix = thinkingLevel ? ` | ${thinkingLevel}` : "";
  const autoCompactSuffix = isAutoCompactionEnabled(ctx.cwd) ? theme.fg("accent", " |  AUTO") : "";
  const workspaceLabel = branch ? `${withHomeTilde(ctx.cwd)} (${branch})` : withHomeTilde(ctx.cwd);
  const trafficLabel =
    theme.fg("warning", "↑") +
    theme.fg("text", formatTokens(snapshot.totalInput)) +
    theme.fg("muted", " ") +
    theme.fg("warning", "↓") +
    theme.fg("text", formatTokens(snapshot.totalOutput)) +
    theme.fg("muted", " ") +
    theme.fg("warning", "R") +
    theme.fg("text", formatTokens(snapshot.totalCacheRead));

  return [
    truncateToWidth(theme.fg("accent", headerTitle) + theme.fg("muted", ` | ${model}${modelLineSuffix}`), width),
    truncateToWidth(
      theme.fg("warning", "CTX ") +
        theme.fg("text", `${contextLabel} ${contextTokens}/${contextWindow}`) +
        theme.fg("muted", " | ") +
        trafficLabel +
        autoCompactSuffix,
      width,
    ),
    truncateToWidth(theme.fg("muted", workspaceLabel), width),
  ];
}

function withHomeTilde(path: string): string {
  const home = process.env.HOME || process.env.USERPROFILE;
  if (!home || !path.startsWith(home)) return path;
  return `~${path.slice(home.length)}`;
}

function applyHeader(ctx: ExtensionContext, settings: VaultTecSettings): void {
  if (!ctx.hasUI) return;

  if (!settings.enabled || !settings.header) {
    ctx.ui.setHeader(undefined);
    return;
  }

  ctx.ui.setHeader((tui, theme) => ({
    invalidate() {},
    render(width: number): string[] {
      return buildHeaderLogo(theme, width, tui.terminal.rows, settings.headerTitle, settings.headerSubtitle);
    },
  }));
}

function applyWidgets(
  ctx: ExtensionContext,
  settings: VaultTecSettings,
  branch: string | null,
  getThinkingLevel: () => string,
): void {
  if (!ctx.hasUI) return;

  if (settings.enabled && settings.telemetry) {
    ctx.ui.setWidget(
      "vault-tec-telemetry",
      (_tui, theme) => ({
        invalidate() {},
        render(width: number): string[] {
          const thinkingLevel = getThinkingLevel();
          return buildTelemetryLines(ctx, theme, branch, thinkingLevel, width, settings.headerTitle);
        },
      }),
      { placement: "belowEditor" },
    );
  } else {
    ctx.ui.setWidget("vault-tec-telemetry", undefined);
  }
}

function applyFooter(
  ctx: ExtensionContext,
  settings: VaultTecSettings,
  onBranchChange: (branch: string | null) => void,
): void {
  if (!ctx.hasUI) return;

  // Clear the legacy per-extension status entry so it never reappears in the custom footer.
  ctx.ui.setStatus("vault-tec", undefined);

  if (!settings.enabled || !settings.status) {
    onBranchChange(null);
    ctx.ui.setFooter(undefined);
    return;
  }

  ctx.ui.setFooter((tui, theme, footerData) => {
    const syncBranch = (): void => {
      onBranchChange(footerData.getGitBranch());
    };

    syncBranch();
    const unsubscribe = footerData.onBranchChange(() => {
      syncBranch();
      tui.requestRender();
    });

    return {
      dispose(): void {
        unsubscribe();
      },
      invalidate() {},
      render(_width: number): string[] {
        void theme;
        void footerData;
        return [];
      },
    };
  });
}

function applyTheme(
  ctx: ExtensionContext,
  settings: VaultTecSettings,
  previousThemeName: string | undefined,
): { previousThemeName: string | undefined; warned: boolean } {
  if (!ctx.hasUI) return { previousThemeName, warned: false };

  const currentThemeName = ctx.ui.theme.name;

  if (settings.enabled && settings.autoTheme) {
    const previous = previousThemeName ?? (currentThemeName && currentThemeName !== THEME_NAME ? currentThemeName : undefined);
    const result = ctx.ui.setTheme(THEME_NAME);
    return { previousThemeName: previous, warned: !result.success };
  }

  if (previousThemeName && currentThemeName === THEME_NAME) {
    ctx.ui.setTheme(previousThemeName);
  }

  return { previousThemeName: undefined, warned: false };
}

function renderStatusSummary(settings: VaultTecSettings): string {
  const parts = SETTING_DEFS.map((item) => `${item.key}=${settings[item.key] ? "on" : "off"}`);
  return `Vault-Tec ${settings.enabled ? "enabled" : "disabled"} | ${parts.join(" | ")}`;
}

async function openSettingsDialog(
  ctx: ExtensionCommandContext,
  settings: VaultTecSettings,
  onToggle: (key: ToggleKey, value: boolean) => void,
): Promise<void> {
  if (!ctx.hasUI) return;

  await ctx.ui.custom<void>((tui, theme, _keybindings, done) => {
    const container = new Container();
    container.addChild(new Text(theme.fg("accent", theme.bold("Vault-Tec control panel")), 1, 0));
    container.addChild(new Spacer(1));

    const items: SettingItem[] = SETTING_DEFS.map((item) => ({
      id: item.key,
      label: item.label,
      description: item.description,
      currentValue: settings[item.key] ? "on" : "off",
      values: ["on", "off"],
    }));

    const settingsList = new SettingsList(
      items,
      Math.min(items.length + 2, 12),
      getSettingsListTheme(),
      (id, newValue) => {
        const key = id as ToggleKey;
        onToggle(key, newValue === "on");
        const item = items.find((candidate) => candidate.id === id);
        if (item) item.currentValue = newValue;
      },
      () => done(undefined),
      { enableSearch: false },
    );

    container.addChild(settingsList);
    container.addChild(new Spacer(1));
    container.addChild(
      new Text(theme.fg("dim", "Enter or Space toggles. Use /vault-tec save global to persist."), 1, 0),
    );

    return {
      handleInput(data: string): void {
        settingsList.handleInput?.(data);
        tui.requestRender();
      },
      invalidate(): void {
        container.invalidate();
      },
      render(width: number): string[] {
        return container.render(width);
      },
    };
  });
}

function getConfigPath(cwd: string, scope: Scope): string {
  return scope === "global" ? GLOBAL_CONFIG_PATH : join(cwd, PROJECT_CONFIG_RELATIVE_PATH);
}

export default function vaultTecExtension(pi: ExtensionAPI): void {
  let settings = { ...DEFAULT_SETTINGS };
  let turnCount = 0;
  let busy = false;
  let currentBranch: string | null = null;
  let previousThemeName: string | undefined;
  let themeWarningShown = false;

  const readThinkingLevel = (ctx: ExtensionContext): string => {
    return pi.getThinkingLevel() ?? getThinkingLevelFromSession(ctx) ?? "off";
  };

  const setCurrentBranch = (ctx: ExtensionContext, branch: string | null): void => {
    if (currentBranch === branch) return;
    currentBranch = branch;
    applyWidgets(ctx, settings, currentBranch, () => readThinkingLevel(ctx));
  };

  const refreshUi = (ctx: ExtensionContext): void => {
    if (!ctx.hasUI) return;

    const themeResult = applyTheme(ctx, settings, previousThemeName);
    previousThemeName = themeResult.previousThemeName;
    if (themeResult.warned && !themeWarningShown) {
      themeWarningShown = true;
      ctx.ui.notify("vault-tec theme could not be applied. Confirm that the package theme resources are loaded.", "warning");
    }

    applyHeader(ctx, settings);
    applyWidgets(ctx, settings, currentBranch, () => readThinkingLevel(ctx));
    applyFooter(ctx, settings, (branch) => setCurrentBranch(ctx, branch));
  };

  const persistSessionSettings = (): void => {
    pi.appendEntry(SETTINGS_ENTRY_TYPE, settings);
  };

  const updateSetting = (ctx: ExtensionContext, key: ToggleKey, value: boolean): void => {
    settings = { ...settings, [key]: value };
    persistSessionSettings();
    refreshUi(ctx);
  };

  const restoreSettings = async (ctx: ExtensionContext): Promise<void> => {
    const diskSettings = await loadDiskSettings(ctx.cwd);
    settings = getSessionSettings(ctx, diskSettings) ?? diskSettings;
  };

  pi.registerCommand("vault-tec", {
    description: "Configure the Vault-Tec theme, prompt, and telemetry.",
    handler: async (args, ctx) => {
      const tokens = args
        .trim()
        .split(/\s+/)
        .map((value) => value.trim())
        .filter(Boolean);

      if (tokens.length === 0) {
        await openSettingsDialog(ctx, settings, (key, value) => updateSetting(ctx, key, value));
        return;
      }

      const [command, second] = tokens;
      const field = KEY_ALIASES[command ?? ""];

      if (command === "on") {
        updateSetting(ctx, "enabled", true);
        ctx.ui.notify("Vault-Tec mode enabled for this session.", "info");
        return;
      }

      if (command === "off") {
        updateSetting(ctx, "enabled", false);
        ctx.ui.notify("Vault-Tec mode disabled for this session.", "info");
        return;
      }

      if (command === "reset") {
        settings = await loadDiskSettings(ctx.cwd);
        persistSessionSettings();
        refreshUi(ctx);
        ctx.ui.notify("Vault-Tec session state reset to saved configuration.", "info");
        return;
      }

      if (command === "status") {
        ctx.ui.notify(renderStatusSummary(settings), "info");
        return;
      }

      if (command === "save") {
        if (second !== "global" && second !== "project") {
          ctx.ui.notify("Use /vault-tec save global or /vault-tec save project.", "warning");
          return;
        }

        await writeSettingsFile(getConfigPath(ctx.cwd, second), settings);
        ctx.ui.notify(`Vault-Tec settings saved to ${second} scope.`, "info");
        return;
      }

      if (command === "header-title") {
        const value = args.trim().slice(command.length).trim() || "PI-BOY 3000";
        settings = { ...settings, headerTitle: value };
        persistSessionSettings();
        await writeSettingsFile(GLOBAL_CONFIG_PATH, settings);
        refreshUi(ctx);
        ctx.ui.notify(`Header title set to: ${value}`, "info");
        return;
      }

      if (command === "header-subtitle") {
        const value = args.trim().slice(command.length).trim() || "VAULT-TEC TERMINAL INTERFACE";
        settings = { ...settings, headerSubtitle: value };
        persistSessionSettings();
        await writeSettingsFile(GLOBAL_CONFIG_PATH, settings);
        refreshUi(ctx);
        ctx.ui.notify(`Header subtitle set to: ${value}`, "info");
        return;
      }

      if (field) {
        const explicitValue = second === "on" ? true : second === "off" ? false : !settings[field];
        updateSetting(ctx, field, explicitValue);
        ctx.ui.notify(`${field} ${explicitValue ? "enabled" : "disabled"} for this session.`, "info");
        return;
      }

      ctx.ui.notify("Unknown /vault-tec command. Use on, off, reset, status, save, header-title, header-subtitle, or a field name.", "warning");
    },
  });

  pi.registerCommand("vault-tec-title", {
    description: "Set the Vault-Tec header title (e.g., /vault-tec-title My Title).",
    handler: async (args, ctx) => {
      const value = args.trim() || "PI-BOY 3000";
      settings = { ...settings, headerTitle: value };
      persistSessionSettings();
      await writeSettingsFile(GLOBAL_CONFIG_PATH, settings);
      refreshUi(ctx);
      ctx.ui.notify(`Header title set to: ${value}`, "info");
    },
  });

  pi.registerCommand("vault-tec-subtitle", {
    description: "Set the Vault-Tec header subtitle (e.g., /vault-tec-subtitle My Subtitle).",
    handler: async (args, ctx) => {
      const value = args.trim() || "VAULT-TEC TERMINAL INTERFACE";
      settings = { ...settings, headerSubtitle: value };
      persistSessionSettings();
      await writeSettingsFile(GLOBAL_CONFIG_PATH, settings);
      refreshUi(ctx);
      ctx.ui.notify(`Header subtitle set to: ${value}`, "info");
    },
  });

  pi.on("session_start", async (_event, ctx) => {
    busy = false;
    turnCount = 0;
    currentBranch = null;
    themeWarningShown = false;
    await restoreSettings(ctx);
    refreshUi(ctx);
  });

  pi.on("session_tree", async (_event, ctx) => {
    await restoreSettings(ctx);
    refreshUi(ctx);
  });

  pi.on("before_agent_start", async (event) => {
    if (!settings.enabled || !settings.prompt) return;
    if (event.systemPrompt.includes(PROMPT_MARKER)) return;

    return {
      systemPrompt: `${event.systemPrompt}\n\n${PROMPT_TEXT}`,
    };
  });

  pi.on("turn_start", async (_event, ctx) => {
    busy = true;
    turnCount += 1;
    applyFooter(ctx, settings, (branch) => setCurrentBranch(ctx, branch));
  });

  pi.on("turn_end", async (_event, ctx) => {
    busy = false;
    refreshUi(ctx);
  });

  pi.on("agent_end", async (_event, ctx) => {
    busy = false;
    applyWidgets(ctx, settings, currentBranch, () => readThinkingLevel(ctx));
    applyFooter(ctx, settings, (branch) => setCurrentBranch(ctx, branch));
  });

  pi.on("model_select", async (_event, ctx) => {
    refreshUi(ctx);
  });
}
