export const videoDimentionNameToAspectRatioMap: Record<string, string> = {
   "InstagramReels": "9:16",
   "Portrait": "4:3",
   "Square": "1:1",
   "Landscape": "16:9",
   "default": "default",
};





// Reverse mapping: from string label to seconds
export const videoAspectRatioToDimentionNameMap: Record<string, string> = {
    "16:9": "Landscape",
    "4:3": "Portrait",
    "1:1": "Square",
    "9:16": "InstagramReels",
    "default": "de  fault",
    
};