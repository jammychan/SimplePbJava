import { BitNameHelper } from "./BitNameHelper";
import { BLOCK_TYPE, EnumBlock, MessageBlock, ProtoBlock, ProtoFile } from "./ProtoBlock";
import { EnumField, EnumRepeatedField, Field, FIELD_RULE, MessageField, MessageRepeatedField, ProtoField, RepeatedField, StringField, StringRepeatedField } from "./ProtoField";
import { WireTagHelper } from "./WireTagHelper";

export class Helper {
    public toProtoFile(protoResult: any) : ProtoFile {
        let protoFile = new ProtoFile();
        
        let headerOptions = null;
        let blocksObject = null;
        if (protoResult.options == null) {
            let protoPakcage = Object.keys(protoResult.nested)[0];
            headerOptions = protoResult.nested[protoPakcage].options;
            blocksObject = protoResult.nested[protoPakcage].nested;
        } else {
            headerOptions = protoResult.options;
            blocksObject = protoResult.nested;
        }
        protoFile.java_package = headerOptions.java_package;
        protoFile.java_outer_classname = headerOptions.java_outer_classname;
        protoFile.blocks = this.blocksObjectToProtoBlocks(blocksObject);
        protoFile.blocksObject = blocksObject;
        console.log(`java_package = ${protoFile.java_package}, java_outer_classname = ${protoFile.java_outer_classname}`)
        for (var block of protoFile.blocks) {
            block.protoFile = protoFile;
            console.log(`block name = ${block.name}`)
            // if (block instanceof MessageBlock) {
            //     for (var field of block.fields) {
            //         console.log(`  ${field.seq} ${field.fieldNumber}, ${field.name} ${field.type} \
            //             tag=${WireTagHelper.getTag(field)}, \
            //             rawtype=${WireTagHelper.getWireMap()[field.type].rawtype}, \
            //             bitname=${BitNameHelper.GetBitFieldName(field.seq)}`)
            //     }
            // } else if (block instanceof EnumBlock) {
            //     for (var enumOne of block.values) {
            //         console.log(`  ${enumOne.name} ${enumOne.value}`)
            //     }
            // }
        }

        return protoFile;
    }

    public newField(type: string, rule: string, blockTypeMap: any) {
        let isRepeated = rule == FIELD_RULE.REPEATED;
        if (type == 'string') {
            return isRepeated ? new StringRepeatedField() : new StringField();
        }
        if (ProtoField.TYPE_MAP[type] != null) {
            // primative type
            return isRepeated ? new RepeatedField() : new Field();
        }
        if (blockTypeMap[type] == null) {
            throw new Error(`unknow type[${type}].`);
        }
        if (blockTypeMap[type] == BLOCK_TYPE.MESSAGE) {
            return isRepeated ? new MessageRepeatedField() : new MessageField();
        } else {
            return isRepeated ? new EnumRepeatedField() : new EnumField();
        }
    }

    protected blocksObjectToProtoBlocks(blocksObject: any) : ProtoBlock[] {
        let protoBlocks = [];
        let keys = Object.keys(blocksObject);

        // 记录block, 是message, 还是enum
        let blockTypeMap: any = {}
        for (var key of keys) {
            blockTypeMap[key] = blocksObject[key].fields != null ? BLOCK_TYPE.MESSAGE : BLOCK_TYPE.ENUM;
        }

        for (var key of keys) {
            let block = blocksObject[key]
            if (block.fields != null) {
                // message block
                let msg = new MessageBlock();
                msg.name = key;
                msg.fields = [];
                let seq = 1;
                for (var fieldName of Object.keys(block.fields)) {
                    let type = block.fields[fieldName].type;
                    let rule = block.fields[fieldName].rule;

                    let field = this.newField(type, rule, blockTypeMap);
                    field.seq = seq++;
                    field.name = fieldName;
                    field.fieldNumber = block.fields[fieldName].id;
                    field.type = type;
                    field.rule = rule || FIELD_RULE.OPTIONAL;
                    field.options = block.fields[fieldName].options;
                    field.block = msg;
                    msg.fields.push(field)
                }
                protoBlocks.push(msg);
            } else {
                // enum block
                let enumBlock = new EnumBlock();
                enumBlock.name = key;
                enumBlock.values = [];
                for (var enumOneName of Object.keys(block.values)) {
                    enumBlock.values.push({name: enumOneName, value: block.values[enumOneName]})
                }
                protoBlocks.push(enumBlock);
            }
        }
        return protoBlocks;
    }
}