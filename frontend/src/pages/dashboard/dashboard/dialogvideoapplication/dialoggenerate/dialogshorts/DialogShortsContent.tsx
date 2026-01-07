import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';
import ShortSubtitleSelection from './ShortSubtitleSelection';
import ShortVideoPreview from './ShortVideoPreview';
import ShortTrimSection from './ShortTrimSection';
import ShortDurationComboBox from './ShortDurationComboBox';
import ShortLanguageComboBox from './ShortLanguageComboBox';
import ShortCountComboBox from './ShortCountComboBox';
import GenerateShortButton from './GenerateShortButton';
import { ShortAspectRatioSelectionSwitcher } from './ShortAspectRatioSelection';
import { VideoAspectRatio } from '@/api/models/VideoAspectRatio';
import { SubtitleCapitalizationMethod } from '@/api/models/SubtitleCapitalizationMethod';
import { LanguageCode } from '@/api/models/LanguageCode';
import { VideoItem } from '../../../generatedvideolist/model/GeneratedVideoListModel';
import { ShortConfigJsonInput } from '@/api/models';
import { VideoProcessingApplication } from '@/api/models/VideoProcessingApplication';
import { EventType } from '@/events';
import { SubtitleApplication as SubtitleApplicationInterface, SubtitleConfiguration } from '@/api/models';
import { SubtitleStyle } from '@/api/models/SubtitleStyle';
import { SubtitlePosition } from '@/api/models/SubtitlePosition';

const SubtitleApplication = {
    Default: {
        subtitleConfiguration: [
            {
                id: 'default',
                name: 'default',
                animation: undefined,
                color: '#FFFFFF',
                size: 16,
                font: 'Arial',
                subtitleStyle: SubtitleStyle.Regular,
                subtitleCapitalizationMethod: SubtitleCapitalizationMethod.Uppercase,
                subtitlePosition: SubtitlePosition.Bottom,
                subtitleBoxFontColor: '#FFFFFF',
                subtitleBoxTransparency: 0,
                subtitleBoxBackgroundColor: '#000000',
                subtitleInactiveColor: '&H00FFFFFF',
                subtitleActiveColor: '&H00B469FF',
                subtitleBoxCornerRadius: 0,
                subtitleBoxWidthCompensation: 1,
                subtitleBoxBorderThickness: 0,
                subtitleFontSize: 16,
                subtitleFontName: 'Arial',
                subtitleFontBold: false,
                subtitleFontItalic: false,
                subtitleFontUnderline: false,
                subtitleLanguageCode: LanguageCode.En,
            } as SubtitleConfiguration
        ]
    } as SubtitleApplicationInterface
};

interface GenerateShortDialogContentProps {
  video: VideoItem;
}

const DialogShortContent: React.FC<GenerateShortDialogContentProps> = ({
  video,
}) => {
    const [shortConfig, setShortConfig] = useState<ShortConfigJsonInput>({
        videoId: video.videoId,
        segmentCount: 3,
        targetShortVideoDurationInSeconds: 60,
        videoLanguageCode: LanguageCode.En,
        videoAspectRatio: VideoAspectRatio._916,
        subtitleApplication: SubtitleApplication.Default,
    });

    useEffect(() => {
        console.log('New shortConfig:', shortConfig);
    }, [shortConfig]);


    const handleStartGeneration = useCallback(() => {
        const event = new CustomEvent(EventType.GENERATION_STARTED, {
            detail: {
                application: VideoProcessingApplication.GenerateShorts,
                videoId: video.videoId,
                config: shortConfig
            }
        });
        window.dispatchEvent(event);

        const closeEvent = new CustomEvent(EventType.CLOSE_DIALOG_APPLICATION_SELECTION, {});
        window.dispatchEvent(closeEvent);
    }, [video.videoId, shortConfig]);

    const handleUpdateShortConfig = useCallback((event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail && customEvent.detail.videoId === video.videoId) {
            const { videoId, ...configUpdates } = customEvent.detail;
            console.log('received customEvent:', customEvent.detail);

            // Map string position to SubtitlePosition enum
            const positionMap: Record<'top' | 'middle' | 'bottom', SubtitlePosition> = {
                'top': SubtitlePosition.Top,
                'middle': SubtitlePosition.Middle,
                'bottom': SubtitlePosition.Bottom,
            };

            // Map string capitalization method to SubtitleCapitalizationMethod enum
            const capitalizationMap: Record<'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words', SubtitleCapitalizationMethod> = {
                'default': SubtitleCapitalizationMethod.Default,
                'uppercase': SubtitleCapitalizationMethod.Uppercase,
                'lowercase': SubtitleCapitalizationMethod.Lowercase,
                'capitalize_first_char_in_words': SubtitleCapitalizationMethod.CapitalizeFirstCharInWords,
            };

            setShortConfig(prev => {
                // If full subtitleApplication is provided, use it directly
                if (configUpdates.subtitleApplication) {
                    return {
                        ...prev,
                        ...configUpdates,
                    };
                }

                // Otherwise, merge individual field updates into existing config
                const existingConfigs = prev.subtitleApplication?.subtitleConfiguration || [];
                if (existingConfigs.length > 0) {
                    const firstConfig = existingConfigs[0];
                    const updatedFirstConfig: SubtitleConfiguration = {
                        ...firstConfig,
                        // Update subtitlePosition if provided
                        ...(configUpdates.subtitlePosition && {
                            subtitlePosition: positionMap[configUpdates.subtitlePosition as 'top' | 'middle' | 'bottom']
                        }),
                        // Update subtitleCapitalizationMethod if provided
                        ...(configUpdates.subtitleCapitalizationMethod && {
                            subtitleCapitalizationMethod: capitalizationMap[configUpdates.subtitleCapitalizationMethod as 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words']
                        }),
                        // Update other fields if provided (subtitleStyle, etc.)
                        ...(configUpdates.subtitleStyle && {
                            subtitleStyle: configUpdates.subtitleStyle as any
                        }),
                    };

                    return {
                        ...prev,
                        ...configUpdates,
                        subtitleApplication: {
                            ...prev.subtitleApplication,
                            subtitleConfiguration: [
                                updatedFirstConfig,
                                ...existingConfigs.slice(1)
                            ]
                        }
                    };
                }

                // Fallback: just merge configUpdates
                return {
                    ...prev,
                    ...configUpdates
                };
            });
        }
    }, [video.videoId]);

    const handleUpdateShortConfigSubtitlePosition = useCallback((event: Event) => {
        const customEvent = event as CustomEvent<{ videoId: string; subtitlePosition: 'top' | 'middle' | 'bottom' }>;
        if (customEvent.detail && customEvent.detail.videoId === video.videoId) {
            const { videoId, subtitlePosition } = customEvent.detail;

            // Map string position to SubtitlePosition enum
            const positionMap: Record<'top' | 'middle' | 'bottom', SubtitlePosition> = {
                'top': SubtitlePosition.Top,
                'middle': SubtitlePosition.Middle,
                'bottom': SubtitlePosition.Bottom,
            };

            setShortConfig(prev => {
                const existingConfigs = prev.subtitleApplication?.subtitleConfiguration || [];
                if (existingConfigs.length > 0) {
                    const updatedConfigs = [
                        {
                            ...existingConfigs[0],
                            subtitlePosition: positionMap[subtitlePosition]
                        },
                        ...existingConfigs.slice(1)
                    ];

                    return {
                        ...prev,
                        subtitleApplication: {
                            ...prev.subtitleApplication,
                            subtitleConfiguration: updatedConfigs
                        }
                    };
                }

                return prev;
            });
        }
    }, [video.videoId]);

    const handleUpdateShortConfigSubtitleCapitalizationMethod = useCallback((event: Event) => {
        const customEvent = event as CustomEvent<{ videoId: string; subtitleCapitalizationMethod: 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words' }>;
        if (customEvent.detail && customEvent.detail.videoId === video.videoId) {
            const { videoId, subtitleCapitalizationMethod } = customEvent.detail;

            // Map string capitalization method to SubtitleCapitalizationMethod enum
            const capitalizationMap: Record<'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words', SubtitleCapitalizationMethod> = {
                'default': SubtitleCapitalizationMethod.Default,
                'uppercase': SubtitleCapitalizationMethod.Uppercase,
                'lowercase': SubtitleCapitalizationMethod.Lowercase,
                'capitalize_first_char_in_words': SubtitleCapitalizationMethod.CapitalizeFirstCharInWords,
            };

            setShortConfig(prev => {
                const existingConfigs = prev.subtitleApplication?.subtitleConfiguration || [];
                if (existingConfigs.length > 0) {
                    const updatedConfigs = [
                        {
                            ...existingConfigs[0],
                            subtitleCapitalizationMethod: capitalizationMap[subtitleCapitalizationMethod]
                        },
                        ...existingConfigs.slice(1)
                    ];

                    return {
                        ...prev,
                        subtitleApplication: {
                            ...prev.subtitleApplication,
                            subtitleConfiguration: updatedConfigs
                        }
                    };
                }

                return prev;
            });
        }
    }, [video.videoId]);


    const handleUpdateShortConfigSubtitleStyle = useCallback((event: Event) => {
        const customEvent = event as CustomEvent<{ videoId: string; subtitleApplication: SubtitleApplicationInterface }>;
        if (customEvent.detail && customEvent.detail.videoId === video.videoId) {
            const { videoId, subtitleApplication } = customEvent.detail;
            
            console.log('Updating subtitle style config:', subtitleApplication);
            
            setShortConfig(prev => {
                const prevConfig = prev.subtitleApplication?.subtitleConfiguration?.[0];
                const newConfig = subtitleApplication.subtitleConfiguration?.[0];
                
                // Merge new configuration with preserved fields from previous state
                const mergedConfig = {
                    ...newConfig,
                    subtitleCapitalizationMethod: prevConfig?.subtitleCapitalizationMethod ?? newConfig?.subtitleCapitalizationMethod,
                    subtitlePosition: prevConfig?.subtitlePosition ?? newConfig?.subtitlePosition,
                };
                
                return {
                    ...prev,
                    subtitleApplication: {
                        ...subtitleApplication,
                        subtitleConfiguration: [mergedConfig]
                    }
                };
            });
        }
    }, [video.videoId]);


    useEffect(() => {
        window.addEventListener(EventType.START_SHORTS_GENERATION, handleStartGeneration);
        window.addEventListener(EventType.UPDATE_SHORT_CONFIG, handleUpdateShortConfig);
        window.addEventListener(EventType.UPDATE_SHORT_CONFIG_SUBTITLE_POSITION, handleUpdateShortConfigSubtitlePosition);
        window.addEventListener(EventType.UPDATE_SHORT_CONFIG_SUBTITLE_CAPITALIZATION_METHOD, handleUpdateShortConfigSubtitleCapitalizationMethod);
        window.addEventListener(EventType.UPDATE_SHORT_CONFIG_SUBTITLE_STYLE, handleUpdateShortConfigSubtitleStyle);
        
        return () => {
            window.removeEventListener(EventType.START_SHORTS_GENERATION, handleStartGeneration);
            window.removeEventListener(EventType.UPDATE_SHORT_CONFIG, handleUpdateShortConfig);
            window.removeEventListener(EventType.UPDATE_SHORT_CONFIG_SUBTITLE_POSITION, handleUpdateShortConfigSubtitlePosition);
            window.removeEventListener(EventType.UPDATE_SHORT_CONFIG_SUBTITLE_CAPITALIZATION_METHOD, handleUpdateShortConfigSubtitleCapitalizationMethod);
            window.removeEventListener(EventType.UPDATE_SHORT_CONFIG_SUBTITLE_STYLE, handleUpdateShortConfigSubtitleStyle);
        };
    }, [handleStartGeneration, handleUpdateShortConfig, handleUpdateShortConfigSubtitlePosition, handleUpdateShortConfigSubtitleCapitalizationMethod, handleUpdateShortConfigSubtitleStyle]);

  return (
    
    <Box>
    <ShortVideoPreview videoData={video} shortConfig={shortConfig} />
      
    <ShortCountComboBox shortConfig={shortConfig} />
    <ShortDurationComboBox shortConfig={shortConfig} />
      
      {/* <ShortTrimSection 
        video={video}
        shortConfig={shortConfig}
      /> */}
      
      <ShortLanguageComboBox shortConfig={shortConfig} />

      <ShortAspectRatioSelectionSwitcher shortConfig={shortConfig} />
      
      <Box sx={{ minWidth: 0 }}>
        <ShortSubtitleSelection 
            shortConfig={shortConfig}
        />
      </Box>

      <Box sx={{ mt: 0.5 }}>
        <GenerateShortButton />
      </Box>
    </Box>
    
  );
};

export default DialogShortContent;

