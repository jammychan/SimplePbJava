import * as protobuf from 'protobufjs'
import { CodeGenerator } from './CodeGenerator'
import { ParseHelper } from './ParseHelper'
import { IO } from './IO'

(async function main() {

    // protoc --proto_path=./protos --java_out=./proto_java_old ./protos/namecard.proto
    // 解析参数、创建文件夹
    var argv = require('process-argv')({single_hyphen_multioption: false})
    // console.log(JSON.stringify(argv))
    if (argv.params == null || argv.params.length <= 0) {
        printHelp()
        process.exit(1)
    }
    let javaOutDir = argv.options && argv.options.java_out || '.'
    IO.mkdir(javaOutDir)
    let protosDir  = argv.options && argv.options.proto_path || null

    // 把protobufjs解析的json,转换成ProtoFile
    let pathToProtoResult: any = {}
    parseCurProto(argv.params, protosDir, pathToProtoResult)
    // console.log(JSON.stringify(pathToProtoResult))
    let protoFile = new ParseHelper().toProtoFile(pathToProtoResult[argv.params], pathToProtoResult)

    // 传入code generator生成java
    new CodeGenerator().generate(protoFile, javaOutDir)
})().catch((err: any) => {
    console.error(err)
})

function parseCurProto(protoPath: string, protosDir: string, pathToProtoResult: any) {
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
        parseCurProto(path, protosDir, pathToProtoResult)
    }
}

function printHelp() {
    console.log(`Please input proto path.`)
}