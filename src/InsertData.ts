
import {DataType} from './value-types';

class InsertData {
    readonly type: DataType;
    readonly value: any;
    constructor(type: DataType, value: string) {
        this.type = type;
     	if (Object(this.value))
     		this.value = value;
     	else
        	this.value = value + '';
    }
};

export { InsertData };
