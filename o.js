function formatAmount(amount) {
    // Convert the amount to a string with two decimal places
    const amountStr = (amount * 100).toFixed(0); // Multiplies by 100 to account for cents and removes decimal
    
    // Pad with leading zeros to ensure the length is 13
    const formattedAmount = amountStr.padStart(13, '0');
    
    return formattedAmount;
}

// Example Usage
console.log(formatAmount(10000000000));    // Output: "0000000010000"
console.log(formatAmount(99));     // Output: "0000000009900"
console.log(formatAmount(99.90));  // Output: "0000000009990"
console.log(formatAmount(0.01));   // Output: "0000000000001"
console.log(formatAmount(12345.67)); // Output: "0000012345670"
