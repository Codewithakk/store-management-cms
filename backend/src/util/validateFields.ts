export const validateFields = (fields: Record<string, unknown>) => {
    return Object.entries(fields).find(([value]) => !value) ? false : true
}
