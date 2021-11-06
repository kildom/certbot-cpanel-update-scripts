
const readline = require('readline');


let rl = null;

function prompt(prompt, password) {

    if (rl === null) {
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl._writeToOutput = function _writeToOutput(stringToWrite) {
            if (rl.password)
                rl.output.write("*");
            else
                rl.output.write(stringToWrite);
        };        
    }

    return new Promise(resolve => {
        rl.question(prompt, value => {
            rl.password = false;
            resolve(value);
        });
        rl.password = !!password;
    });
}

exports.prompt = prompt;
