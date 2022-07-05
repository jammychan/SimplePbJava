import { Field } from "./ProtoField";

export class WireTagHelper {
    public static WIRETYPE_VARINT           = 0;
    public static WIRETYPE_FIXED64          = 1;
    public static WIRETYPE_LENGTH_DELIMITED = 2;
    public static WIRETYPE_START_GROUP      = 3;
    public static WIRETYPE_END_GROUP        = 4;
    public static WIRETYPE_FIXED32          = 5;

    public static TAG_TYPE_BITS = 3;
    public static TAG_TYPE_MASK = (1 << WireTagHelper.TAG_TYPE_BITS) - 1;

    public static WIRE_MAP : any = null;
    public static init() {
        this.WIRE_MAP = {};
        this.WIRE_MAP["double"]   = {iotype: "Double",   rawtype:"double",    javatype:"java.lang.Double",  wire: WireTagHelper.WIRETYPE_FIXED64};
        this.WIRE_MAP["float"]    = {iotype: "Float",    rawtype:"float",     javatype:"java.lang.Float",   wire: WireTagHelper.WIRETYPE_FIXED32};
        this.WIRE_MAP["int64"]    = {iotype: "Int64",    rawtype:"long",      javatype:"java.lang.Long",    wire: WireTagHelper.WIRETYPE_VARINT};
        this.WIRE_MAP["uint64"]   = {iotype: "UInt64",   rawtype:"long",      javatype:"java.lang.Long",    wire: WireTagHelper.WIRETYPE_VARINT};
        this.WIRE_MAP["int32"]    = {iotype: "Int32",    rawtype:"int",       javatype:"java.lang.Integer", wire: WireTagHelper.WIRETYPE_VARINT};
        this.WIRE_MAP["fixed64"]  = {iotype: "Fixed64",  rawtype:"long",      javatype:"java.lang.Long",    wire: WireTagHelper.WIRETYPE_FIXED64};
        this.WIRE_MAP["fixed32"]  = {iotype: "Fixed32",  rawtype:"int",       javatype:"java.lang.Integer", wire: WireTagHelper.WIRETYPE_FIXED32};
        this.WIRE_MAP["bool"]     = {iotype: "Bool",     rawtype:"boolean",   javatype:"java.lang.Boolean", wire: WireTagHelper.WIRETYPE_VARINT};
        this.WIRE_MAP["string"]   = {iotype: "Bytes",    rawtype:"",          javatype:"java.lang.String",  wire: WireTagHelper.WIRETYPE_LENGTH_DELIMITED};
        this.WIRE_MAP["group"]    = {iotype: "",         rawtype:"",          javatype:"Message",           wire: WireTagHelper.WIRETYPE_START_GROUP};
        this.WIRE_MAP["message"]  = {iotype: "",         rawtype:"",          javatype:"Message",           wire: WireTagHelper.WIRETYPE_LENGTH_DELIMITED};
        this.WIRE_MAP["bytes"]    = {iotype: "Bytes",    rawtype:"bytes",     javatype:"ByteString",        wire: WireTagHelper.WIRETYPE_LENGTH_DELIMITED}; // TODO
        this.WIRE_MAP["uint32"]   = {iotype: "Bytes",    rawtype:"int",       javatype:"java.lang.Integer", wire: WireTagHelper.WIRETYPE_VARINT};
        this.WIRE_MAP["enum"]     = {iotype: "",         rawtype:"enum",      javatype:"Enum",              wire: WireTagHelper.WIRETYPE_VARINT};
        this.WIRE_MAP["sfixed32"] = {iotype: "SFixed32", rawtype:"int",       javatype:"java.lang.Integer", wire: WireTagHelper.WIRETYPE_FIXED32};
        this.WIRE_MAP["sfixed64"] = {iotype: "SFixed64", rawtype:"long",      javatype:"java.lang.Long",    wire: WireTagHelper.WIRETYPE_FIXED64};
        this.WIRE_MAP["sint32"]   = {iotype: "SInt32",   rawtype:"int",       javatype:"java.lang.Integer", wire: WireTagHelper.WIRETYPE_VARINT};
        this.WIRE_MAP["sint64"]   = {iotype: "SInt64",   rawtype:"long",      javatype:"java.lang.Long",    wire: WireTagHelper.WIRETYPE_VARINT};
    }

    public static getWireMap() {
        if (this.WIRE_MAP == null) {
            this.init();
        }
        return this.WIRE_MAP;
    }

    public static getTagSize(filed: Field): number {
        let value = filed.fieldNumber << WireTagHelper.TAG_TYPE_BITS 
        return WireTagHelper.getTagSizeFromComplier(value)
    }

    public static getTagSizeFromComplier(value: number) {
        let log2value = 31 ^ WireTagHelper.__builtin_clz(value | 0x1);
        return Math.floor((log2value * 9 + 73) / 64);
    }

    /**
     * 从pb2.5.0.jar获取来的
     */
    public static getTagSizeFromJava(value: number) {
        if ((value & -128) == 0) {
            return 1;
        } else if ((value & -16384) == 0) {
            return 2;
        } else if ((value & -2097152) == 0) {
            return 3;
        } else {
            return (value & -268435456) == 0 ? 4 : 5;
        }
    }

    public static __builtin_clz(val: number): number {
        let count = 0
        for (var i=31; i>=0; --i) {
            if (val < Math.pow(2, i)) {
                count++
            } else {
                break;
            }
        }
        return count
    }

    public static getTag(field: Field): number {
        if (field.isEnumField()) {
            return (field.fieldNumber << WireTagHelper.TAG_TYPE_BITS) | WireTagHelper.WIRETYPE_VARINT;
        }
        if (field.isMessageField()) {
            return (field.fieldNumber << WireTagHelper.TAG_TYPE_BITS) | WireTagHelper.WIRETYPE_LENGTH_DELIMITED;
        }

        let type = field.type;
        let wire = this.getWireMap()[type].wire;
        return (field.fieldNumber << WireTagHelper.TAG_TYPE_BITS) | wire;
    }

    public static getRepeatedPackedTag(field: Field): number {
        let wire = WireTagHelper.WIRETYPE_LENGTH_DELIMITED;
        return (field.fieldNumber << WireTagHelper.TAG_TYPE_BITS) | wire;
    }
}
// public enum FieldType {
//     DOUBLE  (JavaType.DOUBLE     , WIRETYPE_FIXED64         ),
//     FLOAT   (JavaType.FLOAT      , WIRETYPE_FIXED32         ),
//     INT64   (JavaType.LONG       , WIRETYPE_VARINT          ),
//     UINT64  (JavaType.LONG       , WIRETYPE_VARINT          ),
//     INT32   (JavaType.INT        , WIRETYPE_VARINT          ),
//     FIXED64 (JavaType.LONG       , WIRETYPE_FIXED64         ),
//     FIXED32 (JavaType.INT        , WIRETYPE_FIXED32         ),
//     BOOL    (JavaType.BOOLEAN    , WIRETYPE_VARINT          ),
//     STRING  (JavaType.STRING     , WIRETYPE_LENGTH_DELIMITED),
//     GROUP   (JavaType.MESSAGE    , WIRETYPE_START_GROUP     ),
//     MESSAGE (JavaType.MESSAGE    , WIRETYPE_LENGTH_DELIMITED),
//     BYTES   (JavaType.BYTE_STRING, WIRETYPE_LENGTH_DELIMITED),
//     UINT32  (JavaType.INT        , WIRETYPE_VARINT          ),
//     ENUM    (JavaType.ENUM       , WIRETYPE_VARINT          ),
//     SFIXED32(JavaType.INT        , WIRETYPE_FIXED32         ),
//     SFIXED64(JavaType.LONG       , WIRETYPE_FIXED64         ),
//     SINT32  (JavaType.INT        , WIRETYPE_VARINT          ),
//     SINT64  (JavaType.LONG       , WIRETYPE_VARINT          );