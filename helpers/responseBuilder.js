const responseBuilder = function (command, output, outputType="stdout", outputState="Success") {
    if (command.commandType == "sslyze") {
        return {
            id: command._id,
            orgId: command.orgId,
            scanId: command.scanId,
            scanType: command.scanType,
            commandType: command.commandType,
            domain: command.domain,
            subdomain: command.subdomain,
            output: output,
            output_type: "stdout",
            output_state: "Success"
        }
    }
    else {
        return {
            id: command._id,
            orgId: command.orgId,
            scanId: command.scanId,
            scanType: command.scanType,
            commandType: command.commandType,
            domain: command.domain,
            subdomain: command.subdomain,
            output: output,
            output_type: outputType,
            output_state: outputState
        }
    }
};


module.exports = responseBuilder;