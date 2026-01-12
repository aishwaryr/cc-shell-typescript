import fs from "node:fs";
import path from "node:path";
import { createInterface } from "readline";
import { spawnSync } from "node:child_process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtins = ["exit", "echo", "type"];

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

function repl() {
  rl.question("$ ", (answer: string) => {
    const ansArray = answer.split(" ");
    const cmd = ansArray[0];
    const arg = ansArray.slice(1).join(" ");

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

      case "echo":
        console.log(arg);
        break;

      default:
        const fullPath = findExecutable(cmd);
        if (!fullPath) {
          console.log(cmd + ": not found");
          break;
        }
        spawnSync(cmd, ansArray.slice(1), { stdio: "inherit" });

        break;
    }
    repl();
  });
}

repl();
