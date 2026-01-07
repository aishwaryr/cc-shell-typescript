import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtins = ["exit", "echo", "type"];

function repl() {
  rl.question("$ ", (answer: string) => {
    if (answer === "exit") return rl.close();

    const ansArray = answer.split(" ");

    if (ansArray[0] === "type") {
      const cmd = ansArray.slice(1).join(" ");
      if (builtins.includes(cmd)) {
        console.log(cmd + " is a shell builtin");
      } else {
        console.log("invalid_command: not found");
      }
    }

    if (ansArray[0] === "echo") {
      console.log(ansArray.slice(1).join(" "));
    } else {
      console.log(answer + ": command not found");
    }
    repl();
  });
}

repl();
