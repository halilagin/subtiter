import { Box } from "@mui/material";
import ShortSubtitleOverlay from "./ShortSubtitleOverlay";

const GenerateShortsAnimation = () => {
    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Main Video Part 1 - Left (becomes Short 1) */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '240px',
                    height: '135px',
                    borderRadius: 1,
                    border: 'none',
                    zIndex: 10,
                    overflow: 'hidden',
                    clipPath: 'inset(0 160px 0 0)',
                    backgroundImage: 'url(/shortanimations/shortanimation_256w.avif)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 20%',
                    backgroundRepeat: 'no-repeat',
                    animation: 'splitToShort1 4s ease-in-out infinite',
                    '@keyframes splitToShort1': {
                        '0%': {
                            width: '240px',
                            height: '135px',
                            clipPath: 'inset(0 160px 0 0)',
                            transform: 'translateX(0)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/shortanimations/shortanimation_256w.avif)',
                            backgroundPosition: 'center 20%',
                            backgroundSize: 'cover',
                        },
                        '18%': {
                            width: '240px',
                            height: '135px',
                            clipPath: 'inset(0 160px 0 0)',
                            transform: 'translateX(0)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/shortanimations/shortanimation_256w.avif)',
                            backgroundPosition: 'center 20%',
                            backgroundSize: 'cover',
                        },
                        '20%': {
                            width: '80px',
                            height: '135px',
                            clipPath: 'inset(0 0 0 0)',
                            transform: 'translateX(-78px)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/animationimages/animationimage_256w.avif)',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                        },
                        '50%': {
                            width: '70px',
                            height: '124px',
                            clipPath: 'inset(0 0 0 0)',
                            transform: 'translateX(-78px)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/animationimages/animationimage_256w.avif)',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                        },
                        '90%': {
                            width: '70px',
                            height: '124px',
                            clipPath: 'inset(0 0 0 0)',
                            transform: 'translateX(-78px)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/animationimages/animationimage_256w.avif)',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                        },
                        '95%': {
                            width: '70px',
                            height: '124px',
                            clipPath: 'inset(0 0 0 0)',
                            transform: 'translateX(-78px)',
                            opacity: 0,
                            visibility: 'hidden',
                        },
                        '100%': {
                            width: '240px',
                            height: '135px',
                            clipPath: 'inset(0 160px 0 0)',
                            transform: 'translateX(0)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/shortanimations/shortanimation_256w.avif)',
                            backgroundPosition: 'center 20%',
                            backgroundSize: 'cover',
                        },
                    },
                }}
            >
                {/* Subtitle Overlay for Short 1 */}
                <ShortSubtitleOverlay animationName="showSubtitle1" />
            </Box>
            
            {/* Main Video Part 2 - Center (becomes Short 2) */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '240px',
                    height: '135px',
                    borderRadius: 1,
                    border: 'none',
                    zIndex: 10,
                    overflow: 'hidden',
                    clipPath: 'inset(0 80px 0 80px)',
                    backgroundImage: 'url(/shortanimations/shortanimation_256w.avif)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 20%',
                    backgroundRepeat: 'no-repeat',
                    animation: 'splitToShort2 4s ease-in-out infinite',
                    '@keyframes splitToShort2': {
                        '0%': {
                            width: '240px',
                            height: '135px',
                            clipPath: 'inset(0 80px 0 80px)',
                            transform: 'translateX(0)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/shortanimations/shortanimation_256w.avif)',
                            backgroundPosition: 'center 20%',
                            backgroundSize: 'cover',
                        },
                        '18%': {
                            width: '240px',
                            height: '135px',
                            clipPath: 'inset(0 80px 0 80px)',
                            transform: 'translateX(0)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/shortanimations/shortanimation_256w.avif)',
                            backgroundPosition: 'center 20%',
                            backgroundSize: 'cover',
                        },
                        '20%': {
                            width: '80px',
                            height: '135px',
                            clipPath: 'inset(0 0 0 0)',
                            transform: 'translateX(0)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/animationimages/animationimage_256w.avif)',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                        },
                        '50%': {
                            width: '70px',
                            height: '124px',
                            clipPath: 'inset(0 0 0 0)',
                            transform: 'translateX(0)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/animationimages/animationimage_256w.avif)',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                        },
                        '90%': {
                            width: '70px',
                            height: '124px',
                            clipPath: 'inset(0 0 0 0)',
                            transform: 'translateX(0)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/animationimages/animationimage_256w.avif)',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                        },
                        '95%': {
                            width: '70px',
                            height: '124px',
                            clipPath: 'inset(0 0 0 0)',
                            transform: 'translateX(0)',
                            opacity: 0,
                            visibility: 'hidden',
                        },
                        '100%': {
                            width: '240px',
                            height: '135px',
                            clipPath: 'inset(0 80px 0 80px)',
                            transform: 'translateX(0)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/shortanimations/shortanimation_256w.avif)',
                            backgroundPosition: 'center 20%',
                            backgroundSize: 'cover',
                        },
                    },
                }}
            >
                {/* Subtitle Overlay for Short 2 */}
                <ShortSubtitleOverlay animationName="showSubtitle2" />
            </Box>
            
            {/* Main Video Part 3 - Right (becomes Short 3) */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '240px',
                    height: '135px',
                    borderRadius: 1,
                    border: 'none',
                    zIndex: 10,
                    overflow: 'hidden',
                    clipPath: 'inset(0 0 0 160px)',
                    backgroundImage: 'url(/shortanimations/shortanimation_256w.avif)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 20%',
                    backgroundRepeat: 'no-repeat',
                    animation: 'splitToShort3 4s ease-in-out infinite',
                    '@keyframes splitToShort3': {
                        '0%': {
                            width: '240px',
                            height: '135px',
                            clipPath: 'inset(0 0 0 160px)',
                            transform: 'translateX(0)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/shortanimations/shortanimation_256w.avif)',
                            backgroundPosition: 'center 20%',
                            backgroundSize: 'cover',
                        },
                        '18%': {
                            width: '240px',
                            height: '135px',
                            clipPath: 'inset(0 0 0 160px)',
                            transform: 'translateX(0)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/shortanimations/shortanimation_256w.avif)',
                            backgroundPosition: 'center 20%',
                            backgroundSize: 'cover',
                        },
                        '20%': {
                            width: '80px',
                            height: '135px',
                            clipPath: 'inset(0 0 0 0)',
                            transform: 'translateX(78px)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/animationimages/animationimage_256w.avif)',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                        },
                        '50%': {
                            width: '70px',
                            height: '124px',
                            clipPath: 'inset(0 0 0 0)',
                            transform: 'translateX(78px)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/animationimages/animationimage_256w.avif)',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                        },
                        '90%': {
                            width: '70px',
                            height: '124px',
                            clipPath: 'inset(0 0 0 0)',
                            transform: 'translateX(78px)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/animationimages/animationimage_256w.avif)',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                        },
                        '95%': {
                            width: '70px',
                            height: '124px',
                            clipPath: 'inset(0 0 0 0)',
                            transform: 'translateX(78px)',
                            opacity: 0,
                            visibility: 'hidden',
                        },
                        '100%': {
                            width: '240px',
                            height: '135px',
                            clipPath: 'inset(0 0 0 160px)',
                            transform: 'translateX(0)',
                            opacity: 1,
                            visibility: 'visible',
                            backgroundImage: 'url(/shortanimations/shortanimation_256w.avif)',
                            backgroundPosition: 'center 20%',
                            backgroundSize: 'cover',
                        },
                    },
                }}
            >
                {/* Subtitle Overlay for Short 3 */}
                <ShortSubtitleOverlay animationName="showSubtitle3" />
            </Box>
        </Box>
    );
};

export default GenerateShortsAnimation;

