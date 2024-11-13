export const formatAmount = (amount: number) => {
    return amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
};