interface FieldSpace {
  type: string;
  space: number;
  prefix_space: number | undefined;
}

interface StructObj {
  name: string;
  fields: { [fieldName: string]: string };
  enum?: EnumObj;
}

interface EnumObj {
  name: string;
  fields: { [variant: string]: { type?: string } };
}

export const spaceReference: { [type: string]: number } = {
  bool: 1,
  u8: 1,
  i8: 1,
  u16: 2,
  i16: 2,
  u32: 4,
  i32: 4,
  u64: 8,
  i64: 8,
  u128: 16,
  i128: 16,
  Pubkey: 32,
  f32: 4,
  f64: 8,
};

export const getDataStructs = (rustCode: string): StructObj => {
  const structRegex = /#\[(?:\w+\(.*\))?\s*account\](?:\s*#[^\n]+)*\s*(?:pub\s*)?struct\s*(\w+)\s*{([^}]*)}/g;
  const structs: StructObj[] = [];
  let structMatch: RegExpExecArray | null;

  while ((structMatch = structRegex.exec(rustCode)) !== null) {
    const structName = structMatch[1];
    const fields = structMatch[2].trim().split('\n').map((f) => f.trim()).filter((f) => f.startsWith("pub"))
    const structObj: StructObj = {
      name: structName,
      fields: {},
    };

    for (const field of fields) {
      // @ts-ignore
      const [_, fieldName, fieldType] = field.match(/(\w+)\s*:\s*([\w<>;\[\]\s]+)/);
      structObj.fields[fieldName] = fieldType.trim();
    }

    const enumName = Object.values(structObj.fields).find((value) => {
      return getDataEnums(rustCode).some((enumObj) => enumObj.name === value);
    });

    if (enumName) {
      structObj.enum = getDataEnums(rustCode).find((enumObj) => enumObj.name === enumName)!;
    }

    structs.push(structObj);
  }

  return structs[0];
};

const getDataEnums = (rustCode: string): EnumObj[] => {
  const enumRegex = /enum\s+(\w+)\s*{([\s\S]*?)}/g;
  const fieldRegex = /(\w+)\s*(?:{[^}]*})?/g;
  const associatedValueRegex = /(\w+)\s*:\s*(\w+)/;

  const enums: EnumObj[] = [];

  let match: RegExpExecArray | null;
  while ((match = enumRegex.exec(rustCode)) !== null) {
    const enumName = match[1];
    const enumBody = match[2];
    const fields: { [variant: string]: { type?: string } } = {};

    let fieldMatch: RegExpExecArray | null;
    while ((fieldMatch = fieldRegex.exec(enumBody)) !== null) {
      const fieldDeclaration = fieldMatch[0];
      const associatedValueMatch = associatedValueRegex.exec(fieldDeclaration);

      if (associatedValueMatch) {
        const fieldName = associatedValueMatch[1];
        const fieldType = associatedValueMatch[2];
        fields[fieldName] = { type: fieldType };
      } else {
        const fieldName = fieldMatch[1];
        fields[fieldName] = {};
      }
    }

    const enumObj: EnumObj = {
      name: enumName,
      fields: fields,
    };
    enums.push(enumObj);
  }

  return enums;
};


const calculateEnumSpace = (enumObj: EnumObj): number => {
  let largestVariantSize = 0;

  for (const variant of Object.keys(enumObj.fields)) {
    const variantSpace = spaceReference[variant];

    if (variantSpace) {
      if (variantSpace > largestVariantSize) {
        largestVariantSize = variantSpace;
      }
    }
  }

  return largestVariantSize;
};

export const calculateFieldSpace = (structObj: StructObj): { [fieldName: string]: FieldSpace } | null => {
  if (!structObj) {
    return null;
  }

  const fieldSpace: { [fieldName: string]: FieldSpace } = {};

  for (const fieldName in structObj.fields) {
    const fieldType = structObj.fields[fieldName];
    let space: number;
    let prefixSpace: number;
    console.log("Field type: ", fieldType)
    if (fieldType.startsWith('[')) {
      const [arrayType, arraySize] = fieldType.split(';');
      const typeSpace = spaceReference[arrayType.slice(1)];
      const size = parseInt(arraySize);
      space = typeSpace * size;
      prefixSpace = 0;
    } else if (fieldType.startsWith('Vec<')) {
      const vectorType = fieldType.slice(4, -1);
      const typeSpace = spaceReference[vectorType];
      space = typeSpace;
      prefixSpace = 4;
    } else if (fieldType.startsWith('Option<')) {
      const optionType = fieldType.slice(7, -1);
      const typeSpace = spaceReference[optionType];
      space = typeSpace;
      prefixSpace = 1;
    } else if (structObj.enum && fieldType === structObj.enum.name) {
      const enumSpace = calculateEnumSpace(structObj.enum);
      space = enumSpace;
      prefixSpace = 1;
    } else if (fieldType === 'String') {
      space = 0;
      prefixSpace = 4;
    } else {
      const typeSpace = spaceReference[fieldType];
      space = typeSpace;
      prefixSpace = 0;
    }

    fieldSpace[fieldName] = {
      type: fieldType,
      prefix_space: prefixSpace,
      space: space,
    };
  }

  return fieldSpace;
};
