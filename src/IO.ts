import * as fs from "fs";

export class IO {

    protected indent_: string = "";
    protected filepath: string = "";

    constructor(path: string) {
        this.filepath = path;
    }

    public indent() {
        this.indent_ += "  ";
    }

    public outdent() {
        if (this.indent_.length >= 2) {
            this.indent_ = this.indent_.substring(2);
        }
    }

    public print(str: string = ``) {
        let lines = str.split('\n')
        for (var line of lines) {
            line = this.indent_ + line + '\n';
            // fs write line
            fs.appendFileSync(this.filepath, line, {'flag': 'a+'});
        }
    }
}