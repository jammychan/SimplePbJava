import { ProtoFile } from "./ProtoFile"

export class CodeGenerator {
    
    public generate(protoFile: ProtoFile, javaOutDir: string) {
        protoFile.generateCode(javaOutDir)
    }
}