import * as fs from "fs"
import * as path from "path"
import { IO } from "./IO"
import { EnumBlock, MessageBlock, ProtoBlock } from "./ProtoBlock"

export class ProtoFile {
    public java_package!: string
    public java_outer_classname!: string
    public blocks!: ProtoBlock[]
    public keyToProtoBlock!: {[s: string]: ProtoBlock}

    public generateCode(outputDir: string) {
        let subDirs = this.java_package.split('\.')
        let javaOutDir = outputDir
        for (var dir of subDirs) {
            javaOutDir = path.join(javaOutDir, dir)
        }
        IO.mkdir(javaOutDir)
        let javaOutPath = path.join(javaOutDir, this.java_outer_classname + '.java')
        // console.log(`javaOutDir = ${javaOutDir}, javaOutPath = ${javaOutPath}`)
        
        let io = new IO(javaOutPath)
        io.print(`package ${this.java_package};`)
        io.print()
        io.print(`public final class ${this.java_outer_classname} {`)
        io.indent()
        io.print(`private ${this.java_outer_classname}() {}`)
        
        // enum blocks
        for (var block of this.blocks) {
            if (block instanceof EnumBlock) {
                io.print()
                block.generateCode(io)
            }
        }

        // message blocks
        for (var block of this.blocks) {
            if (block instanceof MessageBlock) {
                io.print()
                block.generateCode(io)
            }
        }

        io.outdent()
        io.print(`}`)
    }
}