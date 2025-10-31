const snakeToCamelCase = (str: string) => str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('_', ''));
export const mapDbToSchema = <T>(dbObject: any): T => {
    if (!dbObject) return dbObject;
    const schemaObject: { [key: string]: any } = {};
    for (const key in dbObject) {
        if (Object.prototype.hasOwnProperty.call(dbObject, key)) {
            const camelKey = snakeToCamelCase(key);
            schemaObject[camelKey] = dbObject[key];
        }
    }
    return schemaObject as T;
};

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
export const mapSchemaToDb = <T>(schemaObject: any): T => {
    if (!schemaObject) return schemaObject;
    const dbObject: { [key: string]: any } = {};
    for (const key in schemaObject) {
        if (Object.prototype.hasOwnProperty.call(schemaObject, key)) {
            const snakeKey = camelToSnakeCase(key);
            dbObject[snakeKey] = schemaObject[key];
        }
    }
    return dbObject as T;
};