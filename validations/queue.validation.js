const Joi = require("joi");


const getCommandsFromQueueValidation = Joi.object({
    query: Joi.object({
        state: Joi.string().optional(),
        scanId: Joi.string().required()
    })
});

const getCommandByIdValidation = Joi.object({
    params: Joi.object({
        id: Joi.string().required()
    })
});

const getCommandProgressByIdValidation = Joi.object({
    params: Joi.object({
        id: Joi.string().required()
    })
});

const getScanProgressByIdValidation = Joi.object({
    params: Joi.object({
        id: Joi.string().required()
    })
});

const setGlobalPriorityValidation = Joi.object({
    body: Joi.object({
        priorities: Joi.array().items(Joi.object({
            commandType: Joi.string().required(),
            priority: Joi.number().greater(-1).less(100).required()
        }))
    })
});

const stopCommandByIdValidation = Joi.object({
    params: Joi.object({
        id: Joi.string().required()
    })
});

const stopScanByIdValidation = Joi.object({
    params: Joi.object({
        id: Joi.string().required()
    })
});


module.exports = {
    getCommandsFromQueueValidation,
    getCommandByIdValidation,
    getCommandProgressByIdValidation,
    getScanProgressByIdValidation,
    setGlobalPriorityValidation,
    stopCommandByIdValidation,
    stopScanByIdValidation
}