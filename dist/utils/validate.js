"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEntity = void 0;
const class_validator_1 = require("class-validator");
const validateEntity = async (entity) => {
    const errors = await (0, class_validator_1.validate)(entity);
    if (errors.length > 0) {
        const messages = errors
            .map((error) => Object.values(error.constraints || {}))
            .flat();
        throw new Error(messages.join(", "));
    }
};
exports.validateEntity = validateEntity;
