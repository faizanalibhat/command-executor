const Result = require("../models/result.model");


const store = async (data) => {
    try {
        if (!Array.isArray(data)) {
            return { status: 'failed', message: "Data is not an Array."};
        }

        const stored = await Result.create(data);

        return stored;
    }
    catch(error) {
        console.log(error);
        return { status: 'failed', message: "Failed to store data." };
    }
}


const get = async () => {
    try {
        const commandTypes = ['subfinder', 'dig', 'api', 'nmap', 'httpx', 'tlsscan', 'ip_info'];
        const response = {};

        for (const commandType of commandTypes) {
             let data = await Result.find({ commandType }).lean();

            if (data.length) {
                let ids = data.map(entry => entry._id);
                
                await Result.deleteMany({ _id: { $in: ids } });

                response[commandType] = data;
            }
        }

        return response;
    } catch (error) {
        console.error('Error in get function:', error);
        return {};
    }
};


const isempty = async () => {
    try {
        const count = await Result.countDocuments({});

        return count == 0 ? true : false;
    }
    catch(error) {
        console.log(error);
        return true;
    }
}


module.exports = {
    store,
    get,
    isempty
}