const fs = require("node:fs/promises");
const { createReadStream, unlinkSync } = require("node:fs");

const parserService = require("../services/parser/parser.service");
const responseBuilder = require("../helpers/responseBuilder");

const filesDir = process.env.TOOLS_DIR;

const getParsedOutput = async (command, data = null) => {

    if (data) {
        response = responseBuilder(command, data, "stdout", "Success");

        response = parserService.parseOutput(response);

        return response;
    }

    let subdomain;
    let filePath;
    let output = '';

    subdomain = (command.subdomain.split("/")).pop();
    commandType = command.commandType;

    filePath = `${filesDir}/${subdomain}_${commandType}`;

    console.log("Reading the file : " + filePath);

    try {
        // Check if the file exists and can be read.
        await fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK);

        console.log("[+] PASS ACCESS CHECK");

        // Use a Promise to handle the asynchronous read stream
        output = await new Promise((resolve, reject) => {
            const readStream = createReadStream(filePath);
            let result = '';

            readStream.on("data", (chunk) => {
                result += Buffer.from(chunk).toString('utf8');
            });

            readStream.on("end", () => {
                try {
                    unlinkSync(filePath);
                    resolve(result);
                }
                catch(error) {
                    console.log(error);
                    resolve(result);
                }
            });

            readStream.on("error", (err) => {
                console.log(err);
                reject(err);
            });
        });

        let outputType = output ? "stdout" : "stderr";
        let outputState = output ? "Success" : "Error";
        let response;
	
        if (!output) {
            response = responseBuilder(command, "Nothing found", outputType, outputState);
        }
        else {
            response = responseBuilder(command, output, outputType, outputState);
        }

        // parse the response
        response = parserService.parseOutput(response);

        return response;
    } catch (error) {
        console.log(error);

        response = responseBuilder(command, "Nothing found", "stderr", "Error");

        response = parserService.parseOutput(response);

        return response;
    }
}


module.exports = getParsedOutput;
