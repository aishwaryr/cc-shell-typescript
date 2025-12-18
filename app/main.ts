import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function repl() {
  rl.question("$ ", (answer: string) => {
    if (answer === "exit") return rl.close();

    const ansArray = answer.split(" ");
    if (ansArray[0] === "echo") {
      console.log(ansArray.slice(1).join(" "));
    } else {
      console.log(answer + ": command not found");
    }
    repl();
  });
}

repl();
