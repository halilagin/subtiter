export const durationMapinMinutes: Record<number, string> = {
    30: "0.5 min",
    60: "1 min",
    90: "1.5 min",
    120: "2 min",
    150: "2.5 min",
    [-1]: "Auto"
};

// Reverse mapping: from string label to seconds
export const durationMapToSeconds: Record<string, number> = {
    "0.5 min": 30,
    "1 min": 60,
    "1.5 min": 90,
    "2 min": 120,
    "2.5 min": 150,
    "Auto": -1
};