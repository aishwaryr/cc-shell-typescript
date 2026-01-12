import fs from "node:fs";
import path from "node:path";
import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtins = ["exit", "echo", "type"];

function isExecutable(fullPath: string) {
  try {
    fs.accessSync(fullPath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function findExecutable(arg: string) {
  const PATH = process.env.PATH ?? "";
  console.log(PATH);
  for (const dir of PATH.split(path.delimiter)) {
    const fullPath = path.join(dir, arg);

    if (isExecutable(fullPath)) {
      return fullPath;
    }
  }
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
          findExecutable(arg);
          console.log(arg + ": not found");
        }
        break;

      case "echo":
        console.log(arg);
        break;

      default:
        console.log(answer + ": command not found");
        break;
    }
    repl();
  });
}

repl();
