import { CodeGenerator } from './CodeGenerator'

(async function main() {
    // protoc --proto_dir=./protos --java_out=./proto_java_old ./protos/namecard.proto
    // 解析参数、创建文件夹
    var argv = require('process-argv')({single_hyphen_multioption: false})
    // console.log(JSON.stringify(argv))
    if (argv.params == null || argv.params.length <= 0) {
        printHelp()
        process.exit(1)
    }
    let protoPath  = argv.params[0]  // only one proto file one time
    let protosDir  = argv.options && argv.options.proto_dir || null
    let javaOutDir = argv.options && argv.options.java_out || '.'

    new CodeGenerator().generate(protoPath, protosDir, javaOutDir)
})().catch((err: any) => {
    console.error(err)
})

function printHelp() {
    console.log(`Please input proto path.`)
    console.log(`eg: node ./build/cli.js --java_out ./java_out --proto_dir ./protos ./protos/name.proto`)
    console.log(`    --java_out    java source output directory.`)
    console.log(`    --proto_dir   the proto files base dir.`)
}