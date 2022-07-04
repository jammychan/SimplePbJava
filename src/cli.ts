import * as protobuf from 'protobufjs'
import { CodeGenerator } from './CodeGenerator'
import { Helper } from './Helper'
import { IO } from './IO'

(async function main() {

    // 解析参数
    var argv = require('process-argv')({single_hyphen_multioption: false})
    // console.log(JSON.stringify(argv))
    if (argv.params == null || argv.params.length <= 0) {
        printHelp()
        process.exit(1)
    }
    // todo
    // 解析pb协议。单个proto。多个proto。以文件夹方式传入，深度遍历所有proto。
    // 保证单个message的唯一性，存在冲突或者缺失的话，直接报错

    // 传入code generator生成java
    let protoParseResult = await parseProto(argv.params[0])
    console.log(JSON.stringify(protoParseResult))
    let protoFile = new Helper().toProtoFile(protoParseResult)
    new CodeGenerator().generate(protoFile)
})().catch((err: any) => {
    console.error(err)
})

function parseProto(protoPath: string) {
    console.log(protoPath)
    return new Promise(function(resolve, reject) {
        protobuf.load(protoPath, function(err, root) {
            if (err) reject(err)
            resolve(root)
        })
    })
}

function printHelp() {
    console.log(`Please input proto path or proto dir`)
}