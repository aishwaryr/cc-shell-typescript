import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtins = ["exit", "echo", "type"];

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
