import * as protobuf from 'protobufjs'
import { IO } from "./IO"
import { ParseHelper } from './ParseHelper'


export class CodeGenerator {
    
    public generate(protoPath: string, protosDir: string, javaOutDir: string) {
        IO.mkdir(javaOutDir)

        // 把protobufjs解析的json,转换成ProtoFile
        let pathToProtoResult: any = {}
        this.parseCurProto(protoPath, protosDir, pathToProtoResult)
        // console.log(JSON.stringify(pathToProtoResult))
        let protoFile = new ParseHelper().toProtoFile(pathToProtoResult[protoPath], pathToProtoResult)
        
        // generate java source codee
        protoFile.generateCode(javaOutDir)
        console.log(`generate code finished.`)
    }

    protected parseCurProto(protoPath: string, protosDir: string, pathToProtoResult: any, depth: number = 0) {
        if (depth > 1) {
            // A import B, B import C, C import D, just parse A/B, abandon C/D
            return
        }
        if (pathToProtoResult[protoPath] != null) {
            return
        }
        const root = new protobuf.Root()
        let importedPaths: string[] = []
        root.resolvePath = function(origin, target) {
            // origin is the path of the importing file
            // target is the path of the imported file in origin
            // ... determine absolute path and return it ...
            let ret: string | null = ''
            if (origin == null || origin.length == 0 || protosDir == null) {
                ret = protoPath == target ? target : null
            } else {
                // 引用的proto不解析, 只记录好路劲
                let importedPath = `${protosDir}/${target}`
                importedPaths.push(importedPath)
                
                ret = null
            }
            // console.log(`origin=${origin}, target=${target}, ret=${ret}`)
            return ret
        }
        let parseResult = root.loadSync(protoPath)
        pathToProtoResult[protoPath] = parseResult
        for (var path of importedPaths) {
            this.parseCurProto(path, protosDir, pathToProtoResult, depth+1)
        }
    }
}