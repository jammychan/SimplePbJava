export class Template {

public static read_try_catch_start: string = 
    `try {` + '\n' + 
    `  boolean done = false;` + '\n' + 
    `  while (!done) {` + '\n' +
    `    int tag = input.readTag();` + '\n' + 
    `    switch (tag) {` + '\n' + 
    `      case 0:` + '\n' +
    `        done = true;` + '\n' + 
    `        break;` + '\n'+
    `      default: {` + '\n'+
    `        if (!parseUnknownField(input,` + '\n' + 
    `            extensionRegistry, tag)) {` + '\n' +
    `          done = true;` + '\n' +
    `        }` + '\n' + 
    `        break;` + '\n' + 
    `      }`
        
public static read_try_catch_end: string = 
`    }
  }
} catch (com.google.protobuf.InvalidProtocolBufferException e) {
  throw e.setUnfinishedMessage(this);
} catch (java.io.IOException e) {
  throw new com.google.protobuf.InvalidProtocolBufferException(
      e.getMessage()).setUnfinishedMessage(this);
} finally {
  makeExtensionsImmutable();
}`

public static message_PARSER: string = 
`public static com.google.protobuf.Parser<$classname$> PARSER = 
    new com.google.protobuf.AbstractParser<$classname$>() {
  public $classname$ parsePartialFrom(
      com.google.protobuf.CodedInputStream input,
      com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws com.google.protobuf.InvalidProtocolBufferException {
    return new $classname$(input, extensionRegistry);
  }
};`

public static throw_null_ex: string = 
`if (value == null) {
  throw new NullPointerException();
}`

public static get_string1: string = 
`public java.lang.String get$uppername$() {
  java.lang.Object ref = $propertyname$;
  if (ref instanceof java.lang.String) {
    return (java.lang.String) ref;
  } else {
    com.google.protobuf.ByteString bs = 
        (com.google.protobuf.ByteString) ref;
    java.lang.String s = bs.toStringUtf8();
    if (bs.isValidUtf8()) {
      $propertyname$ = s;
    }
    return s;
  }
}`

public static get_string2: string = 
`public com.google.protobuf.ByteString
    get$uppername$Bytes() {
  java.lang.Object ref = $propertyname$;
  if (ref instanceof java.lang.String) {
    com.google.protobuf.ByteString b = 
        com.google.protobuf.ByteString.copyFromUtf8(
            (java.lang.String) ref);
    $propertyname$ = b;
    return b;
  } else {
    return (com.google.protobuf.ByteString) ref;
  }
}`

public static getSerializedSize_start: string = 
`private int memoizedSerializedSize = -1;
public int getSerializedSize() {
  int size = memoizedSerializedSize;
  if (size != -1) return size;

  size = 0;`

public static getSerializedSize_end: string = 
`  memoizedSerializedSize = size;
  return size;
}`

public static repeated_serialized_size: string = 
`{
  int dataSize = 0;
  dataSize = $datasize$ * get$uppername$List().size();
  size += dataSize;
  size += $tagsize$ * get$uppername$List().size();
}`

public static repeated_serialized_need_compute_size: string = 
`{
  int dataSize = 0;
  for (int i = 0; i < $propertyname$.size(); i++) {
    dataSize += com.google.protobuf.CodedOutputStream
      .compute$iotype$SizeNoTag($propertyname$.get(i));
  }
  size += dataSize;
  size += $datasize$ * get$uppername$List().size();
}`

public static repeated_serialized_size_packed: string = 
`{
  int dataSize = 0;
  dataSize = $datasize$ * get$uppername$List().size();
  size += dataSize;
  if (!get$uppername$List().isEmpty()) {
    size += $tagsize$;
    size += com.google.protobuf.CodedOutputStream
      .computeInt32SizeNoTag(dataSize);
  }
  $lowername$MemoizedSerializedSize = dataSize;
}`

public static repeated_serialized_size_compute_packed: string = 
`{
  int dataSize = 0;
  for (int i = 0; i < $propertyname$.size(); i++) {
    dataSize += com.google.protobuf.CodedOutputStream
      .compute$iotype$SizeNoTag($propertyname$.get(i));
  }
  size += dataSize;
  if (!get$uppername$List().isEmpty()) {
    size += $tagsize$;
    size += com.google.protobuf.CodedOutputStream
      .computeInt32SizeNoTag(dataSize);
  }
  $lowername$MemoizedSerializedSize = dataSize;
}`

public static repeated_message_serialized_size: string = 
`for (int i = 0; i < $propertyname$.size(); i++) {
  size += com.google.protobuf.CodedOutputStream
    .computeMessageSize($fieldnumber$, $propertyname$.get(i));
}`

public static repeated_enum_serialized_size: string = 
`{
  int dataSize = 0;
  for (int i = 0; i < $propertyname$.size(); i++) {
    dataSize += com.google.protobuf.CodedOutputStream
      .computeEnumSizeNoTag($propertyname$.get(i).getNumber());
  }
  size += dataSize;
  size += $tagsize$ * $propertyname$.size();
}`

public static repeated_enum_serialized_size_packed: string = 
`{
  int dataSize = 0;
  for (int i = 0; i < $propertyname$.size(); i++) {
    dataSize += com.google.protobuf.CodedOutputStream
      .computeEnumSizeNoTag($propertyname$.get(i).getNumber());
  }
  size += dataSize;
  if (!get$uppername$List().isEmpty()) {
    size += $tagsize$;
    size += com.google.protobuf.CodedOutputStream
      .computeRawVarint32Size(dataSize);
  }
  $lowername$MemoizedSerializedSize = dataSize;
}`

public static repeated_string_serialized_size: string = 
`{
  int dataSize = 0;
  for (int i = 0; i < $propertyname$.size(); i++) {
    dataSize += com.google.protobuf.CodedOutputStream
      .computeBytesSizeNoTag($propertyname$.getByteString(i));
  }
  size += dataSize;
  size += $datasize$ * get$uppername$List().size();
}`

public static parse_from: string = 
`public static $classname$.$messagename$ parseFrom(
    com.google.protobuf.ByteString data)
    throws com.google.protobuf.InvalidProtocolBufferException {
  return PARSER.parseFrom(data);
}
public static $classname$.$messagename$ parseFrom(byte[] data)
    throws com.google.protobuf.InvalidProtocolBufferException {
  return PARSER.parseFrom(data);
}`

public static builder_method: string = 
`public static $classname$.$messagename$ newBuilder() { return new $classname$.$messagename$(); }
public static $classname$.$messagename$ newBuilder($classname$.$messagename$ prototype) {
  return prototype;
}
public $classname$.$messagename$ toBuilder() { return this; }
public $classname$.$messagename$ build() {
  $classname$.$messagename$ result = this;
  if (!result.isInitialized()) {
    throw new com.google.protobuf.UninitializedMessageException(result);
  }
  return result;
}`

public static required_isInitialized: string =
`if (!has$uppername$()) {
  memoizedIsInitialized = 0;
  return false;
}`

public static repeated_isInitialized_message: string =
`for (int i = 0; i < get$uppername$Count(); i++) {
  if (!get$uppername$(i).isInitialized()) {
    memoizedIsInitialized = 0;
    return false;
  }
}`

public static required_isInitialized_message: string =
`if (!get$uppername$().isInitialized()) {
  memoizedIsInitialized = 0;
  return false;
}`

public static optional_isInitialized_message: string =
`if (has$uppername$()) {
  if (!get$uppername$().isInitialized()) {
    memoizedIsInitialized = 0;
    return false;
  }
}`

public static enum_constuctor: string = 
`private final int value;

private $enumname$(int index, int value) {
  this.value = value;
}`

public static enum_read_value: string = 
`int rawValue = input.readEnum();
$enumname$ value = $enumname$.valueOf(rawValue);
if (value != null) {`
}