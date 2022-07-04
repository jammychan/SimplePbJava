import { IO } from "./IO";

export class Test {
    public static testIO() {
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
}