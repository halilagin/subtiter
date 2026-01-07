export interface  ShortSubtitleStyleProps {
    capitalizationStyle: string;
    selected: ()=> void;
    id: string;
    videoId?: string;
    position?: 'top' | 'middle' | 'bottom';
}