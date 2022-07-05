import * as fs from "fs";
import * as path from "path";
import { IO } from "./IO";
import { EnumBlock, MessageBlock, ProtoBlock } from "./ProtoBlock";

export class ProtoFile {
    public java_package!: string;
    public java_outer_classname!: string;
    public blocks!: ProtoBlock[];
    public blocksObject!: any;

    public generateCode(outputDir: string) {
        let subDirs = this.java_package.split('\.');
        let outputJavaDir = outputDir;
        for (var dir of subDirs) {
            outputJavaDir = path.join(outputJavaDir, dir);
        }
        if (!fs.existsSync(outputJavaDir)) {
            fs.mkdirSync(outputJavaDir);
        }
        let outputJavaPath = path.join(outputJavaDir, this.java_outer_classname + '.java');
        // console.log(`outputJavaDir = ${outputJavaDir}, outputJavaPath = ${outputJavaPath}`)
        
        let io = new IO(outputJavaPath);
        io.print(`package ${this.java_package};`);
        io.print();
        io.print(`public final class ${this.java_outer_classname} {`);
        io.indent();
        io.print(`private ${this.java_outer_classname}() {}`);
        
        // enum blocks
        for (var block of this.blocks) {
            if (block instanceof EnumBlock) {
                io.print()
                block.generateCode(io);
            }
        }

        // message blocks
        for (var block of this.blocks) {
            if (block instanceof MessageBlock) {
                io.print()
                block.generateCode(io);
            }
        }

        io.outdent();
        io.print(`}`);
    }
}