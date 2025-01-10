"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const x = [1, 5, 2, 3];
console.log(x.toSorted());
app.listen(6000, () => {
    console.log("Auth microservice listning on port 300");
});
