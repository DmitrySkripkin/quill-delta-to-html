
import { DeltaInsertOp } from './DeltaInsertOp';
import { DataType } from './value-types';
import { InsertData } from './InsertData';
import { OpAttributeSanitizer } from './OpAttributeSanitizer';
import { InsertOpDenormalizer } from './InsertOpDenormalizer';

/**
 * Converts raw delta insert ops to array of denormalized DeltaInsertOp objects 
 */
class InsertOpsConverter {

    static convert(deltaOps: any[]): DeltaInsertOp[] {

        if (!Array.isArray(deltaOps)) {
            return [];
        }

        var denormalizedOps = [].concat.apply([], 
            deltaOps.map(InsertOpDenormalizer.denormalize));
        var results: DeltaInsertOp[] = [];

        var insertVal, attributes;

        for (var op of denormalizedOps) {
            if (!op.insert) {
                continue;
            }

            insertVal = InsertOpsConverter.convertInsertVal(op.insert);
            if (!insertVal) {
                continue;
            }
            if (!op.attributes && op.insert.mention) {
                op.attributes = op.insert.mention.attributes;
            }
            if (!op.attributes && op.insert.file) {
                op.attributes = op.insert.file.attributes;
            }
            attributes =  OpAttributeSanitizer.sanitize(op.attributes);
            
            results.push(new DeltaInsertOp(insertVal, attributes));
        }
        return results;
    }

    static convertInsertVal(insertPropVal: any): InsertData | null {
        if (typeof insertPropVal === 'string') {
            return new InsertData(DataType.Text, insertPropVal);
        }

        if (!insertPropVal || typeof insertPropVal !== 'object') {
            return null;
        }

        return DataType.Image in insertPropVal ?
            new InsertData(DataType.Image, insertPropVal[DataType.Image])
            : DataType.Video in insertPropVal ?
                new InsertData(DataType.Video, insertPropVal[DataType.Video])
                    : DataType.Mention in insertPropVal ?
                    new InsertData(DataType.Mention, insertPropVal[DataType.Mention])
                        : DataType.File in insertPropVal ?
                        new InsertData(DataType.File, insertPropVal[DataType.File])
                            : DataType.Formula in insertPropVal ?
                                    new InsertData(DataType.Formula, insertPropVal[DataType.Formula])
                                    : null;
    }
}

export { InsertOpsConverter }