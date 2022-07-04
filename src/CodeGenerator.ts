import { ProtoFile } from "./ProtoBlock";

export class CodeGenerator {
    
    public generate(protoFile: ProtoFile) {
        protoFile.generateCode('.');
    }
}