import { Box } from "@mui/material";
import { ShortSubtitleStyleBeast } from "../dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBeast";

interface ShortSubtitleOverlayProps {
    animationName: string;
}

const ShortSubtitleOverlay = ({ animationName }: ShortSubtitleOverlayProps) => {
    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: '50%',
                left: '50%',
                transform: 'translate(-50%, 50%) scale(0.6)',
                zIndex: 20,
                pointerEvents: 'none',
                opacity: 0,
                visibility: 'hidden',
                animation: `${animationName} 4s ease-in-out infinite`,
                [`@keyframes ${animationName}`]: {
                    '0%, 19%': {
                        opacity: 0,
                        visibility: 'hidden',
                    },
                    '20%, 94%': {
                        opacity: 1,
                        visibility: 'visible',
                    },
                    '95%, 100%': {
                        opacity: 0,
                        visibility: 'hidden',
                    },
                },
            }}
        >
            <ShortSubtitleStyleBeast capitalizationStyle="uppercase" selected={() => {}} id="beast" />
        </Box>
    );
};

export default ShortSubtitleOverlay;

