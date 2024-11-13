export const formatAmount = (amount: number) => {
    return amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
};

export const validateAndTransformId = (id: string | number | undefined): string => {
    if (!id) {
        throw new Error('Invalid ingredient: missing ID');
    }
    return String(id);
};