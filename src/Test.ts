import { IO } from "./IO";
import { WireTagHelper } from "./WireTagHelper"

(async function main() {
    assert(WireTagHelper.__builtin_clz(0x1), 31)
    assert(WireTagHelper.__builtin_clz(0x2), 30)
    assert(WireTagHelper.__builtin_clz(0x4), 29)
    assert(WireTagHelper.__builtin_clz(0x8), 28)
    assert(WireTagHelper.__builtin_clz(0x10), 27)
    assert(WireTagHelper.__builtin_clz(0xfffffff), 4)
    assert(WireTagHelper.__builtin_clz(0x1fffffff), 3)
    assert(WireTagHelper.__builtin_clz(0x2fffffff), 2)
    assert(WireTagHelper.__builtin_clz(0x4fffffff), 1)
    assert(WireTagHelper.__builtin_clz(0x8fffffff), 0)
    assert(WireTagHelper.__builtin_clz(0xffffffff), 1)
    
    let tmp = 50;
    while (tmp < 1000*1000*1000) {
        assert(WireTagHelper.getTagSizeFromComplier(tmp), WireTagHelper.getTagSizeFromJava(tmp), tmp+'')
        tmp += 10000;
    }
    console.log(Math.floor(tmp/10000))

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

function assert(a, b, title='') {
    if (a !== b) {
        throw new Error(`${title} [${a}] [${b}] not equal`)
    }
}