// Universal_FormatterComp.tsx
export function formatNumberShort(value: number | string | undefined): string {
    if (!value) return "0";

    const num = typeof value === "string" ? parseFloat(value) : value;

    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";

    return num.toString();
}

// Optional price formatter
export function formatPrice(value: number | string | undefined): string {
    if (!value) return "0";
    return formatNumberShort(value);
}
