function CompactPrice({ price }) {
    const formatted = Number(price).toFixed(8); // pad for small numbers
    const [integer, decimal] = formatted.split(".");

    // find first 4-6 zeros or leading insignificant part
    const leadingZerosMatch = decimal.match(/^(0+)/);
    const leadingZeros = leadingZerosMatch ? leadingZerosMatch[0] : "";
    const remaining = decimal.slice(leadingZeros.length);

    return (
        <span className="text-[18px] font-medium text-lBLue"> ${integer}.0
            <span className="text-xs align-sub text-text-lBLue">{leadingZeros.length}</span>
            <span className="text-[18px] font-medium text-lBLue">
                {remaining}</span>
    </span>
    );
}

export default CompactPrice;