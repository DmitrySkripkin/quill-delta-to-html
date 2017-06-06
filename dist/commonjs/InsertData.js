"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InsertData = (function () {
    function InsertData(type, value) {
        this.type = type;
        if (Object(this.value))
            this.value = value;
        else
            this.value = value + '';
    }
    return InsertData;
}());
exports.InsertData = InsertData;
;
