import { IO } from "./IO";

import { WireTagHelper } from "./WireTagHelper"

(async function main() {

    console.log(WireTagHelper.__builtin_clz(0x1))
    console.log(WireTagHelper.__builtin_clz(0x2))
    console.log(WireTagHelper.__builtin_clz(0x4))
    console.log(WireTagHelper.__builtin_clz(0x8))
    console.log(WireTagHelper.__builtin_clz(0x10))
    console.log(WireTagHelper.__builtin_clz(0xfffffff))
    console.log(WireTagHelper.__builtin_clz(0x1fffffff))
    console.log(WireTagHelper.__builtin_clz(0x2fffffff))
    console.log(WireTagHelper.__builtin_clz(0x4fffffff))
    console.log(WireTagHelper.__builtin_clz(0x8fffffff))
    console.log(WireTagHelper.__builtin_clz(0xffffffff))

})().catch((err: any) => {
    console.error(err)
})

function testIO() {
    let io = new IO('./tmp.txt');
    io.print('public class A {')
    io.indent()
    io.print('public s: string')
    io.indent()
    io.print('private ss: number')
    io.outdent()
    io.outdent()
    io.print('}')
}