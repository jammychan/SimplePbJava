import { BitNameHelper } from "./BitNameHelper";
import { IO } from "./IO";
import { ProtoBlock } from "./ProtoBlock";
import { Template } from "./Template";
import { WireTagHelper } from "./WireTagHelper";

export class ProtoField {
    public static DEFAULT_VALUE: any = {
        "double": "0D",
        "float": "0F",
        "int64": "0L",
        "uint64": "0L",
        "int32": "0",
        "fixed64": "0L",
        "fixed32": "0",
        "bool": "false",
        "string": "\"\"",
        "bytes": "com.google.protobuf.ByteString.EMPTY",
        "uint32": "0",
        "sfixed32": "0",
        "sfixed64": "0L",
        "sint32": "0",
        "sint64": "0L",
    }
    public static TYPE_MAP: any = {
        "double": {for_compute: 0, datasize: 8, iotype: "Double",   rawtype:"double",    javatype:"java.lang.Double"},
        "float" : {for_compute: 0, datasize: 4, iotype: "Float",    rawtype:"float",     javatype:"java.lang.Float"},
        "int64" : {for_compute: 1, datasize: 8, iotype: "Int64",    rawtype:"long",      javatype:"java.lang.Long"},
        "uint64": {for_compute: 1, datasize: 8, iotype: "UInt64",   rawtype:"long",      javatype:"java.lang.Long"},
        "int32" : {for_compute: 1, datasize: 4, iotype: "Int32",    rawtype:"int",       javatype:"java.lang.Integer"},
        "fixed64":{for_compute: 0, datasize: 8, iotype: "Fixed64",  rawtype:"long",      javatype:"java.lang.Long"},
        "fixed32":{for_compute: 0, datasize: 4, iotype: "Fixed32",  rawtype:"int",       javatype:"java.lang.Integer"},
        "bool"  : {for_compute: 0, datasize: 1, iotype: "Bool",     rawtype:"boolean",   javatype:"java.lang.Boolean"},
        "string": {for_compute: 0, datasize: 0, iotype: "Bytes",    rawtype:"java.lang.String",                   javatype:"java.lang.String"},
        "bytes" : {for_compute: 1, datasize: 0, iotype: "Bytes",    rawtype:"com.google.protobuf.ByteString",     javatype:"com.google.protobuf.ByteString"},
        "uint32": {for_compute: 1, datasize: 4, iotype: "UInt32",   rawtype:"int",       javatype:"java.lang.Integer"},
        "sfixed32":{for_compute:0, datasize: 4, iotype:"SFixed32",  rawtype:"int",       javatype:"java.lang.Integer"},
        "sfixed64":{for_compute:0, datasize: 8, iotype:"SFixed64",  rawtype:"long",      javatype:"java.lang.Long"},
        "sint32": {for_compute: 1, datasize: 4, iotype: "SInt32",   rawtype:"int",       javatype:"java.lang.Integer"},
        "sint64": {for_compute: 1, datasize: 8, iotype: "SInt64",   rawtype:"long",      javatype:"java.lang.Long"},
    }
}

export class Field {
    public block!: ProtoBlock;
    public seq!: number;         // 按顺序，1/2/3/4。。。增加
    public name!: string;
    public fieldNumber!: number; // proto文件上，各字段后面的值定义
    public type!: string;
    public rule!: string;        // required/optional/repeated...
    public options!: any;        // packed/default

    public genGetSerializedSize(io: IO) {
        let iotype = this.ioType();
        let getNumberCall = this.isEnumField() ? ".getNumber()" : "";
        io.print(`if (${BitNameHelper.generateGetBitInternal(this.seq)}) {`)
        io.print(`  size += com.google.protobuf.CodedOutputStream`)
        io.print(`    .compute${iotype}Size(${this.fieldNumber}, ${this.propertyName()}${getNumberCall});`)
        io.print(`}`)
    }

    public genReadFrom(io: IO) {
        let tag = WireTagHelper.getTag(this);
        let iotype = this.ioType();
        io.print(`case ${tag}: {`);
        io.indent();
        // console.log(`${this.name} ${this.rank} ${BitNameHelper.GenerateSetBitInternal(this.rank)}`)
        io.print(BitNameHelper.generateSetBitInternal(this.seq) + ';');
        io.print(`${this.propertyName()} = input.read${iotype}();`)
        io.print(`break;`)
        io.outdent();
        io.print(`}`);
    }

    public rawType() {
        if (this.isMessageField() || this.isEnumField()) {
            return this.getTypeClass()
        }
        return ProtoField.TYPE_MAP[this.type].rawtype;
    }

    public javaType() {
        if (this.isMessageField() || this.isEnumField()) {
            return this.getTypeClass()
        }
        return ProtoField.TYPE_MAP[this.type].javatype;
    }

    public ioType() {
        if (this.isMessageField() || this.isEnumField()) {
            return this.getTypeClass()
        }
        return ProtoField.TYPE_MAP[this.type].iotype
    }

    public genPropertyGetSetHas(io: IO) {
        let UpName = this.upperName();
        let rawtype = this.rawType();
        io.print();
        io.print(`protected ${rawtype} ${this.propertyName()};`)
        io.print(`public boolean has${UpName}() {`);
        io.print(`  return ${BitNameHelper.generateGetBitInternal(this.seq)};`);
        io.print(`}`);
        
        io.print(`public ${rawtype} get${UpName}() {`);
        io.print(`  return ${this.propertyName()};`);
        io.print(`}`);

        io.print(`public ${this.block.name} set${UpName}(${rawtype} value) {`);
        if (this.type == 'bytes' || this.isEnumField() || this.isMessageField()) {
            io.indent()
            io.print(Template.throw_null_ex)
            io.outdent()
        }
        io.print(`  ${BitNameHelper.generateSetBitInternal(this.seq)};`);
        io.print(`  ${this.propertyName()} = value;`);
        io.print(`  return this;`);
        io.print(`}`);
    }

    public propertyName(): string {
        return Field.underline2CamelCase(this.name) + "_";
    }
    public upperName(): string {
        return Field.underline2CamelCase(this.name, true)
    }

    public static underline2CamelCase(word: string, isFirstLetterUpperCase: boolean = false): string {
        let isDebug = false;
        if (isDebug) console.log(word)
        if (word == null || word.length == 0) {
            return "";
        }
        let ss = word.split("_");
        if (ss.length == 0) {
            return "";
        }
        if (isFirstLetterUpperCase) {
            let c = ss[0].charAt(0);
            if ('z' >= c && c >= 'a') {
                ss[0] = c.toLocaleUpperCase() + ss[0].substring(1);
            }
        }
        let ret = ss[0];
        ss.splice(0, 1);
        for (var s of ss) {
            if (s.length == 0) continue
            let c = s.charAt(0);
            if ('z' >= c && c >= 'a') {
                ret += c.toLocaleUpperCase() + s.substring(1);
            } else {
                ret += s;
            }
        }
        if (isDebug) console.log(ret)
        return ret;
    }

    public isRequired() {
        return this.rule == FIELD_RULE.REQUIRED
    }

    public isRepeated() {
        return this.rule == FIELD_RULE.REPEATED;
    }

    public isMessageField() {
        return false;
    }

    public isEnumField() {
        return false;
    }

    public getTypeClass(): string {
        return this.isMessageField() || this.isEnumField() 
            ? `${this.block.protoFile.java_package}.${this.block.protoFile.java_outer_classname}.${this.type}` 
            : "";
    }

    public genWriteTo(io: IO) {
        let iotype = this.ioType()
        let getNumberCall = this.isEnumField() ? ".getNumber()" : "";
        io.print(`if (${BitNameHelper.generateGetBitInternal(this.seq)}) {`)
        io.print(`  output.write${iotype}(${this.fieldNumber}, ${this.propertyName()}${getNumberCall});`)
        io.print(`}`)
    }

    protected genDefaultValue() {
        return ProtoField.DEFAULT_VALUE[this.type]
    }

    public genInitDefaultValue(io: IO) {
        let defValue = (this.options != null && this.options.default != null) 
                ? this.options.default 
                : this.genDefaultValue();
        io.print(`${this.propertyName()} = ${defValue};`)
    }
}

export class StringField extends Field {
    public genPropertyGetSetHas(io: IO) {
        let UpName = this.upperName();
        io.print();
        io.print(`protected java.lang.Object ${this.propertyName()};`)
        io.print(`public boolean has${UpName}() {`);
        io.print(`  return ${BitNameHelper.generateGetBitInternal(this.seq)};`);
        io.print(`}`);
        
        io.print(`public ${this.block.name} set${UpName}(`);
        io.print(`    java.lang.String value) {`)
        io.indent()
        io.print(Template.throw_null_ex)
        io.outdent()
        io.print(`  ${BitNameHelper.generateSetBitInternal(this.seq)};`);
        io.print(`  ${this.propertyName()} = value;`);
        io.print(`  return this;`);
        io.print(`}`);

        io.print(Template.get_string1
            .replace(/\$uppername\$/g, this.upperName())
            .replace(/\$propertyname\$/g, this.propertyName()));
        io.print(Template.get_string2
            .replace(/\$uppername\$/g, this.upperName())
            .replace(/\$propertyname\$/g, this.propertyName()))
    }

    public genWriteTo(io: IO) {
        let iotype = this.ioType()
        io.print(`if (${BitNameHelper.generateGetBitInternal(this.seq)}) {`)
        io.print(`  output.write${iotype}(${this.fieldNumber}, get${this.upperName()}Bytes());`)
        io.print(`}`)
    }

    public genGetSerializedSize(io: IO) {
        io.print(`if (${BitNameHelper.generateGetBitInternal(this.seq)}) {`)
        io.print(`  size += com.google.protobuf.CodedOutputStream`)
        io.print(`    .computeBytesSize(${this.fieldNumber}, get${this.upperName()}Bytes());`)
        io.print(`}`)
    }

    public genInitDefaultValue(io: IO) {
        let defValue = (this.options != null && this.options.default != null) 
                ? this.options.default 
                : this.genDefaultValue();
        io.print(`${this.propertyName()} = "${defValue}";`)
    }
}

export class MessageField extends Field {

    public isMessageField() {
        return true;
    }

    public genReadFrom(io: IO) {
        let tag = WireTagHelper.getTag(this);
        io.print(`case ${tag}: {`);
        io.indent();
        io.print(`${this.propertyName()} = input.readMessage(${this.getTypeClass()}.PARSER, extensionRegistry);`)
        io.print(BitNameHelper.generateSetBitInternal(this.seq) + ';');
        io.print(`break;`)
        io.outdent();
        io.print(`}`);
    }

    // public genPropertyGetSetHas(io: IO) {
    //     let UpName = this.upperName();
    //     let fieldTeyp = this.getTypeClass();
    //     io.print();
    //     io.print(`protected ${this.getTypeClass()} ${this.propertyName()};`)

    //     io.print(`public ${this.block.name} set${UpName}(${fieldTeyp} value) {`);
    //     io.indent()
    //     io.print(Template.throw_null_ex1)
    //     io.outdent()
    //     io.print(`  ${this.propertyName()} = value;`);
    //     io.print(`  ${BitNameHelper.generateSetBitInternal(this.seq)};`);
    //     io.print(`  return this;`);
    //     io.print(`}`);

    //     io.print(`public boolean has${UpName}() {`);
    //     io.print(`  return ${BitNameHelper.generateGetBitInternal(this.seq)};`);
    //     io.print(`}`);
        
    //     io.print(`public ${fieldTeyp} get${UpName}() {`);
    //     io.print(`  return ${this.propertyName()};`);
    //     io.print(`}`);
    // }

    protected genDefaultValue() {
        return `${this.getTypeClass()}.getDefaultInstance()`
    }

    public ioType() {
        return "Message";
    }

    // public genWriteTo(io: IO) {
    //     io.print(`if (${BitNameHelper.generateGetBitInternal(this.seq)}) {`)
    //     io.print(`  output.writeMessage(${this.fieldNumber}, ${this.propertyName()});`)
    //     io.print(`}`)
    // }

    // public genGetSerializedSize(io: IO) {
    //     io.print(`if (${BitNameHelper.generateGetBitInternal(this.seq)}) {`)
    //     io.print(`  size += com.google.protobuf.CodedOutputStream`)
    //     io.print(`    .computeMessageSize(${this.fieldNumber}, ${this.propertyName()});`)
    //     io.print(`}`)
    // }
}

export class EnumField extends Field {

    public genReadFrom(io: IO) {
        let tag = WireTagHelper.getTag(this);
        io.print(`case ${tag}: {`);
        io.indent();
        io.print(Template.enum_read_value.replace(/\$enumname\$/g, this.getTypeClass()))
        io.print(`  ${BitNameHelper.generateSetBitInternal(this.seq)};`)
        io.print(`  ${this.propertyName()} = value;`)
        io.print(`}`)
        io.print(`break;`)
        io.outdent();
        io.print(`}`);
    }

    protected genDefaultValue() {
        let enumBlock = this.block.protoFile.blocksObject[this.type];
        if (null == enumBlock || null == enumBlock.values) {
            throw new Error(`unknow enum type[${this.type}].`);
        }
        let keys = Object.keys(enumBlock.values);
        if (keys.length <= 0) {
            throw new Error(`enum type[${this.type}], not has enum values.`);
        }
        let firstOneEnumValue = keys[0];
        return `${this.getTypeClass()}.${firstOneEnumValue}`;
    }

    public genInitDefaultValue(io: IO) {
        let defValue = (this.options != null && this.options.default != null) 
                ? `${this.getTypeClass()}.${this.options.default}` 
                : this.genDefaultValue();
        io.print(`${this.propertyName()} = ${defValue};`)
    }

    public ioType() {
        return "Enum";
    }

    public isEnumField() {
        return true;
    }
}

export class RepeatedField extends Field {
    public genReadFrom(io: IO) {
        let tag = WireTagHelper.getTag(this);
        let iotype = this.ioType();
        let javatype = this.javaType();
        //packed = false
        io.print(`case ${tag}: {`);
        io.indent();
        io.print(`if (!${BitNameHelper.generateGetBitInternal(this.seq, "mutable_")}) {`);
        io.print(`  ${this.propertyName()} = new java.util.ArrayList<${javatype}>();`);
        io.print(`  ${BitNameHelper.generateSetBitInternal(this.seq, "mutable_")};`);
        io.print(`}`)
        io.print(`${this.propertyName()}.add(input.read${iotype}());`)
        io.print(`break;`)
        io.outdent();
        io.print(`}`);

        if (this.type != 'bytes') {
            // packed = true
            tag = WireTagHelper.getRepeatedPackedTag(this);
            io.print(`case ${tag}: {`);
            io.indent();
            io.print(
                `int length = input.readRawVarint32();` + '\n' + 
                `int limit = input.pushLimit(length);`
            );
            io.print(`if (!${BitNameHelper.generateGetBitInternal(this.seq, "mutable_")} && input.getBytesUntilLimit() > 0) {`);
            io.print(`  ${this.propertyName()} = new java.util.ArrayList<${javatype}>();`);
            io.print(`  ${BitNameHelper.generateSetBitInternal(this.seq, "mutable_")};`);
            io.print(`}`)
            io.print(`while (input.getBytesUntilLimit() > 0) {`)
            io.print(`  ${this.propertyName()}.add(input.read${iotype}());`)
            io.print(`}`)
            io.print(`input.popLimit(limit);`);
            io.print(`break;`)
            io.outdent();
            io.print(`}`);
        }
    }

    public genPropertyGetSetHas(io: IO) {
        let UpName = this.upperName();
        let javatype = this.javaType()
        let rawtype = this.rawType()
        io.print();
        io.print(`protected java.util.List<${javatype}> ${this.propertyName()};`)
        io.print(`public java.util.List<${javatype}> get${UpName}List() {`)
        io.print(`  return ${this.propertyName()};`);
        io.print(`}`);

        let listType = (this.isMessageField() || this.isEnumField()) ? `java.util.Collection` : `java.lang.Iterable`;
        io.print(`public ${this.block.name} addAll${UpName}(`)
        io.print(`    ${listType}<? extends ${javatype}> values) {`)
        io.print(`  ensure${UpName}IsMutable();`)
        io.print(`  ${this.propertyName()}.addAll(values);`)
        io.print(`  return this;`)
        io.print(`}`)

        io.print(`public ${this.block.name} add${UpName}(${rawtype} value) {`)
        if (this.type == 'bytes' || this.isMessageField() || this.isEnumField()) {
            io.indent()
            io.print(Template.throw_null_ex)
            io.outdent()
        }
        io.print(`  ensure${UpName}IsMutable();`)
        io.print(`  ${this.propertyName()}.add(value);`)
        io.print(`  return this;`)
        io.print(`}`)

        io.print(`private void ensure${UpName}IsMutable() {`)
        io.print(`  if (!${BitNameHelper.generateGetBitInternal(this.seq)}) {`)
        io.print(`    ${this.propertyName()} = new java.util.ArrayList<${javatype}>(${this.propertyName()});`)
        io.print(`    ${BitNameHelper.generateSetBitInternal(this.seq)};`)
        io.print(`  }`)
        io.print(`}`)

        io.print(`public int get${UpName}Count() {`)
        io.print(`  return ${this.propertyName()}.size();`)
        io.print(`}`)
        
        io.print(`public ${rawtype} get${UpName}(int index) {`)
        io.print(`  return ${this.propertyName()}.get(index);`)
        io.print(`}`)
    }

    public genWriteTo(io: IO) {
        let iotype = this.ioType()
        let getNumberCall = this.isEnumField() ? ".getNumber()" : "";
        io.print(`for (int i = 0; i < ${this.propertyName()}.size(); i++) {`)
        io.print(`  output.write${iotype}(${this.fieldNumber}, ${this.propertyName()}.get(i)${getNumberCall});`)
        io.print(`}`)
    }

    public genGetSerializedSize(io: IO) {
        if (ProtoField.TYPE_MAP[this.type].for_compute == 1)  {
            io.print(Template.repeated_serialized_for_compute_size
                .replace(/\$uppername\$/g, this.upperName())
                .replace(/\$propertyname\$/g, this.propertyName())
                .replace(/\$iotype\$/g, this.ioType()))
        } else {
            io.print(Template.repeated_serialized_size
                .replace(/\$uppername\$/g, this.upperName())
                .replace(/\$datasize\$/g, ProtoField.TYPE_MAP[this.type].datasize+''))
        }
        if (ProtoField.TYPE_MAP[this.type]) {
        }
    }

    protected genDefaultValue() {
        return `java.util.Collections.emptyList()`;
    }
}

export class StringRepeatedField extends RepeatedField {
    public genReadFrom(io: IO) {
        let tag = WireTagHelper.getTag(this);
        let iotype = this.ioType();
        let javatype = this.javaType();
        io.print(`case ${tag}: {`);
        io.indent();
        io.print(`if (!${BitNameHelper.generateGetBitInternal(this.seq, "mutable_")}) {`);
        io.print(`  ${this.propertyName()} = new com.google.protobuf.LazyStringArrayList();`);
        io.print(`  ${BitNameHelper.generateSetBitInternal(this.seq, "mutable_")};`);
        io.print(`}`)
        io.print(`${this.propertyName()}.add(input.read${iotype}());`)
        io.print(`break;`)
        io.outdent();
        io.print(`}`);
    }

    public genWriteTo(io: IO) {
        let iotype = this.ioType()
        io.print(`for (int i = 0; i < ${this.propertyName()}.size(); i++) {`)
        io.print(`  output.write${iotype}(${this.fieldNumber}, ${this.propertyName()}.getByteString(i));`)
        io.print(`}`)
    }

    public genGetSerializedSize(io: IO) {
        io.print(Template.repeated_string_serialized_size
            .replace(/\$uppername\$/g, this.upperName())
            .replace(/\$propertyname\$/g, this.propertyName()))
    }

    public genPropertyGetSetHas(io: IO) {
        let UpName = this.upperName();
        let javatype = this.javaType();
        let rawtype = this.rawType();
        io.print();
        io.print(`protected com.google.protobuf.LazyStringList ${this.propertyName()};`)
        io.print(`public java.util.List<${javatype}>`)
        io.print(`    get${UpName}List() {`)
        io.print(`  return ${this.propertyName()};`);
        io.print(`}`);

        io.print(`public int get${UpName}Count() {`)
        io.print(`  return ${this.propertyName()}.size();`)
        io.print(`}`)

        io.print(`public ${rawtype} get${UpName}(int index) {`)
        io.print(`  return ${this.propertyName()}.get(index);`)
        io.print(`}`)
        io.print(`public com.google.protobuf.ByteString`)
        io.print(`    get${UpName}Bytes(int index) {`)
        io.print(`  return ${this.propertyName()}.getByteString(index);`)
        io.print(`}`)

        io.print(`public ${this.block.name} addAll${UpName}(`)
        io.print(`    java.lang.Iterable<${javatype}> values) {`)
        io.print(`  ensure${UpName}IsMutable();`)
        io.print(`  ${this.propertyName()}.addAll(values);`)
        io.print(`  return this;`)
        io.print(`}`)

        io.print(`public ${this.block.name} add${UpName}(`)
        io.print(`    ${rawtype} value) {`)
        io.indent()
        io.print(Template.throw_null_ex)
        io.outdent()
        io.print(`  ensure${UpName}IsMutable();`)
        io.print(`  ${this.propertyName()}.add(value);`)
        io.print(`  return this;`)
        io.print(`}`)

        io.print(`private void ensure${UpName}IsMutable() {`)
        io.print(`  if (!${BitNameHelper.generateGetBitInternal(this.seq)}) {`)
        io.print(`    ${this.propertyName()} = new com.google.protobuf.LazyStringArrayList(${this.propertyName()});`)
        io.print(`    ${BitNameHelper.generateSetBitInternal(this.seq)};`)
        io.print(`  }`)
        io.print(`}`)
    }

    protected genDefaultValue(): string {
        return `com.google.protobuf.LazyStringArrayList.EMPTY`;        
    }
}

export class MessageRepeatedField extends RepeatedField {
    public genReadFrom(io: IO) {
        let tag = WireTagHelper.getTag(this);
        io.print(`case ${tag}: {`);
        io.indent();
        io.print(`if (!${BitNameHelper.generateGetBitInternal(this.seq, "mutable_")}) {`);
        io.print(`  ${this.propertyName()} = new java.util.ArrayList<${this.getTypeClass()}>();`);
        io.print(`  ${BitNameHelper.generateSetBitInternal(this.seq, "mutable_")};`);
        io.print(`}`)
        io.print(`${this.propertyName()}.add(input.readMessage(${this.getTypeClass()}.PARSER, extensionRegistry));`)
        io.print(`break;`)
        io.outdent();
        io.print(`}`);
    }

    public genPropertyGetSetHas(io: IO) {
        let UpName = this.upperName();
        io.print();
        io.print(`protected java.util.List<${this.getTypeClass()}> ${this.propertyName()};`)

        io.print(`public java.util.List<${this.getTypeClass()}> get${UpName}List() {`)
        io.print(`  return ${this.propertyName()};`);
        io.print(`}`);

        io.print(`public int get${UpName}Count() {`)
        io.print(`  return ${this.propertyName()}.size();`)
        io.print(`}`)

        io.print(`public ${this.getTypeClass()} get${UpName}(int index) {`)
        io.print(`  return ${this.propertyName()}.get(index);`)
        io.print(`}`)

        io.print(`public ${this.block.name} add${UpName}(${this.getTypeClass()} value) {`)
        io.indent()
        io.print(Template.throw_null_ex)
        io.outdent()
        io.print(`  ensure${UpName}IsMutable();`)
        io.print(`  ${this.propertyName()}.add(value);`)
        io.print(`  return this;`)
        io.print(`}`)

        io.print(`public ${this.block.name} addAll${UpName}(`)
        io.print(`    java.util.Collection<? extends ${this.getTypeClass()}> values) {`)
        io.print(`  ensure${UpName}IsMutable();`)
        io.print(`  ${this.propertyName()}.addAll(values);`)
        io.print(`  return this;`)
        io.print(`}`)

        io.print(`private void ensure${UpName}IsMutable() {`)
        io.print(`  if (!${BitNameHelper.generateGetBitInternal(this.seq)}) {`)
        io.print(`    ${this.propertyName()} = new java.util.ArrayList<${this.getTypeClass()}>(${this.propertyName()});`)
        io.print(`    ${BitNameHelper.generateSetBitInternal(this.seq)};`)
        io.print(`  }`)
        io.print(`}`)
    }

    // public genWriteTo(io: IO) {
    //     io.print(`for (int i = 0; i < ${this.propertyName()}.size(); i++) {`)
    //     io.print(`  output.writeMessage(${this.fieldNumber}, ${this.propertyName()}.get(i));`)
    //     io.print(`}`)
    // }

    public ioType() {
        return "Message"
    }

    public genGetSerializedSize(io: IO) {
        io.print(Template.repeated_message_serialized_size
            .replace(/\$propertyname\$/g, this.propertyName())
            .replace(/\$fieldnumber\$/g, this.fieldNumber+'')
        )
    }

    public isMessageField(): boolean {
        return true;
    }
}

export class EnumRepeatedField extends RepeatedField {
    public isEnumField(): boolean {
        return true;
    }
    public genReadFrom(io: IO) {
        let tag = WireTagHelper.getTag(this);
        io.print(`case ${tag}: {`);
        io.indent();
        io.print(Template.enum_read_value.replace(/\$enumname\$/g, this.getTypeClass()))
        io.indent()
        let initListAddOne = function (field: Field) {
            io.print(`if (!${BitNameHelper.generateGetBitInternal(field.seq, "mutable_")}) {`);
            io.print(`  ${field.propertyName()} = new java.util.ArrayList<${field.getTypeClass()}>();`);
            io.print(`  ${BitNameHelper.generateSetBitInternal(field.seq, "mutable_")};`);
            io.print(`}`)
            io.print(`${field.propertyName()}.add(value);`)
        }
        initListAddOne(this)
        io.outdent();
        io.print(`}`)
        io.print(`break;`)
        io.outdent();
        io.print(`}`);

        // packed = true
        tag = WireTagHelper.getRepeatedPackedTag(this);
        io.print(`case ${tag}: {`);
        io.indent();
        io.print(
            `int length = input.readRawVarint32();` + '\n' + 
            `int oldLimit = input.pushLimit(length);` + '\n' + 
            `while(input.getBytesUntilLimit() > 0) {`
        );
        io.indent()
        io.print(Template.enum_read_value.replace(/\$enumname\$/g, this.getTypeClass()))
        io.indent()
        initListAddOne(this)
        io.outdent();
        io.print(`}`)
        io.outdent();
        io.print(`}`)
        io.print(`input.popLimit(oldLimit);`);
        io.print(`break;`)
        io.outdent();
        io.print(`}`);
    }

    public genGetSerializedSize(io: IO) {
        io.print(Template.repeated_enum_serialized_size.replace(/\$propertyname\$/g, this.propertyName()))
    }

    public ioType() {
        return "Enum";
    }
}

export enum FIELD_RULE {
    REQUIRED = "required",
    OPTIONAL = "optional",
    REPEATED = "repeated",
}