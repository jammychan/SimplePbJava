import { ProtoFile } from "./ProtoFile"

export class CodeGenerator {
    
    public generate(protoFile: ProtoFile) {
        protoFile.generateCode('.')
    }
}