import fs from "node:fs";
import path from "node:path";
import { createInterface } from "readline";
import { spawnSync } from "node:child_process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtins = ["exit", "echo", "type", "pwd"];

function isExecutable(fullPath: string) {
  try {
    fs.accessSync(fullPath, fs.constants.X_OK);
    return fs.statSync(fullPath).isFile();
  } catch {
    return false;
  }
}

function findExecutable(arg: string): string | null {
  const PATH = process.env.PATH ?? "";

  for (const dir of PATH.split(path.delimiter)) {
    if (!dir) continue;

    const fullPath = path.join(dir, arg);
    if (isExecutable(fullPath)) return fullPath;
  }
  return null;
}

const NORMAL = "NORMAL" as const;
const IN_SINGLE_QUOTE = "IN_SINGLE_QUOTE" as const;
const IN_DOUBLE_QUOTE = "IN_DOUBLE_QUOTE" as const;

function parser(answer: string): string[] {
  type Mode = typeof NORMAL | typeof IN_SINGLE_QUOTE | typeof IN_DOUBLE_QUOTE;
  let mode: Mode = NORMAL;
  let current = "";
  let args = [];
  let isLiteral = false;
  for (let i = 0; i < answer.length; i++) {
    const char = answer[i];
    if (isLiteral) {
      current += char;
      isLiteral = false;
      continue;
    } else if (char === "\\" && i < answer.length - 1 && mode === NORMAL) {
      // backslash
      isLiteral = true;
      continue;
    } else if (char === "'") {
      // single quote
      if (mode === IN_DOUBLE_QUOTE) {
        current = current + "'";
      } else {
        mode = mode === NORMAL ? IN_SINGLE_QUOTE : NORMAL;
      }
    } else if (char === '"') {
      // double quote
      if (mode === IN_SINGLE_QUOTE) {
        current = current + '"';
      } else {
        mode = mode === NORMAL ? IN_DOUBLE_QUOTE : NORMAL;
      }
    } else if (char === " ") {
      // whitespace
      if (mode === NORMAL) {
        if (current.length > 0) {
          args.push(current);
          current = "";
        }
      } else if (mode === IN_SINGLE_QUOTE || mode === IN_DOUBLE_QUOTE) {
        current = current + " ";
      }
      // every other character
    } else {
      current = current + char;
    }
  }
  if (current.length > 0) {
    args.push(current);
  }
  return args;
}

function repl() {
  rl.question("$ ", (answer: string) => {
    const args = parser(answer.trim());
    const cmd = args[0];
    let arg = args.slice(1).join(" ");

    switch (cmd) {
      case "exit":
        return rl.close();

      case "type":
        if (builtins.includes(arg)) {
          console.log(arg + " is a shell builtin");
        } else {
          const fullPath = findExecutable(arg);
          if (fullPath) console.log(arg + " is " + fullPath);
          else console.log(arg + ": not found");
        }
        break;

      case "cd":
        try {
          if (arg === "~") {
            arg = process.env.HOME as string;
          }
          process.chdir(arg);
        } catch {
          console.log("cd: " + arg + ": No such file or directory");
        }
        break;

      case "pwd":
        console.log(process.cwd());
        break;

      case "echo":
        console.log(arg);
        break;

      default:
        const fullPath = findExecutable(cmd);
        if (!fullPath) {
          console.log(cmd + ": not found");
          break;
        }
        spawnSync(cmd, args.slice(1), { stdio: "inherit" });

        break;
    }
    repl();
  });
}

repl();
