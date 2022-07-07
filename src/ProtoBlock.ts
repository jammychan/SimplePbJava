import { IO } from "./IO"
import { BitNameHelper } from "./BitNameHelper"
import { Template } from "./Template"
import { Field } from "./ProtoField"
import { ProtoFile } from "./ProtoFile"

export enum BLOCK_TYPE {
    ENUM = "enum",
    MESSAGE = "message",
}

export abstract class ProtoBlock {
    public name!: string
    public nestedOnes!: ProtoBlock[]
    public protoFile!: ProtoFile
    // ProtoBlock(nestedOnes: ProtoBlock[]) {
    //     this.nestedOnes = nestedOnes
    // }
    public abstract generateCode(io: IO): any

    public isMessage(): boolean {
        return false
    }

    public isEnum(): boolean {
        return false
    }

    public blockJavaClassPath(): string {
        return `${this.protoFile.java_package}.${this.protoFile.java_outer_classname}.${this.name}`
    }
}

export class MessageBlock extends ProtoBlock {
    public fields!: Field[]

    public isMessage(): boolean {
        return true
    }

    public generateCode(io: IO): any {
        io.print(`public static class ${this.name} extends`)
        io.print(`    com.mini_pbjava.GeneratedMessageLiteBase`)
        io.print(`    {`)
        io.indent()

        this.genConstructor(io)
        this.genGetDefaultInstance(io)
        this.genReadFrom(io)
        this.genPARSER(io)
        BitNameHelper.genMessageBitFieldPropertyDefinition(this, io)
        this.genFieldPropertyGetSetHas(io)
        this.genInitFields(io)
        this.genIsInitialized(io)
        this.genWriteTo(io)
        this.genGetSerializedSize(io)
        this.genParseFrom(io)
        this.genBuilderMethod(io)
        this.genMergeFrom(io)

        io.outdent()
        io.print(`}`)
    }

    protected genMergeFrom(io: IO) {
        io.print()
        io.print(`public void mergeFrom(${this.blockJavaClassPath()} other) {`)
        io.indent()
        io.print(`if (other == ${this.blockJavaClassPath()}.getDefaultInstance()) return;`)
        for (var field of this.fields) {
            field.genMergeFrom(io)    
        }
        io.outdent()
        io.print(`}`)
    }

    protected genParseFrom(io: IO) {
        io.print(Template.parse_from
            .replace(/\$messageclasspath\$/g, this.blockJavaClassPath())
            )
    }

    protected genBuilderMethod(io: IO) {
        io.print(Template.builder_method
            .replace(/\$messageclasspath\$/g, this.blockJavaClassPath())
            )
    }

    protected genGetSerializedSize(io: IO) {
        io.print()
        io.print(Template.getSerializedSize_start)
        io.indent()
        for (var field of this.fields) {
            field.genGetSerializedSize(io)
        }
        io.outdent()
        io.print(Template.getSerializedSize_end)
    }

    protected genIsInitialized(io: IO) {
        io.print()
        io.print(`private byte memoizedIsInitialized = -1;`)
        io.print(
            `public final boolean isInitialized() {` + '\n' +
            `  byte isInitialized = memoizedIsInitialized;` + '\n' +
            `  if (isInitialized != -1) return isInitialized == 1;` + '\n'
        )
        io.indent()
        for (var field of this.fields) {
            if (field.isRequired()) {
                io.print(Template.required_isInitialized.replace(/\$uppername\$/g, field.upperName()))
            }
        }
        for (var field of this.fields) {
            if (field.isMessageField()) {
                let temp = Template.optional_isInitialized_message
                if (field.isRepeated()) temp = Template.repeated_isInitialized_message
                if (field.isRequired()) temp = Template.required_isInitialized_message
                io.print(temp.replace(/\$uppername\$/g, field.upperName()))
            }
        }
        io.outdent()
        io.print(`  memoizedIsInitialized = 1;`)
        io.print(`  return true;`)
        io.print(`}`)
    }

    protected genInitFields(io: IO) {
        io.print(`private void initFields() {`)
        io.indent()
        for (var field of this.fields) {
            field.genInitDefaultValue(io)
        }
        io.outdent()
        io.print(`}`)
    }

    protected genFieldPropertyGetSetHas(io: IO) {
        for (var field of this.fields) {
            field.genPropertyGetSetHas(io)
        }
    }

    protected genPARSER(io: IO) {
        io.print()
        io.print(Template.message_PARSER.replace(/\$classname\$/g, this.name))
    }

    protected genWriteTo(io: IO) {
        io.print()
        io.print(`public void writeTo(com.google.protobuf.CodedOutputStream output)`)
        io.print(`    throws java.io.IOException {`)
        io.print(`  getSerializedSize();`)
        io.indent()
        for (var field of this.fields) {
            field.genWriteTo(io)
        }
        io.outdent()
        io.print(`}`)
    }

    protected genReadFrom(io: IO) {
        io.print()
        io.print(
            `private ${this.name}(` + '\n' + 
            `    com.google.protobuf.CodedInputStream input,` + '\n' + 
            `    com.google.protobuf.ExtensionRegistryLite extensionRegistry)` + '\n' + 
            `    throws com.google.protobuf.InvalidProtocolBufferException {` + '\n' + 
            `  initFields();`)
        io.indent()
        // gen local bitField_ for repeated rules
        BitNameHelper.genLocalBitFieldDefinition(this, io)
        // parse while part begin
        io.print(Template.read_try_catch_start)
        io.indent()
        io.indent()
        io.indent()
        // for-loop fields(handle packed option)
        for (var field of this.fields) {
            field.genReadFrom(io)
        }
        io.outdent()
        io.outdent()
        io.outdent()
        // parse while part end
        io.print(Template.read_try_catch_end)
        // finally part 
        io.outdent()
        io.print(`}`)
    }

    protected genConstructor(io: IO) {
        io.print()
        io.print(
            `private ${this.name}() {` + '\n' +  
            `  super();` + '\n' +  
            `  initFields();` + '\n' +   
            `}`)
    }

    protected genGetDefaultInstance(io: IO) {
        io.print()
        io.print(
            `public static ${this.name} getDefaultInstance() {` + '\n' +  
            `  return new ${this.name}();` + '\n' +   
            `}`
        )
    }
}

export class EnumValue {
    public name!: string
    public value!: number
}
export class EnumBlock extends ProtoBlock {
    public values!: EnumValue[]

    public isEnum(): boolean {
        return true
    }
    public generateCode(io: IO): any {
        io.print(`public enum ${this.name}`)
        io.print(`    implements com.google.protobuf.Internal.EnumLite {`)
        io.indent()
        this.genEnumValues(io)
        this.genConstInt(io)
        io.print()
        io.print(`public final int getNumber() { return value; }`)
        this.genValueOf(io)
        io.print(Template.enum_constuctor
            .replace(/\$enumname\$/g, this.name))
        io.outdent()
        io.print(`}`)
    }

    protected genValueOf(io: IO) {
        io.print()
        io.print(`public static ${this.name} valueOf(int value) {`)
        io.indent()
        io.print(`switch (value) {`)
        io.indent()
        for (var eValue of this.values) {
            io.print(`case ${eValue.value}: return ${eValue.name};`)
        }
        io.print(`default: return null;`)
        io.outdent()
        io.print(`}`)
        io.outdent()
        io.print(`}`)
    }

    protected genConstInt(io: IO) {
        for (var eValue of this.values) {
            io.print()
            io.print(`public static final int ${eValue.name}_VALUE = ${eValue.value};`)
        }
    }

    protected genEnumValues(io: IO) {
        for (var i=0; i<this.values.length; ++i) {
            io.print(`${this.values[i].name}(${i}, ${this.values[i].value}),`)
        }
    }
}