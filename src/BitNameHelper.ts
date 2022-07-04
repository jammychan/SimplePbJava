import { IO } from "./IO";
import { MessageBlock } from "./ProtoBlock";

export class BitNameHelper {
    public static bit_masks = [
        "0x00000001",
        "0x00000002",
        "0x00000004",
        "0x00000008",
        "0x00000010",
        "0x00000020",
        "0x00000040",
        "0x00000080",
      
        "0x00000100",
        "0x00000200",
        "0x00000400",
        "0x00000800",
        "0x00001000",
        "0x00002000",
        "0x00004000",
        "0x00008000",
      
        "0x00010000",
        "0x00020000",
        "0x00040000",
        "0x00080000",
        "0x00100000",
        "0x00200000",
        "0x00400000",
        "0x00800000",
      
        "0x01000000",
        "0x02000000",
        "0x04000000",
        "0x08000000",
        "0x10000000",
        "0x20000000",
        "0x40000000",
        "0x80000000",
    ];

    public static getBitFieldName(index: number): string {
        let varName = "bitField";
        varName += index;
        varName += "_";
        return varName;
    }

    public static getBitFieldNameForBit(bitIndex: number): string {
        return this.getBitFieldName(Math.floor(bitIndex / 32));
    }

    public static generateGetBitInternal(bitIndex: number, prefix: string = ''): string {
        let varName = prefix + this.getBitFieldNameForBit(bitIndex-1);
        let bitInVarIndex = (bitIndex-1) % 32;
      
        let mask = this.bit_masks[bitInVarIndex];
        return "((" + varName + " & " + mask + ") == " + mask + ")";
    }

    public static generateSetBitInternal(bitIndex: number, prefix: string = ''): string {
        let varName = prefix + this.getBitFieldNameForBit(bitIndex-1);
        let bitInVarIndex = (bitIndex-1) % 32;
      
        let mask = this.bit_masks[bitInVarIndex];
        return varName + " |= " + mask;
    }

    public static genLocalBitFieldDefinition(msgBlock: MessageBlock, io: IO) {
        let bitFieldMap: any = {};
        for (var field of msgBlock.fields) {
            if (field.isRepeated()) {
                // console.log(`field rule ${field.rule}`)
                let index = Math.floor(field.seq/32);
                if (bitFieldMap[`bitField${index}`] == null) {
                    bitFieldMap[`bitField${index}`] = 1;
                    io.print(`int mutable_${this.getBitFieldName(index)} = 0;`);
                }
            }
        }
    }

    public static genMessageBitFieldPropertyDefinition(msgBlock: MessageBlock, io: IO) {
        let max = 0;
        for (var field of msgBlock.fields) {
            if (field.seq > max) {
                max = field.seq;
            }
        }
        if (max > 0) {
            let bitNumber = Math.ceil(max/32);
            for (var i=0; i<bitNumber; ++i) {
                io.print(`protected int bitField${i}_;`)
            }
        }
    }
}