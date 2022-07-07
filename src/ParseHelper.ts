import { ProtoFile } from "./ProtoFile"
import { BLOCK_TYPE, EnumBlock, EnumValue, MessageBlock, ProtoBlock} from "./ProtoBlock"
import { EnumField, EnumRepeatedField, Field, FIELD_RULE, MessageField, MessageRepeatedField, ProtoField, RepeatedField, StringField, StringRepeatedField } from "./ProtoField"

export class ParseHelper {

    protected resolveAllBlocks(pathToProtoResult: any): any {
        let keyToProtoBlock: any = {}
        for (var protoResult of Object.values(pathToProtoResult)) {
            let { headerOptions, blocksObject } = this.resolveHeadOptionsAndBlocksObject(protoResult)

            let protoFile = new ProtoFile()
            protoFile.java_package = headerOptions.java_package
            protoFile.java_outer_classname = headerOptions.java_outer_classname

            // resolve all blocks, just simple information
            let keys = Object.keys(blocksObject)
            for (var key of keys) {
                let protoBlock = blocksObject[key].fields != null ? new MessageBlock(): new EnumBlock()
                protoBlock.name = key
                protoBlock.protoFile = protoFile
                if (protoBlock instanceof EnumBlock) {
                    protoBlock.values = this.enumValuesObjectToArr(blocksObject[key].values)
                }
                
                if (keyToProtoBlock[key] != null) throw new Error(`${key} define multi times.`)
                keyToProtoBlock[key] = protoBlock
            }
        }
        return keyToProtoBlock
    }

    protected resolveHeadOptionsAndBlocksObject(protoResult: any) {
        let headerOptions = null
        let blocksObject = null
        if (protoResult.options == null) {
            let protoPakcage = Object.keys(protoResult.nested)[0]
            headerOptions = protoResult.nested[protoPakcage].options
            blocksObject = protoResult.nested[protoPakcage].nested
        } else {
            headerOptions = protoResult.options
            blocksObject = protoResult.nested
        }
        return {headerOptions, blocksObject}
    }

    public toProtoFile(protoResult: any, pathToProtoResult: any) : ProtoFile {
        let keyToProtoBlock = this.resolveAllBlocks(pathToProtoResult)

        let protoFile = new ProtoFile()
        let { headerOptions, blocksObject } = this.resolveHeadOptionsAndBlocksObject(protoResult)
        protoFile.java_package = headerOptions.java_package
        protoFile.java_outer_classname = headerOptions.java_outer_classname
        protoFile.blocks = this.blocksObjectToProtoBlocks(blocksObject, keyToProtoBlock)
        protoFile.keyToProtoBlock = keyToProtoBlock
        console.log(`java_package = ${protoFile.java_package}, java_outer_classname = ${protoFile.java_outer_classname}`)
        for (var block of protoFile.blocks) {
            block.protoFile = protoFile
            console.log(`block name = ${block.name}, ${block.isMessage() ? 'Message' : 'Enum'}`)
            // if (block instanceof MessageBlock) {
            //     for (var field of block.fields) {
            //         console.log(`  ${field.seq} ${field.fieldNumber}, ${field.name} ${field.type}`)
            //     }
            // } else if (block instanceof EnumBlock) {
            //     for (var enumOne of block.values) {
            //         console.log(`  ${enumOne.name} ${enumOne.value}`)
            //     }
            // }
        }

        return protoFile
    }

    public newField(type: string, rule: string, blockTypeMap: { [s: string]: ProtoBlock }) {
        let isRepeated = rule == FIELD_RULE.REPEATED
        if (type == 'string') {
            return isRepeated ? new StringRepeatedField() : new StringField()
        }
        if (ProtoField.TYPE_MAP[type] != null) {
            // primative type
            return isRepeated ? new RepeatedField() : new Field()
        }
        if (blockTypeMap[type] == null) {
            throw new Error(`unknow type[${type}].`)
        }
        if (blockTypeMap[type].isMessage()) {
            return isRepeated ? new MessageRepeatedField() : new MessageField()
        } else {
            return isRepeated ? new EnumRepeatedField() : new EnumField()
        }
    }

    protected blocksObjectToProtoBlocks(blocksObject: any, keyToProtoBlock: any) : ProtoBlock[] {
        let protoBlocks = []
        let keys = Object.keys(blocksObject)

        for (var key of keys) {
            let block = blocksObject[key]
            if (block.fields != null) {
                // message block
                let msg = new MessageBlock()
                msg.name = key
                msg.fields = []
                let seq = 1
                for (var fieldName of Object.keys(block.fields)) {
                    let type = block.fields[fieldName].type
                    let rule = block.fields[fieldName].rule

                    let field = this.newField(type, rule, keyToProtoBlock)
                    field.seq = seq++
                    field.name = fieldName
                    field.fieldNumber = block.fields[fieldName].id
                    field.type = type
                    field.rule = rule || FIELD_RULE.OPTIONAL
                    field.options = block.fields[fieldName].options
                    field.block = msg
                    msg.fields.push(field)
                }
                protoBlocks.push(msg)
            } else {
                // enum block
                let enumBlock = new EnumBlock()
                enumBlock.name = key
                enumBlock.values = this.enumValuesObjectToArr(block.values)
                protoBlocks.push(enumBlock)
            }
        }
        return protoBlocks
    }

    protected enumValuesObjectToArr(obj: any) {
        if (null == obj) {
            return []
        }
        let arr: EnumValue[] = []
        for (var enumOneName of Object.keys(obj)) {
            arr.push({name: enumOneName, value: obj[enumOneName]})
        }
        return arr
    }
}