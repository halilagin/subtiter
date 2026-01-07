from pydantic import BaseModel, RootModel, Field
from typing import List, Dict, Optional
from enum import Enum

class CroppingOperator(str, Enum):
    AI = "AI"
    MANUAL = "MANUAL"
    CUSTOM = "CUSTOM"

class BoxRel(BaseModel):
    Left: float = Field(..., alias='Left')
    Top: float = Field(..., alias='Top')
    Width: float = Field(..., alias='Width')
    Height: float = Field(..., alias='Height')

class BoxPx(BaseModel):
    Left: int
    Top: int
    Width: int
    Height: int

class Face(BaseModel):
    index: int
    image_file: Optional[str] = None
    image_base64: Optional[str] = None  # base64 encoded image
    similarity: float
    box_rel: BoxRel
    box_px: BoxPx
    roi_px: Optional[BoxPx] = None  # the region of interest in the image
    interpolated_box_px: Optional[BoxPx] = None


class RecognizedFacesBBoxes(RootModel[Dict[str, List[Face]]]):
    """
    Represents the analysis of multiple frames, indexed by frame identifier.
    """

    def __iter__(self):
        return iter(self.root)

    def __getitem__(self, item):
        return self.root[item]
